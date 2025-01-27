const mongoose = require('mongoose')

const QRSetSchema = new mongoose.Schema({
  setName: String,
  qrQuantity: Number,
  creatorAddress: String,
  linksUploaded: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: [
      'NOT_SENT_TO_PRINTER',
      'SENT_TO_PRINTER',
      'ON_ITS_WAY_TO_WAREHOUSE',
      'BEING_INSERTED_TO_BOXES',
      'READY_TO_SHIP',
      'SHIPPING',
      'SHIPPED'
    ],
    default: 'NOT_SENT_TO_PRINTER'
  },
  archived: {
    type: Boolean,
    default: false
  },
  campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign' }
},
{
  timestamps: true
})

QRSetSchema.index({ creatorAddress: 1 })
QRSetSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.set_id = ret._id
    ret.set_name = ret.setName
    ret.qr_quantity = ret.qrQuantity
    ret.creator_address = ret.creatorAddress
    ret.links_uploaded = ret.linksUploaded
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.setName
    delete ret.qrQuantity
    delete ret.creatorAddress
    delete ret.linksUploaded
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}

const QRSet = mongoose.model('QRSet', QRSetSchema)
module.exports = QRSet
