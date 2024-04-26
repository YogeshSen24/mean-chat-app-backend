import jwt from "jsonwebtoken";


//cookie options
const cookieOptions = {
  maxAge: 15 * 24 * 60 * 60 * 1000,
  httpOnly : true ,
  sameSite : "none" ,
  secure : true 
};

//send auth token
const sendToken = (res, user, code, message) => {
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
  return res.status(code).cookie("token", token , cookieOptions).json({
    success : true,
    message,
  })
};

const emmitEvent = (req , event , users , data)=>{
  console.log("Emmit event");
}

export {sendToken , emmitEvent};
