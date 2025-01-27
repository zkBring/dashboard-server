const mongoose = require('mongoose')
const stageConfig = require('../../stage-config')

// Set up default mongoose connection
const connectDB = () => {
  mongoose.set('strictQuery', false)
  return mongoose.connect(
    stageConfig.mongoURI || 'mongodb://localhost:27017/default_dashboard_db',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )
}

module.exports = connectDB
