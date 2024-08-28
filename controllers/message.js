const Message = require("../models/message");
const Backup = require("../models/backup");
const fs = require("fs");
const path = require("path");

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
      isImage: message.isImage,
      imageUri: message.imageUri,
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
            isImage: message.isImage,
            imageUri: message.imageUri,
          });
          if (message.howManyRead >= howManyRead) {
          setTimeout(async () => {
            if (message.isImage) {
              await deleteImageFile(message.imageUri,(err,deleted)=>{
                if(err){
                  console.log(err);
                }
              });
            }
            await Message.findOneAndDelete({ id: message.id });
          }, 3000);
          } else {
            message.save();
          }
        }
      }
      if (message.sender !== userId && !isGroup) {
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
          isImage: message.isImage,
          imageUri: message.imageUri,
        });
      }
    });
    return { success: true, messages: list };
  } catch (err) {
    console.log(err);
  }
};

const deleteMessages = async ({
  messageId,
  isGroup,
  noOfMembers,
  sender,
  isImage,
}) => {
  const howManyRead = noOfMembers - 1;

  try {
    if (isGroup) {
      const message = await Message.findOne({ id: messageId });

      if (!message) return false;
      if (message.howManyRead === howManyRead && message.sender !== sender) {
        if (message.isImage) {
          await deleteImageFile(message.imageUri, (err, deleted) => {
            if (err) {
              console.log(err);
            }
          });
        }
        await Message.findOneAndDelete({ id: messageId });
        return true;
      }
      return true;
    }
    if (!messageId) return false;
    if (isImage) {
      const message = await Message.findOne({ id: messageId });
      if (!message) return false;
      await deleteImageFile(message.imageUri, (err, deleted) => {
        if (err) {
          console.log(err);
        }
      });
    }
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

const deleteImageFile = (fileName, callback) => {
  const filePath = path.join(__dirname, "../uploads", fileName);

  fs.access(filePath, (err) => {
    if (err) {
      if (err.code === "ENOENT") {
        return callback(null, false);
      } else {
        return callback(err, false);
      }
    }

    fs.unlink(filePath, (unlinkErr) => {
      if (unlinkErr) {
        return callback(unlinkErr, false);
      }

      callback(null, true);
    });
  });
};

//low level function bettah dan multer
async function uploadImageChunks(req, res) {
  try {
    const { chunk, chunkIdx, totalChunks, fileName } = req.body;
    const uploadDir = path.join(__dirname, "../uploads");
    const filePath = path.join(uploadDir, fileName);

    // Check if uploads dir exists, creates one if not
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    // Append or create the file
    if (fs.existsSync(filePath)) {
      fs.appendFileSync(filePath, Buffer.from(chunk, "base64"));
    } else {
      fs.writeFileSync(filePath, Buffer.from(chunk, "base64"));
    }
    // checks If its the last chunk if so return success
    if (chunkIdx === totalChunks - 1) {
     
      return res.status(200).json({
        success: true,
        done: true,
        uri: fileName,
      });
    } else {
      return res.json({
        success: true,
        done: false,
        uri: null,
      });
    }
  } catch (error) {
    await deleteImageFile(req.body.fileName, (err, deleted) => {
      if (err) {
        console.log(err);
      }
    });
    return res.json({
      success: false,
      done: false,
      uri: null,
      error: error.message
    });
  }
}


async function sendFileToClient(req, res) {
  const { fileName } = req.query;

  const filePath = path.join(__dirname, "../uploads", fileName);

  if (!fs.existsSync(filePath)) {
    return res.json({ success: false, message: "File not found" });
  }

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.json({ success: false, message: "Error downloading file" });
    }
  });
}

async function deleteFileErrorHandler(req, res) {
 try{
    const {fileName} = req.body;
    await deleteImageFile(fileName,(err,deleted)=>{
      if(err){
        return res.json({success:false,message:err.message});
      }
      return res.json({success:true,message:"File deleted successfully"});
    });
 }catch(err){
    return res.json({success:false,message:err.message});
 }
}

module.exports = {
  addMessage,
  checkMessages,
  deleteMessages,
  backupMessages,
  getBackup,
  deleteBackup,
  uploadImageChunks,
  sendFileToClient,
  deleteFileErrorHandler,
};
