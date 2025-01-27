const mongoose = require('mongoose')

const DashboardKeySchema = new mongoose.Schema({
  userAddress: {
    type: String,
    required: true
  },
  nonce: {
    type: String,
    required: true
  },
  keyId: {
    type: String,
    required: true
  },
  sigMessage: {
    type: String,
    required: true
  },
  encryptedKey: {
    type: String
  },
  derivationMethod: {
    type: String,
    enum: ['SIGNATURE']
  },
  active: {
    type: Boolean
  }
},
{
  timestamps: true
})

DashboardKeySchema.index({ userAddress: 1 })
DashboardKeySchema.index({ keyId: 1 }, { unique: true })
DashboardKeySchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.user_address = ret.userAddress
    ret.encrypted_key = ret.encryptedKey
    ret.key_id = ret.keyId
    ret.derivation_method = ret.derivationMethod
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.userAddress
    delete ret.encryptedKey
    delete ret.keyId
    delete ret.derivationMethod
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}

const DashboardKey = mongoose.model('DashboardKey', DashboardKeySchema)
module.exports = DashboardKey
