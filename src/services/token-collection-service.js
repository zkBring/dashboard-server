const logger = require('../utils/logger')
const tokenService = require('./token-service')
const { NotFoundError } = require('../utils/errors')
const tokenCounterService = require('./token-counter-service')
const TokenCollection = require('../models/token-collection-model')

class TokenCollectionService {
  async create ({
    sbt,
    title,
    symbol,
    chainId,
    thumbnail,
    tokenAddress,
    tokenStandard,
    creatorAddress
  }) {
    creatorAddress = creatorAddress.toLowerCase()
    const collectionDB = new TokenCollection({
      sbt,
      title,
      symbol,
      chainId,
      thumbnail,
      tokenAddress,
      tokenStandard,
      creatorAddress
    })

    await collectionDB.save()
    logger.info(`Token collection ${title} was successfully saved to database`)
    return collectionDB
  }

  async findByCreatorAddress (creatorAddress) {
    creatorAddress = creatorAddress.toLowerCase()
    return await TokenCollection.find({ creatorAddress }).sort({ createdAt: -1 })
  }

  async findOneById (collectionId) {
    return await TokenCollection.findOne({ _id: collectionId })
  }

  async findOneByIdAndCountTokens (collectionId) {
    let collection = await this.findOneById(collectionId)
    const tokenCount = await tokenService.countTokens(collection._id)
    collection = collection.toJSON()
    collection.tokens_amount = tokenCount
    return collection
  }

  async findByCreatorAddressAndCountTokens (creatorAddress) {
    const collections = await this.findByCreatorAddress(creatorAddress)
    return Promise.all(collections.map(async (collection) => {
      const tokenCount = await tokenService.countTokens(collection._id)
      collection = collection.toJSON()
      collection.tokens_amount = tokenCount
      return collection
    }))
  }

  async getCollectionsWithTokenCounts (creatorAddress) {
    const collections = await this.findByCreatorAddress(creatorAddress)
    return Promise.all(collections.map(async (collection) => {
      const tokens = await tokenService.findByCollectionId(collection._id)
      const {
        linksCount,
        linksClaimed
      } = await tokenCounterService.countTotalTokenLinksAndClaims(tokens)

      collection = collection.toJSON()
      collection.tokens_amount = tokens.length
      collection.links_count = linksCount
      collection.links_claimed = linksClaimed
      return collection
    }))
  }

  async updateCollection ({ collectionId, archived }) {
    const updatedCollection = await TokenCollection.findOneAndUpdate(
      { _id: collectionId },
      { archived },
      { runValidators: true, new: true }
    )

    if (!updatedCollection) throw new NotFoundError('Collection not found', 'COLLECTION_NOT_FOUND')

    return updatedCollection
  }
}

module.exports = new TokenCollectionService()
