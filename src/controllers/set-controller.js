const logger = require('../utils/logger')
const ObjectId = require('mongoose').Types.ObjectId
const qrSetService = require('../services/qr-set-service')
const qrItemService = require('../services/qr-item-service')
const claimLinkService = require('../services/claim-link-service')
const { BadRequestError, ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors')
const batchService = require('../services/batch-service')

const createQRSet = async (req, res) => {
  logger.json({ controller: 'qr-set-controller', method: 'createQRSet', user_address: req.userAddress })
  const creatorAddress = req.body.creator_address.toLowerCase()
  const {
    set_name: setName,
    qr_array: qrArray,
    qr_quantity: qrQuantity
  } = req.body

  if (qrQuantity !== qrArray.length) {
    throw new BadRequestError('QR array length is not equal QR quantity', 'QR_ARRAY_LENGTH_NOT_EQUAL_QR_QUANTITY')
  }

  if (creatorAddress !== req.userAddress) {
    throw new ValidationError('Creator address is not valid', 'CREATOR_ADDRESS_NOT_VALID')
  }

  const qrSetDb = await qrSetService.create(setName, qrQuantity, creatorAddress)
  const qrArrayDb = await qrItemService.create(qrArray, qrSetDb._id)

  res.json({
    success: true,
    qr_set: qrSetDb,
    qr_array: qrArrayDb
  })
}

const getQRSets = async (req, res) => {
  logger.json({ controller: 'qr-set-controller', method: 'getQRSets', user_address: req.userAddress })
  const creatorAddress = req.userAddress
  if (!creatorAddress) throw new BadRequestError('Creator address is not provided', 'CREATOR_ADDRESS_NOT_PROVIDED')

  const qrSetsWithCampaings = await qrSetService.findByCreatorAddressAndPopulateCampaign(creatorAddress)
  res.json({
    success: true,
    qr_sets: qrSetsWithCampaings
  })
}

const getQRSetById = async (req, res) => {
  logger.json({ controller: 'qr-set-controller', method: 'getQRSetById', user_address: req.userAddress })
  const setId = req.params.set_id
  if (!ObjectId.isValid(setId)) throw new BadRequestError('Set ID is not valid', 'SET_ID_NOT_VALID')

  const qrSetWithCampaign = await qrSetService.findOneBySetIdAndPopulateCampaign(setId)
  if (qrSetWithCampaign.creatorAddress.toLowerCase() !== req.userAddress) {
    throw new ForbiddenError('User address doesn’t match campaign creator address', 'CREATOR_ADDRESS_NOT_VALID')
  }

  res.json({
    success: true,
    qr_set: qrSetWithCampaign
  })
}

const getQRsBySetId = async (req, res) => {
  logger.json({ controller: 'qr-set-controller', method: 'getQRsBySetId', user_address: req.userAddress })
  const setId = req.params.set_id
  if (!ObjectId.isValid(setId)) throw new BadRequestError('Set ID is not valid', 'SET_ID_NOT_VALID')

  const qrSet = await qrSetService.findOneBySetId(setId)
  if (!qrSet) throw new NotFoundError('QR set not found', 'QR_SET_NOT_FOUND')

  if (qrSet.creatorAddress.toLowerCase() !== req.userAddress) {
    throw new ForbiddenError('User address doesn’t match QR set creator address', 'CREATOR_ADDRESS_NOT_VALID')
  }

  const qrs = await qrItemService.findByQRSetId(setId)
  res.json({
    success: true,
    qr_array: qrs
  })
}

const updateStatus = async (req, res) => {
  logger.json({ controller: 'qr-set-controller', method: 'updateStatus', user_address: req.userAddress })
  const { status } = req.body
  const setId = req.params.set_id
  if (!ObjectId.isValid(setId)) throw new BadRequestError('Set ID is not valid', 'SET_ID_NOT_VALID')

  let qrSet = await qrSetService.findOneBySetId(setId)
  if (!qrSet) throw new NotFoundError('QR set not found', 'QR_SET_NOT_FOUND')

  if (qrSet.creatorAddress.toLowerCase() !== req.userAddress) {
    throw new ForbiddenError('User address doesn’t match QR set creator address', 'CREATOR_ADDRESS_NOT_VALID')
  }

  qrSet = await qrSetService.updateQRSetStatus(setId, status)
  res.json({
    success: true,
    qr_set: qrSet
  })
}

const updateQuantity = async (req, res) => {
  logger.json({ controller: 'qr-set-controller', method: 'updateQuantity', user_address: req.userAddress })
  const setId = req.params.set_id
  const {
    qr_array: qrArray,
    qr_quantity: qrQuantity
  } = req.body

  if (!ObjectId.isValid(setId)) throw new BadRequestError('Set ID is not valid', 'SET_ID_NOT_VALID')

  if (qrArray.length !== qrQuantity) {
    throw new BadRequestError('QR array length is not equal QR quantity', 'QR_ARRAY_LENGTH_NOT_EQUAL_QR_QUANTITY')
  }

  const qrSet = await qrSetService.findOneBySetId(setId)
  if (!qrSet) throw new NotFoundError('QR set not found', 'QR_SET_NOT_FOUND')
  if (qrSet.creatorAddress.toLowerCase() !== req.userAddress) {
    throw new ForbiddenError('User address doesn’t match QR set creator address', 'CREATOR_ADDRESS_NOT_VALID')
  }
  if (qrSet.linksUploaded) {
    throw new ValidationError('Claim links have already been uploaded', 'CLAIM_LINKS_ALREADY_UPLOADED')
  }

  const updatedQrSet = await qrSetService.updateQRSetQuantity(setId, qrQuantity)
  await qrItemService.deleteByQRSetId(setId)
  const qrArrayDb = await qrItemService.create(qrArray, setId)

  res.json({
    success: true,
    qr_set: updatedQrSet,
    qr_array: qrArrayDb
  })
}

const mapLinks = async (req, res) => {
  logger.json({ controller: 'qr-set-controller', method: 'mapLinks', user_address: req.userAddress })
  const setId = req.params.set_id
  const { mapping } = req.body

  if (!ObjectId.isValid(setId)) throw new BadRequestError('Set ID is not valid', 'SET_ID_NOT_VALID')

  const linkId = mapping[0].claim_link_id
  const linkItem = await claimLinkService.findOneByLinkIdAndPopulateCampaign(linkId)
  if (!linkItem) throw new NotFoundError('Claim links from mapping not found in DB', 'CLAIM_LINKS_FROM_MAPPING_NOT_FOUND')

  let qrSet = await qrSetService.findOneBySetId(setId)
  if (!qrSet) throw new NotFoundError('QR set not found', 'QR_SET_NOT_FOUND')
  if (qrSet.creatorAddress.toLowerCase() !== req.userAddress) {
    throw new ForbiddenError('User address doesn’t match QR set creator address', 'CREATOR_ADDRESS_NOT_VALID')
  }

  if (mapping.length !== qrSet.qrQuantity) {
    throw new BadRequestError('Mapping length is not equal to QR set QR quantity', 'MAPPING_NOT_EQUAL_QR_QUANTITY')
  }

  if (qrSet.linksUploaded) {
    qrSet = await qrSetService.updateQRSetLinksUploadedStatus(setId, false)
  }

  const bulkMappingResult = await qrItemService.mapQRBulkWithLink(mapping)
  if (bulkMappingResult) {
    qrSet = await qrSetService.updateQRSetLinksUploadedStatus(setId, true)
  }

  await batchService.setQrCampaign({ linkId, qrCampaign: setId, qrCampaignType: 'QR_SET' })

  res.json({
    success: bulkMappingResult,
    qr_set: qrSet
  })
}

const getMappedLinks = async (req, res) => {
  logger.json({ controller: 'qr-set-controller', method: 'getMappedLinks', user_address: req.userAddress })
  const setId = req.params.set_id
  if (!ObjectId.isValid(setId)) throw new BadRequestError('Set ID is not valid', 'SET_ID_NOT_VALID')

  const qrSet = await qrSetService.findOneBySetId(setId)
  if (!qrSet) throw new NotFoundError('QR set not found', 'QR_SET_NOT_FOUND')
  if (qrSet.creatorAddress.toLowerCase() !== req.userAddress) {
    throw new ForbiddenError('User address doesn’t match QR set creator address', 'CREATOR_ADDRESS_NOT_VALID')
  }

  const qrs = await qrItemService.findByQRSetId(setId)
  res.json({
    success: true,
    mapping: qrs
  })
}

const updateQRSet = async (req, res) => {
  logger.json({ controller: 'qr-set-controller', method: 'updateQRSet', user_address: req.userAddress })
  const setId = req.params.set_id
  const { archived } = req.body
  if (!ObjectId.isValid(setId)) throw new BadRequestError('Set ID is not valid', 'SET_ID_NOT_VALID')

  const updatedQRSet = await qrSetService.updateQRSet({
    setId,
    archived
  })

  res.json({
    success: true,
    qr_set: updatedQRSet
  })
}

module.exports = {
  mapLinks,
  getQRSets,
  createQRSet,
  updateQRSet,
  updateStatus,
  getQRSetById,
  getQRsBySetId,
  getMappedLinks,
  updateQuantity
}
