import { Router } from "express";
import { Role } from "../../utils/role.js";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware.js";
import validateRequest from "../../middleware/validateRequest.js";
import { MessageController } from "./messages.controller.js";
import { MessageValidation } from "./messages.validation.js";
import { upload } from "../../utils/fileUpload.js";

const router = Router();

router.get(
  "/all-messages",
  checkAuthMiddleware(Role.ADMIN, Role.USER, Role.SYSTEM_OWNER, Role.BUSINESS_OWNER),
  MessageController.getAllMessages
);

router.get(
  "/my-instances",
  checkAuthMiddleware(Role.ADMIN, Role.USER, Role.SYSTEM_OWNER, Role.BUSINESS_OWNER),
  MessageController.getInstances
);

router.get(
  "/:instance_id?",
  checkAuthMiddleware(Role.ADMIN, Role.USER, Role.SYSTEM_OWNER, Role.BUSINESS_OWNER),
  validateRequest(MessageValidation.getMessagesSchema),
  MessageController.getMessages
);

router.post(
  "/create",
  checkAuthMiddleware(Role.ADMIN, Role.USER, Role.SYSTEM_OWNER, Role.BUSINESS_OWNER),
  upload.fields([
    { name: "documents", maxCount: 10 },
    { name: "voice", maxCount: 10 },
  ]),
  validateRequest(MessageValidation.createMessageSchema),
  MessageController.createMessage
);

export const MessageRoutes = router;
