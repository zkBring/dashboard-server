const mongoose = require('mongoose')

const DispenserLinkSchema = new mongoose.Schema({
  dispenserId: {
    type: String,
    required: true
  },
  linkId: {
    type: String,
    required: true,
    unique: true
  },
  linkNumber: {
    type: Number,
    required: true
  },
  encryptedClaimLink: {
    type: String,
    required: true
  },
  receiver: String,
  scanId: String,

  // relcaim attributes (only for reclaim proofs)
  reclaimDeviceId: String, // "owner" in relcaim docs
  reclaimSessionId: String // "owner" in relcaim docs
  // reclaimProofUserId: String,
},
{
  timestamps: true
})

DispenserLinkSchema.index({ linkId: 1 }, { unique: true })
DispenserLinkSchema.index({ reclaimSessionId: 1 })
DispenserLinkSchema.index({ dispenserId: 1, scanId: 1 })
DispenserLinkSchema.index({ dispenserId: 1, linkNumber: 1 })
DispenserLinkSchema.index({ linkId: 1, reclaimDeviceId: 1 }, { unique: true })
DispenserLinkSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.link_id = ret.linkId
    ret.scan_id = ret.scanId
    ret.link_number = ret.linkNumber
    ret.dispenser_id = ret.dispenserId
    ret.reclaim_device_id = ret.reclaimDeviceId
    ret.reclaim_session_id = ret.reclaimSessionId
    ret.encrypted_claim_link = ret.encryptedClaimLink
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.linkId
    delete ret.scanId
    delete ret.linkNumber
    delete ret.dispenserId
    delete ret.reclaimSessionId
    delete ret.encryptedClaimLink
    delete ret.device.reclaimDeviceId
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}

const DispenserLink = mongoose.model('DispenserLink', DispenserLinkSchema)
module.exports = DispenserLink
