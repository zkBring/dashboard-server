const logger = require('../utils/logger')
const qrManagerService = require('../services/qr-manager-service')

const getQrCampaigns = async (req, res) => {
  const creatorAddress = req.userAddress.toLowerCase()
  logger.json({ controller: 'qr-manager-controller', method: 'getQrCampaigns', user_address: creatorAddress })

  const items = await qrManagerService.getQrCampaigns(creatorAddress)

  res.json({
    success: true,
    items
  })
}

module.exports = {
  getQrCampaigns
}
