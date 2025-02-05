const reclaimVerification = require('../models/reclaim-verification-model')

class reclaimVerificationService {
  async createReclaimVerification({ reclaimSessionId }) {
    const existingReclaimVerification = await reclaimVerification.findOne({ reclaimSessionId })
    
    if (existingReclaimVerification) {
      existingReclaimVerification.status = 'pending'
      existingReclaimVerification.cause = ''
      existingReclaimVerification.message = ''

      return await existingReclaimVerification.save()
    }

    return await reclaimVerification.create({ 
      reclaimSessionId,
      status: 'pending'
    })
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