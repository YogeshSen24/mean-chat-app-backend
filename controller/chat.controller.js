import asyncHandler from "../utils/asyncHandler.js";
import myError from "../utils/customErrors.js";
import Chat from "../models/chat.model.js";
import Response from "../utils/customResponses.js";
import User from "../models/user.model.js";

const createChat = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  if (!userId) {
    throw new myError("Please provide user to connect!!!", 501);
  }

  const user1 = await User.findById(req.user._id);
  const user2 = await User.findById(userId);
  if (!user2) {
    throw new myError("User to connect not found!!!", 501);
  }

  if (user1.friends.includes(user2._id)) {
    throw new myError("User is already connected!!!", 501);
  }

  const particepants = [user1._id, user2._id];

  const chat = await Chat.create({
    particepants,
    type: "individual",
  });

  if (!chat) {
    throw new myError("Something went wrong while creating the chat", 501);
  }
  chat.save();

  user1.friends.push(user2._id);
  user1.save();
  user2.friends.push(user1._id);
  user2.save();
  Response(res, chat, 201, "Chat Created Successfully!!!");
});
const findChat = asyncHandler(async (req, res) => {
  const currentUser = req.user._id;
  const { userId } = req.params;
  if (!userId) {
    throw new myError("Please provide user to connect!!!", 501);
  }

  const chat = await Chat.findOne({
    particepants: { $all: [currentUser, userId] },
    type: "individual",
  });

  if (!chat) {
    throw new myError(
      "No connection found , please add the user in your friendlist to send message!!!",
      501
    );
  }
  Response(res, chat, 201, "Success!!!");
});
const createGroup = asyncHandler(async (req, res) => {
  let { particepants, groupName } = req.body;
  const owner = req.user._id;
  if (!groupName) {
    throw new myError("Group name is required!!!", 501);
  }
  if (!particepants || particepants.length < 2) {
    throw new myError("Minimum 3 members are required!!!", 501);
  }

  particepants = [...particepants, owner];

  const group = await Chat.create({
    groupName,
    owner,
    particepants,
    type: "group",
  });

  if (!group) {
    throw new myError("Something went wrong while creating the group", 501);
  }
  group.save();

  particepants.map((participant) => {
    const user = User.findById(participant);
    if (!user) {
      throw new myError("User not found!!!", 404);
    }
    if (participant.toString() !== owner.toString()) {
      user.inGroups.push(group._id);
      user.save();
    }
    user.createdGroups.push(group._id);
    user.save();
  });
  Response(res, group, 201, "Group Creaed Successfully!!!");
});
const updateGroup = asyncHandler(async (req, res) => {
  const { groupName } = req.body;
  const owner = req.user._id;
  let group = await Chat.findById(req.params.id);
  const groupIcon = req.fileUrls || group.groupIcon;
  if (!group) {
    throw new myError("Group not found!!!", 404);
  }
  if (group.owner.toString() !== owner.toString()) {
    throw new myError("Only owner can change the group info!!!", 401);
  }
  group.groupName = groupName || group.groupName;
  group.groupIcon = groupIcon || group.groupIcon;

  group.save();
  Response(res, group, 201, "Group Updated Successfully!!!");
});
const transferGroupOwnership = asyncHandler(async (req, res) => {
  const { newOwner } = req.body;
  const owner = req.user._id;
  let group = await Chat.findById(req.params.id);
  if (!group) {
    throw new myError("Group not found!!!", 404);
  }
  if (group.owner.toString() !== owner.toString()) {
    throw new myError("You ar not the owner!!!", 401);
  }
  group.owner = newOwner;

  group.save();

  //remove the group from previous owner and add to new owner
  const previousOwner = await User.findById(owner);
  const indexofPreviousOwner = previousOwner.createdGroups.indexOf(group._id);
  previousOwner.createdGroups.splice(indexofPreviousOwner, 1);
  previousOwner.inGroups.push(group._id);
  previousOwner.save();

  const newOwnerUser = await User.findById(newOwner);
  newOwnerUser.createdGroups.push(group._id);
  const indexofCurrentOwner = newOwnerUser.inGroups.indexOf(group._id);
  newOwnerUser.inGroups.splice(indexofCurrentOwner, 1);
  newOwnerUser.save();

  Response(res, group, 201, "Group ownership transfered Successfully!!!");
});
const addMembers = asyncHandler(async (req, res) => {
  const membersToAdd = req.body.members;
  const group = await Chat.findById(req.params.id);
  if (!group) {
    throw new myError("Group not found!!!", 404);
  }
  const owner = req.user._id;
  if (owner.toString() !== group.owner.toString()) {
    throw new myError("Only owner can add the members", 401);
  }
  group.particepants.push(...membersToAdd);
  group.save();
  membersToAdd.map((member) => {
    const user = User.findById(member);
    user.inGroups.push(group._id);
    user.save();
  });
  Response(res, group, 201, "Members added Successfully!!!");
});
const removeMembers = asyncHandler(async (req, res) => {
  const membersToRemove = req.body.members;
  const group = await Chat.findById(req.params.id);
  if (!group) {
    throw new myError("Group not found!!!", 404);
  }
  const owner = req.user._id;
  if (owner.toString() !== group.owner.toString()) {
    throw new myError("Only owner can remove the members", 401);
  }
  const newMembers = group.particepants.filter((member) => {
    return !membersToRemove.includes(member.toString());
  });
  group.particepants = newMembers;
  group.save();
  membersToRemove.map((member) => {
    const user = User.findById(member);
    const indexofCurrentMember = user.inGroups.indexOf(group._id);
    user.inGroups.splice(indexofCurrentMember, 1);
    user.save();
  });
  Response(res, group, 201, "Members removed Successfully!!!");
});
const deleteChat = asyncHandler(async (req, res) => {
  const { _id } = req.user;
  const { chatId } = req.params;
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new myError("Chat not found!!!", 404);
  }
  // Check if the current user is authorized to delete the chat
  if (!chat.particepants.includes(_id))
    throw new myError("You are not authorized to delete this chat", 401);
  chat.particepants.map(async (participant) => {
    const user = await User.findById(participant);
    const indexofCurrentChat = user.chats.indexOf(chat._id);
    user.chats.splice(indexofCurrentChat, 1);
    user.save();
  });

  const removechat = await Chat.findOneAndDelete({ _id: chatId });
  Response(res, removechat, 200, "Chat deleted successfully!!!");
});

const deleteGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { _id } = req.user;
  const group = await Chat.findById(groupId);
  if (!group) {
    throw new myError("Group not found!!!", 404);
  }
  // Check if the current user is authorized to delete the group
  if (group.owner.toString() !== _id.toString())
    throw new myError("You are not authorized to delete this group", 401);

  await User.updateMany(
    { _id: { $in: group.particepants } }, // Find users who are participants in the group
    { $pull: { createdGroups: group._id, inGroups: group._id } } // Remove references to the group
  );

  await group.remove(); // Remove the group from the database
  Response(res, null, 200, "Group deleted successfully!!!");
});

export {
  createChat,
  findChat,
  createGroup,
  updateGroup,
  transferGroupOwnership,
  addMembers,
  removeMembers,
  deleteChat,
  deleteGroup,
};
