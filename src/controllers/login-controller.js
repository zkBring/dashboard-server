const jwt = require('jsonwebtoken')
const logger = require('../utils/logger')
const stageConfig = require('../../stage-config')
const loginService = require('../services/login-service')

const login = async (req, res) => {
  const {
    sig,
    msg,
    timestamp,
    chain_id: chainId
  } = req.body
  const userAddress = req.body.user_address.toLowerCase()
  logger.json({ controller: 'login-controller', method: 'login', user_address: userAddress })

  loginService.checkTimestamp(timestamp)

  const verifiedUserAddress = await loginService.verifySignedMessage({ sig, msg, userAddress, chainId })
  const expirationTime = parseInt(stageConfig.TOKEN_EXPIRATION_TIME, 10)
  const token = jwt.sign({ verifiedUserAddress }, stageConfig.JWT_SECRET, { expiresIn: expirationTime })

  return res
    .cookie('access_token', token, {
      maxAge: expirationTime * 1000,
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    })
    .status(200)
    .json({ message: 'Logged in successfully 😊 👌' })
}

const logout = async (req, res) => {
  logger.json({ controller: 'login-controller', method: 'logout', user_address: req.userAddress })

  return res
    .clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none'
    })
    .status(200)
    .json({ message: 'Successfully logged out 😏 🍀' })
}

const getNonce = async (req, res) => {
  const userAddress = req.body.user_address.toLowerCase()
  logger.json({ controller: 'login-controller', method: 'getNonce', user_address: userAddress })
  const nonce = loginService.generateNonce(userAddress)

  res.json({
    succes: true,
    nonce
  })
}

module.exports = {
  login,
  logout,
  getNonce
}
