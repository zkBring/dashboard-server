const mongoose = require('mongoose')

const HandleSchema = new mongoose.Schema({
  handle: {
    type: String,
    required: true
  },
  alreadyClaimed: {
    type: Boolean,
    default: false
  },
  reclaimProviderType: {
    type: String,
    enum: [
      'instagram'
    ],
    default: 'instagram'
  },
  reclaimSessionId: {
    type: String
  },
  lindId: {
    type: String
  }
},
{
  timestamps: true
})

HandleSchema.index({ handle: 1 }, { unique: true })
HandleSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.reclaim_provider_type = ret.reclaimProviderType
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}
const Handle = mongoose.model('Handle', HandleSchema)
module.exports = Handle
