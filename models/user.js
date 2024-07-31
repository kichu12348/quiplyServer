const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    salt: {
        type: String,
        required: true
    },
    hash: {
        type: String,
        required: true
    },
    isGroup:{
        type: Boolean,
        default: false
    },
    noOfMembers:{
        type: Number,
        default: 0
    },
    contacts:[
        {
        contact:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        roomID:String 
        },
    ]
},{
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);