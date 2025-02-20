const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
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
      'instagram',
      'x',
      'luma'
    ]
  },
  reclaimSessionId: {
    type: String
  },
  linkId: {
    type: String
  },
  dispenserId: {
    type: String
  }
},
{
  timestamps: true
})

UserSchema.index({ handle: 1, dispenserId: 1 }, { unique: true })
UserSchema.options.toJSON = {
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
const User = mongoose.model('User', UserSchema)
module.exports = User
