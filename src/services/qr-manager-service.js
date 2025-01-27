const qrSetService = require('./qr-set-service')
const claimApiService = require('./claim-api-service')
const dispenserService = require('./dispenser-service')
const claimLinkService = require('./claim-link-service')

class QrManagerService {
  async getQrCampaigns (creatorAddress) {
    const qrSets = await this.getQRSets(creatorAddress)
    const dispensers = await this.getDispensers(creatorAddress)

    let items = [...qrSets, ...dispensers]
      .sort((a, b) => b.created_at - a.created_at)

    items = items.map(item => {
      if (item.type === 'qr_set') {
        return {
          type: item.type,
          title: item.set_name,
          status: item.status,
          item_id: item.set_id,
          archived: item.archived,
          created_at: item.created_at,
          links_count: item.links_count,
          links_claimed: item.links_claimed,
          links_assigned: item.links_claimed
        }
      }

      if (item.type === 'dispenser') {
        return {
          type: item.type,
          title: item.title,
          status: item.status,
          active: item.active,
          dynamic: item.dynamic,
          reclaim: item.reclaim,
          archived: item.archived,
          item_id: item.dispenser_id,
          created_at: item.created_at,
          redirect_on: item.redirect_on,
          claim_start: item.claim_start,
          links_count: item.links_count,
          claim_finish: item.claim_finish,
          redirect_url: item.redirect_url,
          timeframe_on: item.timeframe_on,
          links_claimed: item.links_claimed,
          links_assigned: item.links_assigned,
          claim_duration: item.claim_duration
        }
      }
    })

    return items
  }

  async getQRSets (creatorAddress) {
    let qrSets = await qrSetService.findByCreatorAddressAndPopulateCampaign(creatorAddress)

    const campaignIds = qrSets.map(q => q.campaign?._id).filter(Boolean)
    const chainIds = qrSets.map(q => q.campaign?.chainId).filter(Boolean)
    const proxyAddresses = qrSets.map(q => q.campaign?.proxyContractAddress).filter(Boolean)

    if (!campaignIds.length) {
      return qrSets.map(qrSet => {
        const jsonedQrSet = qrSet.toJSON()
        jsonedQrSet.links_count = 0
        jsonedQrSet.links_claimed = 0
        jsonedQrSet.type = 'qr_set'
        return jsonedQrSet
      })
    }

    const [claimCounts, linkCounts] = await Promise.all([
      claimApiService.fetchClaimCounts(proxyAddresses, chainIds[0]),
      claimLinkService.aggregateLinkCountsAndCampaings(campaignIds)
    ])

    const claimCountsMap = new Map(claimCounts.map(({ proxyAddress, count }) => [proxyAddress, count]))
    const linkCountsMap = new Map(linkCounts.map(({ _id, count }) => [_id.toString(), count]))

    qrSets = qrSets.map(qrSet => {
      const jsonedQrSet = qrSet.toJSON()
      jsonedQrSet.links_count = linkCountsMap.get(qrSet.campaign?._id.toString()) || 0
      jsonedQrSet.links_claimed = claimCountsMap.get(qrSet.campaign?.proxyContractAddress) || 0
      jsonedQrSet.type = 'qr_set'
      return jsonedQrSet
    })

    return qrSets
  }

  async getDispensers (creatorAddress) {
    let dispensers = await dispenserService.findByCreatorAddress(creatorAddress)
    dispensers = await Promise.all(dispensers.map(async (dispenser) => {
      const dispenserWithCounts = await dispenserService.findOneWithCountLinksAndCountClaims(dispenser._id)
      dispenserWithCounts.type = 'dispenser'
      return dispenserWithCounts
    }))

    return dispensers
  }
}

module.exports = new QrManagerService()
