const ethers = require('ethers')
const logger = require('../utils/logger')
const tokenService = require('./token-service')
const stageConfig = require('../../stage-config')
const Dispenser = require('../models/dispenser-model')
const Handle = require('../models/handle-model')
const claimApiService = require('./claim-api-service')
const whitelistService = require('./whitelist-service')
const claimLinkService = require('./claim-link-service')
const dispenserLinkService = require('./dispenser-link-service')
const { ReclaimProofRequest, verifyProof } = require('@reclaimprotocol/js-sdk')
const reclaimVerificationService = require('./reclaim-verification-service')
const { ForbiddenError, NotFoundError, BadRequestError } = require('../utils/errors')

class DispenserService {
  constructor () {
    this.poppedCache = {}
    this.whiteListHandlesCache = {}
    this.initializeHandlesCache()
  }

  async initializeHandlesCache() {
    const handles = await Handle.find({}, 'handle dispenserId')
    
    handles.forEach((handleObj) => {
      handleObj = handleObj.toObject()
      
      if (!this.whiteListHandlesCache[handleObj.dispenserId]) {
        this.whiteListHandlesCache[handleObj.dispenserId] = {}
      }

      this.whiteListHandlesCache[handleObj.dispenserId][handleObj.handle.toLowerCase()] = true
    })

    logger.info(`Successfully loaded handles into cache for ${Object.keys(this.whiteListHandlesCache).length} dispensers`)
  }

  async create ({
    title,
    dynamic,
    reclaim,
    appTitle,
    appTitleOn,
    claimStart,
    claimFinish,
    redirectOn,
    timeframeOn,
    redirectUrl,
    claimDuration,
    multiscanQrId,
    creatorAddress,
    encryptedMultiscanQrSecret,
    encryptedMultiscanQrEncCode
  }) {

    const params = {
      title,
      dynamic,
      reclaim,
      appTitle,
      appTitleOn,
      claimStart,
      claimFinish,
      redirectOn,
      timeframeOn,
      redirectUrl,
      claimDuration,
      encryptedMultiscanQrSecret,
      encryptedMultiscanQrEncCode,
      multiscanQrId: multiscanQrId.toLowerCase(),
      creatorAddress: creatorAddress.toLowerCase()
    }

    if (reclaim === true) {
      params.reclaimAppId = stageConfig.RECLAIM_APP_ID
      params.reclaimAppSecret = stageConfig.RECLAIM_APP_SECRET
      params.reclaimProviderId = stageConfig.RECLAIM_PROVIDER_ID
      params.reclaimProviderType = stageConfig.RECLAIM_PROVIDER_TYPE
    }

    return await this._create(params)
  }
  
  async _create ({
    title,
    dynamic,
    reclaim,
    appTitle,
    appTitleOn,
    claimStart,
    claimFinish,
    redirectOn,
    timeframeOn,
    redirectUrl,
    reclaimAppId,
    claimDuration,
    multiscanQrId,
    creatorAddress,
    reclaimAppSecret,
    reclaimProviderId,
    reclaimProviderType,
    encryptedMultiscanQrSecret,
    encryptedMultiscanQrEncCode
  }) {
    const dispenserDB = new Dispenser({
      title,
      dynamic,
      reclaim,
      appTitle,
      appTitleOn,
      claimStart,
      claimFinish,
      redirectOn,
      timeframeOn,
      redirectUrl,
      reclaimAppId,
      claimDuration,
      multiscanQrId,
      creatorAddress,
      reclaimAppSecret,
      reclaimProviderId,
      reclaimProviderType,
      encryptedMultiscanQrSecret,
      encryptedMultiscanQrEncCode
    })

    await dispenserDB.save()
    logger.info(`Dispenser ${title} was successfully saved to database`)
    return dispenserDB
  }

  async findByCreatorAddress (creatorAddress) {
    creatorAddress = creatorAddress.toLowerCase()
    return await Dispenser.find({ creatorAddress }).sort({ createdAt: -1 })
  }

