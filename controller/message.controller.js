import asyncHandler from "../utils/asyncHandler.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import myError from "../utils/customErrors.js";
import Response from "../utils/customResponses.js";
import mongoose from "mongoose";
import { io } from "../server.js";
import {userSockets} from "../server.js"

const sendMessage = asyncHandler(async (req, res) => {
  const chatId = req.params.chatId;
  const { content } = req.body;
  const sender = req.user._id;
  const attachments = req.fileUrls || [];

  // Check if chatId is valid
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new myError("Invalid Chat Id", 500);
  }

  // Find the chat
  const chat = await Chat.findById(chatId);

  // Check if chat exists
  if (!chat) {
    throw new myError("Chat not found!!!", 404);
  }

  if(!content && attachments.length===0) {
    throw new myError("Message can't be empty", 400);
  }

  // Check if the sender is a participant in the chat
  if (!chat.particepants.includes(sender)) {
    throw new myError("You are not a participant in this chat", 403);
  }

  // Create the message
  const newMessage = await Message.create({
    sender,
    content : content || "",
    attachments,
  });

  // Add the message to the chat
  chat.messages.push(newMessage);
  await chat.save();

  await chat.populate({
    path : "sender",
    select : "username profileImage ",
    options: { strictPopulate: false } 
  })

  //find the receiver socket and emmit the message to the receiver socket
  const receiver = chat.particepants.find((p) => p._id.toString() !== sender.toString());
  const receiverId = receiver._id.toString(); // Extract receiver's ID
  console.log(receiverId);
  const receiverSocket = userSockets.get(receiverId);
  if (receiverSocket) {
    io.to(receiverSocket).emit("direct-message", newMessage);
    console.log(`message sent to ${receiverSocket} : ${receiverId} `);
  }


  // Send success response
  Response(res, newMessage, 201, "Message sent successfully");
  
  
});
const updateMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;
  const { content } = req.body;
  const attachmentsToDelete = req.body.attachments;
  const sender = req.user._id;

  // Check if messageId is valid
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new myError("Invalid Message Id", 500);
  }

  // Find the message
  const message = await Message.findById(messageId);

  // Check if message exists
  if (!message) {
    throw new myError("Message not found!!!", 404);
  }
  if (message.sender !== sender) {
    throw new myError("Only sender can update the message", 501);
  }
  // Update the message
  message.content = content || message.content;
  message.attachments = message.attachments.filter(
    (attachment) => !attachmentsToDelete.includes(attachment)
  );
  await message.save();

  // Send success response
  Response(res, message, 200, "Message updated successfully");
});

const deleteMessage = asyncHandler(async (req, res) => {
  const messageId = req.params.messageId;
  const sender = req.user._id;

  // Check if messageId is valid
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new myError("Invalid Message Id", 500);
  }
  // Find the message
  const message = await Message.findById(messageId);
  if (message.sender.toString() !== sender.toString()) {
    throw new myError("Only sender can delete the attachments", 501);
  }

  // Find the message and delete it
  const deletedMessage = await Message.findByIdAndDelete(messageId);

  // Check if message exists
  if (!deletedMessage) {
    throw new myError("Message not found!!!", 404);
  }

  // Send success response
  Response(res, deletedMessage, 200, "Message deleted successfully");
});

export { sendMessage, updateMessage , deleteMessage };
