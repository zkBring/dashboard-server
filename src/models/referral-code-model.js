const mongoose = require('mongoose')

const ReferralCodeSchema = new mongoose.Schema({
  referrer: {
    type: String,
    required: true
  },
  linkId: {
    type: String,
    required: true
  },
  claimCode: {
    type: String,
    required: true
  },
  referralCampaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReferralCampaign',
    required: true
  }
},
{
  timestamps: true
})

ReferralCodeSchema.index({ referralCampaign: 1 })
ReferralCodeSchema.index({ referrer: 1 })
ReferralCodeSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.link_id = ret.linkId
    ret.claim_code = ret.claimCode
    ret.referral_campaign_id = ret.referralCampaign
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.linkId
    delete ret.claimCode
    delete ret.referralCampaign
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}

const ReferralCode = mongoose.model('ReferralCode', ReferralCodeSchema)
module.exports = ReferralCode
