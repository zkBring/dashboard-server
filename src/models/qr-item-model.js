const mongoose = require('mongoose')

const QRItemSchema = new mongoose.Schema({
  qrId: {
    type: String,
    required: true
  },
  encryptedQrSecret: {
    type: String,
    required: true
  },
  claimLinkId: String,
  encryptedClaimLink: String,
  QRSet: { type: mongoose.Schema.Types.ObjectId, ref: 'QRSet' }
},
{
  timestamps: true
})

QRItemSchema.index({ qrId: 1 })
QRItemSchema.index({ QRSet: 1 })
QRItemSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.qr_id = ret.qrId
    ret.encrypted_qr_secret = ret.encryptedQrSecret
    ret.claim_link_id = ret.claimLinkId
    ret.encrypted_claim_link = ret.encryptedClaimLink
    ret.qr_set_id = ret.QRSet
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.qrId
    delete ret.encryptedQrSecret
    delete ret.claimLinkId
    delete ret.encryptedClaimLink
    delete ret.QRSet
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}

const QRItem = mongoose.model('QRItem', QRItemSchema)
module.exports = QRItem
