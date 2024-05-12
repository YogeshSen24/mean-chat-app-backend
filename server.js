import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import cors from "cors"

import { createServer } from "http";
import { Server } from "socket.io";


import authRoute from "./route/auth.route.js"
import userRoute from "./route/user.route.js"
import messageRoute from "./route/message.route.js"
import chatRoute from "./route/chat.route.js"
import requestRoute from "./route/request.route.js"
import { log } from "console";




const app = express();
const httpServer = createServer(app);
export const io = new Server(httpServer, {
  cors: {
    origin: ["https://owl-chat.netlify.app" , "http://localhost:5173"],
    methods: ["GET", "POST" , "PUT" , "DELETE"]
  },
});
dotenv.config();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(cookieParser())

const whitelist = ['https://owl-chat.netlify.app', 'http://localhost:5173'];

app.use(cors({
  origin: function(origin, callback) {
    // Check if the origin is allowed
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

//routers 

app.use("/api/v1/auth" ,  authRoute)
app.use("/api/v1/user" ,  userRoute)
app.use("/api/v1/message" , messageRoute)
app.use("/api/v1/chat" , chatRoute)
app.use("/api/v1/request" , requestRoute)

//starting server
const port = process.env.PORT || 8000;


//using map to store active user id and socket id
export let userSockets = new Map();

io.on('connection', (socket) => {
  console.log('a user connected: ' + socket.id);

  // Extract user ID from the query parameters sent by the client
  const userId = socket.handshake.query.userId;

  if (userId) {
    // Store the socket with the user ID
    userSockets.set(userId, socket);
    // Log the user ID and socket ID
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
    const activeUsers = Array.from(userSockets.keys());
    io.emit('active-users', activeUsers);
  } else {
    // If no user ID is provided, log an error
    console.log('User connected without providing a user ID');
  }

  socket.on("direct-message" , (message)=>{
    io.emit("direct-message" , message)
    console.log(message);
  })

  // When a user disconnects
  socket.on('disconnect', () => {
    // Find the user ID associated with the socket
    const userId = Array.from(userSockets.entries())
    .find(([key, value]) => value === socket)?.[0];

  if (userId) {
    // Remove the user socket entry from the Map
    userSockets.delete(userId);
    // Log the disconnection
    console.log(`User ${userId} disconnected`);

    // Broadcast updated active user IDs to all clients
    const activeUsers = Array.from(userSockets.keys());
    io.emit('active-users', activeUsers);
    } else {
      console.log('Unknown user disconnected');
    }
  });
});


httpServer.listen(port, () => {
  console.log('server running at ' + port);
});

//connecting database
connectDB()


