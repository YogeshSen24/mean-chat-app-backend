import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { api_key, api_secret, cloud_name } from "../const/index.js";
import { log } from "console";

// Configure Cloudinary with API credentials
cloudinary.config({
  cloud_name: cloud_name,
  api_key: api_key,
  api_secret: api_secret,
});

// Middleware function to upload file(s) to Cloudinary
const uploadToCloudinary = async (req, res, next) => {
  let files = []
  try {
    // Check if file(s) were uploaded
    if(req.files){
      files = req.files
    }else{
      files = Array(req.file)
    }
    console.log(files);
    if (files[0]===undefined || files.length === 0) {
      return next();
    }
    // Array to store uploaded file URLs
    let fileUrls = [];
    
    // Loop through each file
    for (const file of files) {
      // Upload file to Cloudinary
      const result = await cloudinary.uploader.upload(file.path , {
          resource_type : "auto"
      });

      // Add Cloudinary URL to the array
      fileUrls.push(result.url);

      // Remove file from server after upload
      fs.unlinkSync(file.path);
    }

    // Attach array of Cloudinary URLs to request object
    req.fileUrls = fileUrls;

    next();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to upload file(s) to Cloudinary" });
  }
};

export default uploadToCloudinary;
