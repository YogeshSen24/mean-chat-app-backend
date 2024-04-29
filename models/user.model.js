// user.js

import mongoose from 'mongoose';
import bcrypt from "bcryptjs"

// Define user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    profileImage: {
        type: String // URL of the user's profile image (stored in Cloudinary)
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }],
    friendRequests : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Request'
    }],
    createdGroups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }],
    inGroups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat'
    }],
    status: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    bio: {
        type: String
    }
}, { timestamps: true });

userSchema.pre("save" , async function(next){
    if (!this.isModified('password')) {
        return next();
      }
    //encrypt the password
    const hashedPassword = await bcrypt.hash(this.password , 10);
    // Replace plain password with hashed password
    this.password = hashedPassword;
    next();

})

// Create User model
const User = mongoose.model('User', userSchema);

export default User;
