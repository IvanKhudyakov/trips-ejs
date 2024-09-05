const mongoose = require('mongoose')

const connectDB = (url) => {
  return mongoose.connect(url, {
    //commented since in the latest version of mongoose i instal to get rid of the "dep0170 deprecationwarning" those options are deprecated
    // useNewUrlParser: true,
    // useCreateIndex: true,
    // useFindAndModify: false,
    // useUnifiedTopology: true,
  })
}

module.exports = connectDB
