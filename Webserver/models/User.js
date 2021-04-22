var mongoose = require('mongoose')
var mongoseLocalStrategy = require('passport-local-mongoose')

const UserSchema = new mongoose.Schema({
    username: String,
    password: String
})

UserSchema.plugin(mongoseLocalStrategy)

module.exports = mongoose.model("User", UserSchema)