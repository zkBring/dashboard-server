const logger = require('../utils/logger')
const { ValidationError } = require('../utils/errors')
const DispenserLink = require('../models/dispenser-link-model')

class DispenserLinkService {
  async create ({
    dispenserId,
    encryptedClaimLinks,
    indexOffset = 0 // offset is needed for topping up links to existing dispenser
  }) {
    try {
      const linksToInsert = encryptedClaimLinks.map((linkObj, index) => {
        return {
          dispenserId,
          linkNumber: indexOffset + index + 1,
          linkId: linkObj.link_id,
          encryptedClaimLink: linkObj.encrypted_claim_link
        }
      })

      const insertedLinks = await DispenserLink.insertMany(linksToInsert)
      logger.info(`${linksToInsert.length} links for dispenser ${dispenserId} was successfully saved to DB.`)
      return insertedLinks
    } catch (err) {
      if (err.code === 11000) throw new ValidationError('Uploading duplicate links is forbidden.', 'UPLOADING_DUPLICATE_LINKS_IS_FORBIDDEN')
      throw err
    }
  }

  async findOneByDispenserId (dispenserId) {
    return await DispenserLink.findOne({ dispenserId })
  }

  async countLinksByDispenserId (dispenserId) {
    return await DispenserLink.countDocuments({ dispenserId })
  }

  async findOneByDispenserIdAndScanId (dispenserId, scanId) {
    return await DispenserLink.findOne({ dispenserId, scanId })
  }

  async findOneByDispenserIdAndReceiver (dispenserId, receiver) {
    receiver = receiver.toLowerCase()
    return await DispenserLink.findOne({ dispenserId, receiver })
  }

  async findOneByDispenserIdAndReclaimDeviceId (dispenserId, reclaimDeviceId) {
    return await DispenserLink.findOne({ dispenserId, reclaimDeviceId })
  }

  async findOneByDispenserIdAndReclaimSessionId (dispenserId, reclaimSessionId) {
    return await DispenserLink.findOne({ dispenserId, reclaimSessionId })
  }

  async findOneByDispenserIdAndLinkNumber (dispenserId, linkNumber) {
    return await DispenserLink.findOne({ dispenserId, linkNumber })
  }

  async deleteLinks (dispenserId) {
    return await DispenserLink.deleteMany({ dispenserId })
  }
}

module.exports = new DispenserLinkService()
