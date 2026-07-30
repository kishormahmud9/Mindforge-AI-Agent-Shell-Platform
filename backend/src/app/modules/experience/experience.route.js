import express from "express";
import { ExperienceController } from "./experience.controller.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import {Role} from "../../utils/role.js"

const router = express.Router();



router.post("/", checkAuthMiddleware(...Object.values(Role)), ExperienceController.createExperience);
router.get("/", checkAuthMiddleware(...Object.values(Role)), ExperienceController.getAllExperiences);
router.get("/user/:userId", checkAuthMiddleware(...Object.values(Role)), ExperienceController.getExperiencesByUserId);
router.get("/user/for-ai/:userId",  ExperienceController.getExperiencesByUserId);
router.get("/:id", checkAuthMiddleware(...Object.values(Role)), ExperienceController.getExperienceById);
router.patch("/:id", checkAuthMiddleware(...Object.values(Role)), ExperienceController.updateExperience);
router.delete("/:id", checkAuthMiddleware(...Object.values(Role)), ExperienceController.deleteExperience);

export const ExperienceRoutes = router;
