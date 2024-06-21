const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    id:String,
    sender: {
        type:String
    },
    roomID: {
        type: String
    },
    msg: {
        type: String
    },
    time:{
        type:String
    },
    isSticker:{
        type:Boolean,
        default:false
    },
    sticker:{
        type:String,
        default:null
    }
},{
    timestamps: true
})

module.exports = mongoose.model('Message', messageSchema);