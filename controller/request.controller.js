import asyncHandler from "../utils/asyncHandler.js";
import Chat from "../models/chat.model.js";
import myError from "../utils/customErrors.js";
import Response from "../utils/customResponses.js";


const sendRequest = asyncHandler(async (req, res) => {
  

      throw new myError("Chat not found!!!", 404);

  
    // Send success response
    Response(res, newMessage, 201, "Message sent successfully");
  });

  export {sendRequest}