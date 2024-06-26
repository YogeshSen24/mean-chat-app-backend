import User from "../models/user.model.js";
import Chat from "../models/chat.model.js";
import asyncHandler from "../utils/asyncHandler.js";
import myError from "../utils/customErrors.js";
import Response from "../utils/customResponses.js";
import bcrypt from "bcryptjs";

const getSelf = asyncHandler(async (req, res) => {
  const { _id } = req.user;

  const user = await User.findById({ _id });
  if (!user) throw new myError("User not found", 404);

  Response(res, user, 200, "User data fetched successfully");
});
const getUser = asyncHandler(async (req, res) => {
  const id = req.params.userId;
  const user = await User.findById(id).select("-password");
  if (!user) throw new myError("User not found", 404);

  Response(res, user, 200, "User data fetched successfully");
});
const resetPassword = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { oldPassword, newPassword } = req.body;
  let user = await User.findById(_id);
  if (!user) throw new myError("User not found", 404);
  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) throw new myError("Invalid password", 400);
  user.password = newPassword;
  const isSaved = await user.save();
  if (!isSaved)
    throw new myError(
      "SOmething went wrong while saving the new password",
      500
    );

  Response(res, user, 200, "Password changed successfully");
});
const updateUser = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { username, status, bio } = req.body;
  let user = await User.findById(_id);
  const profileImage = req.fileUrls ? req.fileUrls[0] : user.profileImage;
  if (!user) throw new myError("User not found", 404);

  user.username = username || user.username;
  user.profileImage = profileImage || user.profileImage;
  user.bio = bio || user.bio;
  user.status = status || user.status;

  const updatedUser = await user.save();
  if (!updatedUser) {
    throw new myError(
      "Something went wrong while saving the new password",
      500
    );
  }

  Response(res, user, 200, "Data updated successfully");
});

const getAllFriendRequests = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const me = await User.findById(_id)
    .select("friendRequests")
    .populate({
      path: "friendRequests",
      select: "_id type",
      populate: {
        path: "requester",
        select: "_id username email profileImage",
        populate: {
          path: "friends",
          select: "_id profileImage",
        },
      },
    });

  if (!me) throw new myError("User not found", 404);
  if (me.friendRequests.length === 0)
    throw new myError("No friend requests found", 404);

  Response(res, me, 200, "Friend requests fetched successfully");
});

const getAllFriends = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const user = await User.findById(_id).select("friends")
  .populate({
      path: 'friends',
      select : 'particepants',
      populate: {
          path: 'particepants',
              select : 'username _id email profileImage'
       

      }
  });  if (!user) throw new myError("No friends found", 404);
  Response(res, user, 200, "Friends fetched successfully");
});

const removeFriend = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { friendId } = req.params;

  // Find the chat between the current user and the friend
  const chat = await Chat.findOneAndDelete({
    particepants: { $all: [_id, friendId] } // Find chat with both users
  });

  if (!chat) {
    throw new myError("Chat not found", 404);
  }

  // Remove the chat ID from the user's and friend's friends array
  await User.findByIdAndUpdate(_id, {
    $pull: { friends: chat._id }
  });

  await User.findByIdAndUpdate(friendId, {
    $pull: { friends: chat._id }
  });
  // Send response
  Response(res, chat, 200, "Friend removed successfully");
});

const searchUser = asyncHandler(async (req, res) => {
  const { data } = req.params;
  const {_id : currentUserId} = req.user

  // Find users matching the username
  const matchedUsers = await User.find({
    $and: [ // Add an additional condition to exclude the current user
        { _id: { $ne: currentUserId } }, // Exclude documents with the current user's ID
        {
          $or: [
            { username: { $regex: `${data}.*`, $options: "i" } },
            { email: { $regex: `${data}.*`, $options: "i" } },
          ],
        }
      ]
  })
    .select("_id username email profileImage bio")
    .populate({
      path: 'friends',
      select : 'particepants',
      populate: {
          path: 'particepants',
              select : '_id profileImage'
      }
  }); // Select fields you want to send in the response

  // Send the response
  Response(res, matchedUsers, 200, "Users found successfully");
});

export {
  getUser,
  getSelf,
  resetPassword,
  updateUser,
  getAllFriendRequests,
  getAllFriends,
  searchUser,
  removeFriend
};
