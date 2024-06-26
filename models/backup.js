const mongoose = require("mongoose");
const message = require("./message");

const backupSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  messages: [
    {
      id: {
        type: String,
        required: true,
      },
      sender: {
        type: String,
        required: true,
      },
      msg: {
        type: String,
        default: "",
      },
      time: {
        type: String,
        required: true,
      },
      roomID: {
        type: String,
        required: true,
      },
      isSticker: {
        type: Boolean,
        default: false,
      },
      sticker: {
        type: String,
        default: null,
      },
      isDeleted: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

const Backup = mongoose.model("Backup", backupSchema);

module.exports = Backup;
