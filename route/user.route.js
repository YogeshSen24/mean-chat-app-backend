
import express from 'express';
import { getUser, resetPassword , getSelf , updateUser, getAllFriendRequests } from '../controller/user.controller.js';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import multerUpload from '../middlewares/multer.middleware.js';
import uploadToCloudinary from '../middlewares/cloudinary.middleware.js';

const router = express.Router();

router.get("/:userId",  getUser)
router.get("/", authenticateUser , getSelf)
router.get("/requests/get", authenticateUser , getAllFriendRequests)
router.put("/resetPassword", authenticateUser , resetPassword)
router.put("/update", authenticateUser ,multerUpload.single("avatar") , uploadToCloudinary, updateUser)

export default router