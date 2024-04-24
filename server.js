import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/connectDB.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";


import authRoute from "./route/auth.route.js"
import userRoute from "./route/user.route.js"
import messageRoute from "./route/message.route.js"
import chatRoute from "./route/chat.route.js"


const app = express();
dotenv.config();
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())
app.use(cookieParser())

//routers 

app.use("/api/v1/auth" ,  authRoute)
app.use("/api/v1/user" ,  userRoute)
app.use("/api/v1/message" , messageRoute)
app.use("/api/v1/chat" , chatRoute)

//starting server
const port = process.env.PORT || 8000;
app.listen(port, () => {
  console.log(`Server is running on the port : ${port}`);
});

//connecting database
connectDB()

//mongodb+srv://yose0026:Yose24@cluster0.nydoxki.mongodb.net/
