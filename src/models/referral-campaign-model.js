const mongoose = require('mongoose')

const ReferralCampaignSchema = new mongoose.Schema({
  creator: {
    type: String,
    required: true
  },
  title: String,
  description: String,
  active: {
    type: Boolean,
    required: true,
    default: true
  },
  apiKey: {
    type: String,
    required: true
  }
},
{
  timestamps: true
})

ReferralCampaignSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.api_key = ret.apiKey
    ret.campaign_active = ret.active
    ret.referral_campaign_id = ret._id
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.active
    delete ret.apiKey
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}

const ReferralCampaign = mongoose.model('ReferralCampaign', ReferralCampaignSchema)
module.exports = ReferralCampaign
