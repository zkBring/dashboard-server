const mongoose = require('mongoose')

const WhiteListItemSchema = new mongoose.Schema({
  email: String,
  address: String,
  twitterHandle: String,
  dispenser: {
    type: String,
    required: true
  },
  itemType: {
    type: String,
    required: true,
    enum: ['address', 'email', 'twitter']
  }
},
{
  timestamps: true
})

WhiteListItemSchema.index({ email: 1, dispenser: 1 })
WhiteListItemSchema.index({ address: 1, dispenser: 1 })
WhiteListItemSchema.index({ twitterHandle: 1, dispenser: 1 })
WhiteListItemSchema.index({ dispenser: 1, itemType: 1 })
WhiteListItemSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.type = ret.itemType
    ret.dispenser_id = ret.dispenser
    ret.twitter_handle = ret.twitterHandle
    delete ret._id
    delete ret.itemType
    delete ret.dispenser
    delete ret.twitterHandle
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}

const WhiteListItem = mongoose.model('WhiteListItem', WhiteListItemSchema)
module.exports = WhiteListItem
