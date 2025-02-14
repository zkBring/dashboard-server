const User = require('../models/user-model')

class UserService {
  async createUser ({ handle, dispenserId, reclaimProviderType }) {
    return await User.create({
      handle: handle.toLowerCase(),
      dispenserId,
      reclaimProviderType
    })
  }

  async findOneByHandleAndDispenserId ({ handle, dispenserId }) {
    return await User.findOne({
      handle: handle.toLowerCase(), 
      dispenserId
    })
  }

  async getUserHandlesAndDispenserIds() {
    return await User.find({}, 'handle dispenserId')
  }
}

module.exports = new UserService()