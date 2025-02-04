const mongoose = require('mongoose')

const ClaimerSchema = new mongoose.Schema({
  dispenser: {
    type: String,
    required: true
  },
  claimerId: {
    type: String,
    required: true
  },
  reclaimProviderType: {
    type: String,
    enum: [
      'instagram'
    ]
  }
},
{
  timestamps: true
})

ClaimerSchema.index({ dispenser: 1, claimerId: 1 }, { unique: true })
ClaimerSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.claimer_id = ret.claimerId
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.claimerId
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}
const Claimer = mongoose.model('Claimer', ClaimerSchema)
module.exports = Claimer
