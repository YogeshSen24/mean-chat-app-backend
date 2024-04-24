// authRoutes.js

import express from 'express';
const router = express.Router();

// Import auth controller functions
import {login , logout , register} from "../controller/auth.controller.js"
import multerUpload from '../middlewares/multer.middleware.js';
import uploadToCloudinary from '../middlewares/cloudinary.middleware.js';


// Authentication routes
router.post('/login', login);
router.post('/logout', logout);
router.post('/register', multerUpload.single("avatar") , uploadToCloudinary,  register);

export default router;
