const mongoose = require("mongoose")

const validator = require('validator')


const { Schema } = mongoose;



const userSchema = new Schema({

    name: { type: String, required: true },
    email: {
        type: String, required: true,
        unique: true,
        validator(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Not valid email")
            }
        }

    },      
    phoneNo: { type: Number, required: true },
    password: { type: String, required: true },


})


module.exports = mongoose.model('User', userSchema);