  async findOneById (dispenserId) {
    return await Dispenser.findOne({ _id: dispenserId })
  }

  async findOneByMultiscanQrId (multiscanQrId) {
    multiscanQrId = multiscanQrId.toLowerCase()
    return await Dispenser.findOne({ multiscanQrId })
  }

  async findDispensersAndCountLinks (creatorAddress) {
    const dispensers = await this.findByCreatorAddress(creatorAddress)
    if (!dispensers.length) return dispensers

    const dispensersWithLinksCount = await Promise.all(dispensers.map(async (dispenser) => {
      const linksCount = await dispenserLinkService.countLinksByDispenserId(dispenser._id)
      const jsonedDispenser = dispenser.toJSON()
      jsonedDispenser.links_count = linksCount
      return jsonedDispenser
    }))

    return dispensersWithLinksCount
  }

  async findOneAndCountLinks (dispenserId) {
    const dispenser = await this.findOneById(dispenserId)
    if (!dispenser) throw new NotFoundError('Dispenser not found', 'DISPENSER_NOT_FOUND')
    const linksCount = await dispenserLinkService.countLinksByDispenserId(dispenser._id)
    const jsonedDispenser = dispenser.toJSON()
    jsonedDispenser.links_count = linksCount
    return jsonedDispenser
  }

  async getDispensers(creatorAddress) {
    let dispensers = await this.findByCreatorAddress(creatorAddress)
    dispensers = await Promise.all(dispensers.map(async (dispenser) => {
      const dispenserWithCounts = await this.findOneWithCountLinksAndCountClaims(dispenser._id)
      return dispenserWithCounts
    }))

    return dispensers
  }

  async findOneWithCountLinksAndCountClaims (dispenserId) {
    const dispenser = await this.findOneById(dispenserId)
    if (!dispenser) throw new NotFoundError('Dispenser not found', 'DISPENSER_NOT_FOUND')
    const jsonedDispenser = dispenser.toJSON()

    if (jsonedDispenser.whitelist_type) {
      const whitelistCount = await whitelistService.countItemsByDispenserId(dispenserId)
      jsonedDispenser.whitelist_count = whitelistCount
    }

    const linksCount = await dispenserLinkService.countLinksByDispenserId(dispenserId)
    if (linksCount === 0) {
      jsonedDispenser.links_count = linksCount
      jsonedDispenser.links_claimed = 0
      return jsonedDispenser
    }

    const claimCounts = await this.fetchClaimCounts(dispenserId)
    jsonedDispenser.links_count = linksCount
    jsonedDispenser.links_claimed = claimCounts[0].count
    return jsonedDispenser
  }

  async fetchClaimCounts (dispenserId) {
    const claimLinkObj = await dispenserLinkService.findOneByDispenserId(dispenserId)
    if (!claimLinkObj) return [{ count: 0 }]

    const linkWithCampaign = await claimLinkService.findOneByLinkIdAndPopulateCampaign(claimLinkObj.linkId)
    if (!linkWithCampaign) return [{ count: 0 }]

    const proxyAddressArray = [linkWithCampaign.campaign.proxyContractAddress]
    const fetchedClaimCounts = await claimApiService.fetchClaimCounts(proxyAddressArray, linkWithCampaign.campaign.chainId)
    return fetchedClaimCounts
  }

  async getLinksReportByDispenserId (dispenserId) {
    const claimLinkObj = await dispenserLinkService.findOneByDispenserId(dispenserId)
    if (!claimLinkObj) return []
    const linkWithCampaign = await claimLinkService.findOneByLinkIdAndPopulateCampaign(claimLinkObj.linkId)
    if (!linkWithCampaign) return []

    const fetchedClaims = await claimApiService.fetchClaimedLinks(linkWithCampaign.campaign?.proxyContractAddress, linkWithCampaign.campaign?.chainId)

    const aggregatedLinkItems = fetchedClaims.map(item => {
      const tx = item.transactions.filter(tx => tx.status === 'completed')[0]
      return {
        receiver: item.data.receiverAddress,
        campaign_id: linkWithCampaign.campaign._id,
        link_id: item.data.linkId,
        token_address: item.data.tokenAddress,
        nft_address: item.data.nftAddress,
        token_id: item.data.tokenId,
        token_amount: item.data.tokenAmount,
        tx_hash: tx.hash
      }
    })

    return aggregatedLinkItems
  }

