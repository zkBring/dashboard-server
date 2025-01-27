const crypto = require('crypto')
const ethers = require('ethers')
const logger = require('../utils/logger')
const stageConfig = require('../../stage-config')
const DashboardKey = require('../models/dashboard-key-model')

class DashboardKeyService {
  random () {
    const buffer = crypto.randomBytes(4)
    return buffer.readUInt32LE()
  }

  generateRandomNonce (n) {
    const arr = Array.from({ length: n }, (v, k) => this.random())
    return arr.join('').substring(0, n)
  }

  generateKeyId (sigMessage) {
    sigMessage = sigMessage.toLowerCase()
    return ethers.utils.id(sigMessage)
  }

  async findByUserAddress (userAddress) {
    return DashboardKey.findOne({ userAddress })
  }

  async create (userAddress, nonce, keyId, sigMessage) {
    const dashboardKeyDB = new DashboardKey({
      userAddress,
      nonce,
      keyId,
      sigMessage
    })

    await dashboardKeyDB.save()
    logger.info(`userAddress ${userAddress} was successfully saved to database`)
    return dashboardKeyDB
  }

  async generateDashboardKey (userAddress) {
    const nonce = this.generateRandomNonce(10)
    const sigMessage = `${stageConfig.DASHBOARD_KEY_SIG_MESSAGE} ${nonce}`
    const keyId = this.generateKeyId(sigMessage)
    const dashboardKeyDB = await this.create(
      userAddress,
      nonce,
      keyId,
      sigMessage
    )

    return dashboardKeyDB
  }

  async updateDashboardKey (userAddress, encryptedKey) {
    try {
      const dashboardKey = await DashboardKey.findOneAndUpdate(
        { userAddress },
        {
          encryptedKey,
          derivationMethod: 'SIGNATURE',
          active: true
        },
        {
          runValidators: true,
          new: true
        })

      return dashboardKey
    } catch (err) {
      const errorMessage = err.message || err.reason || 'Unknown error'
      logger.error(`Error occured while updating dashboard key. Error: ${errorMessage}`)
      throw err
    }
  }
}

module.exports = new DashboardKeyService()
