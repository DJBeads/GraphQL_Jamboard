const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        firstName: String,
        lastName: String,
        emailAddress: String,
        password: String,
    }

});

const User = mongoose.model('User', UserSchema);

module.exports = User