  async getCampaign (dispenserObj) {
    const link = await dispenserLinkService.findOneByDispenserId(dispenserObj._id)
    if (!link) throw new NotFoundError('Claim link not found.', 'CLAIM_LINK_NOT_FOUND')

    const populatedLink = await claimLinkService.findOneByLinkIdAndPopulateCampaign(link.linkId)
    if (!populatedLink) throw new NotFoundError('Campaign not found.', 'CAMPAIGN_NOT_FOUND')
    const tokenId = populatedLink.claimParams?.tokenId
    const tokenAmount = populatedLink.claimParams?.tokenAmount
    const campaign = populatedLink?.campaign
    let isLinkdropToken = false
    let token
    if (campaign?.collectionId !== null) {
      token = await tokenService.findOneByTokenAndCollectionId({
        tokenId,
        tokenCollection: campaign?.collectionId
      })
      isLinkdropToken = true
    }

    return {
      token_id: tokenId,
      title: campaign.title,
      token_name: token?.name,
      wallet: campaign.wallet,
      campaign_id: campaign._id,
      token_amount: tokenAmount,
      chain_id: campaign.chainId,
      token_image: token?.thumbnail,
      sponsored: campaign.sponsored,
      linkdrop_token: isLinkdropToken,
      token_address: campaign.tokenAddress,
      redirect_on: dispenserObj.redirectOn,
      redirect_url: dispenserObj.redirectUrl,
      token_standard: campaign.tokenStandard,
      campaign_number: campaign.campaignNumber,
      avilable_wallets: campaign.availableWallets,
      preferred_wallet_on: campaign.preferredWalletOn,
      available_countries: campaign.availableCountries,
      claiming_finished_button_url: campaign.claimingFinishedButtonUrl,
      claiming_finished_description: campaign.claimingFinishedDescription,
      claiming_finished_button_title: campaign.claimingFinishedButtonTitle
    }
  }

  async updatePreviewSetting (dispenserId, previewSetting) {
    const updatedDispenser = await Dispenser.findOneAndUpdate(
      { _id: dispenserId },
      { previewSetting },
      { new: true }
    )

    if (!updatedDispenser) throw new NotFoundError('Dispenser not found.', 'DISPENSER_NOT_FOUND')
    return updatedDispenser
  }

  async updateDispenser ({
    title,
    active,
    archived,
    appTitle,
    appTitleOn,
    redirectOn,
    claimStart,
    claimFinish,
    whitelistOn,
    dispenserId,
    redirectUrl,
    timeframeOn,
    reclaimAppId,
    whitelistType,
    claimDuration,
    reclaimAppSecret,
    reclaimProviderId,
    instagramFollowId
  }) {
    return await Dispenser.findOneAndUpdate(
      { _id: dispenserId },
      {
        $set: {
          title,
          active,
          archived,
          appTitle,
          appTitleOn,
          claimStart,
          redirectOn,
          claimFinish,
          whitelistOn,
          timeframeOn,
          redirectUrl,
          reclaimAppId,
          claimDuration,
          whitelistType,
          reclaimAppSecret,
          reclaimProviderId,
          instagramFollowId
        }
      },
      { new: true }
    )
  }

  checkTimeframe ({ claimStart, claimFinish }) {
    const currentDate = +new Date()

    if (!claimStart) {
      if (!claimFinish) return
      if (currentDate > claimFinish) throw new ForbiddenError('Claim is over.', 'DISPENSER_EXPIRED')
    } else {
      if (claimStart > currentDate) throw new ForbiddenError('Claim has not started yet.', 'DISPENSER_NOT_STARTED')
      if (!claimFinish) return
      if (currentDate > claimFinish) throw new ForbiddenError('Claim is over.', 'DISPENSER_EXPIRED')
    }
  }

