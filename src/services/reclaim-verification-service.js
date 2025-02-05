const reclaimVerification = require('../models/reclaim-verification-model')

class reclaimVerificationService {
  async createReclaimVerification({ reclaimSessionId }) {
    console.log('reclaimSessionId', reclaimSessionId)
    return await reclaimVerification.create({ 
      reclaimSessionId,
      status: 'pending'
    })
  }
  
  async updateOnFailedVerification({ 
    reclaimSessionId, 
    message, 
    cause
  }) {
    await reclaimVerification.updateOne(
      { reclaimSessionId },
      { $set: {
          status: 'failed', 
          cause,
          message
        } 
      }
    )
  }
}

module.exports = new reclaimVerificationService()