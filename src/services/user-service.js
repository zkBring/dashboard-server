const User = require('../models/user-model')

class UserService {
  async createUser ({ handle, dispenserId, reclaimProviderType }) {
    const user = await User.findOne({ handle: handle.toLowerCase(), dispenserId })
    if (user) return user
    
    return await User.create({
      handle,
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