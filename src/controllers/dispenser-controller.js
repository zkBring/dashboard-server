const batchService = require('../services/batch-service')
const dispenserService = require('../services/dispenser-service')
const claimLinkService = require('../services/claim-link-service')
const dispenserLinkService = require('../services/dispenser-link-service')
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError
} = require('../utils/errors')
const logger = require('../utils/logger')

const createDispenser = async (req, res) => {
  const creatorAddress = req.userAddress.toLowerCase()
  const {
    title,
    dynamic,
    reclaim,
    app_title: appTitle,
    claim_start: claimStart,
    redirect_on: redirectOn,
    app_title_on: appTitleOn,
    claim_finish: claimFinish,
    redirect_url: redirectUrl,
    timeframe_on: timeframeOn,
    claim_duration: claimDuration,
    multiscan_qr_id: multiscanQrId,
    instagram_follow_id: instagramFollowId,
    encrypted_multiscan_qr_secret: encryptedMultiscanQrSecret,
    encrypted_multiscan_qr_enc_code: encryptedMultiscanQrEncCode
  } = req.body
  logger.json({ controller: 'dispenser-controller', method: 'createDispenser', user_address: creatorAddress })

  if (!creatorAddress) {
    throw new BadRequestError('Creator address is not provided.', 'CREATOR_ADDRESS_REQUIRED')
  }

  let dispenserDB = await dispenserService.create({
    title,
    dynamic,
    reclaim,
    appTitle,
    claimStart,
    appTitleOn,
    claimFinish,
    redirectOn,
    timeframeOn,
    redirectUrl,
    claimDuration,
    multiscanQrId,
    creatorAddress,
    instagramFollowId,
    encryptedMultiscanQrSecret,
    encryptedMultiscanQrEncCode
  })

  dispenserDB = dispenserDB.toJSON()
  dispenserDB.links_count = 0

  res.json({
    success: true,
    dispenser: dispenserDB
  })
}

const updateDispenser = async (req, res) => {
  const userAddress = req.userAddress.toLowerCase()
  const dispenserId = req.params.dispenser_id
  const {
    title,
    active,
    archived,
    app_title: appTitle,
    claim_start: claimStart,
    redirect_on: redirectOn,
    app_title_on: appTitleOn,
    whitelist_on: whitelistOn,
    claim_finish: claimFinish,
    redirect_url: redirectUrl,
    timeframe_on: timeframeOn,
    claim_duration: claimDuration,
    instagram_follow_id: instagramFollowId
  } = req.body
  logger.json({ controller: 'dispenser-controller', method: 'updateDispenser', dispenser_id: dispenserId })

  const dispenser = await dispenserService.findOneById(dispenserId)
  if (!dispenser) throw new NotFoundError('Dispenser not found.', 'DISPENSER_NOT_FOUND')

  if (dispenser.creatorAddress.toLowerCase() !== userAddress) {
    throw new ForbiddenError('User address does not match dispenser creator address.', 'CREATOR_ADDRESS_NOT_VERIFIED')
  }

  if (claimStart && claimFinish) {
    if (claimStart >= claimFinish) throw new ForbiddenError('Claim start must be erlier than claim finish', 'INVALID_CLAIM_START')
  }

  const updatedDispenser = await dispenserService.updateDispenser({
    title,
    active,
    archived,
    appTitle,
    redirectOn,
    appTitleOn,
    claimStart,
    whitelistOn,
    redirectUrl,
    claimFinish,
    dispenserId,
    timeframeOn,
    claimDuration,
    instagramFollowId
  })

  res.json({
    success: true,
    dispenser: updatedDispenser
  })
}

const getDispensers = async (req, res) => {
  const creatorAddress = req.userAddress.toLowerCase()
  logger.json({ controller: 'dispenser-controller', method: 'getDispensers', user_address: creatorAddress })

  if (!creatorAddress) {
    throw new BadRequestError('Creator address is not provided.', 'CREATOR_ADDRESS_REQUIRED')
  }

  const dispensers = await dispenserService.getDispensers(creatorAddress)

  res.json({
    success: true,
    dispensers
  })
}

