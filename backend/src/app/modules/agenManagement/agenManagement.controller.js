import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import prisma from "../../prisma/client.js";
import { AgenManagementService } from "./agenManagement.service.js";
import catchAsync from "../../utils/catchAsync.js";

const createAgent = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await AgenManagementService.createAgent(prisma, userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Agent created successfully",
    data: result,
  });
});

const getAgents = catchAsync(async (req, res) => {
  const result = await AgenManagementService.getAgents(prisma);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Agents retrieved successfully",
    data: result,
  });
});

const getAgentById = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await AgenManagementService.getAgentById(prisma, userId, id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Agent retrieved successfully",
    data: result,
  });
});

const updateAgent = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await AgenManagementService.updateAgent(prisma, userId, id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Agent updated successfully",
    data: result,
  });
});

const deleteAgent = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await AgenManagementService.deleteAgent(prisma, userId, id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Agent deleted successfully",
    data: result,
  });
});

export const AgenManagementController = {
  createAgent,
  getAgents,
  getAgentById,
  updateAgent,
  deleteAgent,
};
