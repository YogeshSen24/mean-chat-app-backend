
import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { deleteMessage, sendMessage, updateMessage } from '../controller/message.controller.js';
import multerUpload from '../middlewares/multer.middleware.js';
import uploadToCloudinary from '../middlewares/cloudinary.middleware.js';
const router = express.Router();

router.post('/send/:chatId' , authenticateUser , multerUpload.array("attachments") , uploadToCloudinary, sendMessage);
router.put("/update/:messageId" , authenticateUser , updateMessage )
router.delete("/delete/:messageId" , authenticateUser , deleteMessage)

export default router