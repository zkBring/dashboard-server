const mongoose = require('mongoose')

const CampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  chainId: {
    type: String,
    required: true
  },
  campaignNumber: {
    type: String,
    required: true
  },
  tokenAddress: {
    type: String,
    required: true
  },
  tokenStandard: {
    type: String,
    required: true,
    enum: [
      'ERC20',
      'ERC721',
      'ERC1155'
    ]
  },
  symbol: {
    type: String,
    required: true
  },
  wallet: {
    type: String,
    required: true
  },
  proxyContractAddress: {
    type: String,
    required: true
  },
  encryptedSignerKey: {
    type: String,
    required: true
  },
  signerAddress: {
    type: String,
    required: true
  },
  creatorAddress: {
    type: String,
    required: true
  },
  claimPattern: {
    type: String,
    required: true,
    enum: [
      'mint',
      'transfer'
    ]
  },
  sdk: {
    type: Boolean,
    required: true
  },
  proxyContractVersion: {
    type: String,
    required: true
  },
  sponsored: {
    type: Boolean,
    required: true
  },
  preferredWalletOn: {
    type: Boolean,
    default: false
  },
  availableWallets: {
    type: [String],
    required: true,
    default: []
  },
  additionalWalletsOn: {
    type: Boolean,
    default: true
  },
  availableCountries: {
    type: [String],
    required: true,
    default: []
  },
  availableCountriesOn: {
    type: Boolean,
    default: false
  },
  claimingFinishedButtonOn: {
    type: Boolean,
    default: false
  },
  collectionId: {
    type: String,
    default: null
  },
  multipleClaimsOn: {
    type: Boolean,
    default: false
  },
  claimHostOn: {
    type: Boolean,
    default: false
  },
  factoryAddress: {
    type: String,
    required: true
  },
  claimHost: String,
  claimingFinishedDescription: String,
  claimingFinishedButtonTitle: String,
  claimingFinishedButtonUrl: String,
  archived: {
    type: Boolean,
    default: false
  },
  claimingFinishedAutoRedirect: {
    type: Boolean,
    default: false
  }
},
{
  timestamps: true
})

CampaignSchema.index({ creatorAddress: 1 })
CampaignSchema.options.toJSON = {
  minimize: false,
  versionKey: false,
  transform: function (doc, ret, options) {
    ret.campaign_id = ret._id
    ret.chain_id = ret.chainId
    ret.claim_host = ret.claimHost
    ret.claim_host_on = ret.claimHostOn
    ret.collection_id = ret.collectionId
    ret.token_address = ret.tokenAddress
    ret.claim_pattern = ret.claimPattern
    ret.signer_address = ret.signerAddress
    ret.token_standard = ret.tokenStandard
    ret.factory_address = ret.factoryAddress
    ret.campaign_number = ret.campaignNumber
    ret.creator_address = ret.creatorAddress
    ret.available_wallets = ret.availableWallets
    ret.multiple_claims_on = ret.multipleClaimsOn
    ret.preferred_wallet_on = ret.preferredWalletOn
    ret.available_countries = ret.availableCountries
    ret.encrypted_signer_key = ret.encryptedSignerKey
    ret.additional_wallets_on = ret.additionalWalletsOn
    ret.proxy_contract_address = ret.proxyContractAddress
    ret.proxy_contract_version = ret.proxyContractVersion
    ret.available_countries_on = ret.availableCountriesOn
    ret.claiming_finished_button_on = ret.claimingFinishedButtonOn
    ret.claiming_finished_button_url = ret.claimingFinishedButtonUrl
    ret.claiming_finished_description = ret.claimingFinishedDescription
    ret.claiming_finished_button_title = ret.claimingFinishedButtonTitle
    ret.claiming_finished_auto_redirect = ret.claimingFinishedAutoRedirect
    ret.created_at = ret.createdAt
    ret.updated_at = ret.updatedAt
    delete ret._id
    delete ret.chainId
    delete ret.claimHost
    delete ret.claimHostOn
    delete ret.tokenAddress
    delete ret.claimPattern
    delete ret.collectionId
    delete ret.tokenStandard
    delete ret.signerAddress
    delete ret.factoryAddress
    delete ret.creatorAddress
    delete ret.campaignNumber
    delete ret.availableWallets
    delete ret.multipleClaimsOn
    delete ret.preferredWalletOn
    delete ret.availableCountries
    delete ret.encryptedSignerKey
    delete ret.additionalWalletsOn
    delete ret.proxyContractAddress
    delete ret.proxyContractVersion
    delete ret.availableCountriesOn
    delete ret.claimingFinishedButtonOn
    delete ret.claimingFinishedButtonUrl
    delete ret.claimingFinishedDescription
    delete ret.claimingFinishedButtonTitle
    delete ret.claimingFinishedAutoRedirect
    delete ret.createdAt
    delete ret.updatedAt
    return ret
  }
}

const Campaign = mongoose.model('Campaign', CampaignSchema)
module.exports = Campaign