const getDispenserById = async (req, res) => {
  const dispenserId = req.params.dispenser_id
  const userAddress = req.userAddress.toLowerCase()
  logger.json({ controller: 'dispenser-controller', method: 'getDispenserById', dispenser_id: dispenserId })

  if (!dispenserId) {
    throw new BadRequestError('Dispenser id is not provided.', 'DISPENSER_ID_REQUIRED')
  }

  let dispenser = await dispenserService.findOneById(dispenserId)
  if (!dispenser) {
    throw new NotFoundError('Dispenser not found.', 'DISPENSER_NOT_FOUND')
  }
  if (dispenser.creatorAddress.toLowerCase() !== userAddress) {
    throw new ForbiddenError('User address does not match dispenser creator address.', 'CREATOR_ADDRESS_NOT_VERIFIED')
  }

  dispenser = await dispenserService.findOneWithCountLinksAndCountClaims(dispenserId)

  res.json({
    success: true,
    dispenser
  })
}

const getCampaignDataForClaimer = async (req, res) => {
  const multiscanQrId = req.params.multiscan_qr_id.toLowerCase()
  const { multiscanQREncCode } = req.query
  const SERVER_URL = 'https://' + req.get('host')
  const APP_URL = req.get('origin')
  logger.json({ controller: 'dispenser-controller', method: 'getCampaignDataForClaimer', multiscan_qr_id: multiscanQrId })

  if (!multiscanQrId) throw new BadRequestError('Multiscan qr id is not provided.', 'MULTISCAN_QR_ID_REQUIRED')

  const {
    campaign,
    reclaim,
    reclaimVerificationURL
  } = await dispenserService.getCampaignDataForClaimer({ multiscanQrId, multiscanQREncCode, SERVER_URL, APP_URL })

  res.json({
    success: true,
    campaign,
    reclaim,
    reclaimVerificationURL
  })
}

const receiveReclaimProofs = async (req, res) => {
  const reclaimProof = req.body
  const {
    multiscan_qr_id: multiscanQrId,
    session_id: reclaimSessionId
  } = req.params

  logger.json({ controller: 'dispenser-controller', method: 'receiveReclaimProofs', multiscan_qr_id: multiscanQrId, session_id: reclaimSessionId })
  logger.json({ reclaimProof, multiscanQrId, reclaimSessionId })

  const dispenser = await dispenserService.findOneByMultiscanQrId(multiscanQrId)
  if (!dispenser) throw new NotFoundError('Dispenser not found.', 'DISPENSER_NOT_FOUND')

  // save link to reclaim user (reclaim session id and reclaim device)
  await dispenserService.popReclaimDispenser({
    dispenser,
    reclaimSessionId,
    reclaimProof
  })

  return res.sendStatus(200)
}

const popReclaimLink = async (req, res) => {
  const multiscanQrId = req.params.multiscan_qr_id
  const reclaimSessionId = req.body.reclaim_session_id

  logger.json({ controller: 'dispenser-controller', method: 'popReclaimLink', multiscanQrId, reclaimSessionId })
  logger.json({ multiscanQrId, reclaimSessionId })

  const encryptedClaimLink = await dispenserService.popReclaimLink({ multiscanQrId, reclaimSessionId })

  res.json({
    success: true,
    encrypted_claim_link: encryptedClaimLink
  })
}

const getLinksReport = async (req, res) => {
  const dispenserId = req.params.dispenser_id
  const userAddress = req.userAddress.toLowerCase()
  logger.json({ controller: 'dispenser-controller', method: 'getLinksReport', dispenser_id: dispenserId })

  const dispenser = await dispenserService.findOneById(dispenserId)
  if (!dispenser) {
    throw new NotFoundError('Dispenser not found.', 'DISPENSER_NOT_FOUND')
  }
  if (dispenser.creatorAddress.toLowerCase() !== userAddress) {
    throw new ForbiddenError('User address does not match dispenser creator address.', 'CREATOR_ADDRESS_NOT_VERIFIED')
  }
  const aggregatedLinkItems = await dispenserService.getLinksReportByDispenserId(dispenserId)

  res.json({
    success: true,
    links_data: aggregatedLinkItems
  })
}

