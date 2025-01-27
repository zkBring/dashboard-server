const referralCampaignMessageTemplater = ({
  uri,
  nonce,
  domain,
  address,
  version,
  chainId,
  issuedAt,
  campaignId
}) => {
  const line1 = 'wants you to sign in with your Ethereum account:'
  const line4 = 'I want to reveal my referral codes.'
  const line6 = 'URI:'
  const line7 = 'Version:'
  const line8 = 'Chain ID:'
  const line9 = 'Campaign ID:'
  const line10 = 'Nonce:'
  const line11 = 'Issued At:'

  return `${domain} ${line1.trim()}\n${address.trim()}\n\n${line4.trim()}\n\n${line6.trim()} ${uri.trim()}\n${line7.trim()} ${version.trim()}\n${line8.trim()} ${chainId.trim()}\n${line9.trim()} ${campaignId.trim()}\n${line10.trim()} ${nonce.trim()}\n${line11.trim()} ${issuedAt.trim()}`
}

module.exports = { referralCampaignMessageTemplater }
