const logger = require('../utils/logger')
const Batch = require('../models/batch-model')
const { NotFoundError } = require('../utils/errors')
const claimLinkService = require('./claim-link-service')

class BatchService {
  async create (campaignId, batchDescription) {
    const batchDB = new Batch({
      campaign: campaignId,
      batchDescription
    })

    await batchDB.save()

    logger.info(`Batch for campaign ${campaignId} was successfully saved to database`)
    return batchDB
  }

  async findByCampaignId (campaignId) {
    return await Batch.find({ campaign: campaignId })
      .select(['-campaign'])
      .sort({ createdAt: -1 })
  }

  async findOneById (batchId) {
    return await Batch.findOne({ _id: batchId })
  }

  async aggregateBatchesAndLinks (batchArray, claimLinkArray) {
    const batches = []
    batchArray.forEach(batch => {
      const claimLinks = claimLinkArray
        .filter(claimLink => {
          return batch._id.toString() === claimLink.batch.toString()
        })
        .map(claimLink => {
          return {
            link_id: claimLink.linkId,
            encrypted_claim_link: claimLink.encryptedClaimLink
          }
        })

      batches.push({
        batch_id: batch._id,
        batch_description: batch.batchDescription,
        created_at: batch.createdAt,
        updated_at: batch.updatedAt,
        claim_links: claimLinks
      })
    })
    return batches
  }

  async countLinksAndAggregateWithBatches (batchArray) {
    const batches = []
    await Promise.all(batchArray.map(async (batch) => {
      const claimLinksCount = await claimLinkService.countLinksByBatchId(batch._id)
      batches.push({
        batch_id: batch._id,
        qr_campaign: batch.qrCampaign,
        qr_campaign_type: batch.qrCampaignType,
        batch_description: batch.batchDescription,
        claim_links_count: claimLinksCount,
        created_at: batch.createdAt,
        updated_at: batch.updatedAt
      })
    }))

    const sortedBatches = batches.sort((batch1, batch2) => batch2.created_at - batch1.created_at)
    return sortedBatches
  }

  async setQrCampaign ({
    linkId,
    qrCampaign,
    qrCampaignType
  }) {
    const linkItem = await claimLinkService.findOneByLinkIdAndPopulateCampaign(linkId)
    if (!linkItem) throw new NotFoundError('Claim link not found.', 'CLAIM_LINK_NOT_FOUND')
    const batchId = linkItem.batch

    return await Batch.findOneAndUpdate({ _id: batchId }, { qrCampaign, qrCampaignType }, { new: true })
  }
}

module.exports = new BatchService()
