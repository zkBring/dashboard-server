const logger = require('../utils/logger')
const stageConfig = require('../../stage-config')
const Campaign = require('../models/campaign-model')
const claimApiService = require('./claim-api-service')
const claimLinkService = require('./claim-link-service')
const { NotFoundError } = require('../utils/errors')
const config = require(`../../configs/${stageConfig.NODE_ENV}.config`)

class CampaignService {
  async create ({
    sdk,
    symbol,
    wallet,
    chainId,
    sponsored,
    claimHostOn,
    claimPattern,
    tokenAddress,
    signerAddress,
    campaignTitle,
    tokenStandard,
    campaignNumber,
    creatorAddress,
    multipleClaimsOn,
    preferredWalletOn,
    availableCountries,
    encryptedSignerKey,
    additionalWalletsOn,
    proxyContractAddress,
    proxyContractVersion,
    availableCountriesOn,
    claimingFinishedButtonOn,
    claimHost = '',
    claimingFinishedButtonUrl = '',
    claimingFinishedDescription = '',
    claimingFinishedButtonTitle = ''
  }) {
    const params = {
      sdk,
      symbol,
      wallet,
      chainId,
      sponsored,
      claimHost,
      claimHostOn,
      claimPattern,
      tokenAddress,
      signerAddress,
      campaignTitle,
      tokenStandard,
      campaignNumber,
      creatorAddress,
      multipleClaimsOn,
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
      claimingFinishedButtonTitle,
      factoryAddress: config.factoryAddresses[chainId].toLowerCase()
    }

    return await this._create(params)
  }

  async _create ({
    sdk,
    symbol,
    wallet,
    chainId,
    sponsored,
    claimHost,
    claimHostOn,
    collectionId,
    claimPattern,
    tokenAddress,
    signerAddress,
    campaignTitle,
    tokenStandard,
    campaignNumber,
    creatorAddress,
    factoryAddress,
    multipleClaimsOn,
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
  }) {
    const campaignDB = new Campaign({
      sdk,
      symbol,
      wallet,
      chainId,
      sponsored,
      claimHost,
      claimHostOn,
      collectionId,
      claimPattern,
      tokenAddress,
      signerAddress,
      tokenStandard,
      campaignNumber,
      creatorAddress,
      factoryAddress,
      multipleClaimsOn,
      preferredWalletOn,
      availableCountries,
      encryptedSignerKey,
      additionalWalletsOn,
      proxyContractAddress,
      proxyContractVersion,
      title: campaignTitle,
      availableCountriesOn,
      claimingFinishedButtonOn,
      claimingFinishedButtonUrl,
      claimingFinishedDescription,
      claimingFinishedButtonTitle
    })

    await campaignDB.save()

    logger.info(`Campaign ${campaignTitle} was successfully saved to database`)
    return campaignDB
  }

  async findByCreatorAddress (creatorAddress) {
    return await Campaign.find({ creatorAddress }).sort({ createdAt: -1 })
  }

  async findByCreatorAddressAndChainId (creatorAddress, chainId) {
    if (!chainId) {
      return await Campaign.find({ creatorAddress }).sort({ createdAt: -1 })
    }
    return await Campaign.find({ creatorAddress, chainId }).sort({ createdAt: -1 })
  }

  async findOneById (campaignId) {
    return await Campaign.findOne({ _id: campaignId })
  }

  async getAllCampaigns(offset, limit) {
    offset = Number(offset) || 0
    limit = Number(limit) || 10

    const campaigns = await Campaign.find({})
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit)

    const total = await Campaign.countDocuments()
    return {
      campaigns,
      resultSet: {
        offset,
        total,
        count: campaigns.length
      }
    }
  }

  async findCampaignsAndCountLinks (creatorAddress, chainId) {
    const campaigns = await this.findByCreatorAddressAndChainId(creatorAddress, chainId)
    if (!campaigns.length) return campaigns

    const campaignsWithLinksCount = await Promise.all(campaigns.map(async (campaign) => {
      const linksCount = await claimLinkService.countLinksByCampaignId(campaign._id)
      const jsonedCampaign = campaign.toJSON()
      jsonedCampaign.links_count = linksCount
      return jsonedCampaign
    }))

    return campaignsWithLinksCount
  }

  async findCampaignsWithCountLinksAndCountClaims (creatorAddress, chainId) {
    const campaignsWithLinksCount = await this.findCampaignsAndCountLinks(creatorAddress, chainId)
    if (!campaignsWithLinksCount.length) return campaignsWithLinksCount

    const proxyAddresses = campaignsWithLinksCount.map(campaign => campaign.proxy_contract_address)
    const fetchedClaimCounts = await claimApiService.fetchClaimCounts(proxyAddresses, chainId)

    const campaignsWithLinksCountAndClaimCounts = campaignsWithLinksCount.map(campaign => {
      const filteredItem = fetchedClaimCounts
        .filter(proxyAddressItem => campaign.proxy_contract_address === proxyAddressItem.proxyAddress)[0]
      campaign.links_claimed = filteredItem.count
      return campaign
    })

    return campaignsWithLinksCountAndClaimCounts
  }

  async findOneWithCountLinksAndCountClaims (campaignId) {
    let campaign = await this.findOneById(campaignId)
    if (!campaign) throw new NotFoundError('Campaign not found.', 'CAMPAIGN_NOT_FOUND')

    const chainId = campaign.chainId
    const proxyAddressArray = []
    proxyAddressArray.push(campaign.proxyContractAddress)

    const linksCount = await claimLinkService.countLinksByCampaignId(campaign._id)
    const claimCount = await claimApiService.fetchClaimCounts(proxyAddressArray, chainId)

    campaign = campaign.toJSON()
    campaign.links_count = linksCount
    campaign.links_claimed = claimCount[0].count
    return campaign
  }

  async getCampaignData (campaignId) {
    return await this.findOneWithCountLinksAndCountClaims(campaignId)
  }

  async getLinksReportByCampaignId (campaignId) {
    const campaign = await this.findOneById(campaignId)
    if (!campaign) throw new NotFoundError('Campaign not found.', 'CAMPAIGN_NOT_FOUND')

    const fetchedClaims = await claimApiService.fetchClaimedLinks(campaign.proxyContractAddress, campaign.chainId)

    const aggregatedLinkItems = fetchedClaims.map(item => {
      const tx = item.transactions.filter(tx => tx.status === 'completed')[0]
      return {
        receiver: item.data.receiverAddress,
        campaign_id: campaignId,
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

  async updateCampaign ({
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
    claimingFinishedButtonTitle,
    claimingFinishedDescription,
    claimingFinishedAutoRedirect
  }) {
    const updateFields = {
      title,
      wallet,
      archived,
      claimHost,
      claimHostOn,
      multipleClaimsOn,
      preferredWalletOn,
      availableCountries,
      additionalWalletsOn,
      availableCountriesOn,
      claimingFinishedButtonOn,
      claimingFinishedButtonUrl,
      claimingFinishedButtonTitle,
      claimingFinishedDescription,
      claimingFinishedAutoRedirect
    }

    return await Campaign.findOneAndUpdate(
      { _id: campaignId },
      { $set: updateFields },
      { new: true }
    )
  }
}

module.exports = new CampaignService()
