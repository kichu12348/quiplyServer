const Message = require("../models/message");
const Backup = require("../models/backup");

const addMessage = async ({ message }) => {
  const { id, sender, msg, time, roomID, isSticker, sticker, isDeleted } =
    message;

  try {
    if (isDeleted) {
      const checkDbForMessage = await Message.findOne({ id });
      if (checkDbForMessage) {
        checkDbForMessage.isDeleted = true;
        await checkDbForMessage.save();
        return;
      }
    }
    const newMessage = new Message({
      id,
      sender,
      roomID,
      msg,
      time,
      isSticker,
      sticker,
      isDeleted,
    });
    await newMessage.save();
  } catch (err) {
    console.log(err);
  }
};

const checkMessages = async (roomID) => {
  try {
    let list = [];
    const messages = await Message.find({ roomID });
    if (messages.length === 0) {
      return { success: false, messages: [] };
    }
    messages.forEach((message) => {
      list.push({
        id: message.id,
        sender: message.sender,
        msg: message.msg,
        time: message.time,
        roomID: message.roomID,
        isSticker: message?.isSticker,
        sticker: message?.sticker,
        isDeleted: message.isDeleted,
      });
    });
    return { success: true, messages: list };
  } catch (err) {
    console.log(err);
  }
};

const deleteMessages = async (messageId) => {
  try {
    if (!messageId) return false;
    await Message.findOneAndDelete({ id: messageId });
    return true;
  } catch (err) {
    console.log(err.message);
  }
};

const backupMessages = async (id, messages) => {
  try {
    const checkBackup = await Backup.find({ id });
    if (checkBackup.length > 0) {
      await Backup.findOneAndDelete({ id });
    }
    const backup = new Backup({
      id: id,
      messages,
    });
    await backup.save();
    return true;
  } catch (err) {
    return false;
  }
};

const getBackup = async (id) => {
  try {
    const backup = await Backup.findOne({ id });
    return backup.messages;
  } catch (err) {
    return false;
  }
};

const deleteBackup = async (id) => {
  try {
    await Backup.findOneAndDelete({ id });
    return true;
  } catch (err) {
    return false;
  }
};

module.exports = {
  addMessage,
  checkMessages,
  deleteMessages,
  backupMessages,
  getBackup,
  deleteBackup,
};