  verifyScanIdSignature (scanId, scanIdSig, multiscanQrId) {
    const message = `${stageConfig.SCAN_ID_SIG_MESSAGE} ${scanId}`
    const decodedAddress = ethers.utils.verifyMessage(message, scanIdSig)
    if (decodedAddress.toLowerCase() !== multiscanQrId.toLowerCase()) {
      throw new ForbiddenError('Scan id signature is not verified.', 'SCAN_ID_NOT_VERIFIED')
    }
    return true
  }

  async addWhitelist ({
    whitelist,
    dispenserId,
    whitelistOn,
    whitelistType
  }) {
    const foundWhitelistItem = await whitelistService.findOneByDispenserId(dispenserId)
    if (foundWhitelistItem) {
      await whitelistService.deleteItemsByDispenserId(dispenserId)
    }

    const whitelistDB = await whitelistService.create({ dispenserId, whitelist, whitelistType })
    const updatedDispenser = await this.updateDispenser({ dispenserId, whitelistType, whitelistOn })
    updatedDispenser.whitelist_count = whitelistDB.length

    return {
      dispenser: updatedDispenser,
      whitelist: whitelistDB
    }
  }

  async getCampaignDataForClaimer ({ multiscanQrId, multiscanQREncCode, SERVER_URL, APP_URL }) {
    const dispenser = await this.findOneByMultiscanQrId(multiscanQrId)
    if (!dispenser) throw new NotFoundError('Dispenser not found', 'DISPENSER_NOT_FOUND')
  
    let reclaimVerificationURL = null
  
    if (dispenser.reclaim) {
      const reclaimProofRequest = await ReclaimProofRequest.init(dispenser.reclaimAppId, dispenser.reclaimAppSecret, dispenser.reclaimProviderId)
  
      logger.json({ SERVER_URL, APP_URL })
      const jsonProofResponse = false
      reclaimProofRequest.setAppCallbackUrl(`${stageConfig.ZUPLO_API_SERVER_URL}/api/v2/dashboard/dispensers/multiscan-qrs/${multiscanQrId}/campaign/${reclaimProofRequest.sessionId}/receive-reclaim-proofs`, jsonProofResponse)
  
      const redirectUrl = `${stageConfig.VERIFICATION_APP_URL}/#/reclaim/${multiscanQrId}/${reclaimProofRequest.sessionId}/${multiscanQREncCode}/verification-complete`
      reclaimProofRequest.setRedirectUrl(redirectUrl)
  
      // Generate the verification request URL
      reclaimVerificationURL = await reclaimProofRequest.getRequestUrl()
  
      const reclaimRequestJson = reclaimProofRequest.toJsonString()
      logger.json({ reclaimRequestJson, sessionId: reclaimProofRequest.sessionId })
    }
  
    const campaign = await this.getCampaign(dispenser)
    campaign.preview_setting = dispenser.previewSetting
    campaign.whitelist_type = dispenser.whitelistType
    campaign.whitelist_on = dispenser.whitelistOn
    campaign.redirect_url = dispenser.redirectUrl
    campaign.redirect_on = dispenser.redirectOn
    campaign.provider_type = dispenser.reclaimProviderType
    
    return {
      campaign,
      reclaimVerificationURL,
      reclaim: dispenser.reclaim
    }
  }

  async getLinkByReclaimSessionId ({
    dispenser,
    reclaimSessionId
  }) {
    if (!dispenser.reclaim) throw new ForbiddenError('Reclaim action for non-reclaim dispenser.', 'RECLAIM_ACTION_FOR_NON_RECLAIM_DISPENSER')

    const dispenserLink = await dispenserLinkService.findOneByDispenserIdAndReclaimSessionId(dispenser._id, reclaimSessionId)
    if (!dispenserLink) throw new ForbiddenError('Reclaim drop was not redeemed yet.', 'RECLAIM_DROP_WAS_NOT_REDEEMED_YET')
    
    return dispenserLink.encryptedClaimLink
  }

