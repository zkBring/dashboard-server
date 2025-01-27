const WhiteListItem = require('../models/whitelist-item-model')
const { ValidationError } = require('../utils/errors')
const logger = require('../utils/logger')

class WhiteListService {
  async findOneByDispenserId (dispenserId) {
    return WhiteListItem.findOne({ dispenser: dispenserId })
  }

  async findOne (receiver, whitelistType, dispenserId) {
    receiver = receiver.toLowerCase()
    let whitelistItemDB

    switch (true) {
      case whitelistType === 'address':
        whitelistItemDB = await WhiteListItem.findOne({ address: receiver, dispenser: dispenserId })
        break
      case whitelistType === 'email':
        whitelistItemDB = await WhiteListItem.findOne({ email: receiver, dispenser: dispenserId })
        break
      case whitelistType === 'twitter':
        whitelistItemDB = await WhiteListItem.findOne({ twitterHandle: receiver, dispenser: dispenserId })
        break
      default:
        throw new ValidationError('Invalid whitelistType.', 'INVALID_WHITELIST_TYPE')
    }

    return whitelistItemDB
  }

  async create ({ dispenserId, whitelist, whitelistType }) {
    const itemsToInsert = whitelist.map(item => {
      const itemObj = {
        dispenser: dispenserId,
        itemType: whitelistType
      }

      switch (true) {
        case whitelistType === 'address':
          itemObj.address = item.toLowerCase()
          break
        case whitelistType === 'email':
          itemObj.email = item.toLowerCase()
          break
        case whitelistType === 'twitter':
          itemObj.twitterHandle = item.toLowerCase()
          break
        default:
          throw new ValidationError(
            'Invalid whitelistType.', 'INVALID_WHITELIST_TYPE'
          )
      }

      return itemObj
    })

    const insertedItems = await WhiteListItem.insertMany(itemsToInsert)
    logger.info(
      `${itemsToInsert.length} whitelist items with type __${whitelistType}__ was successfully added to dispenser ${dispenserId}`
    )
    return insertedItems
  }

  async getWhitelist (dispenser) {
    if (!dispenser.whitelistType) return []

    return await WhiteListItem.find({
      dispenser: dispenser._id,
      itemType: dispenser.whitelistType
    })
  }

  async countItemsByDispenserId (dispenserId) {
    return await WhiteListItem.countDocuments({ dispenser: dispenserId })
  }

  async deleteItemsByDispenserId (dispenserId) {
    const deletedItemsCount = await WhiteListItem.deleteMany({ dispenser: dispenserId })
    logger.info(`${deletedItemsCount.deletedCount} whitelist items for dispenser ${dispenserId} was deleted from DB.`)
    return deletedItemsCount
  }
}

module.exports = new WhiteListService()
