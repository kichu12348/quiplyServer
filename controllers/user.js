const User = require("../models/user");
const crypto = require("crypto");
const jwt = require("jsonwebtoken"); 

const hashPassword = (
  password,
  salt = crypto.randomBytes(16).toString("hex")
) => {
  const hash = crypto.createHmac("sha256", salt).update(password).digest("hex");
  return {
    salt,
    hash,
  };
};

const randomString = (length=16) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const generateToken = (user) => {
  return jwt.sign({ id: user._id, username: user.username }, process.env.SECRET_KEY);
};

const verifyToken = (token) => jwt.verify(token, process.env.SECRET_KEY);


const addContact = async (req, res) => {
    const { contactId } = req.body;
    const { user } = req.user;
    const id = user.id;
    try {
        if(id===contactId){
            return res.json({ error: "Cannot add self", success: false });
        }
      const user = await User.findById(id).populate('contacts.contact');
      const contact = await User.findById(contactId);
    
      if (!user || !contact) {
        return res.json({ error: "User not found", success: false });
      }
      if (user.contacts.find((c) => c.contact._id.toString() === contactId)) {
        return res.json({ error: "Contact already exists", success: false });
      }
      const roomID = randomString(16);
      user.contacts.push({contact:contactId,roomID:roomID});
      contact.contacts.push({contact:id,roomID:roomID});
      await user.save();
      await contact.save();
      return res.json({ success: true, contact: { username: contact.username, id: contact._id, roomID ,time:Date.now()}});
    } catch (err) {
      return res.json({ error: "Internal server error", success: false });
    }
}

const Login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username }).populate('contacts.contact');
    if (!user) {
      return res.json({ error: "User not found", success: false });
    }
    const { hash } = hashPassword(password, user.salt);
    if (hash === user.hash) {
      const token = generateToken(user);
      return res.json({
        success: true,
        user: { username: user.username, id: user._id,contacts:user.contacts},
        token,
      });
    } else {
      return res.json({ error: "Invalid credentials", success: false });
    }
  } catch (err) {
    return res.json({ error: "Internal server error", success: false });
  }
};

const Register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({username});
    if (user) {
      return res.json({ error: 'User already exists', success: false });
    }
    const { salt, hash } = hashPassword(password);
    const newUser = await User.create({
      username,
      salt,
      hash,
      contacts:[]
    });
    const token = generateToken(newUser);
    return res.json({ success: true, user: { username: newUser.username, id: newUser._id,contacts:newUser.contacts}, token });
  } catch (err) {
    return res.json({ error: 'Internal server error', success: false });
  }
};

const queryUsers=async(req,res)=>{
   const {query}=req.body;
   const list = await User.find({username:{$regex:query, $options:'i'}});
  let users=[];
  list.forEach((user)=>{
    users.push({username:user.username,id:user._id});
  });
  return res.json({success:true, list:users});
}

const getContacts=async(req,res)=>{
    const r=req.user;
    const user=await User.findById(r.user.id).populate('contacts.contact');
    if(!user){
        return res.json({error:'User not found',success:false});
    }
    return res.json({success:true, contacts:user.contacts});
}


const checkAuth=async (req,res)=>{
    const {token}=req.body;
    if(!token){
        return res.json({error:'No token provided', success:false});
    }
    try{
        const user=verifyToken(token);
        if(!user){
            return res.json({error:'Invalid token', success:false});
        }
    }catch(err){
        return res.json({error:'Invalid token', success:false});
    }
}

module.exports = {
    Login,
    Register,
    addContact,
    queryUsers,
    getContacts,
    checkAuth
}

