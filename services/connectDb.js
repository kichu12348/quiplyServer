const mongoose = require("mongoose")


const connectToDb=async(url)=>{
    await mongoose.connect(url).then(()=>{
        console.log('connected to mongoDb 😎')
    }).catch((e)=>{
        console.log("damn you messed up 🤨")
    })
}

module.exports={connectToDb}