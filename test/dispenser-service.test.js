const { expect } = require('chai')
const { BadRequestError } = require('../src/utils/errors')
const dispenserService = require('../src/services/dispenser-service')

describe('DispenserService', () => {

  describe('getHandleByReclaimProviderType', () => {
    it('should return handle value when all data is valid', () => {
      const dispenser = {
        reclaimAppId: "0x6e9Ba629a13E0a599150b949abafa149159253a8"
      }
      const reclaimProof = {
        claimData: {
          context: JSON.stringify({
            extractedParameters: {
              trusted_username: "testuser"
            }
          })
        }
      }

      const result = dispenserService.getHandleByReclaimProviderType({ dispenser, reclaimProof })
      expect(result).to.equal("testuser")
    })

    it('should return handle value for different provider type', () => {
      const dispenser = {
        reclaimAppId: "0x4203699ae2549c544B1f91e748e66AA61D9aF182"
      }
      const reclaimProof = {
        claimData: {
          context: JSON.stringify({
            extractedParameters: {
              screen_name: "twitteruser"
            }
          })
        }
      }

      const result = dispenserService.getHandleByReclaimProviderType({ dispenser, reclaimProof })
      expect(result).to.equal("twitteruser")
    })

    it('should throw BadRequestError when handleKey is not defined', () => {
      const dispenser = {
        reclaimAppId: "0xnonexistentaddress"
      }
      const reclaimProof = {
        claimData: {
          context: JSON.stringify({
            extractedParameters: {
              some_key: "somevalue"
            }
          })
        }
      }

      expect(() => 
        dispenserService.getHandleByReclaimProviderType({ dispenser, reclaimProof })
      ).to.throw(BadRequestError, 'Handle key is not defined for this provider.')
    })

    it('should return undefined when context is empty', () => {
      const dispenser = {
        reclaimAppId: "0x6e9Ba629a13E0a599150b949abafa149159253a8"
      }
      const reclaimProof = {
        claimData: {
          context: "{}"
        }
      }

      const result = dispenserService.getHandleByReclaimProviderType({ dispenser, reclaimProof })
      expect(result).to.be.undefined
    })

    it('should return undefined when extractedParameters is empty', () => {
      const dispenser = {
        reclaimAppId: "0x6e9Ba629a13E0a599150b949abafa149159253a8"
      }
      const reclaimProof = {
        claimData: {
          context: JSON.stringify({
            extractedParameters: {}
          })
        }
      }

      const result = dispenserService.getHandleByReclaimProviderType({ dispenser, reclaimProof })
      expect(result).to.be.undefined
    })
  })
}) 