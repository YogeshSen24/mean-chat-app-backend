import asyncHandler from "express-async-handler"
import User from "../models/user.model.js"
import { validateRegistrationData } from "../utils/validation.js";
import myError from "../utils/customErrors.js"
import {sendToken} from "../utils/features.js"
import bcrypt from "bcryptjs"

// Register a new user
const register = asyncHandler(
    async (req, res) => {
        //get the user detaiils from the body of the request
        const {username, email, password } = req.body;
        const avatar = req.fileUrl || "data:image/png;base64,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"
        validateRegistrationData(req.body)

        const user = await User.create({
            username,
            email,
            password,
            profileImage:avatar
        })

        if(!user){
            throw new myError("Something went wrong while creating the user" , 500)
        }

        sendToken(res,user , 201, "User Created !!!")
    }
)

// Login user
const login = asyncHandler(async(req , res) => {
    const {email , password} = req.body
  
    const userToValidate = await User.findOne({email}).select("+password")
    if(!userToValidate){
      throw new myError("User not found" , 404)
    }
  
    const isValid = await bcrypt.compare(password , userToValidate.password)
  
    if(!isValid){
      throw new myError("Incorrect Password" , 501)
    }
  
    sendToken(res,userToValidate , 201, `Welcome Back ${userToValidate.username}`)
  
  })
// Logout user
const logout = async (req, res) => {
  return res.status(200).cookie("token", "").json({
    success : true , 
    message : "Logout Success!!!"
  })
};

export {login , logout , register}

