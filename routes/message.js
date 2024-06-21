const router = require('express').Router();
const {checkMessages,deleteMessages} = require('../controllers/message');

router.post('/delete',async (req,res)=>{
    const {messageId} = req.body;
    const deleted = await deleteMessages(messageId);
    if(deleted){
        return res.json({success:true});
    }
    return res.json({success:false});
})

router.post('/check',async (req,res)=>{
    const {roomID} = req.body;
    const messages = await checkMessages(roomID);
    if(messages.success){
        return res.json({success:true,messages:messages.messages});
    }
    return res.json({success:false});
})


module.exports = router;