  getHandleByReclaimProviderType ({ dispenser, reclaimProof }) {
    const context = JSON.parse(reclaimProof.claimData?.context)
    switch (dispenser.reclaimProviderType) {
      case 'instagram':
        return context?.extractedParameters?.trusted_username
      case 'x':
        return context?.extractedParameters?.screen_name
      default:
        throw new BadRequestError('Dispenser reclaim provider type is incorrect.', 'PROIDER_TYPE_IS_INCORRECT')
    }
  }

  async popReclaimDispenser ({
    dispenser,
    reclaimProof,
    reclaimSessionId
  }) {
    if (!dispenser.reclaim) throw new ForbiddenError('Reclaim action for non-reclaim dispenser.', 'RECLAIM_ACTION_FOR_NON_RECLAIM_DISPENSER')
    const reclaimVerification = await reclaimVerificationService.createReclaimVerification({ reclaimSessionId })
    
    reclaimProof = JSON.parse(Object.keys(reclaimProof)[0])
    
    const isVerifiedProof = await verifyProof(reclaimProof)
    if (!isVerifiedProof) {
      return await reclaimVerificationService.updateReclaimVerification({
        reclaimVerification,
        message: 'Invalid proofs data',
        cause: 'INVALID_PROOFS_DATA',
        status: 'failed'
      })
    }

    const reclaimDeviceId = reclaimProof.claimData.owner.toLowerCase()
    const userHandle = this.getHandleByReclaimProviderType({ dispenser, reclaimProof })
    logger.json({ userHandle: userHandle, providerType: dispenser.reclaimProviderType })

    const isHandleWhitelisted = this.whiteListHandlesCache[dispenser._id.toString()][userHandle?.toLowerCase()]
    logger.json({isHandleWhitelisted})
    if (!isHandleWhitelisted) {
      return await reclaimVerificationService.updateReclaimVerification({
        reclaimVerification,
        message: 'User is not whitelisted',
        cause: 'USER_NOT_WHITE_LISTED',
        status: 'failed'
      })
    }
    
    const handleDb = await Handle.findOne({ 
      handle: userHandle.toLowerCase(), 
      dispenserId: dispenser._id.toString() 
    })
    if (!handleDb) {
      return await reclaimVerificationService.updateReclaimVerification({
        reclaimVerification,
        message: 'Handle not exists', 
        cause: 'HANDLE_NOT_EXISTS',
        status: 'failed'
      })
    }

    if (!handleDb.alreadyClaimed) {
      const dispenserLink = await this._popDispenserLink({ dispenser })

      dispenserLink.reclaimProof = reclaimProof
      dispenserLink.reclaimDeviceId = reclaimDeviceId
      dispenserLink.reclaimSessionId = reclaimSessionId
      await dispenserLink.save()

      handleDb.alreadyClaimed = true
      handleDb.reclaimSessionId = reclaimSessionId
      handleDb.linkId = dispenserLink.linkId
      await handleDb.save()
    }
    
    const oldReclaimSessionId = handleDb.reclaimSessionId
    if (handleDb.alreadyClaimed && (oldReclaimSessionId !== reclaimSessionId)) {
      const oldDispenserLink = await dispenserLinkService.findOneByDispenserIdAndReclaimSessionId(dispenser._id, oldReclaimSessionId)
      if (!oldDispenserLink) {
        return await reclaimVerificationService.updateReclaimVerification({
          reclaimVerification,
          message: 'Claim link not found', 
          cause: 'CLAIM_LINK_NOT_FOUND',
          status: 'failed'
        })
      }

      oldDispenserLink.reclaimProof = reclaimProof
      oldDispenserLink.reclaimDeviceId = reclaimDeviceId
      oldDispenserLink.reclaimSessionId = reclaimSessionId
      await oldDispenserLink.save()

      handleDb.reclaimSessionId = reclaimSessionId
      await handleDb.save()
    }

    await reclaimVerificationService.updateReclaimVerification({
      reclaimVerification,
      status: 'success',
      message: '',
      cause: ''
    })
  }

