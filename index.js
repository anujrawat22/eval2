
const express = require("express")
const app = express()
const {connection} = require("./db")
const {UserModel} = require("./model/user.model")
const {TodoModel} = require("./model/todo.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const env = require("dotenv")
const { authenticate } = require("./middleware/authenticate")
env.config()
app.use(express.json())





app.post("/signup",async (req,res)=>{
    const {name,email,password,age} = req.body
    const finduser = await UserModel.findOne({email})
    if(finduser){
        res.send({"msg" : "User alreday exists"})
    }else{
        bcrypt.hash(password, 5,async function(err, hash) {
            if(err){
                res.send({"msg" :"Something went wrong"})
                console.log(err)
            }else{
                const user =await new UserModel({name,email,password:hash,age})
                user.save()
                res.send({"msg" : "Signed in  Succesfully"})
            }
        });
    }
})


app.post("/login",async(req,res)=>{
const {email,password} = req.body
const user = await UserModel.find({email})
console.log(user)
if(user.length===0){
    res.send({"msg" :"User does not exist ,Please Signup"})
}else{
    const hashedpassword = user[0].password
    console.log(hashedpassword)
    bcrypt.compare(password, hashedpassword, function(err, result) {
        if(err){
            res.send({"msg":"something went wrong"})
            console.log(err)
        }else{
            if(result){
                const token = jwt.sign({
                    userId: user[0]._id
                  }, process.env.SECRETKEY, { expiresIn: 60  });

                const refreshtoken = jwt.sign({
                    userId: user[0]._id
                  }, process.env.REFRESHKEY, { expiresIn: 60 * 5 });
                
                res.send({"msg" : "Logged in sucessfully","token" : token ,"refreshtoken" : refreshtoken})
            }else{
                res.send({"msg" : "Invalid Credentials"})
            }
        }
    });
}
})

app.post("/getrefreshtoken",(req,res)=>{
    const {refreshtoken} = req.header?.authorization?.split(" ")[1]
    jwt.verify(refreshtoken, process.env.REFRESHKEY, function(err, decoded) {
        if(decoded){
            const newtoken =  jwt.sign({
                userId: decoded.userId
              }, process.env.SECRETKEY, { expiresIn: 60  });

              res.send({"msg" :"Logged in Sucessfully",'token' : newtoken})
        }else if(err){
            res.send({"msg" : "Please login again","error" : err })
        }
      });
    })


app.get("/todos",authenticate,async(req,res)=>{
    const status = req.query.status
    const tag = req.query.tag
    const {userId} = req.body
    if(status === "pending"){
        const userposts = await TodoModel.find({userId,status : 'pending'})
        res.send({"posts" :userposts})
    }
    else if(status === 'done' && tag === 'personal'){
        const userposts = await TodoModel.find({userId,status : 'pending',tag : 'personal'})
        res.send({"todo" :userposts})

    }
    else{
        const userposts = await TodoModel.find({userId})
        res.send({"todo" : userposts})
    }
    
})


app.get("/todos/:todoID",authenticate,async(req,res)=>{
    const id = req.params.todoID
    const todo = await TodoModel.find({_id : id})
    res.send({'todo' : todo})
})

app.post("/todos/create",authenticate,async(req,res)=>{
    const { taskname,
    Status,
    tag,
    userId} = req.body
    
    let newpost = await new TodoModel({taskname,Status,tag,userId})
    newpost.save()

    res.send({"msg" : "Post created sucessfully"})
    
})

app.patch("/todos/update/:id",authenticate,async(req,res)=>{
    const id = req.params.id
    let data = req.body
    await TodoModel.findOneAndUpdate({_id : id},data)
    res.send({"msg" : `Todo with id ${id} updated sucessfully`})
})

app.delete("/todos/delete/:id",authenticate,async(req,res)=>{
    const id = req.params.id
    await TodoModel.findByIdAndDelete({_id : id})
    res.send({"msg" : "Todo deleted Sucessfully"})
})













app.listen(process.env.PORT,async()=>{
try{
    await connection 
    console.log("Connected to DB")
}
catch(err){
    console.log("Error connecting to DB")
    console.log(err)
}
console.log(`Listening on Port ${process.env.PORT}`)
})




