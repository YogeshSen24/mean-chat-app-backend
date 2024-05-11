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




const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "https://owl-chat.netlify.app",
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
io.on('connection', (socket) => {
  console.log('a user connected'+ socket.id);




  socket.on('dissconnect' , ()=>{
    console.log('user disconnected');
  })
});

httpServer.listen(port, () => {
  console.log('server running at ' + port);
});

//connecting database
connectDB()


