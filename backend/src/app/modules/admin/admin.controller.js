import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import prisma from "../../prisma/client.js";
import { AdminService } from "./admin.service.js";
import catchAsync from "../../utils/catchAsync.js";

const getAllUsers = catchAsync(async (req, res) => {
  const result = await AdminService.getAllUsers(prisma);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Users retrieved successfully",
    data: result,
  });
});

const getUserInstances = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await AdminService.getUserInstances(prisma, id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User instances retrieved successfully",
    data: result,
  });
});

export const AdminController = {
  getAllUsers,
  getUserInstances,
};
