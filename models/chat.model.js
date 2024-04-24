// chat.js

import mongoose from 'mongoose';

// Define chat schema
const chatSchema = new mongoose.Schema({
    owner : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    particepants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    messages: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    }],
    type: {
        type: String,
        enum: ['individual', 'group'],
        required: true,
        default : "individual"
    },
    groupName: {
        type: String // Only applicable for group chats
    },
    groupIcon : {
        type: String // URL of the group's profile image (stored in Cloudinary)
    }
}, { timestamps: true });

// Create Chat model
const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
