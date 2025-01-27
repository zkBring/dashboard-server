const { ethers } = require('ethers')
const logger = require('../utils/logger')
const claimLinkService = require('./claim-link-service')
const { NotFoundError } = require('../utils/errors')

class P2PpaymentService {
  async getPaymentStatus (linkId) {
    linkId = ethers.utils.getAddress(linkId)
    const linkItem = await claimLinkService.findOneByLinkIdAndPopulateCampaign(linkId)
    if (!linkItem) throw new NotFoundError('Claim link not found.', 'CLAIM_LINK_NOT_FOUND')

    let linkStatusObj = await claimLinkService.fetchClaimLinkStatus(linkItem)
    linkStatusObj = this.mapLinkStatus(linkStatusObj)
    const operations = []

    if (linkStatusObj.status !== 'deposited' && linkStatusObj.status !== 'cancelled') {
      operations.push(
        {
          status: linkStatusObj.status,
          tx_hash: linkStatusObj.tx_hash,
          receiver: linkStatusObj.recipient,
          type: linkStatusObj.operationType,
          timestamp: linkStatusObj.created_at
        }
      )
    }
    return {
      fee_amount: '0',
      source: 'dashboard',
      transfer_id: linkId,
      status: linkStatusObj.status,
      wallet: linkItem.campaign.wallet,
      token: linkItem.campaign.tokenAddress,
      token_id: linkItem.claimParams.tokenId,
      amount: linkItem.claimParams.tokenAmount,
      sender: linkItem.campaign.creatorAddress,
      wei_amount: linkItem.claimParams.weiAmount,
      token_type: linkItem.campaign.tokenStandard,
      chain_id: parseInt(linkItem.campaign.chainId),
      total_amount: linkItem.claimParams.tokenAmount,
      escrow: linkItem.campaign.proxyContractAddress,
      expiration: linkItem.claimParams.expirationTime,
      version: linkItem.campaign.proxyContractVersion,
      fee_token: '0x0000000000000000000000000000000000000000',
      preferred_wallet_on: linkItem.campaign.preferredWalletOn,
      additional_wallets_on: linkItem.campaign.additionalWalletsOn,
      claiming_finished_button_on: linkItem.campaign.claimingFinishedButtonOn,
      claiming_finished_button_url: linkItem.campaign.claimingFinishedButtonUrl,
      claiming_finished_description: linkItem.campaign.claimingFinishedDescription,
      claiming_finished_button_title: linkItem.campaign.claimingFinishedButtonTitle,
      claiming_finished_auto_redirect: linkItem.campaign.claimingFinishedAutoRedirect,
      operations
    }
  }

  mapLinkStatus (linkStatusObj) {
    let status
    let operationType
    if (linkStatusObj.status === 'DEACTIVATED' || linkStatusObj.status === 'EXPIRED') {
      status = 'cancelled'
    }
    if (linkStatusObj.status === 'CREATED') {
      status = 'deposited'
    }
    if (linkStatusObj.status === 'FAILED') {
      status = 'error'
      operationType = 'redeem'
    }
    if (linkStatusObj.status === 'PENDING') {
      status = 'redeeming'
      operationType = 'redeem'
    }
    if (linkStatusObj.status === 'CLAIMED') {
      status = 'redeemed'
      operationType = 'redeem'
    }

    linkStatusObj.status = status
    linkStatusObj.operationType = operationType
    return linkStatusObj
  }

  async redeem ({
    linkId,
    countryCode,
    receiverAddress,
    receiverSignature
  }) {
    linkId = ethers.utils.getAddress(linkId)

    const txHash = await claimLinkService.claim({
      linkId,
      countryCode,
      receiverAddress,
      receiverSignature
    })

    logger.info(`Claim server redeemed payment with transfer ID ${linkId} to the address ${receiverAddress}. Tx hash: ${txHash}`)
    return txHash
  }
}

module.exports = new P2PpaymentService()
