import asyncHandler from "../utils/asyncHandler.js";
import Chat from "../models/chat.model.js";
import myError from "../utils/customErrors.js";
import Response from "../utils/customResponses.js";
import User from  "../models/user.model.js";
import Request from "../models/request.model.js"


const sendFriendRequest = asyncHandler(async (req, res) => {
  const { receiver } = req.body;
  const requester = req.user._id;

  // Check if receiver exists
  const isValidReceiver = await User.findById(receiver);
  if (!isValidReceiver) {
    throw new myError("Invalid Receiver", 404);
  }

  // Check if requester and receiver are already friends
  const areAlreadyFriends = isValidReceiver.friends.includes(requester);
  if (areAlreadyFriends) {
    throw new myError("User is already connected!!!", 501);
  }

  // Check if a friend request already exists
  const existingFriendRequest = await Request.findOne({ requester, receiver });
  if (existingFriendRequest) {
    throw new myError("Friend request already sent!!!", 409);
  }

  // Create new friend request
  const friendRequest = new Request({
    requester,
    receiver,
    type: "friend"
  });

  // Save friend request
  await friendRequest.save();

  // Add friend request to receiver's friendRequests array
  isValidReceiver.friendRequests.push(friendRequest._id);
  await isValidReceiver.save();

  // Send success response
  Response(res, friendRequest, 201, "Friend request sent successfully");
});


  export {sendFriendRequest}