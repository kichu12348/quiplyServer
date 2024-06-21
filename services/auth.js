const jwt = require('jsonwebtoken');


const verifyToken = (token) => {
    return jwt.verify(token, process.env.SECRET_KEY);
}

const Auth =(req,res,next)=>{
    const {token} = req.body
    if(!token){
        return res.json({error:"No token provided",success:false})
    }
    try{
        const decoded = verifyToken(token);
        req.user = {user:decoded};
        next();
    }catch(err){
        return res.json({error:"Invalid token",success:false})
    }
}

module.exports={Auth}