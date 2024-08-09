const mongoose = require("mongoose")

require("dotenv").config()


const connectTOdb = ()=>{
  
    mongoose.connect(process.env.url).then(()=>{
        console.log("Database connected succesfully")
    }).catch((err)=>{
        console.log(err)
    })
}


module.exports = connectTOdb;