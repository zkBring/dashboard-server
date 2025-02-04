const ethers = require('ethers')
const logger = require('../utils/logger')
const tokenService = require('./token-service')
const stageConfig = require('../../stage-config')
const Claimer = require('../models/claimer-model')
const Dispenser = require('../models/dispenser-model')
const claimApiService = require('./claim-api-service')
const whitelistService = require('./whitelist-service')
const claimLinkService = require('./claim-link-service')
const dispenserLinkService = require('./dispenser-link-service')
const { ForbiddenError, NotFoundError, BadRequestError } = require('../utils/errors')
const { log } = require('winston')

class DispenserService {
  constructor () {
    this.poppedCache = {}
    this.dublicateReclaims = {} // mapping from the new session id to the stored session id
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
      params.reclaimProviderType = 'instagram'
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

  async getLinkByReclaimSessionId ({
    dispenser,
    reclaimSessionId
  }) {
    // check if dispenser is for reclaim airdrop
    if (!dispenser.reclaim) throw new ForbiddenError('Reclaim action for non-reclaim dispenser.', 'RECLAIM_ACTION_FOR_NON_RECLAIM_DISPENSER')
    // if user has already claimed before return the old claim link
    if (this.dublicateReclaims[reclaimSessionId]) {
      reclaimSessionId = this.dublicateReclaims[reclaimSessionId]
    }
    const dispenserLink = await dispenserLinkService.findOneByDispenserIdAndReclaimSessionId(dispenser._id, reclaimSessionId)
    if (!dispenserLink) throw new ForbiddenError('Reclaim drop was not redeemed yet .', 'RECLAIM_DROP_WAS_NOT_REDEEMED_YET')
    return dispenserLink.encryptedClaimLink
  }

  async popReclaimDispenser ({
    dispenser,
    reclaimSessionId,
    reclaimProof
  }) {
    logger.json({ reclaimproof1: reclaimProof })
    // check if dispenser is for reclaim airdrop
    if (!dispenser.reclaim) throw new ForbiddenError('Reclaim action for non-reclaim dispenser.', 'RECLAIM_ACTION_FOR_NON_RECLAIM_DISPENSER')
    
    // check if link was already popped by this reclaimDeviceId
    const reclaimDeviceId = reclaimProof.claimData.owner.toLowerCase()
    const alreadyClaimed = await dispenserLinkService
      .findOneByDispenserIdAndReclaimDeviceId(dispenser._id, reclaimDeviceId)
    if (alreadyClaimed) {
      this.dublicateReclaims[reclaimSessionId] = alreadyClaimed.reclaimSessionId
      logger.warn(`Reclaim Dispenser Link was already assigned before for this reclaim device ID. Dispenser: ${dispenser._id}. Reclaim Device Id: ${reclaimDeviceId}. New Reclaim Session Id: ${reclaimSessionId}. Existing reclaim session id: ${alreadyClaimed.reclaimSessionId}`)
      return alreadyClaimed
    }
    logger.json({ claimData: reclaimProof.claimData })
    logger.json({ context: reclaimProof.claimData?.context })
    logger.json({ keke: "krkk", extractedParameters: reclaimProof.claimData?.context?.extractedParameters })
    const isFollowing = reclaimProof?.claimData?.context?.extractedParameters?.following
    const isCorrectInstagramFollowId = reclaimProof?.claimData?.context?.extractedParameters?.id
    const userInstagramId = reclaimProof?.claimData?.context?.extractedParameters?.id_23422
    logger.json({ isFollowing, isCorrectInstagramFollowId, userInstagramId })
    if (isFollowing !== 'true') {
      throw new BadRequestError('User should follow the account to claim.', 'USER_SHOULD_FOLLOW')
    }
    if (dispenser.instagramFollowId !== isCorrectInstagramFollowId) {
      throw new BadRequestError('User should follow the correct account to claim.', 'USER_SHOULD_FOLLOW_CORRECT_ACCOUNT')
    }

    const claimerExists = await Claimer.exists({ 
      dispenser: dispenser._id, 
      claimerId: userInstagramId 
    })
    if (claimerExists) {
      throw new BadRequestError('User already claimed and exists in database.', 'USER_ALREADY_CLAIMED_AND_EXISTS')
    }

    const dispenserLink = await this._popDispenserLink({ dispenser })

    dispenserLink.reclaimProof = reclaimProof
    dispenserLink.reclaimDeviceId = reclaimDeviceId
    dispenserLink.reclaimSessionId = reclaimSessionId
    await dispenserLink.save()

    await Claimer.create({ 
      dispenser: dispenser._id,
      claimerId: userInstagramId, 
      reclaimProviderType: dispenser.reclaimProviderType 
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
