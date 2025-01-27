const { defineChain } = require('viem')

const zeroChain = defineChain({
  id: 543210,
  name: 'ZERϴ Network',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: [
        'https://zero-network.calderachain.xyz'
      ]
    }
  },
  blockExplorers: {
    default: {
      name: 'Zerion Explorer',
      url: 'https://explorer.zero.network/'
    }
  },
  contracts: {
    multicall3: {
      address: '0xca11bde05977b3631167028862be2a173976ca11',
      blockCreated: 1142990
    }
  }
})

module.exports = { zeroChain }
