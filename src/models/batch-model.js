const mongoose = require('mongoose')

const BatchSchema = new mongoose.Schema({
  batchDescription: {
    type: String,
    required: true
  },
  qrCampaign: String,
  qrCampaignType: {
    type: String,
    enum: [
      'QR_SET',
      'RECLAIM',
      'DISPENSER',
      'DYNAMIC_DISPENSER'
    ]
  },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true }
},
{
  timestamps: true
})

BatchSchema.index({ campaign: 1 })
BatchSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.batch_id = ret._id
    ret.qr_campaign = ret.qrCampaign
    ret.qr_campaign_type = ret.qrCampaignType
    ret.batch_description = ret.batchDescription
    ret.campaign_id = ret.campaign
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.qrCampaign
    delete ret.qrCampaignType
    delete ret.batchDescription
    delete ret.campaign
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}

const Batch = mongoose.model('Batch', BatchSchema)
module.exports = Batch
