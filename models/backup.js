const mongoose = require("mongoose");


const backupSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  messages: [
    {
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
      groupMembers:{
          type:Number,
          default:0
      },
      howManyRead:{
          type:Number,
          default:0
      }
    },
  ],
});

const Backup = mongoose.model("Backup", backupSchema);

module.exports = Backup;
