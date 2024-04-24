import asyncHandler from "express-async-handler"
import mongoose from "mongoose"

const connectDB =asyncHandler(async()=>{
    const db = await mongoose.connect(process.env.MONGODB_URI)
    if (db){
        console.log(`Database Connected!!!`);
    }
}) 

export default connectDB