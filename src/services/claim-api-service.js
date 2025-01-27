const logger = require('../utils/logger')
const stageConfig = require('../../stage-config')
const config = require(`../../configs/${stageConfig.NODE_ENV}.config`)
const { NotFoundError, ServiceUnavailableError } = require('../utils/errors')

class ClaimApiService {
  async fetchClaimCounts (proxyAddressesArray, chainId) {
    const claimServerUrl = stageConfig.CLAIM_SERVER_URL
    if (!claimServerUrl) throw new NotFoundError('Claim server URL not found.', 'CLAIM_SERVER_URL_NOT_FOUND')

    try {
      const bodyData = {
        proxy_addresses: proxyAddressesArray
      }

      const response = await fetch(`${claimServerUrl}/api/v1/claimed-count`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(bodyData)
      })

      if (!response.ok) {
        logger.warn(`Failed to fetch claim counts. Status: ${response.status}, Status text: ${response.statusText}, proxyAddresses: ${proxyAddressesArray}`)
        return [{
          proxyAddress: proxyAddressesArray[0],
          count: 0
        }]
      }
      const fetchedData = await response.json()

      return fetchedData.count_array
    } catch (err) {
      const errorMessage = err.message || err.reason || 'Unknown error'
      logger.error(`Some error occured while fetching claim counts. Error: ${errorMessage}`)
      throw new ServiceUnavailableError('Some error occured while fetching claim counts.', 'CLAIM_COUNTS_FETCH_ERROR')
    }
  }

  async fetchClaimedLinks (proxyAddress, chainId) {
    const claimServerUrl = stageConfig.CLAIM_SERVER_URL
    if (!claimServerUrl) throw new NotFoundError('Claim server URL not found.', 'CLAIM_SERVER_URL_NOT_FOUND')

    try {
      const response = await fetch(`${claimServerUrl}/api/v1/get-report/${proxyAddress}`)
      const data = await response.json()
      return data.operations
    } catch (err) {
      const errorMessage = err.message || err.reason || 'Unknown error'
      logger.error(`Some error occured while fetching claimed links. Error: ${errorMessage}`)
      throw new ServiceUnavailableError('Some error occured while fetching claimed links.', 'CLAIMED_LINKS_FETCH_ERROR')
    }
  }
}

module.exports = new ClaimApiService()
