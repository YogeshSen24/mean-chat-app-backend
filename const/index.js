//config env file
import dotenv from "dotenv"
dotenv.config()


const cloud_name =  String(process.env.CLOUDINARY_CLOUD_NAME)
const api_key =  String(process.env.CLOUDINARY_API_KEY)
const api_secret =  String(process.env.CLOUDINARY_API_SECRET)

export {cloud_name , api_key , api_secret }