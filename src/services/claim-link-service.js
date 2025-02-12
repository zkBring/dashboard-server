const logger = require('../utils/logger')
const stageConfig = require('../../stage-config')
const ClaimLink = require('../models/claim-link-model')
const config = require(`../../configs/${stageConfig.NODE_ENV}.config`)
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ServiceUnavailableError,
  UnprocessableEntityError
} = require('../utils/errors')

class ClaimLinkService {
  async create (claimLinks, campaignId, batchId) {
    const linksToInsert = claimLinks.map(linkObj => {
      return {
        linkId: linkObj.link_id,
        claimParams: {
          tokenId: linkObj.token_id,
          tokenAmount: linkObj.token_amount,
          senderSignature: linkObj.sender_signature,
          weiAmount: linkObj.wei_amount,
          expirationTime: linkObj.expiration_time
        },
        encryptedClaimCode: linkObj.encrypted_claim_code,
        encryptedClaimLink: linkObj.encrypted_claim_link,
        campaign: campaignId,
        batch: batchId
      }
    })

    const insertedLinks = await ClaimLink.insertMany(linksToInsert)
    logger.info(`${linksToInsert.length} links from batch ${batchId} was successfully saved to DB.`)
    return insertedLinks
  }

  async findByCampaignId (campaignId) {
    return await ClaimLink.find({
      campaign: campaignId
    })
      .select([
        '-campaign',
        '-createdAt',
        '-updatedAt'
      ])
  }

  async findByBatchId (batchId) {
    return await ClaimLink.find({
      batch: batchId
    })
      .select([
        '-campaign',
        '-batch',
        '-createdAt',
        '-updatedAt'
      ])
  }

  async getLinkWithClaimParams (linkId) {
    const linkItem = await this.findOneByLinkIdAndPopulateCampaign(linkId)
    if (!linkItem) return null

    return {
      token_name: token?.name,
      link_key: linkItem.linkKey,
      token_image: token?.thumbnail,
      symbol: linkItem.campaign?.symbol,
      wallet: linkItem.campaign?.wallet,
      chain_id: linkItem.campaign?.chainId,
      sponsored: linkItem.campaign?.sponsored,
      token_id: linkItem.claimParams?.tokenId,
      wei_amount: linkItem.claimParams?.weiAmount,
      token_address: linkItem.campaign?.tokenAddress,
      claim_pattern: linkItem.campaign?.claimPattern,
      token_amount: linkItem.claimParams?.tokenAmount,
      token_standard: linkItem.campaign?.tokenStandard,
      factory_address: linkItem.campaign?.factoryAddress,
      creator_address: linkItem.campaign?.creatorAddress,
      campaign_number: linkItem.campaign?.campaignNumber,
      expiration_time: linkItem.claimParams?.expirationTime,
      available_wallets: linkItem.campaign?.availableWallets,
      sender_signature: linkItem.claimParams?.senderSignature,
      preferred_wallet_on: linkItem.campaign?.preferredWalletOn,
      additional_wallets_on: linkItem.campaign?.additionalWalletsOn,
      proxy_contract_version: linkItem.campaign?.proxyContractVersion,
      claiming_finished_button_on: linkItem.campaign?.claimingFinishedButtonOn,
      claiming_finished_button_url: linkItem.campaign?.claimingFinishedButtonUrl,
      claiming_finished_description: linkItem.campaign?.claimingFinishedDescription,
      claiming_finished_button_title: linkItem.campaign?.claimingFinishedButtonTitle,
      claiming_finished_auto_redirect: linkItem.campaign?.claimingFinishedAutoRedirect
    }
  }

  async findOneByLinkIdAndPopulateCampaign (linkId) {
    return await ClaimLink.findOne({ linkId })
      .populate('campaign')
  }

  async updateActiveStatus (linkId, activateStatus) {
    return await ClaimLink.findOneAndUpdate({ linkId }, { active: activateStatus }, { new: true })
  }

