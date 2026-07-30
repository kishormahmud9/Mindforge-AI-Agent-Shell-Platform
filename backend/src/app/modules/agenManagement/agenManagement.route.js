import { Router } from "express";
import { Role } from "../../utils/role.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import validateRequest from "../../middleware/validateRequest.js";
import { AgenManagementController } from "./agenManagement.controller.js";
import { AgenManagementValidation } from "./agenManagement.validation.js";

const router = Router();

router.post(
    "/create",
    checkAuthMiddleware(Role.ADMIN, Role.SYSTEM_OWNER, Role.BUSINESS_OWNER),
    validateRequest(AgenManagementValidation.createAgentSchema),
    AgenManagementController.createAgent
);

router.get(
    "/all",
    checkAuthMiddleware(Role.ADMIN, Role.USER, Role.SYSTEM_OWNER, Role.BUSINESS_OWNER),
    AgenManagementController.getAgents
);

router.get(
    "/all/for-ai",
    AgenManagementController.getAgents
);

router.get(
    "/:id",
    checkAuthMiddleware(Role.ADMIN, Role.SYSTEM_OWNER, Role.BUSINESS_OWNER),
    AgenManagementController.getAgentById
);

router.patch(
    "/:id",
    checkAuthMiddleware(Role.ADMIN, Role.SYSTEM_OWNER, Role.BUSINESS_OWNER),
    validateRequest(AgenManagementValidation.updateAgentSchema),
    AgenManagementController.updateAgent
);

router.delete(
    "/:id",
    checkAuthMiddleware(Role.ADMIN, Role.SYSTEM_OWNER, Role.BUSINESS_OWNER),
    AgenManagementController.deleteAgent
);

export const AgenManagementRoutes = router;
