
import express from 'express';
import { authenticateUser } from '../middlewares/auth.middleware.js';
import { sendFriendRequest } from '../controller/request.controller.js';
const router = express.Router();

router.post("/send" ,authenticateUser,sendFriendRequest )

export default router