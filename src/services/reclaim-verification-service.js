const ReclaimVerification = require('../models/reclaim-verification-model')

class reclaimVerificationService {
  async createReclaimVerification({ reclaimSessionId }) {
    const existingReclaimVerification = await ReclaimVerification.findOne({ reclaimSessionId })
    
    if (existingReclaimVerification) {
      existingReclaimVerification.status = 'pending'
      existingReclaimVerification.cause = ''
      existingReclaimVerification.message = ''

      return await existingReclaimVerification.save()
    }

    return await ReclaimVerification.create({ 
      reclaimSessionId,
      status: 'pending'
    })
  }

  async findOneByReclaimSessionId({ reclaimSessionId }) {
    return await ReclaimVerification.findOne({ reclaimSessionId })
  }

  async updateReclaimVerificationHandle ({
    reclaimVerification,
    handle
  }) {
    reclaimVerification.handle = handle.toLowerCase()

    return await reclaimVerification.save()
  }
  
  async updateReclaimVerification({
    reclaimVerification,
    message,
    status,
    cause
  }) {
    reclaimVerification.status = status
    reclaimVerification.message = message
    reclaimVerification.cause = cause
    
    return await reclaimVerification.save()
  }
}

module.exports = new reclaimVerificationService()