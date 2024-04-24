
import User from "../models/user.model.js"
import asyncHandler from "../utils/asyncHandler.js" 
import myError from "../utils/customErrors.js"
import Response from "../utils/customResponses.js"
import bcrypt from "bcryptjs"


const getSelf = asyncHandler(
    async(req , res)=>{
        const {_id} = req.user

        const user = await User.findById({_id})
        if(!user) throw new myError("User not found" , 404)

        Response(res , user , 200 , "User data fetched successfully")
    }
)
const getUser = asyncHandler(
    async(req , res)=>{
        const id = req.params.userId
        const user = await User.findById(id).select("-password")
        if(!user) throw new myError("User not found" , 404)

        Response(res , user , 200 , "User data fetched successfully")
    }
)
const resetPassword = asyncHandler(
    async(req , res)=>{
        const {_id} = req.user
        const {oldPassword , newPassword} = req.body
        let user = await User.findById(_id)
        if(!user) throw new myError("User not found" , 404)
        const isValid = await bcrypt.compare(oldPassword , user.password )
        if(!isValid) throw new myError("Invalid password" , 400)
        user.password = newPassword
        const isSaved = await user.save()
        if(!isSaved) throw new myError("SOmething went wrong while saving the new password" , 500)

        Response(res , user , 200 , "Password changed successfully")
    }
)
const updateUser = asyncHandler(
    async(req , res)=>{
        const {_id} = req.user
        const {username , status , bio} = req.body
        let user = await User.findById(_id)
        const profileImage = req.fileUrls[0] || user.profileImage
        if(!user) throw new myError("User not found" , 404)

        user.username = username || user.username;
        user.profileImage = profileImage || user.profileImage ;
        user.bio = bio || user.bio;
        user.status = status || user.status;

        const updatedUser = await user.save();
        if (!updatedUser) {
            throw new myError("Something went wrong while saving the new password", 500);
        }


        Response(res , user , 200 , "Data updated successfully")
    }
)

export {getUser , getSelf , resetPassword , updateUser }