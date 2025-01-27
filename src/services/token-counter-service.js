const Campaign = require('../models/campaign-model')
const claimApiService = require('./claim-api-service')
const claimLinkService = require('./claim-link-service')

class TokenCounterService {
  async fetchTokenLinksAndClaimCounts (tokenArray) {
    const campaignIds = tokenArray.map(token => token.campaignId).filter(campaignId => campaignId !== null)
    if (!campaignIds.length) return [{ linkCounts: [0], claimCounts: [0] }]

    const campaigns = await Promise.all(campaignIds.map(async (campaignId) => await Campaign.findOne({ _id: campaignId })))
    const linkCounts = await Promise.all(campaignIds.map(async (campaignId) => await claimLinkService.countLinksByCampaignId(campaignId)))
    const proxyAddresses = campaigns.map(campaign => campaign.proxyContractAddress)
    const chainId = campaigns[0].chainId
    let claimCounts = await claimApiService.fetchClaimCounts(proxyAddresses, chainId)
    claimCounts = claimCounts.map(claimCountItem => claimCountItem.count)

    return [{ linkCounts, claimCounts }]
  }

  async countTotalTokenLinksAndClaims (tokenArray) {
    let linksCount
    let linksClaimed
    const counts = await this.fetchTokenLinksAndClaimCounts(tokenArray)

    counts.forEach(count => {
      linksCount = count.linkCounts.reduce((acc, cur) => {
        return acc + parseInt(cur)
      }, 0)

      linksClaimed = count.claimCounts.reduce((acc, cur) => {
        return acc + parseInt(cur)
      }, 0)
    })

    return {
      linksCount,
      linksClaimed
    }
  }
}

module.exports = new TokenCounterService()
