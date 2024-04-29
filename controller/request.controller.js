import asyncHandler from "../utils/asyncHandler.js";
import Chat from "../models/chat.model.js";
import myError from "../utils/customErrors.js";
import Response from "../utils/customResponses.js";
import User from "../models/user.model.js";
import Request from "../models/request.model.js";

const sendFriendRequest = asyncHandler(async (req, res) => {
  const { receiver } = req.body;
  const requester = req.user._id;

  // Check if receiver exists
  const isValidReceiver = await User.findById(receiver);
  if (!isValidReceiver) {
    throw new myError("Invalid Receiver", 404);
  }
  if (receiver.toString() === requester.toString()) {
    throw new myError("You cant send request to yourself", 501);
  }

  // Check if requester and receiver are already friends
  const areAlreadyFriends = isValidReceiver.friends.includes(requester);
  if (areAlreadyFriends) {
    throw new myError("User is already connected!!!", 501);
  }

  if (isValidReceiver.status === "public") {
    // Create a chat between the requester and the receiver
    const newChat = new Chat({
      particepants: [requester, receiver],
      messages: [], // You can initialize the messages array here if needed
    });

    // Save the new chat
    await newChat.save();

    // Add the new chat to the friends array of both users
    await User.findByIdAndUpdate(
      requester,
      { $addToSet: { friends: newChat._id } },
      { new: true }
    );

    await User.findByIdAndUpdate(
      receiver,
      { $addToSet: { friends: newChat._id } },
      { new: true }
    );
    Response(res, newChat, 201, "Friend added successfully");
  } else {
    // Check if a friend request already exists
    const existingFriendRequest = await Request.findOne({
      requester,
      receiver,
    });
    if (existingFriendRequest) {
      throw new myError("Friend request already sent!!!", 409);
    }

    // Create new friend request
    const friendRequest = new Request({
      requester,
      receiver,
      type: "friend",
    });

    // Save friend request
    await friendRequest.save();

    // Add friend request to receiver's friendRequests array
    isValidReceiver.friendRequests.push(friendRequest._id);
    await isValidReceiver.save();

    // Send success response
    Response(res, friendRequest, 201, "Friend request sent successfully");
  }
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
  // Get the current user's ID from req.user._id
  const currentUserID = req.user._id;

  // Get the friend request ID from req.body
  const { requestId } = req.body;
  // Find the friend request by ID
  const friendRequest = await Request.findById(requestId);

  // If the friend request doesn't exist, throw an error
  if (!friendRequest) {
    throw new myError("Friend request not found", 404);
  }
  if (friendRequest.receiver.toString() !== currentUserID.toString()) {
    throw new myError("You cant accept the request", 501);
  }

  // Create a chat between the requester and the receiver
  const newChat = new Chat({
    particepants: [friendRequest.requester, currentUserID],
    messages: [], // You can initialize the messages array here if needed
  });

  // Save the new chat
  await newChat.save();

  // Add the new chat to the friends array of both users
  await User.findByIdAndUpdate(
    currentUserID,
    { $addToSet: { friends: newChat._id } },
    { new: true }
  );

  await User.findByIdAndUpdate(
    friendRequest.requester,
    { $addToSet: { friends: newChat._id } },
    { new: true }
  );

  // Remove the friend request from the receiver's friendRequests array
  await User.findByIdAndUpdate(currentUserID, {
    $pull: { friendRequests: friendRequest._id },
  });

  // Delete the friend request
  await Request.findByIdAndDelete(friendRequest._id);

  // Send success response
  Response(res, newChat, 200, "Friend request accepted successfully");
});

const rejectFriendRequest = asyncHandler(async (req, res) => {
  // Get the current user's ID from req.user._id
  const currentUserID = req.user._id;

  // Get the friend request ID from req.body
  const { requestId } = req.body;

  // Find the friend request
  const friendRequest = await Request.findById(requestId);
  if (friendRequest.receiver.toString() !== currentUserID.toString()) {
    throw new myError("You cant reject the request", 501);
  }

  // Remove the friend request from the receiver's friendRequests array
  await User.findByIdAndUpdate(currentUserID, {
    $pull: { friendRequests: requestId },
  });

  // Delete the friend request
  await Request.findByIdAndDelete(requestId);

  // Send success response
  Response(res, null, 200, "Friend request rejected successfully");
});

export { sendFriendRequest, acceptFriendRequest, rejectFriendRequest };
