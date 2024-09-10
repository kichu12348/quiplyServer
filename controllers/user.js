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
        return res.json({ error: "Contact already exists", success: false,contact:{
          username:contact.username,
          id:contact._id,
          roomID:user.contacts.find((c) => c.contact._id.toString() === contactId).roomID,
          time:Date.now(),
          isGroup:false,
          noOfMembers:0
        } });
      }
      const roomID = randomString(16);
      user.contacts.push({contact:contactId,roomID:roomID});
      contact.contacts.push({contact:id,roomID:roomID});
      await user.save();
      await contact.save();
      return res.json({ success: true, contact: { 
        username: contact.username, 
        id: contact._id, 
        roomID ,
        time:Date.now(),
        isGroup:false,
        noOfMembers:0
      }});
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
    if(user.isGroup) return;
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

async function createGroup(req,res){
  const {user}=req.user;
  const {groupName,contacts}=req.body;
  if(!groupName || !contacts){
    return res.json({error:'Invalid data',success:false});
  }
  const roomID = crypto.randomBytes(32).toString('hex');
  const users = await User.find({_id:{$in:contacts}});
  if(!users){
    return res.json({error:'Users not found',success:false});
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.createHmac('sha256',salt).update(roomID).digest('hex');
  const noOfMembers = users.length+1;

  const group = await User.create({
    username:groupName,
    salt,
    hash,
    isGroup:true,
    noOfMembers,
    contacts:[]
  });

  users.forEach(async (u)=>{
    group.contacts.push({contact:u._id,roomID});
    u.contacts.push({contact:group._id,roomID});
    await u.save();
  });
  group.contacts.push({contact:user.id,roomID});
  await group.save();
  return res.json({success:true,contact:{
    username:group.username,
    id:group._id,
    noOfMembers:noOfMembers,
    isGroup:true,
    time:Date.now(),
    roomID
  }});
}

async function addUserToGroup(req,res){
  const {groupId,users}=req.body;
  if(!groupId || users.length===0){
    return res.json({error:'Invalid data',success:false});
  }
  const group = await User.findById(groupId);
  if(!group){
    return res.json({error:'Group not found',success:false});
  }
  const noOfMembers = group.noOfMembers+users.length;

  const usersT = await User.find({_id:{$in:users}});
  if(!usersT){
    return res.json({error:'Users not found',success:false});
  }
  usersT.forEach(async (u)=>{
    if(group.contacts.find((c)=>c.contact.toString()===u._id.toString())){
      return;
    }
    group.contacts.push({contact:u._id,roomID:group.roomID});
    u.contacts.push({contact:group._id,roomID:group.roomID});
    await u.save();
  });
  if(group.contacts.length===noOfMembers){
    return res.json({error:'Users not added',success:false});
  }
  group.noOfMembers=noOfMembers;
  await group.save();

  res.json({success:true,contact:{
    username:group.username,
    id:group._id,
    noOfMembers:noOfMembers,
    isGroup:true,
    time:Date.now(),
    roomID:group.roomID,
  }});
}



module.exports = {
    Login,
    Register,
    addContact,
    queryUsers,
    getContacts,
    checkAuth,
    createGroup,
    addUserToGroup
}

