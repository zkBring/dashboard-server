const logger = require('../utils/logger')
const claimLinkService = require('../services/claim-link-service')
const { NotFoundError, ForbiddenError } = require('../utils/errors')

const getClaimLinkStatus = async (req, res) => {
  const linkId = req.params.link_id
  logger.json({ controller: 'claim-link-controller', method: 'getClaimLinkStatus', link_id: linkId })

  const status = await claimLinkService.getClaimLinkStatusById(linkId)

  res.send({
    success: true,
    data: status
  })
}

const claim = async (req, res) => {
  const linkId = req.params.link_id
  const countryCode = req.get('country-code')
  const {
    receiver_address: receiverAddress,
    receiver_signature: receiverSignature
  } = req.body
  logger.json({ controller: 'claim-link-controller', method: 'claim', link_id: linkId })

  const txHash = await claimLinkService.claim({
    linkId,
    countryCode,
    receiverAddress,
    receiverSignature
  })
  logger.info(`Claim server claimed link ${linkId} to the address ${receiverAddress}. Tx hash: ${txHash}`)

  res.send({
    success: true,
    data: {
      tx_hash: txHash
    }
  })
}

module.exports = {
  getClaimLinkStatus,
  claim
}
