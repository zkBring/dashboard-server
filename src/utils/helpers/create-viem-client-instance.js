const { base } = require('viem/chains')
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
    case 8453:
      return base
    default:
      throw new BadRequestError('Chain id is not valid', 'CHAIN_ID_NOT_VALID')
  }
}

module.exports = { createClient }
