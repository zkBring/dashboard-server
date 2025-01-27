const { Alchemy, Network } = require('alchemy-sdk')
const stageConfig = require('../../../stage-config')

const defineAlchemyNetwork = (chainId) => {
  if (!chainId) return

  switch (Number(chainId)) {
    case 1:
      return Network.ETH_MAINNET
    case 5:
      return Network.ETH_GOERLI
    case 137:
      return Network.MATIC_MAINNET
    default:
      return Network.MATIC_MUMBAI
  }
}

const createAlchemyInstance = (chainId) => {
  const alchemyNetwork = defineAlchemyNetwork(chainId)
  if (!alchemyNetwork) return

  const alchemy = new Alchemy({
    apiKey: stageConfig.ALCHEMY_API_KEY,
    network: alchemyNetwork
  })

  return alchemy
}

module.exports = { createAlchemyInstance }
