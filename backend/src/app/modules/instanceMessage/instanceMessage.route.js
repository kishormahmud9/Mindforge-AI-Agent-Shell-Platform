import { Router } from "express";
import { Role } from "../../utils/role.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import validateRequest from "../../middleware/validateRequest.js";
import { InstanceMessageController } from "./instanceMessage.controller.js";
import { InstanceMessageValidation } from "./instanceMessage.validation.js";

const router = Router();

// Instance Routes
router.post(
  "/create",
  checkAuthMiddleware(Role.ADMIN, Role.USER, Role.SYSTEM_OWNER, Role.BUSINESS_OWNER),
  validateRequest(InstanceMessageValidation.createInstanceSchema),
  InstanceMessageController.createInstance
);

router.get(
  "/all-instances",
  checkAuthMiddleware(Role.ADMIN, Role.USER, Role.SYSTEM_OWNER, Role.BUSINESS_OWNER),
  InstanceMessageController.getInstances
);

router.patch(
  "/:id",
  checkAuthMiddleware(Role.ADMIN, Role.USER, Role.SYSTEM_OWNER, Role.BUSINESS_OWNER),
  validateRequest(InstanceMessageValidation.updateInstanceSchema),
  InstanceMessageController.updateInstance
);

router.delete(
  "/:id",
  checkAuthMiddleware(Role.ADMIN, Role.USER, Role.SYSTEM_OWNER, Role.BUSINESS_OWNER),
  InstanceMessageController.deleteInstance
);

export const InstanceMessageRoutes = router;
