const logger = require('../utils/logger')
const userService = require('./user-service')
const stageConfig = require('../../stage-config')
const Dispenser = require('../models/dispenser-model')
const claimApiService = require('./claim-api-service')
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
    const whitelistDispensers = await Dispenser.find({ whitelistOn: true }, '_id')
    const whitelistDispenserIds = new Set(
      whitelistDispensers.map(dispenser => dispenser._id.toString())
    )

    const handles = await userService.getUserHandlesAndDispenserIds()
    handles.forEach((handleObj) => {
      handleObj = handleObj.toObject()
      if (whitelistDispenserIds.has(handleObj.dispenserId)) {
        if (!this.whiteListHandlesCache[handleObj.dispenserId]) {
          this.whiteListHandlesCache[handleObj.dispenserId] = {}
        }
        this.whiteListHandlesCache[handleObj.dispenserId][handleObj.handle.toLowerCase()] = true
      }
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
    instagramFollowId,
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
      params.instagramFollowId = instagramFollowId
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
    instagramFollowId,
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
      instagramFollowId,
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

  async getDispensers (creatorAddress) {
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

    return {
      token_id: tokenId,
      title: campaign.title,
      wallet: campaign.wallet,
      campaign_id: campaign._id,
      token_amount: tokenAmount,
      chain_id: campaign.chainId,
      sponsored: campaign.sponsored,
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

  async getCampaignDataForClaimer ({ multiscanQrId, multiscanQREncCode, SERVER_URL, APP_URL }) {
    const dispenser = await this.findOneByMultiscanQrId(multiscanQrId)
    if (!dispenser) throw new NotFoundError('Dispenser not found', 'DISPENSER_NOT_FOUND')

    let reclaimVerificationURL = null

    if (dispenser.reclaim) {
      const reclaimProofRequest = await ReclaimProofRequest.init(dispenser.reclaimAppId, dispenser.reclaimAppSecret, dispenser.reclaimProviderId)

      logger.json({ SERVER_URL, APP_URL })
      const jsonProofResponse = false
      reclaimProofRequest.setAppCallbackUrl(`${stageConfig.ZUPLO_API_SERVER_URL}/api/v2/dashboard/dispensers/multiscan-qrs/${multiscanQrId}/campaign/${reclaimProofRequest.sessionId}/receive-reclaim-proofs`, jsonProofResponse)

      const redirectUrl = `${stageConfig.VERIFICATION_APP_URL}/#/verify/${multiscanQrId}/${multiscanQREncCode}/${reclaimProofRequest.sessionId}/verification-complete`
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

    const reclaimVerification = await reclaimVerificationService.findOneByReclaimSessionId({ reclaimSessionId })
    logger.json({ reclaimVerification })
    if (!reclaimVerification) throw new ForbiddenError('Reclaim verification not exists.', 'RECLAIM_VERIFICATION_NOT_EXISTS')
    if (reclaimVerification.status !== 'success') throw new ForbiddenError('Reclaim verification not success.', 'RECLAIM_VERIFICATION_NOT_SUCCESS')
    if (!reclaimVerification.handle) throw new ForbiddenError('No handle in reclaim verification', 'NO_HADLE_IN_RECLAIM_VERIFICATION')

    const userDb = await userService.findOneByHandleAndDispenserId({
      handle: reclaimVerification.handle.toLowerCase(),
      dispenserId: dispenser._id.toString()
    })
    if (!userDb) throw new ForbiddenError('User not exists', 'USER_NOT_EXISTS')

    if (userDb.linkId) {
      const previousLink = await dispenserLinkService.findOneByLinkId(userDb.linkId)
      if (!previousLink) throw new NotFoundError('Claim link not found.', 'CLAIM_LINK_NOT_FOUND')
      return previousLink.encryptedClaimLink
    }

    const dispenserLink = await this._popDispenserLink({ dispenser })

    userDb.alreadyClaimed = true
    userDb.linkId = dispenserLink.linkId
    await userDb.save()

    return dispenserLink.encryptedClaimLink
  }

  getHandleByReclaimProviderType ({ dispenser, reclaimProof }) {
    const context = JSON.parse(reclaimProof.claimData?.context)
    switch (dispenser.reclaimProviderType) {
      case 'instagram':
        return context?.extractedParameters?.trusted_username
      case 'x':
        return context?.extractedParameters?.screen_name
      case 'luma':
        return context?.extractedParameters?.email
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

    const userHandle = this.getHandleByReclaimProviderType({ dispenser, reclaimProof })
    logger.json({ userHandle, providerType: dispenser.reclaimProviderType })

    if (!userHandle) {
      return await reclaimVerificationService.updateReclaimVerification({
        reclaimVerification,
        message: 'No user handle in proof',
        cause: 'NO_USER_HANDLE_IN_PROOF',
        status: 'failed'
      })
    }

    await reclaimVerificationService.updateReclaimVerificationHandle({
      reclaimVerification,
      handle: userHandle
    })

    if (dispenser.whitelistOn) {
      const isHandleWhitelisted = this.whiteListHandlesCache[dispenser._id.toString()]?.[userHandle?.toLowerCase()]
      logger.json({ isHandleWhitelisted })

      if (!isHandleWhitelisted) {
        return await reclaimVerificationService.updateReclaimVerification({
          reclaimVerification,
          message: 'User is not whitelisted',
          cause: 'USER_NOT_WHITE_LISTED',
          status: 'failed'
        })
      }
    } else {
      const userDb = await userService.findOneByHandleAndDispenserId({
        handle: userHandle.toLowerCase(),
        dispenserId: dispenser._id.toString()
      })

      if (!userDb) {
        await userService.createUser({ 
          handle: userHandle.toLowerCase(),
          dispenserId: dispenser._id.toString(),
          reclaimProviderType: dispenser.reclaimProviderType
        })
      }
    }

    await reclaimVerificationService.updateReclaimVerification({
      reclaimVerification,
      status: 'success',
      message: '',
      cause: ''
    })
  }

  async popReclaimLink ({ multiscanQrId, reclaimSessionId }) {
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

  getQrCampaignType (dispenser) {
    if (dispenser.dynamic) return 'DYNAMIC_DISPENSER'
    if (dispenser.reclaim) return 'RECLAIM'
    return 'DISPENSER'
  }
}

module.exports = new DispenserService()
