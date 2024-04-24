// message.js

import mongoose from 'mongoose';

// Define message schema
const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Reference to the user who is the intended receiver (for individual chats)
    },
    receiverGroup: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Group' // Reference to the group where the message is sent (for group chats)
    },
    content: {
        type: String,
        required: true
    },
    attachments: [{
        type: String // Array of attachment URLs (stored in Cloudinary)
    }]
}, { timestamps: true });

// Create Message model
const Message = mongoose.model('Message', messageSchema);

export default Message;
