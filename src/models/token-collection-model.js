const mongoose = require('mongoose')

const TokenCollectionSchema = new mongoose.Schema({
  sbt: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  chainId: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  tokenAddress: {
    type: String,
    required: true
  },
  creatorAddress: {
    type: String,
    required: true
  },
  tokenStandard: {
    type: String,
    required: true,
    enum: [
      'ERC20',
      'ERC721',
      'ERC1155'
    ]
  },
  archived: {
    type: Boolean,
    default: false
  }
},
{
  timestamps: true
})

TokenCollectionSchema.index({ creatorAddress: 1 })
TokenCollectionSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.chain_id = ret.chainId
    ret.collection_id = ret._id
    ret.tokens_amount = ret.tokensAmount
    ret.token_address = ret.tokenAddress
    ret.token_standard = ret.tokenStandard
    ret.creator_address = ret.creatorAddress
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.chainId
    delete ret.tokensAmount
    delete ret.tokenAddress
    delete ret.tokenStandard
    delete ret.creatorAddress
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}

const TokenCollection = mongoose.model('TokenCollection', TokenCollectionSchema)
module.exports = TokenCollection
