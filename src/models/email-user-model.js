const mongoose = require('mongoose')

const EmailUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  userAddress: {
    type: String,
    required: true
  }
},
{
  timestamps: true
})

EmailUserSchema.index({ userAddress: 1 })
EmailUserSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.user_address = ret.userAddress
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret.userAddress
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}

const EmailUser = mongoose.model('EmailUser', EmailUserSchema)
module.exports = EmailUser
