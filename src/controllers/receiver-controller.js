const logger = require('../utils/logger')
const qrItemService = require('../services/qr-item-service')
const claimLinkService = require('../services/claim-link-service')
const { NotFoundError } = require('../utils/errors')

const getLink = async (req, res) => {
  logger.json({ controller: 'receiver-controller', method: 'getLink' })
  const qrId = req.params.qr_id

  const qrItem = await qrItemService.findOneByIdPopulatedWithQRSet(qrId)
  if (!qrItem) throw new NotFoundError('QR item is not found', 'QR_ITEM_NOT_FOUND')

  logger.json({ qr_id: qrItem.qrId, qr_set_id: qrItem.QRSet._id, link_id: qrItem.claimLinkId || 'LINK_NOT_MAPPED' })

  if (!qrItem.QRSet.linksUploaded) {
    res.json({ success: true })
    return
  }

  res.json({
    success: true,
    encrypted_claim_link: qrItem.encryptedClaimLink
  })
}

const getLinkWithClaimParams = async (req, res) => {
  const linkId = req.params.link_id
  logger.json({ controller: 'receiver-controller', method: 'getLinkWithClaimParams', link_id: linkId })

  const linkItem = await claimLinkService.getLinkWithClaimParams(linkId)
  if (!linkItem) throw new NotFoundError('Claim link not found.', 'CLAIM_LINK_NOT_FOUND')

  res.json({
    success: true,
    data: linkItem
  })
}

module.exports = {
  getLink,
  getLinkWithClaimParams
}
