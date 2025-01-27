const dashboardKeyService = require('../services/dashboard-key-service')
const { BadRequestError, ForbiddenError, NotFoundError } = require('../utils/errors')
const logger = require('../utils/logger')

const getEncryptedKey = async (req, res) => {
  const userAddress = req.userAddress
  logger.json({ controller: 'dashboard-key-controller', method: 'getEncryptedKey', user_address: req.userAddress })

  if (!userAddress) {
    throw new BadRequestError('User address is not provided', 'USER_ADDRESS_NOT_PROVIDED')
  }

  let dashboardKeyDB = await dashboardKeyService.findByUserAddress(userAddress)

  if (!dashboardKeyDB) {
    dashboardKeyDB = await dashboardKeyService.generateDashboardKey(userAddress)

    res.json({
      success: true,
      nonce: dashboardKeyDB.nonce,
      sig_message: dashboardKeyDB.sigMessage,
      key_id: dashboardKeyDB.keyId
    })
    return
  }

  res.json({
    success: true,
    nonce: dashboardKeyDB.nonce,
    sig_message: dashboardKeyDB.sigMessage,
    key_id: dashboardKeyDB.keyId,
    encrypted_key: dashboardKeyDB.encryptedKey
  })
}

const addEncryptedKey = async (req, res) => {
  const userAddress = req.userAddress
  const keyId = req.body.key_id.toLowerCase()
  const encryptedKey = req.body.encrypted_key
  logger.json({ controller: 'dashboard-key-controller', method: 'addEncryptedKey', user_address: req.userAddress })

  if (!userAddress) {
    throw new BadRequestError('User address is not provided', 'USER_ADDRESS_NOT_PROVIDED')
  }

  const dashboardKeyDB = await dashboardKeyService.findByUserAddress(userAddress)

  if (!dashboardKeyDB) {
    throw new NotFoundError('Dashboard key is not found', 'DASHBOARD_KEY_NOT_FOUND')
  }

  if (!(dashboardKeyDB.userAddress === userAddress && dashboardKeyDB.keyId === keyId)) {
    throw new ForbiddenError('Key id or user address is not verified', 'KEY_ID_OR_USER_ADDRESS_NOT_VERIFIED')
  }

  if (dashboardKeyDB.encryptedKey || dashboardKeyDB.active) {
    throw new ForbiddenError('Encrypted key already exists', 'ENCRYPTED_KEY_EXSISTS')
  }

  await dashboardKeyService.updateDashboardKey(userAddress, encryptedKey)

  res.json({
    success: true
  })
}

module.exports = {
  getEncryptedKey,
  addEncryptedKey
}
