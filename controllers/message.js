const Message = require("../models/message");
const Backup = require("../models/backup");

const addMessage = async ({ message }) => {
  const {
    id,
    sender,
    senderName,
    msg,
    time,
    roomID,
    isSticker,
    sticker,
    isDeleted,
    isGroup,
  } = message;

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
      senderName,
      roomID,
      msg,
      time,
      isSticker,
      sticker,
      isDeleted,
      isGroup,
    });
    await newMessage.save();
  } catch (err) {
    console.log(err);
  }
};

const checkMessages = async ({ roomID, isGroup, noOfMembers }, userId) => {
  try {
    const howManyRead = noOfMembers - 1;
    let list = [];
    const messages = await Message.find({ roomID });
    if (messages.length === 0) {
      return { success: false, messages: [] };
    }
    messages.forEach(async (message) => {
      if (message.sender !== userId && isGroup) {
        if (message.readBy.includes(userId)) {
          return;
        } else {
          message.howManyRead++;
          message.readBy.push(userId);
          list.push({
            id: message.id,
            sender: message.sender,
            senderName: message.senderName,
            msg: message.msg,
            time: message.time,
            roomID: message.roomID,
            isSticker: message?.isSticker,
            sticker: message?.sticker,
            isDeleted: message.isDeleted,
            isGroup: message.isGroup,
          });
          if (message.howManyRead >= howManyRead) {
            await Message.findOneAndDelete({ id: message.id });
          } else {
            message.save();
          }
        }
      }
      if(message.sender !== userId && !isGroup) {
        list.push({
          id: message.id,
          sender: message.sender,
          senderName: message.senderName,
          msg: message.msg,
          time: message.time,
          roomID: message.roomID,
          isSticker: message?.isSticker,
          sticker: message?.sticker,
          isDeleted: message.isDeleted,
          isGroup: message.isGroup,
        });
      }
    });
    return { success: true, messages: list };
  } catch (err) {
    console.log(err);
  }
};

const deleteMessages = async ({ messageId, isGroup, noOfMembers, sender }) => {
  const howManyRead = noOfMembers - 1;

  try {
    if (isGroup) {
      const message = await Message.findOne({ id: messageId });

      if (!message) return false;
      if (message.howManyRead === howManyRead && message.sender !== sender) {
        await Message.findOneAndDelete({ id: messageId });
        return true;
      }
      return true;
    }

    if (!messageId) return false;
    await Message.findOneAndDelete({ id: messageId });
    return true;
  } catch (err) {
    console.log(err.message);
  }
};

const backupMessages = async (id, messages) => {
  try {
    const checkBackup = await Backup.findOne({ id });
    if (checkBackup) {
      await Backup.findOneAndDelete({ id });
    }
    const backup = new Backup({
      id: id,
      messages,
    });
    await backup.save();
    return { success: true };
  } catch (err) {
    console.log(err);
    return { success: false, error: { message: err.message } };
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
