const {
  base,
  xLayer,
  mainnet,
  polygon,
  sepolia,
  immutableZkEvm
} = require('viem/chains')
const { zeroChain } = require('./crete-zero-network-chain-instance')
const { BadRequestError } = require('../errors')
const { createPublicClient, http } = require('viem')

const createClient = (chainId) => {
  const chain = getChain(chainId)

  return createPublicClient({
    chain,
    transport: http()
  })
}

const getChain = (chainId) => {
  switch (chainId) {
    case 1:
      return mainnet
    case 137:
      return polygon
    case 8453:
      return base
    case 11155111:
      return sepolia
    case 13371:
      return immutableZkEvm
    case 196:
      return xLayer
    case 543210:
      return zeroChain
    default:
      throw new BadRequestError('Chain id is not valid', 'CHAIN_ID_NOT_VALID')
  }
}

module.exports = { createClient }
