const mongoose = require('mongoose')

const ReclaimVerificationSchema = new mongoose.Schema({
reclaimSessionId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: [
      'pending',
      'success',
      'failed'
    ]
  },
  cause: String,
  message: String
},
{
  timestamps: true
})

ReclaimVerificationSchema.index({ dispenser: 1, claimerId: 1 }, { unique: true })
ReclaimVerificationSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.claimer_id = ret.claimerId
    ret.dispenser_id = ret.dispenser
    ret.reclaim_provider_type = ret.reclaimProviderType
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.dispenser
    delete ret.reclaimProviderType
    delete ret.claimerId
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}
const ReclaimVerification = mongoose.model('ReclaimVerification', ReclaimVerificationSchema)
module.exports = ReclaimVerification
