const mongoose = require('mongoose')

const DispenserSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  claimStart: {
    type: Number,
    default: null
  },
  claimFinish: {
    type: Number,
    default: null
  },
  claimDuration: {
    type: Number
  },
  creatorAddress: {
    type: String,
    required: true
  },
  multiscanQrId: {
    type: String,
    required: true
  },
  encryptedMultiscanQrSecret: {
    type: String,
    required: true
  },
  encryptedMultiscanQrEncCode: {
    type: String,
    required: true
  },
  previewSetting: {
    type: String,
    enum: [
      'stub',
      'token',
      'custom'
    ],
    default: 'token'
  },
  popped: {
    type: Number, // number of times dispenser assigned claim links
    default: 0
  },
  active: {
    type: Boolean,
    default: true
  },
  redirectUrl: {
    type: String,
    default: null
  },
  redirectOn: {
    type: Boolean,
    default: false
  },
  whitelistOn: {
    type: Boolean,
    default: false
  },
  timeframeOn: {
    type: Boolean,
    default: false
  },
  whitelistType: {
    type: String,
    enum: [
      'email',
      'address',
      'twitter'
    ]
  },
  dynamic: {
    type: Boolean,
    default: false
  },
  reclaim: {
    type: Boolean,
    default: false
  },
  appTitle: {
    type: String,
    default: null
  },
  appTitleOn: {
    type: Boolean,
    default: false
  },
  archived: {
    type: Boolean,
    default: false
  },
  reclaimAppId: {
    type: String
  },
  reclaimAppSecret: {
    type: String
  },
  reclaimProviderId: {
    type: String
  },
  instagramFollowId: {
    type: String
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

DispenserSchema.index({ creatorAddress: 1 })
DispenserSchema.index({ multiscanQrId: 1 })
DispenserSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.dispenser_id = ret._id
    ret.app_title = ret.appTitle
    ret.links_assigned = ret.popped
    ret.redirect_on = ret.redirectOn
    ret.claim_start = ret.claimStart
    ret.app_title_on = ret.appTitleOn
    ret.claim_finish = ret.claimFinish
    ret.whitelist_on = ret.whitelistOn
    ret.timeframe_on = ret.timeframeOn
    ret.redirect_url = ret.redirectUrl
    ret.reclaim_app_id = ret.reclaimAppId
    ret.whitelist_type = ret.whitelistType
    ret.claim_duration = ret.claimDuration
    ret.multiscan_qr_id = ret.multiscanQrId
    ret.creator_address = ret.creatorAddress
    ret.preview_setting = ret.previewSetting
    ret.reclaim_app_secret = ret.reclaimAppSecret
    ret.instagram_follow_id = ret.instagramFollowId
    ret.reclaim_provider_id = ret.reclaimProviderId
    ret.reclaim_provider_type = ret.reclaimProviderType
    ret.encrypted_multiscan_qr_secret = ret.encryptedMultiscanQrSecret
    ret.encrypted_multiscan_qr_enc_code = ret.encryptedMultiscanQrEncCode
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.popped
    delete ret.appTitle
    delete ret.appTitleOn
    delete ret.claimStart
    delete ret.redirectOn
    delete ret.claimFinish
    delete ret.redirectUrl
    delete ret.whitelistOn
    delete ret.timeframeOn
    delete ret.reclaimAppId
    delete ret.whitelistType
    delete ret.claimDuration
    delete ret.multiscanQrId
    delete ret.creatorAddress
    delete ret.previewSetting
    delete ret.reclaimAppSecret
    delete ret.reclaimProviderId
    delete ret.instagramFollowId
    delete ret.reclaimProviderType
    delete ret.encryptedMultiscanQrSecret
    delete ret.encryptedMultiscanQrEncCode
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}

const Dispenser = mongoose.model('Dispenser', DispenserSchema)
module.exports = Dispenser
