const logger = require('../utils/logger')
const claimLinkService = require('../services/claim-link-service')
const { NotFoundError } = require('../utils/errors')

const getLinkWithClaimParams = async (req, res) => {
  const linkId = req.params.link_id
  logger.json({ controller: 'receiver-controller', method: 'getLinkWithClaimParams', link_id: linkId })

  const linkItem = await claimLinkService.getLinkWithClaimParams(linkId)
  if (!linkItem) throw new NotFoundError('Claim link not found.', 'CLAIM_LINK_NOT_FOUND')

  res.json({
    success: true,
    data: linkItem
  })
}

module.exports = {
  getLinkWithClaimParams
}