  async popReclaimLink({ multiscanQrId, reclaimSessionId }) {
    const dispenser = await this.findOneByMultiscanQrId(multiscanQrId)
    if (!dispenser) throw new NotFoundError('Dispenser not found.', 'DISPENSER_NOT_FOUND')
    
    const reclaimVerification = await reclaimVerificationService.findOneByReclaimSessionId({ reclaimSessionId })
    if (!reclaimVerification) throw new NotFoundError('Reclaim verification not exists.', 'REACLAIM_VERIFICATION_NOT_EXISTS')

    if (reclaimVerification.status !== 'success') {
      const message = reclaimVerification.message || 'Reclaim verification is pending.'
      const cause = reclaimVerification.cause || 'RECLAIM_VERIFICATION_PENDING' 
      throw new ForbiddenError(message, cause)
    }
    
    return await this.getLinkByReclaimSessionId({
      dispenser,
      reclaimSessionId
    })
  }

  async pop ({
    scanId,
    receiver,
    socketId,
    dispenser
  }) {
    if (dispenser.reclaim) throw new ForbiddenError('Non-Reclaim action for reclaim dispenser.', 'NON_RECLAIM_ACTION_FOR_RECLAIM_DISPENSER')

    // check if dispenser has been scanned before by this device
    let previousLink = await dispenserLinkService.findOneByDispenserIdAndScanId(dispenser._id, scanId)
    if (previousLink) return previousLink.encryptedClaimLink

    // check if dispenser is whitelisted
    if (dispenser.whitelistOn) {
      if (dispenser.whitelistType === 'address') {
        previousLink = await dispenserLinkService.findOneByDispenserIdAndReceiver(dispenser._id, receiver)
        if (previousLink) return previousLink.encryptedClaimLink
      }
    }

    const dispenserLink = await this._popDispenserLink({ dispenser })

    dispenserLink.scanId = scanId
    if (receiver) dispenserLink.receiver = receiver.toLowerCase()
    await dispenserLink.save()

    if (dispenser.dynamic) this._triggerSuccesfullScanEvent({ socketId })
    return dispenserLink.encryptedClaimLink
  }

  async _popDispenserLink ({ dispenser }) {
    if (!dispenser.active) {
      throw new ForbiddenError('Dispenser is not active.', 'DISPENSER_IS_INACTIVE')
    }

    if (dispenser.timeframeOn) {
      this.checkTimeframe({ claimStart: dispenser.claimStart, claimFinish: dispenser.claimFinish })
    }

    // save popped to cache
    if (!this.poppedCache[dispenser._id]) {
      this.poppedCache[dispenser._id] = dispenser.popped
    }

    const popped = this.poppedCache[dispenser._id] + 1
    const dispenserLink = await dispenserLinkService.findOneByDispenserIdAndLinkNumber(dispenser._id, popped)
    if (!dispenserLink) throw new ForbiddenError('No more claims available.', 'NO_MORE_CLAIMS_AVAILABLE')

    this.poppedCache[dispenser._id] = popped
    dispenser.popped = popped
    dispenser.save()
    return dispenserLink
  }

  async _triggerSuccesfullScanEvent ({ socketId }) {
    const config = {
      headers: { 'api-secret-key': `${stageConfig.SOCKET_SERVER_API_KEY}` }
    }

    try {
      fetch(`${stageConfig.SOCKET_SERVER_URL}/scan?socket_id=${socketId}`, {
        method: 'GET',
        headers: config.headers
      })
    } catch (err) {
      const errorMessage = err.message || err.reason || 'Unknown error'
      logger.error(`Something went wrong while triggering socket server. Error: ${errorMessage}`)
    }
  }

  getQrCampaignType (dispenser) {
    if (dispenser.dynamic) return 'DYNAMIC_DISPENSER'
    if (dispenser.reclaim) return 'RECLAIM'
    return 'DISPENSER'
  }
}

module.exports = new DispenserService()
