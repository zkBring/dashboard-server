const logger = require('../logger')
const ipfsGatewayUrl = 'https://cloudflare-ipfs.com/ipfs'
const ipfsPinataGatewayUrl = 'https://gateway.pinata.cloud/ipfs'
const crossmintUrl = 'https://www.crossmint.com/user/collection'

const addTokenIdToIPFS = (url, tokenId) => {
  if (url.indexOf('{id}') > -1) {
    if (tokenId !== undefined) {
      return url
        .replace('0x{id}', tokenId)
        .replace('{id}', tokenId)
        .replace(ipfsPinataGatewayUrl, ipfsGatewayUrl)
    }
    return url.replace(ipfsPinataGatewayUrl, ipfsGatewayUrl)
  } else {
    return url.replace(ipfsPinataGatewayUrl, ipfsGatewayUrl)
  }
}

const redefineURL = (url, tokenId) => {
  if (url.startsWith('ipfs://')) {
    const urlUpdated = `${ipfsGatewayUrl}/${url.replaceAll('ipfs://', '').replaceAll('ipfs/', '')}`
    return addTokenIdToIPFS(urlUpdated, tokenId)
  } else {
    return addTokenIdToIPFS(url, tokenId)
  }
}

const getValidImage = async (imageUrl) => {
  if (!imageUrl) return

  try {
    const redefinedURL = redefineURL(imageUrl)
    const checkImage = await fetch(redefinedURL)
    if (checkImage.status === 404) return
    return redefinedURL
  } catch (err) {
    logger.error(err)
  }
}

const getAlchemyTokenImage = async (tokenData) => {
  if (tokenData.rawMetadata) {
    if (tokenData.rawMetadata.image) {
      const image = await getValidImage(tokenData.rawMetadata.image)
      return image
    }
    if (tokenData.rawMetadata.animation_url) {
      const image = await getValidImage(tokenData.rawMetadata.animation_url)
      return image
    }
  } else if (tokenData.media && tokenData.media[0] && tokenData.media[0].raw) {
    const image = await getValidImage(tokenData.media[0].raw)
    return image
  }
}

const generateCrossmintUrl = ({ tokenId, tokenAddress, chainSuffix }) => {
  if (!chainSuffix) return

  return `${crossmintUrl}/${chainSuffix}:${tokenAddress}:${tokenId}`
}

module.exports = {
  redefineURL,
  getValidImage,
  getAlchemyTokenImage,
  generateCrossmintUrl
}
