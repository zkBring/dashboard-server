const { ethers } = require('ethers')
const logger = require('../utils/logger')
const { verifyMessage } = require('@ethersproject/wallet')
const stringTemplater = require('../utils/string-templater')
const campaignService = require('../services/campaign-service')
const dashboardKeyService = require('../services/dashboard-key-service')
const { createClient } = require('../utils/helpers/create-viem-client-instance')
const { BadRequestError, ForbiddenError, NotFoundError } = require('../utils/errors')

class LoginService {
  constructor () {
    this.nonceCache = {}
  }

  checkTimestamp (timestamp) {
    const now = Date.now()
    const timeDiffernce = now - timestamp

    if (isNaN(timeDiffernce)) throw new BadRequestError('Timestamp is incorrect', 'INVALID_TIMESTAMP')
    if (timeDiffernce > 60 * 60 * 1000) throw new ForbiddenError('Timestamp is stale', 'TIMESTAMP_IS_STALE')

    return true
  }

  async _verifySignedMessage ({
    msg,
    sig,
    chainId,
    userAddress
  }) {
    const nonce = this.nonceCache[userAddress.toLowerCase()]
    const isValidNonce = msg.includes(nonce)
    if (!isValidNonce) throw new ForbiddenError('Nonce is not verified.', 'NONCE_NOT_VERIFIED')

    const client = createClient(chainId)
    const valid = await client.verifyMessage({
      message: msg,
      signature: sig,
      address: userAddress.toLowerCase()
    })

    if (!valid) return false
    delete this.nonceCache[userAddress.toLowerCase()]
    return userAddress.toLowerCase()
  }

  async verifySignedMessage ({
    msg,
    sig,
    chainId,
    userAddress
  }) {
    try {
      const verifiedAddress = await this._verifySignedMessage({
        msg,
        sig,
        chainId,
        userAddress
      })

      if (!verifiedAddress) throw new ForbiddenError('User address is not verified.', 'USER_ADDRESS_NOT_VERIFIED')

      return verifiedAddress.toLowerCase()
    } catch (err) {
      if (err.cause === 'NONCE_NOT_VERIFIED') throw err
      if (err.cause === 'USER_ADDRESS_NOT_VERIFIED') throw err

      const errorMessage = err.message || err.reason || err.shortMessage || 'Unknown error'
      logger.warn(`Some error occured while signature verification. Error: ${errorMessage}`)
      throw new ForbiddenError('Signature is not verified.', 'ERROR_SIGNATURE_VERIFICATION')
    }
  }

  verifyReferralCampaignSignedMessage ({
    uri,
    nonce,
    domain,
    address,
    version,
    chainId,
    issuedAt,
    referrer,
    signature,
    campaignId
  }) {
    const message = stringTemplater.referralCampaignMessageTemplater({
      uri,
      nonce,
      domain,
      address,
      version,
      chainId,
      issuedAt,
      campaignId
    })
    const signer = verifyMessage(message, signature).toLowerCase()

    if (signer !== referrer.toLowerCase()) {
      throw new ForbiddenError('Signer is not verified.', 'SIGNER_NOT_VERIFIED')
    }
    return referrer
  }

  async verifyCampaignKey (campaignKey) {
    const [
      timestamp,
      campaignId,
      campaignSignatureB64
    ] = campaignKey.split('-')

    this.checkTimestamp(timestamp)

    const campaign = await campaignService.findOneById(campaignId)
    if (!campaign) throw new NotFoundError('Campaign not found.', 'CAMPAING_NOT_FOUND')

    const msg = `API-AUTH-${campaignId}-${timestamp}`
    const digest = ethers.utils.id(msg)
    const campaignSignature = ethers.utils.base64.decode(campaignSignatureB64)
    const signer = ethers.utils.verifyMessage(digest, campaignSignature)

    if (signer !== campaign.signerAddress) {
      throw new ForbiddenError('Signer is not verified.', 'SIGNER_NOT_VERIFIED')
    }

    return campaign.creatorAddress.toLowerCase()
  }

  generateNonce (userAddress) {
    const nonce = dashboardKeyService.generateRandomNonce(10)
    this.nonceCache[userAddress.toLowerCase()] = nonce
    return nonce
  }

  async verifyWhitelistSig ({
    chainId,
    message,
    receiver,
    whitelistSig
  }) {
    try {
      const verifiedAddress = await this._verifySignedMessage({
        chainId,
        msg: message,
        sig: whitelistSig,
        userAddress: receiver
      })

      if (!verifiedAddress) throw new ForbiddenError('Receiver address is not verified.', 'RECEIVER_ADDRESS_NOT_VERIFIED')

      return verifiedAddress.toLowerCase()
    } catch (err) {
      if (err.cause === 'NONCE_NOT_VERIFIED') throw err
      if (err.cause === 'RECEIVER_ADDRESS_NOT_VERIFIED') throw err

      const errorMessage = err.message || err.reason || 'Unknown error'
      logger.warn(`Some error occured while whitelist signature verification. Error: ${errorMessage}`)
      throw new BadRequestError('Error whitelist signature verification', 'ERROR_WHITELIST_SIGNATURE_VERIFICATION')
    }
  }
}

module.exports = new LoginService()
