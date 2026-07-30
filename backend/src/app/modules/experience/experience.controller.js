import { StatusCodes } from "http-status-codes";
import { sendResponse } from "../../utils/sendResponse.js";
import catchAsync from "../../utils/catchAsync.js";
import prisma from "../../prisma/client.js";
import { ExperienceService } from "./experience.service.js";

const createExperience = catchAsync(async (req, res) => {
  const result = await ExperienceService.createExperience(prisma, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: "Experience created successfully",
    data: result,
  });
});

const getAllExperiences = catchAsync(async (req, res) => {
  const result = await ExperienceService.getAllExperiences(prisma, req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Experiences retrieved successfully",
    data: result,
  });
});

const getExperienceById = catchAsync(async (req, res) => {
  const result = await ExperienceService.getExperienceById(prisma, req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Experience retrieved successfully",
    data: result,
  });
});

const updateExperience = catchAsync(async (req, res) => {
  const result = await ExperienceService.updateExperience(prisma, req.params.id, req.body);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Experience updated successfully",
    data: result,
  });
});

const deleteExperience = catchAsync(async (req, res) => {
  await ExperienceService.deleteExperience(prisma, req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "Experience deleted successfully",
    data: null,
  });
});

const getExperiencesByUserId = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const result = await ExperienceService.getAllExperiences(prisma, { 
    ...req.query, 
    userId 
  });
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: "User experiences retrieved successfully",
    data: result,
  });
});

export const ExperienceController = {
  createExperience,
  getAllExperiences,
  getExperiencesByUserId,
  getExperienceById,
  updateExperience,
  deleteExperience,
};
