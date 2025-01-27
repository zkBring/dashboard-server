const logger = require('../utils/logger')
const tokenService = require('../services/token-service')
const tokenCollectionService = require('../services/token-collection-service')
const ObjectId = require('mongoose').Types.ObjectId
const { BadRequestError, NotFoundError, ForbiddenError } = require('../utils/errors')
const { collection } = require('../models/token-model')

const createCollection = async (req, res) => {
  logger.json({ controller: 'token-collection-controller', method: 'createCollection', user_address: req.userAddress.toLowerCase() })
  const {
    sbt,
    title,
    symbol,
    thumbnail,
    chain_id: chainId,
    token_address: tokenAddress,
    tokens_amount: tokensAmount,
    token_standard: tokenStandard
  } = req.body
  const creatorAddress = req.userAddress.toLowerCase()
  if (!creatorAddress) throw new BadRequestError('Creator address is not provided.', 'CREATOR_ADDRESS_REQUIRED')

  const collection = await tokenCollectionService.create({
    sbt,
    title,
    symbol,
    chainId,
    thumbnail,
    tokensAmount,
    tokenAddress,
    tokenStandard,
    creatorAddress
  })

  res.json({
    success: true,
    collection
  })
}

const getCollections = async (req, res) => {
  logger.json({ controller: 'token-collection-controller', method: 'getCollections', user_address: req.userAddress.toLowerCase() })
  const creatorAddress = req.userAddress.toLowerCase()
  if (!creatorAddress) throw new BadRequestError('Creator address is not provided.', 'CREATOR_ADDRESS_REQUIRED')

  const collections = await tokenCollectionService.getCollectionsWithTokenCounts(creatorAddress)
  res.json({
    success: true,
    collections
  })
}

const getCollectionById = async (req, res) => {
  logger.json({ controller: 'token-collection-controller', method: 'getCollectionById', user_address: req.userAddress.toLowerCase() })
  const collectionId = req.params.collection_id

  if (!ObjectId.isValid(collectionId)) {
    throw new BadRequestError('Collection ID is not valid', 'COLLECTION_ID_IS_NOT_VALID')
  }

  const collection = await tokenCollectionService.findOneByIdAndCountTokens(collectionId)
  if (!collection) throw new NotFoundError('Collection not found', 'COLLECTION_NOT_FOUND')

  // temp work around, remove it later
  // if (collection.creator_address.toLowerCase() !== req.userAddress.toLowerCase()) {
  //  throw new ForbiddenError('User address doesn’t match collection creator address', 'CREATOR_ADDRESS_NOT_VERIFIED')
  // }

  const tokens = await tokenService.findByCollectionId(collectionId)
  res.json({
    success: true,
    collection,
    tokens
  })
}

const addTokenToCollection = async (req, res) => {
  logger.json({ controller: 'token-collection-controller', method: 'addTokenToCollection', user_address: req.userAddress.toLowerCase() })
  const collectionId = req.params.collection_id
  const {
    name,
    copies,
    thumbnail,
    properties,
    description,
    token_id: tokenId
  } = req.body

  if (!ObjectId.isValid(collectionId)) {
    throw new BadRequestError('Collection ID is not valid', 'COLLECTION_ID_IS_NOT_VALID')
  }

  const collection = await tokenCollectionService.findOneById(collectionId)
  if (!collection) throw new NotFoundError('Collection not found.', 'COLLECTION_NOT_FOUND')

  if (collection.creatorAddress.toLowerCase() !== req.userAddress.toLowerCase()) {
    throw new ForbiddenError('User address doesn’t match collection creator address', 'CREATOR_ADDRESS_NOT_VERIFIED')
  }

  const tokenDB = await tokenService.create({
    name,
    copies,
    tokenId,
    thumbnail,
    properties,
    description,
    tokenCollection: collection._id
  })

  res.json({
    success: true,
    collection,
    token: tokenDB
  })
}

const updateCollection = async (req, res) => {
  logger.json({ controller: 'token-collection-controller', method: 'updateCollection', user_address: req.userAddress.toLowerCase() })
  const collectionId = req.params.collection_id
  const { archived } = req.body
  if (!ObjectId.isValid(collectionId)) {
    throw new BadRequestError('Collection ID is not valid', 'COLLECTION_ID_IS_NOT_VALID')
  }

  const updatedCollection = await tokenCollectionService.updateCollection({
    archived,
    collectionId
  })

  res.json({
    success: true,
    collection: updatedCollection
  })
}

module.exports = {
  getCollections,
  createCollection,
  updateCollection,
  getCollectionById,
  addTokenToCollection
}