  async fetchClaimLinkStatus (linkItem) {
    if (!linkItem.active) {
      return {
        link_id: linkItem.linkId,
        status: 'DEACTIVATED'
      }
    }

    const now = Date.now()
    const timeDifference = linkItem.claimParams.expirationTime - now
    if (timeDifference <= 0) {
      return {
        link_id: linkItem.linkId,
        status: 'EXPIRED'
      }
    }

    const operation = await this.fetchClaimLinkTxData({
      linkId: linkItem.linkId,
      chainId: linkItem.campaign?.chainId
    })

    if (!operation) {
      return {
        link_id: linkItem.linkId,
        status: 'CREATED'
      }
    }

    if ((operation.status === 'canceled') || (operation.status === 'error')) {
      const lastTx = operation.transactions[operation.transactions.length - 1]
      return {
        link_id: linkItem.linkId,
        status: 'FAILED',
        recipient: operation.data?.receiverAddress,
        tx_hash: lastTx?.hash,
        created_at: linkItem.createdAt
      }
    }

    if (operation.status === 'pending') {
      const lastTx = operation.transactions[operation.transactions.length - 1]
      return {
        link_id: linkItem.linkId,
        status: 'PENDING',
        recipient: operation.data?.receiverAddress,
        tx_hash: lastTx?.hash,
        created_at: linkItem.createdAt
      }
    }

    if (operation.status === 'completed') {
      const tx = operation.transactions.filter(tx => tx.status === 'completed')[0]
      return {
        link_id: linkItem.linkId,
        status: 'CLAIMED',
        recipient: operation.data?.receiverAddress,
        tx_hash: tx?.hash,
        created_at: linkItem.createdAt,
        claimed_at_block: operation.claimCompleted
      }
    }
  }

  async fetchClaimLinkTxData ({ linkId, chainId }) {
    const claimServerUrl = stageConfig.CLAIM_SERVER_URL
    if (!claimServerUrl) throw new NotFoundError('Claim server URL not found.', 'CLAIM_SERVER_URL_NOT_FOUND')

    try {
      const response = await fetch(`${claimServerUrl}/api/v1/get-operation/${linkId}`)
      const data = await response.json()
      const operation = data.operation
      return operation
    } catch (err) {
      const errorMessage = err.message || err.reason || 'Unknown error'
      logger.error(`Some error occured while fetching claim link tx data. Error: ${errorMessage}`)
      throw new ServiceUnavailableError('Some error occured while fetching claim link tx data.', 'CLAIM_LINK_TX_DATA_FETCH_ERROR')
    }
  }

  async claim ({ linkId, countryCode, receiverAddress, receiverSignature }) {
    const linkItem = await this.findOneByLinkIdAndPopulateCampaign(linkId)

    if (!linkItem) throw new NotFoundError('Claim link not found.', 'CLAIM_LINK_NOT_FOUND')
    if (!linkItem.active) throw new UnprocessableEntityError('Claim link is deactivated.', 'CLAIM_LINK_DEACTIVAITED')
    if (!linkItem.campaign?.sponsored) throw new UnprocessableEntityError('Claim link is not sponsored.', 'CLAIM_LINK_NOT_SPONSORED')

    if (linkItem.campaign?.availableCountriesOn) {
      if (linkItem.campaign?.availableCountries.length && !linkItem.campaign?.availableCountries.includes(countryCode)) {
        throw new UnprocessableEntityError('Claim link cannot be claimed from your region.', 'CLAIM_LINK_NOT_AVAILABLE_IN_REGION')
      }
    }

    return await this._claim({
      linkId,
      receiverAddress,
      receiverSignature,
      chainId: linkItem.campaign?.chainId,
      tokenId: linkItem.claimParams?.tokenId,
      weiAmount: linkItem.claimParams?.weiAmount,
      tokenAddress: linkItem.campaign?.tokenAddress,
      campaignId: linkItem.campaign?.campaignNumber,
      tokenAmount: linkItem.claimParams?.tokenAmount,
      tokenStandard: linkItem.campaign?.tokenStandard,
      version: linkItem.campaign?.proxyContractVersion,
      factoryAddress: linkItem.campaign?.factoryAddress,
      expirationTime: linkItem.claimParams?.expirationTime,
      multipleClaimsOn: linkItem.campaign?.multipleClaimsOn,
      proxyAddress: linkItem.campaign?.proxyContractAddress,
      masterAddress: linkItem.campaign?.creatorAddress,
      signerSignature: linkItem.claimParams?.senderSignature
    })
  }

