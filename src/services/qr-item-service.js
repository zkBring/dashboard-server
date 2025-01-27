const QRItem = require('../models/qr-item-model')
const logger = require('../utils/logger')

class QRItemService {
  async create (qrArray, setId) {
    const qrsToInsert = qrArray.map(qrItem => {
      return {
        qrId: qrItem.qr_id,
        encryptedQrSecret: qrItem.encrypted_qr_secret,
        QRSet: setId
      }
    })

    const insertedQrs = await QRItem.insertMany(qrsToInsert)
    logger.info(`${qrsToInsert.length} QRs from QRSet ${setId} was successfully saved to DB.`)

    return insertedQrs
  }

  async findByQRSetId (setId) {
    return await QRItem.find({ QRSet: { _id: setId } })
      .select([
        '-_id',
        'qrId',
        'encryptedQrSecret'
      ])
  }

  async findOneByQRSetId (setId) {
    return await QRItem.findOne({ QRSet: { _id: setId } })
  }

  async findOneByIdPopulatedWithQRSet (qrId) {
    return await QRItem.findOne({ qrId }).populate('QRSet')
  }

  async findOneByQrId (qrId) {
    return await QRItem.findOne({ qrId })
  }

  async deleteByQRSetId (setId) {
    const deletedQrsCount = await QRItem.deleteMany({ QRSet: setId })
    logger.info(`${deletedQrsCount.deletedCount} QRs from QRSet ${setId} was deleted from DB.`)
    return deletedQrsCount
  }

  async mapQRWithLink (qrArray) {
    const mappedArray = []
    for (let i = 0; i < qrArray.length; i++) {
      mappedArray.push(await QRItem.findOneAndUpdate(
        { qrId: qrArray[i].qr_id },
        {
          claimLinkId: qrArray[i].claim_link_id,
          encryptedClaimLink: qrArray[i].encrypted_claim_link
        },
        { new: true }
      )
      )
    }
    logger.info(`${mappedArray.length} qrItems was mapped with encryptedClaimLinks.`)

    return mappedArray
  }

  async sliceArrayToChunks (qrArray) {
    const chunkSize = 100000
    const slicedArray = []

    for (let i = 0; i < qrArray.length; i += chunkSize) {
      const chunk = qrArray.slice(i, i + chunkSize)
      slicedArray.push(chunk)
    }

    return slicedArray
  }

  bulkUpdateChunk (chunk) {
    return new Promise((resolve, reject) => {
      const bulk = QRItem.collection.initializeUnorderedBulkOp()

      for (let i = 0; i < chunk.length; i++) {
        bulk.find({
          qrId: chunk[i].qr_id
        })
          .updateOne({
            $set: {
              claimLinkId: chunk[i].claim_link_id,
              encryptedClaimLink: chunk[i].encrypted_claim_link
            }
          })
      }

      return bulk.execute().then(result => resolve(result.nMatched))
    })
  }

  async mapQRBulkWithLink (qrArray) {
    const chunks = await this.sliceArrayToChunks(qrArray)
    const chunksPromises = chunks.map(this.bulkUpdateChunk)

    return Promise.all(chunksPromises).then(
      bulkExecuteResults => {
        const matched = bulkExecuteResults.reduce((acc, cur) => acc + cur, 0)
        if (qrArray.length !== matched) {
          throw new Error(
            `Got ${qrArray.length} qrs, ${matched} was updated! qrArray length does not equal length of chunks`
          )
        }
        logger.info(`${matched} qrs was mapped with links successfully!`)
        return true
      }).catch(error => {
      logger.error(error)
      return false
    })
  }
}

module.exports = new QRItemService()