const uploadLinks = async (req, res) => {
  const dispenserId = req.params.dispenser_id
  const userAddress = req.userAddress.toLowerCase()
  const {
    preview_setting: previewSetting,
    encrypted_claim_links: encryptedClaimLinks
  } = req.body
  const linkId = encryptedClaimLinks[0]?.link_id
  logger.json({ controller: 'dispenser-controller', method: 'uploadLinks', dispenser_id: dispenserId })

  if (!dispenserId) {
    throw new BadRequestError('Dispenser id is not provided.', 'DISPENSER_ID_REQUIRED')
  }

  const dispenser = await dispenserService.findOneById(dispenserId)
  if (!dispenser) {
    throw new NotFoundError('Dispenser not found.', 'DISPENSER_NOT_FOUND')
  }
  if (dispenser.creatorAddress.toLowerCase() !== userAddress) {
    throw new ForbiddenError('User address does not match dispenser creator address.', 'CREATOR_ADDRESS_NOT_VERIFIED')
  }

  const dispenserLink = await dispenserLinkService.findOneByDispenserId(dispenserId)
  if (dispenserLink) {
    throw new ForbiddenError('Claim links have already been uploaded.', 'CLAIM_LINKS_ALREADY_UPLOADED')
  }

  if (+new Date() > (dispenser.claimStart + dispenser.claimDuration * 60 * 1000)) {
    throw new ForbiddenError('Claim is over.', 'DISPENSER_EXPIRED')
  }

  await dispenserLinkService.create({ dispenserId, encryptedClaimLinks })
  await dispenserService.updatePreviewSetting(dispenserId, previewSetting)

  const qrCampaignType = dispenserService.getQrCampaignType(dispenser)
  await batchService.setQrCampaign({ linkId, qrCampaign: dispenserId, qrCampaignType })
  res.json({ success: true })
}

const updateLinks = async (req, res) => {
  const dispenserId = req.params.dispenser_id
  const userAddress = req.userAddress.toLowerCase()
  const {
    preview_setting: previewSetting,
    encrypted_claim_links: encryptedClaimLinks
  } = req.body
  const linkId = encryptedClaimLinks[0]?.link_id
  logger.json({ controller: 'dispenser-controller', method: 'updateLinks', dispenser_id: dispenserId })

  if (!dispenserId) {
    throw new BadRequestError('Dispenser id is not provided.', 'DISPENSER_ID_REQUIRED')
  }

  const dispenser = await dispenserService.findOneById(dispenserId)
  if (!dispenser) {
    throw new NotFoundError('Dispenser not found.', 'DISPENSER_NOT_FOUND')
  }
  if (dispenser.creatorAddress.toLowerCase() !== userAddress) {
    throw new ForbiddenError('User address does not match dispenser creator address.', 'CREATOR_ADDRESS_NOT_VERIFIED')
  }

  const dispenserLink = await dispenserLinkService.findOneByDispenserId(dispenserId)
  if (!dispenserLink) {
    throw new NotFoundError('Claim link not found.', 'CLAIM_LINK_NOT_FOUND')
  }
  await claimLinkService.checkLinksArrayForDiffCampaingId(encryptedClaimLinks, dispenserLink)

  const linksNumberBefore = await dispenserLinkService.countLinksByDispenserId(dispenserId)
  await dispenserLinkService.create({ dispenserId, encryptedClaimLinks, indexOffset: linksNumberBefore })
  await dispenserService.updatePreviewSetting(dispenserId, previewSetting)

  const qrCampaignType = dispenserService.getQrCampaignType(dispenser)
  await batchService.setQrCampaign({ linkId, qrCampaign: dispenserId, qrCampaignType })

  res.json({ success: true })
}

const getDispenserSettings = async (req, res) => {
  const multiscanQrId = req.params.multiscan_qr_id
  logger.json({ controller: 'dispenser-controller', method: 'getDispenserSettings', multiscan_qr_id: multiscanQrId })

  const dispenser = await dispenserService.findOneByMultiscanQrId(multiscanQrId)
  if (!dispenser) throw new NotFoundError('Dispenser not found.', 'DISPENSER_NOT_FOUND')

  res.json({
    success: true,
    dispenser: {
      app_title: dispenser.appTitle,
      app_title_on: dispenser.appTitleOn
    }
  })
}

module.exports = {
  uploadLinks,
  updateLinks,
  getDispensers,
  getLinksReport,
  popReclaimLink,
  updateDispenser,
  createDispenser,
  getDispenserById,
  getDispenserSettings,
  receiveReclaimProofs,
  getCampaignDataForClaimer
}
