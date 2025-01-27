const p2pPaymentService = require('../services/p2p-payment-service')
const logger = require('../utils/logger')

const getPaymentStatus = async (req, res) => {
  const linkId = req.params.transfer_id
  logger.json({ controller: 'p2p-payment-controller', method: 'getPaymentStatus', transfer_id: linkId })

  const linkItem = await p2pPaymentService.getPaymentStatus(linkId)

  res.json({
    success: true,
    claim_link: linkItem
  })
}

const redeem = async (req, res) => {
  const countryCode = req.get('country-code')
  const {
    transfer_id: linkId,
    receiver: receiverAddress,
    receiver_sig: receiverSignature
  } = req.body
  logger.json({ controller: 'p2p-payment-controller', method: 'redeem', transfer_id: linkId })

  const txHash = await p2pPaymentService.redeem({
    linkId,
    countryCode,
    receiverAddress,
    receiverSignature
  })

  res.send({
    success: true,
    tx_hash: txHash
  })
}

module.exports = {
  redeem,
  getPaymentStatus
}
