const router = require('express').Router();
const {Auth} = require('../services/auth');
const {checkMessages,deleteMessages,backupMessages,getBackup,deleteBackup} = require('../controllers/message');

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

router.post('/backup',Auth,async (req,res)=>{
    const {messages} = req.body;
    const {user} = req.user;
    const ok =await backupMessages(user.id,messages);
    if(!ok){
        return res.json({success:false});
    }
    return res.json({success:true});
})

router.post('/getBackup',Auth,async (req,res)=>{
    const {user}=req.user;
    const backup = await getBackup(user.id);
    if(!backup){
        return res.json({success:false,error:{message:'No backup found'}});
    }
    if(backup){
        return res.json({success:true,messages:backup});
    }
    return res.json({success:false,error:{message:'Error getting backup'}});
})

router.post('/deleteBackup',Auth,async (req,res)=>{
    const {user} = req.user;
    const deleted = await deleteBackup(user.id);
    if(deleted){
        return res.json({success:true});
    }
    return res.json({success:false});
})




module.exports = router;