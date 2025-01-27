const logger = require('../utils/logger')
const claimLinkService = require('../services/claim-link-service')
const { NotFoundError, ForbiddenError } = require('../utils/errors')

const deactivateClaimLink = async (req, res) => {
  const linkId = req.params.link_id
  logger.json({ controller: 'claim-link-controller', method: 'deactivateClaimLink', link_id: linkId })
  let linkItem = await claimLinkService.findOneByLinkIdAndPopulateCampaign(linkId)
  if (!linkItem) throw new NotFoundError('Claim link not found.', 'CLAIM_LINK_NOT_FOUND')

  if (linkItem?.campaign?.creatorAddress.toLowerCase() !== req.userAddress) {
    throw new ForbiddenError('User address doesn’t match campaign creator address', 'CREATOR_ADDRESS_NOT_VALID')
  }

  linkItem = await claimLinkService.updateActiveStatus(linkId, false)
  res.json({
    success: true,
    data: linkItem
  })
}

const reactivateClaimLink = async (req, res) => {
  const linkId = req.params.link_id
  logger.json({ controller: 'claim-link-controller', method: 'reactivateClaimLink', link_id: linkId })
  let linkItem = await claimLinkService.findOneByLinkIdAndPopulateCampaign(linkId)
  if (!linkItem) throw new NotFoundError('Claim link not found.', 'CLAIM_LINK_NOT_FOUND')

  if (linkItem?.campaign?.creatorAddress.toLowerCase() !== req.userAddress) {
    throw new ForbiddenError('User address doesn’t match campaign creator address', 'CREATOR_ADDRESS_NOT_VALID')
  }

  linkItem = await claimLinkService.updateActiveStatus(linkId, true)
  res.json({
    success: true,
    data: linkItem
  })
}

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
  deactivateClaimLink,
  reactivateClaimLink,
  getClaimLinkStatus,
  claim
}
