const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    id:String,
    sender: {
        type:String
    },
    senderName:{
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
    },
    isDeleted:{
        type:Boolean,
        default:false
    },
    isGroup:{
        type:Boolean,
        default:false
    },
    howManyRead:{
        type:Number,
        default:0
    },
    readBy:{
        type:Array,
        default:[]
    },
    isImage:{
        type:Boolean,
        default:false
    },
    imageUri:{
        type:String,
        default:null
    },
},{
    timestamps: true
})

module.exports = mongoose.model('Message', messageSchema);