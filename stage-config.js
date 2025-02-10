const dotenv = require('dotenv')
const path = require('path')
const version = require('./package.json').version
process.env.DD_GIT_COMMIT_SHA = process.env.HEROKU_SLUG_COMMIT

dotenv.config({
  path: path.resolve(__dirname, `${process.env.NODE_ENV}.env`)
})

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  DD_VERSION: version,
  PORT: process.env.PORT || 8000,
  mongoURI: process.env.mongoURI,
  API_SECRET: process.env.API_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  RECLAIM_APP_ID: process.env.RECLAIM_APP_ID,
  CLAIM_SERVER_URL: process.env.CLAIM_SERVER_URL,
  AUTH_SIG_MESSAGE: process.env.AUTH_SIG_MESSAGE,
  SOCKET_SERVER_URL: process.env.SOCKET_SERVER_URL,
  MIGRATE_MONGO_URI: process.env.MIGRATE_MONGO_URI,
  RECLAIM_APP_SECRET: process.env.RECLAIM_APP_SECRET,
  REQUEST_VALIDATION: process.env.REQUEST_VALIDATION,
  RECLAIM_PROVIDER_ID: process.env.RECLAIM_PROVIDER_ID,
  SCAN_ID_SIG_MESSAGE: process.env.SCAN_ID_SIG_MESSAGE,
  VERIFICATION_APP_URL: process.env.VERIFICATION_APP_URL,
  ZUPLO_API_SERVER_URL: process.env.ZUPLO_API_SERVER_URL,
  RECLAIM_PROVIDER_TYPE: process.env.RECLAIM_PROVIDER_TYPE,
  MIGRATE_MONGO_DB_NAME: process.env.MIGRATE_MONGO_DB_NAME,
  WHITELIST_SIG_MESSAGE: process.env.WHITELIST_SIG_MESSAGE,
  SOCKET_SERVER_API_KEY: process.env.SOCKET_SERVER_API_KEY,
  LINKS_BATCH_LIMIT: process.env.LINKS_BATCH_LIMIT || 100001,
  DASHBOARD_KEY_SIG_MESSAGE: process.env.DASHBOARD_KEY_SIG_MESSAGE,
  TOKEN_EXPIRATION_TIME: process.env.TOKEN_EXPIRATION_TIME || 2592000,
}