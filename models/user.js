const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    googleID: String,
    firstName: String,
    lastName: String,
    email: String,
    photo: String,
    password: String
});

module.exports = mongoose.model('User', UserSchema);