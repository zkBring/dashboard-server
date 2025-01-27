const QRSet = require('../models/qr-set-model')
const qrItemService = require('./qr-item-service')
const claimLinkService = require('./claim-link-service')
const { NotFoundError } = require('../utils/errors')
const logger = require('../utils/logger')

class QRSetService {
  async create (setName, qrQuantity, creatorAddress) {
    const qrSetDB = new QRSet({ setName, qrQuantity, creatorAddress })
    await qrSetDB.save()

    logger.info(`QRSet ${setName} was successfully saved to database`)
    return qrSetDB
  }

  async findByCreatorAddress (creatorAddress) {
    return await QRSet.find({ creatorAddress })
      .select(['-creatorAddress'])
      .sort({ createdAt: -1 })
  }

  async findOneBySetId (setId) {
    return await QRSet.findOne({ _id: setId })
  }

  async findByCreatorAddressAndPopulateCampaign (creatorAddress) {
    return await QRSet.find({ creatorAddress })
      .populate('campaign', ['_id', 'title', 'chainId', 'proxyContractAddress'])
      .select(['-creatorAddress'])
      .sort({ createdAt: -1 })
  }

  async findOneBySetIdAndPopulateCampaign (setId) {
    return await QRSet.findOne({ _id: setId })
      .populate('campaign', ['_id', 'title'])
  }

  async updateQRSetStatus (setId, status) {
    try {
      const qrSet = await QRSet.findOneAndUpdate(
        { _id: setId },
        { status },
        { runValidators: true, new: true }
      ).populate('campaign', ['_id', 'title'])
      return qrSet
    } catch (err) {
      logger.error(err)
    }
  }

  async updateQRSetQuantity (setId, qrQuantity) {
    try {
      const qrSet = await QRSet.findOneAndUpdate(
        { _id: setId },
        { qrQuantity },
        { runValidators: true, new: true }
      )
      return qrSet
    } catch (err) {
      logger.error(err)
    }
  }

  async fetchLinkItemForQRSet (setId) {
    const qrItem = await qrItemService.findOneByQRSetId(setId)
    if (!qrItem) throw new NotFoundError('QR item not found.', 'QR_ITEM_NOT_FOUND')

    const linkId = qrItem?.claimLinkId
    const linkItem = await claimLinkService.findOneByLinkIdAndPopulateCampaign(linkId)
    if (!linkItem) throw new NotFoundError('Claim link not found.', 'CLAIM_LINK_NOT_FOUND')
    return linkItem
  }

  async updateQRSetLinksUploadedStatus (setId, status) {
    let qrSet = await QRSet.findOneAndUpdate(
      { _id: setId },
      {
        $set: { linksUploaded: status },
        $unset: { campaign: '' }
      },
      { runValidators: true, new: true }
    )

    if (qrSet.linksUploaded) {
      qrSet = await this.addCampaignToQRSet(qrSet._id)
    }

    return qrSet
  }

  async addCampaignToQRSet (setId) {
    const linkItem = await this.fetchLinkItemForQRSet(setId)
    const qrSet = await QRSet.findOneAndUpdate(
      { _id: setId },
      { campaign: linkItem?.campaign?._id },
      { runValidators: true, new: true }
    )
    return qrSet
  }

  async updateQRSet ({ setId, archived }) {
    const updatedQRSet = await QRSet.findOneAndUpdate(
      { _id: setId },
      { archived },
      { runValidators: true, new: true }
    )

    if (!updatedQRSet) throw new NotFoundError('QR set not found', 'QR_SET_NOT_FOUND')

    return updatedQRSet
  }
}

module.exports = new QRSetService()
