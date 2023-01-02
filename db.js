const mongoose  = require("mongoose")
const env = require("dotenv")
env.config()

const connection = mongoose.connect(process.env.MONGOURL)

module.exports = {connection}