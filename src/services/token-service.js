const logger = require('../utils/logger')
const Token = require('../models/token-model')
const { BadRequestError } = require('../utils/errors')

class TokenService {
  async create ({
    name,
    copies,
    tokenId,
    thumbnail,
    properties,
    description,
    tokenCollection
  }) {
    const tokenDB = new Token({
      name,
      copies,
      tokenId,
      thumbnail,
      properties,
      description,
      tokenCollection
    })

    await tokenDB.save()
    logger.info(`Token ${name} was successfully saved to database`)
    return tokenDB
  }

  async findByCollectionId (collectionId) {
    return await Token.find({ tokenCollection: collectionId })
  }

  async findOneByTokenAndCollectionId ({ tokenId, tokenCollection }) {
    return await Token.findOne({ tokenId, tokenCollection })
  }

  async findOneByCampaignId (campaignId) {
    return await Token.findOne({ campaignId })
  }

  async countTokens (collectionId) {
    const tokens = await this.findByCollectionId(collectionId)
    const tokenCount = tokens.reduce((acc, cur) => {
      cur = parseInt(cur.copies)
      return acc + cur
    }, 0)
    return tokenCount.toString()
  }

  async bindCampaignIdToToken ({ collectionId, campaignId, tokenId }) {
    const token = await Token.findOne({ tokenCollection: collectionId, tokenId })
    if (!token) throw new BadRequestError('Token does not match any collection', 'TOKEN_NOT_MATCH_COLLECTION')

    return await Token.updateMany({ tokenCollection: collectionId, tokenId }, { campaignId })
  }
}

module.exports = new TokenService()
