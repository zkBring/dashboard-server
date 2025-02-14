const logger = require('../utils/logger')
const ObjectId = require('mongoose').Types.ObjectId
const batchService = require('../services/batch-service')
const campaignService = require('../services/campaign-service')
const claimLinkService = require('../services/claim-link-service')
const { claimLinksArrayValidator } = require('../utils/validation-helper')
const { BadRequestError, ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors')

const createCampaign = async (req, res) => {
  logger.json({ controller: 'campaign-controller', method: 'createCampaign', user_address: req.userAddress })
  const creatorAddress = req.body.creator_address.toLowerCase()
  const {
    sdk,
    symbol,
    wallet,
    sponsored,
    chain_id: chainId,
    title: campaignTitle,
    claim_host: claimHost,
    claim_links: claimLinks,
    claim_host_on: claimHostOn,
    token_address: tokenAddress,
    collection_id: collectionId,
    claim_pattern: claimPattern,
    token_standard: tokenStandard,
    signer_address: signerAddress,
    campaign_number: campaignNumber,
    batch_description: batchDescription,
    multiple_claims_on: multipleClaimsOn,
    collection_token_id: collectionTokenId,
    preferred_wallet_on: preferredWalletOn,
    available_countries: availableCountries,
    encrypted_signer_key: encryptedSignerKey,
    additional_wallets_on: additionalWalletsOn,
    proxy_contract_address: proxyContractAddress,
    proxy_contract_version: proxyContractVersion,
    available_countries_on: availableCountriesOn,
    claiming_finished_button_on: claimingFinishedButtonOn,
    claiming_finished_button_url: claimingFinishedButtonUrl,
    claiming_finished_description: claimingFinishedDescription,
    claiming_finished_button_title: claimingFinishedButtonTitle
  } = req.body

  if (creatorAddress !== req.userAddress) {
    throw new ValidationError('Creator address is not valid', 'CREATOR_ADDRESS_NOT_VALID')
  }

  if (!sdk) {
    if (!batchDescription) {
      throw new BadRequestError('Batch description is not provided', 'BATCH_DESCRIPTION_NOT_PROVIDED')
    }

    if (!claimLinks) {
      throw new BadRequestError('Claim links are not provided', 'CLAIM_LINKS_NOT_PROVIDED')
    }

    claimLinksArrayValidator(claimLinks)
  }

  const campaignDb = await campaignService.create({
    sdk,
    symbol,
    wallet,
    chainId,
    sponsored,
    claimHost,
    claimLinks,
    claimHostOn,
    claimPattern,
    collectionId,
    tokenAddress,
    signerAddress,
    campaignTitle,
    tokenStandard,
    campaignNumber,
    creatorAddress,
    multipleClaimsOn,
    collectionTokenId,
    preferredWalletOn,
    availableCountries,
    encryptedSignerKey,
    additionalWalletsOn,
    proxyContractAddress,
    proxyContractVersion,
    availableCountriesOn,
    claimingFinishedButtonOn,
    claimingFinishedButtonUrl,
    claimingFinishedDescription,
    claimingFinishedButtonTitle
  })

  let batchDb, claimLinksDb
  if (!sdk) {
    batchDb = await batchService.create(
      campaignDb._id,
      batchDescription
    )
    claimLinksDb = await claimLinkService.create(
      claimLinks,
      campaignDb._id,
      batchDb._id
    )
  }

  res.json({
    success: true,
    campaign: campaignDb,
    batch: batchDb,
    claim_links: claimLinksDb
  })
}

const getCampaigns = async (req, res) => {
  logger.json({ controller: 'campaign-controller', method: 'getCampaigns', user_address: req.userAddress })
  const creatorAddress = req.userAddress
  const chainId = req.query.chain_id

  if (!creatorAddress) {
    throw new BadRequestError('Creator address is not provided', 'CREATOR_ADDRESS_NOT_PROVIDED')
  }

  const campaignsWithLinksCount = await campaignService.findCampaignsWithCountLinksAndCountClaims(creatorAddress, chainId)
  res.json({
    success: true,
    campaigns_array: campaignsWithLinksCount
  })
}

const getCampaignById = async (req, res) => {
  logger.json({ controller: 'campaign-controller', method: 'getCampaignById', user_address: req.userAddress })
  const campaignId = req.params.campaign_id

  if (!ObjectId.isValid(campaignId)) {
    throw new BadRequestError('Campaign ID is not valid', 'CAMPAIGN_ID_NOT_VALID')
  }

  const campaign = await campaignService.getCampaignData(campaignId)
  if (campaign.creator_address.toLowerCase() !== req.userAddress) {
    throw new ForbiddenError('User address doesn’t match campaign creator address', 'CREATOR_ADDRESS_NOT_VALID')
  }

  res.json({
    success: true,
    campaign
  })
}

const getLinksReport = async (req, res) => {
  logger.json({ controller: 'campaign-controller', method: 'getLinksReport', user_address: req.userAddress })
  const campaignId = req.params.campaign_id

  if (!ObjectId.isValid(campaignId)) {
    throw new BadRequestError('Campaign ID is not valid', 'CAMPAIGN_ID_NOT_VALID')
  }

  const aggregatedLinkItems = await campaignService.getLinksReportByCampaignId(campaignId)
  res.json({
    success: true,
    links_data: aggregatedLinkItems
  })
}

const getLinksBatches = async (req, res) => {
  logger.json({ controller: 'campaign-controller', method: 'getLinksBatch', user_address: req.userAddress })
  const campaignId = req.params.campaign_id

  if (!ObjectId.isValid(campaignId)) {
    throw new BadRequestError('Campaign ID is not valid', 'CAMPAIGN_ID_NOT_VALID')
  }

  const campaign = await campaignService.findOneById(campaignId)
  if (!campaign) {
    throw new NotFoundError('Campaign not found.', 'CAMPAIGN_NOT_FOUND')
  }

  if (campaign.creatorAddress.toLowerCase() !== req.userAddress) {
    throw new ForbiddenError('User address doesn’t match campaign creator address', 'CREATOR_ADDRESS_NOT_VALID')
  }

  const batches = await batchService.findByCampaignId(campaignId)
  const aggregatedBatches = await batchService.countLinksAndAggregateWithBatches(batches)
  res.json(
    {
      success: true,
      creator_address: campaign.creatorAddress,
      batches: aggregatedBatches
    }
  )
}

const getLinksBatchById = async (req, res) => {
  logger.json({ controller: 'campaign-controller', method: 'getLinksBatchById', user_address: req.userAddress })
  const campaignId = req.params.campaign_id
  const batchId = req.params.batch_id

  if (!ObjectId.isValid(campaignId)) {
    throw new BadRequestError('Campaign ID is not valid', 'CAMPAIGN_ID_NOT_VALID')
  }

  const campaign = await campaignService.findOneById(campaignId)
  if (!campaign) {
    throw new NotFoundError('Campaign not found.', 'CAMPAIGN_NOT_FOUND')
  }

  if (campaign.creatorAddress.toLowerCase() !== req.userAddress) {
    throw new ForbiddenError('User address doesn’t match campaign creator address', 'CREATOR_ADDRESS_NOT_VALID')
  }

  if (!ObjectId.isValid(batchId)) {
    throw new BadRequestError('Batch ID is not valid.', 'BATCH_ID_NOT_VALID')
  }

  const batch = await batchService.findOneById(batchId)
  if (!batch) {
    throw new NotFoundError('Batch not found.', 'BATCH_NOT_FOUND')
  }

  if (batch.campaign.toString() !== campaign._id.toString()) {
    throw new ValidationError('Batch does not match campaign', 'BATCH_NOT_MATCH_CAMPAIGN')
  }

  const linkArray = await claimLinkService.findByBatchId(batchId)
  res.json({
    success: true,
    creator_address: req.userAddress,
    batch,
    claim_links: linkArray
  })
}

const updateCampaign = async (req, res) => {
  logger.json({ controller: 'campaign-controller', method: 'updateCampaign', user_address: req.userAddress })
  const campaignId = req.params.campaign_id
  const {
    title,
    wallet,
    archived,
    claim_host: claimHost,
    claim_host_on: claimHostOn,
    multiple_claims_on: multipleClaimsOn,
    preferred_wallet_on: preferredWalletOn,
    available_countries: availableCountries,
    additional_wallets_on: additionalWalletsOn,
    available_countries_on: availableCountriesOn,
    claiming_finished_button_on: claimingFinishedButtonOn,
    claiming_finished_button_url: claimingFinishedButtonUrl,
    claiming_finished_description: claimingFinishedDescription,
    claiming_finished_button_title: claimingFinishedButtonTitle,
    claiming_finished_auto_redirect: claimingFinishedAutoRedirect
  } = req.body

  if (!ObjectId.isValid(campaignId)) {
    throw new BadRequestError('Campaign ID is not valid', 'CAMPAIGN_ID_NOT_VALID')
  }

  const campaign = await campaignService.findOneById(campaignId)
  if (campaign.creatorAddress.toLowerCase() !== req.userAddress) {
    throw new ForbiddenError('User address doesn’t match campaign creator address', 'CREATOR_ADDRESS_NOT_VALID')
  }

  const updatedCampaign = await campaignService.updateCampaign({
    title,
    wallet,
    archived,
    claimHost,
    campaignId,
    claimHostOn,
    multipleClaimsOn,
    preferredWalletOn,
    availableCountries,
    additionalWalletsOn,
    availableCountriesOn,
    claimingFinishedButtonOn,
    claimingFinishedButtonUrl,
    claimingFinishedDescription,
    claimingFinishedButtonTitle,
    claimingFinishedAutoRedirect
  })

  res.json({
    success: true,
    campaign: updatedCampaign
  })
}

module.exports = {
  getCampaigns,
  createCampaign,
  updateCampaign,
  getLinksReport,
  getCampaignById,
  getLinksBatches,
  getLinksBatchById
}
