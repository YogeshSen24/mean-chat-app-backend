import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import multerUpload from '../middlewares/multer.middleware.js';
import uploadToCloudinary from '../middlewares/cloudinary.middleware.js';
import { addMembers, createChat, getFullChatInfo ,  createGroup, deleteChat, deleteGroup, findChat, getConversation, removeMembers, transferGroupOwnership, updateGroup } from '../controller/chat.controller.js';
const router = express.Router();

router.post("/create/group" , authenticateUser , createGroup )
router.get("/create/:userId" , authenticateUser , createChat )
router.get("/find/:userId" , authenticateUser , findChat )
router.get("/conversation/get/:userId" , authenticateUser , getConversation )
router.get("/get/:chatId" , authenticateUser , getFullChatInfo )
router.put("/update/:id" , authenticateUser , multerUpload.single("groupIcon") , uploadToCloudinary , updateGroup )
router.put("/transfer" , authenticateUser , transferGroupOwnership)
router.put("/addMembers/:id" , authenticateUser , addMembers)
router.put("/removeMembers/:id" , authenticateUser , removeMembers)
router.delete("/delete/user/:chatId" , authenticateUser , deleteChat)
router.delete("/delete/group/:chatId" , authenticateUser , deleteGroup)

export default router