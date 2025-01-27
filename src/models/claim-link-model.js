const mongoose = require('mongoose')

const ClaimLinkSchema = new mongoose.Schema({
  linkId: {
    type: String,
    required: true
  },
  claimParams: {
    tokenId: { type: String },
    tokenAmount: { type: String },
    senderSignature: { type: String },
    weiAmount: {
      type: String,
      default: '0'
    },
    expirationTime: { type: Number }
  },
  encryptedClaimLink: {
    type: String,
    required: true,
    default: 'NO_DATA'
  },
  encryptedClaimCode: { // encrypted with dashboard key
    type: String,
    required: true,
    default: 'NO_DATA'
  },
  active: {
    type: Boolean,
    required: true,
    default: true
  },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true }
},
{
  timestamps: true
})

ClaimLinkSchema.index({ campaign: 1 })
ClaimLinkSchema.index({ batch: 1 })
ClaimLinkSchema.index({ linkId: 1 })
ClaimLinkSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.link_id = ret.linkId
    ret.batch_id = ret.batch
    ret.campaign_id = ret.campaign
    ret.token_id = ret.claimParams.tokenId
    ret.wei_amount = ret.claimParams.weiAmount
    ret.token_amount = ret.claimParams.tokenAmount
    ret.encrypted_claim_code = ret.encryptedClaimCode
    ret.encrypted_claim_link = ret.encryptedClaimLink
    ret.expiration_time = ret.claimParams.expirationTime
    ret.sender_signature = ret.claimParams.senderSignature
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.batch
    delete ret.linkId
    delete ret.campaign
    delete ret.claimParams
    delete ret.batchDescription
    delete ret.encryptedClaimLink
    delete ret.encryptedClaimCode
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}

const ClaimLink = mongoose.model('ClaimLink', ClaimLinkSchema)
module.exports = ClaimLink
