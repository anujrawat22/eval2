
const jwt = require("jsonwebtoken")
const env = require("dotenv")
env.config()

const authenticate = (req,res,next)=>{
const token = req.headers?.authorization?.split(" ")[1]
jwt.verify(token, process.env.SECRETKEY, function(err, decoded) {
    console.log(decoded)
    if(decoded){
        req.body.userId = decoded.userId
        next()
    }else if(err){
        res.send({"msg" : "Please login again","error" : err })
    }
  });
}

module.exports = {authenticate}