  async _claim ({
    linkId,
    chainId,
    tokenId,
    version,
    weiAmount,
    campaignId,
    tokenAmount,
    tokenAddress,
    proxyAddress,
    tokenStandard,
    factoryAddress,
    expirationTime,
    receiverAddress,
    multipleClaimsOn,
    receiverSignature,
    masterAddress,
    signerSignature
  }) {
    const claimServerUrl = stageConfig.CLAIM_SERVER_URL
    const claimMethod = config.claimMethod[tokenStandard]

    if (!claimServerUrl) throw new NotFoundError('Claim server URL not found.', 'CLAIM_SERVER_URL_NOT_FOUND')
    if (!claimMethod) throw new NotFoundError('Claim method is not found.', 'CLAIM_METHOD_NOT_FOUND')

    let fetchedData
    try {
      const bodyData = {
        linkId,
        chainId,
        version,
        weiAmount,
        campaignId,
        proxyAddress,
        factoryAddress,
        expirationTime,
        receiverAddress,
        multipleClaimsOn,
        receiverSignature,
        masterAddress,
        signerSignature
      }

      if (claimMethod === 'claim') {
        bodyData.tokenAmount = tokenAmount
        bodyData.tokenAddress = tokenAddress
      }

      if (claimMethod === 'claim-erc721') {
        bodyData.tokenId = tokenId
        bodyData.nftAddress = tokenAddress
      }

      if (claimMethod === 'claim-erc1155') {
        bodyData.tokenId = tokenId
        bodyData.tokenAmount = tokenAmount
        bodyData.nftAddress = tokenAddress
      }

      logger.info(`Calling claim server API (${claimServerUrl}/api/v1/${claimMethod}) to claim link ${linkId} to the address ${receiverAddress}`)

      const response = await fetch(`${claimServerUrl}/api/v1/${claimMethod}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8'
        },
        body: JSON.stringify(bodyData)
      })

      fetchedData = await response.json()
      if (!fetchedData.success) {
        const errorMessage = fetchedData.message || fetchedData.reason || 'Failed to claim link.'
        const cause = fetchedData?.errors[0] || 'FAILED_TO_CLAIM_LINK'
        throw new BadRequestError(errorMessage, cause)
      }

      return fetchedData.txHash
    } catch (err) {
      if (err.cause === 'MULTIPLE_CLAIMS_FORBIDDEN') throw new ForbiddenError(err.message, err.cause)
      const errorMessage = err.message || err.reason || 'Unknown error'
      const cause = err.cause || 'FAILED_TO_CLAIM_LINK'
      logger.error(`Some error occured while claiming link for receiver ${receiverAddress}. Error: ${errorMessage}, Cause: ${cause}`)
      throw new BadRequestError(errorMessage, cause)
    }
  }

  async countLinksByBatchId (batchId) {
    return await ClaimLink.countDocuments({ batch: batchId })
  }

  async countLinksByCampaignId (campaignId) {
    return await ClaimLink.countDocuments({ campaign: campaignId })
  }

  async checkLinksArrayForDiffCampaingId (claimLinksArray, dispenserLink) {
    const claimLink = await this.findOneByLinkIdAndPopulateCampaign(dispenserLink.linkId)
    if (!claimLink) throw new NotFoundError('Claim link not found.', 'CLAIM_LINK_NOT_FOUND')
    const dispenserLinkCampaing = claimLink.campaign._id.toString()

    const linkIds = claimLinksArray.map(linkObject => linkObject.link_id)
    const foundLinks = await ClaimLink.aggregate().match({ linkId: { $in: linkIds } })
    const uniqueCampaignIds = [...new Set(foundLinks.map(link => link.campaign.toString()))]
    if (!uniqueCampaignIds.length) throw new ForbiddenError('Claim links not uploaded.', 'CLAIM_LINKS_NOT_UPLOADED')

    if (uniqueCampaignIds.length > 1) {
      throw new ForbiddenError('Claim links have more than one unique campaing in array', 'CAMPAIGN_ID_IS_NOT_UNIQUE')
    }

    if (uniqueCampaignIds[0] !== dispenserLinkCampaing) {
      throw new ForbiddenError('Claim links are from different campaign', 'CAMPAIGN_ID_NOT_MATCH_DISPENSER')
    }

    return true
  }

  async aggregateLinkCountsAndCampaings (campaignIds) {
    const results = await ClaimLink.aggregate([
      {
        $match: {
          campaign: { $in: campaignIds }
        }
      },
      {
        $group: {
          _id: '$campaign',
          count: { $sum: 1 }
        }
      }
    ])

    return results
  }

  async getClaimLinkStatusById (linkId) {
    const linkItem = await this.findOneByLinkIdAndPopulateCampaign(linkId)
    if (!linkItem) throw new NotFoundError('Claim link not found.', 'CLAIM_LINK_NOT_FOUND')

    const status = await this.fetchClaimLinkStatus(linkItem)
    if (!status) throw new NotFoundError('Claim link status not found.', 'CLAIM_LINK_STATUS_NOT_FOUND')
    return status
  }
}

module.exports = new ClaimLinkService()
