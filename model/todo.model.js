const mongoose = require("mongoose")

const todoSchema = mongoose.Schema({
    taskname : String,
    Status : String,
    tag : String,
    userId : String
})


const TodoModel = mongoose.model("todo",todoSchema)

module.exports = { TodoModel }