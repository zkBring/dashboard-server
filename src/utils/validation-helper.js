const stageConfig = require('../../stage-config')
const {
  BadRequestError,
  ValidationError
} = require('./errors')

const claimLinksArrayValidator = (claimLinks) => {
  if (claimLinks.length >= +stageConfig.LINKS_BATCH_LIMIT) {
    throw new ValidationError('Limit of links amount for one batch is reached.', 'LIMIT_OF_LINKS_FOR_BATCH_IS_REACHED')
  }

  const isclaimLinksValid = claimLinks.every(item => {
    if (item.link_id && item.encrypted_claim_code && (item.token_id || item.token_amount) && item.sender_signature) {
      return true
    }
    return false
  })

  if (!isclaimLinksValid) {
    throw new BadRequestError('Invalid claim link object in claim link array. Link ID or Encrypted Claim Code or Sender Signature not provided', 'INVALID_CLAIM_LINK_OBJECT')
  }
}

module.exports = {
  claimLinksArrayValidator
}
