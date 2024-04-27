
import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { acceptFriendRequest, rejectFriendRequest, sendFriendRequest } from '../controller/request.controller.js';
const router = express.Router();

router.post("/send" ,authenticateUser,sendFriendRequest )
router.post("/accept" ,authenticateUser,acceptFriendRequest )
router.post("/reject" ,authenticateUser,rejectFriendRequest )

export default router