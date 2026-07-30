import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import prisma from "../../prisma/client.js";
import { InstanceMessageService } from "./instanceMessage.service.js";
import catchAsync from "../../utils/catchAsync.js";

const getOwner = (req) => {
  return {
    id: req.user.id,
    role: req.user.role,
  };
};

const createInstance = catchAsync(async (req, res) => {
  const owner = getOwner(req);
  const result = await InstanceMessageService.createInstance(
    prisma,
    owner,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Instance created successfully",
    data: result,
  });
});

const getInstances = catchAsync(async (req, res) => {
  const owner = getOwner(req);
  const { agentId } = req.query;
  console.log(`🔍 Fetching instances for User ID: ${owner.id}, Agent: ${agentId}`);
  const result = await InstanceMessageService.getInstances(prisma, owner, agentId);
  console.log(`✅ Found ${result.length} instances`);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Instances retrieved successfully",
    data: result,
    debug: {
      ownerId: owner.id,
      ownerType: req.user.userType,
    }
  });
});

const updateInstance = catchAsync(async (req, res) => {
  const owner = getOwner(req);
  const { id } = req.params;
  const result = await InstanceMessageService.updateInstance(prisma, owner, id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Instance updated successfully",
    data: result,
  });
});

const deleteInstance = catchAsync(async (req, res) => {
  const owner = getOwner(req);
  const { id } = req.params;
  const result = await InstanceMessageService.deleteInstance(prisma, owner, id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Instance deleted successfully",
    data: result,
  });
});

export const InstanceMessageController = {
  createInstance,
  getInstances,
  updateInstance,
  deleteInstance,
};
