const logger = require('../logger')
const { createAlchemyInstance } = require('./create-alchemy-instance')
const { getAlchemyTokenImage } = require('./redefine-url-and-get-valid-image')

const getTokenImage = async ({ tokenAddress, tokenId, chainId }) => {
  try {
    const alchemy = createAlchemyInstance(chainId)
    if (!alchemy) throw new Error('No Alchemy instance is created')
    const tokenData = await alchemy.nft.getNftMetadata(tokenAddress, tokenId)
    const imageUrl = await getAlchemyTokenImage(tokenData)

    return { name: tokenData.title, imageUrl, description: tokenData.description }
  } catch (err) {
    logger.error(err)
  }
}

module.exports = { getTokenImage }
