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
  cause: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  }
},
{
  timestamps: true
})

ReclaimVerificationSchema.index({ reclaimSessionId: 1 }, { unique: true })
ReclaimVerificationSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.reclaim_session_id = ret.reclaimSessionId
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.reclaimSessionId
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}
const ReclaimVerification = mongoose.model('ReclaimVerification', ReclaimVerificationSchema)
module.exports = ReclaimVerification
