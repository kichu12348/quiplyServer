const router = require('express').Router();
const {Auth} = require('../services/auth');
const {checkMessages,deleteMessages,backupMessages,getBackup,deleteBackup} = require('../controllers/message');

router.post('/delete',async (req,res)=>{
    const deleted = await deleteMessages(req.body);
    if(deleted){
        return res.json({success:true});
    }
    return res.json({success:false});
})

router.post('/check',Auth,async (req,res)=>{
    const {user} = req.user;
    const messages = await checkMessages(req.body,user.id);
    if(messages.success){
        return res.json({success:true,messages:messages.messages});
    }
    return res.json({success:false});
})

router.post('/backup',Auth,async (req,res)=>{
    const {messages} = req.body;
    const {user} = req.user;
    const {success,error} =await backupMessages(user.id,messages);
    if(!success){
        return res.json({success:false,error:{message:error.message}});
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