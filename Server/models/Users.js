const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fullName: {
        type : String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password:{
        type: String,
        require: true
    },
    token: {
        type: String,
    }
});
const Users = mongoose.model('User', userSchema);
module.exports = Users;