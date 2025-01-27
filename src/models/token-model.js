const mongoose = require('mongoose')

const TokenSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  copies: {
    type: String,
    required: true
  },
  tokenId: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  properties: {
    type: Object,
    required: true
  },
  description: {
    type: String
  },
  campaignId: {
    type: String,
    default: null
  },
  tokenCollection: { type: mongoose.Schema.Types.ObjectId, ref: 'TokenCollection', required: true }
},
{
  timestamps: true
})

TokenSchema.index({ tokenCollection: 1 })
TokenSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.token_id = ret.tokenId
    ret.campaign_id = ret.campaignId
    ret.token_collection = ret.tokenCollection
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.tokenId
    delete ret.campaignId
    delete ret.tokenCollection
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}

const Token = mongoose.model('Token', TokenSchema)
module.exports = Token
