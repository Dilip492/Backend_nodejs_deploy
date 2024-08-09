const mongoose = require('mongoose')


const userOTPschema =  new mongoose.Schema({

    otp: { type: Number, required: true },
    createdAt: { type: Date, expires: 120, default: Date.now } 

})


module.exports = mongoose.model('userOTP', userOTPschema);