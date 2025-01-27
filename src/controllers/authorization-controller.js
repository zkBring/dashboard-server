const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')
const stageConfig = require('../../stage-config')
const { ForbiddenError } = require('../utils/errors')
const loginService = require('../services/login-service')

const requestValidator = (req, res, next) => {
  if (stageConfig.REQUEST_VALIDATION !== 'true') return next()

  const urlPattern = /\/api\/v2\/dashboard\/dispensers\/multiscan-qrs\/[^/]+\/campaign\/[^/]+\/receive-reclaim-proofs$/

  if (urlPattern.test(req.path)) {
    // If the request matches the pattern (and possibly user-agent), skip validation.
    return next()
  }

  const apiSecretKey = req.get('api-secret-key')
  if (apiSecretKey) {
    if (apiSecretKey !== stageConfig.API_SECRET) {
      throw new ForbiddenError('Requests from unauthorized resources are forbidden!', 'UNAUTHORIZED_REQUEST')
    }
    return next()
  }

  throw new ForbiddenError('Api secret key is not provided.', 'API_SECRET_KEY_NOT_PROVIDED')
}

const authorizationJWT = (req, res, next) => {
  const token = req.cookies.access_token

  try {
    const data = jwt.verify(token, stageConfig.JWT_SECRET)
    req.userAddress = data.verifiedUserAddress.toLowerCase()
    return next()
  } catch {
    throw new ForbiddenError('Token was not verified', 'TOKEN_NOT_VERIFIED')
  }
}

const authorizationCampaignKey = async (req, res, next) => {
  const campaignKey = req.get('x-campaign-key')
  const verifiedUserAddress = await loginService.verifyCampaignKey(campaignKey)

  if (verifiedUserAddress) {
    req.userAddress = verifiedUserAddress
    return next()
  }

  throw new ForbiddenError('x-campaign-key was not verified', 'X_CAMPAIGN_KEY_NOT_VERIFIED')
}

const authorizationApiKey = async (req, res, next) => {
  let customer
  try {
    const encodedCustomer = req.get('zp-customer')
    if (!encodedCustomer) throw new ForbiddenError('Customer is not provided', 'CUSTOMER_NOT_PROVIDED')

    const customerObj = atob(encodedCustomer)
    const parsedCustomerObj = JSON.parse(customerObj)

    if (parsedCustomerObj.internal) {
      throw new ForbiddenError('Internal API key.', 'INTERNAL_API_KEY')
    }

    const userAddress = parsedCustomerObj.user_address
    customer = parsedCustomerObj.customer
    if (!userAddress) throw new ForbiddenError('User address is not provided.', 'USER_ADDRESS_NOT_PROVIDED')

    req.userAddress = userAddress.toLowerCase()

    return next()
  } catch (err) {
    if (err.cause === 'INTERNAL_API_KEY') throw err

    const message = err.message || err.reason || 'Invalid customer profile.'
    logger.error(`Error getting customer profile. Customer - ${customer}. Reason: ${message}`)
    throw new ForbiddenError(`Error getting customer profile. Reason: ${message}`, 'INVALID_CUSTOMER_PROFILE')
  }
}

const buildAuthorization = (authType) => {
  const authorization = (req, res, next) => {
    if (authType.includes('JWT') && req.cookies.access_token) {
      return authorizationJWT(req, res, next)
    }
    if (authType.includes('CAMPAIGN_SIG') && req.get('x-campaign-key')) {
      return authorizationCampaignKey(req, res, next)
    }
    if (authType.includes('API_KEY') && req.get('zp-customer')) {
      return authorizationApiKey(req, res, next)
    }
    throw new ForbiddenError('Token or x-campaign-key or customer is not provided', 'TOKEN_OR_X_CAMPAIGN_KEY_OR_CUSTOMER_NOT_PROVIDED')
  }
  return authorization
}

module.exports = {
  requestValidator,
  buildAuthorization
}
