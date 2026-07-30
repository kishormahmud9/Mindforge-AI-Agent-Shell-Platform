
import { createUserService, UserService } from "./user.service.js";
import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import DevBuildError from "../../lib/DevBuildError.js";
import prisma from "../../prisma/client.js";
import catchAsync from "../../utils/catchAsync.js";

const registerUser = catchAsync(async (req, res) => {
  const picture = req.file ? {
    url: `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`,
    path: `uploads/avatars/${req.file.filename}`
  } : null;
  const payload = {
    prisma,
    ...req.body,
    picture,
  };

  const result = await createUserService(payload);

  sendResponse(res, {
    success: true,
    message: "User created successfully",
    statusCode: StatusCodes.CREATED,
    data: result,
  });
});

const getUserInfo = catchAsync(async (req, res) => {
  const userId = req.params.id || req.user.id;
  const user = await UserService.findUserInfoById(prisma, userId);

  if (!user) {
    throw new DevBuildError("User not found", 404);
  }

  res.json({
    success: true,
    data: user,
  });
});

// User details by ID
const userDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const user = await UserService.findByIdWithProfile(prisma, id);

  if (!user) {
    throw new DevBuildError("User not found", 404);
  }

  res.status(200).json({
    success: true,
    data: user,
  });
});

const getAllUsersWithProfile = catchAsync(async (req, res) => {
  const users = await UserService.findAllWithProfile(prisma);

  return res.json({
    success: true,
    data: users,
  });
});

const updateProfile = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;

  // Filter allowed fields
  const allowedUpdates = {};
  if (name) allowedUpdates.name = name;
  if (email) allowedUpdates.email = email;

  // Handle profile picture update if a new file is uploaded
  if (req.file) {
    const avatarUrlPath = `uploads/avatars/${req.file.filename}`;
    const avatarUrl = `${req.protocol}://${req.get('host')}/${avatarUrlPath}`;
    allowedUpdates.avatarUrl = avatarUrl;
    allowedUpdates.avatarUrlPath = avatarUrlPath;
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: allowedUpdates,
  });

  sendResponse(res, {
    success: true,
    message: "Profile updated successfully",
    statusCode: StatusCodes.OK,
    data: updatedUser,
  });
});

const updateUser = catchAsync(async (req, res) => {
  const { userId, ...data } = req.body;

  if (!userId) {
    throw new DevBuildError("userId is required", StatusCodes.BAD_REQUEST);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
  });

  sendResponse(res, {
    success: true,
    message: "User updated successfully",
    statusCode: StatusCodes.OK,
    data: updatedUser,
  });
});

const uploadAvatar = catchAsync(async (req, res) => {
  const { id } = req.user;

  if (!req.file) {
    throw new DevBuildError("No file uploaded", 400);
  }

  const avatarUrlPath = `uploads/avatars/${req.file.filename}`;
  const avatarUrl = `${req.protocol}://${req.get('host')}/${avatarUrlPath}`;
  const result = await UserService.updateAvatar(prisma, id, avatarUrl, avatarUrlPath);

  sendResponse(res, {
    success: true,
    message: "Avatar uploaded successfully",
    statusCode: StatusCodes.OK,
    data: result,
  });
});

export const UserController = { registerUser, userDetails, getAllUsersWithProfile, updateUser, getUserInfo, uploadAvatar, updateProfile };
