const Message = require('../models/message');

const addMessage = async ({message})=>{
    const {id,sender,msg,time,roomID,isSticker,sticker} = message;
    try{
        const newMessage = new Message({id,sender,roomID,msg,time,isSticker,sticker});
        await newMessage.save();
    }catch(err){
        console.log(err);
    }
}

const checkMessages = async (roomID)=>{
    try{
        let list = [];
        const messages = await Message.find({roomID});
        if(messages.length===0){
            return {success:false,messages:[]};
        }
        messages.forEach((message)=>{
            list.push({id:message.id,sender:message.sender,msg:message.msg,time:message.time,roomID:message.roomID,isSticker:message?.isSticker,sticker:message?.sticker});
        });
        return {success:true,messages:list};
    }
    catch(err){
        console.log(err);
    }
}

const deleteMessages = async (messageId)=>{
    try{
        if(!messageId) return false;
        await Message.findOneAndDelete({id:messageId});
        return true;
    }
    catch(err){
        console.log(err.message);
    }
}

module.exports = {addMessage,checkMessages,deleteMessages};
