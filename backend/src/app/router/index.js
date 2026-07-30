import { Router } from "express";
import { UserRoutes } from "../modules/user/user.route.js";
import { AuthRouter } from "../modules/auth/auth.route.js";
import { OtpRouter } from "../modules/otp/otp.route.js";




import { AgenManagementRoutes } from "../modules/agenManagement/agenManagement.route.js";
import { InstanceMessageRoutes } from "../modules/instanceMessage/instanceMessage.route.js";
import { MessageRoutes } from "../modules/messages/messages.route.js";
import { AdminRoutes } from "../modules/admin/admin.route.js";
import { ExperienceRoutes } from "../modules/experience/experience.route.js";

export const router = Router();
const moduleRoutes = [
  {
    path: "/user",
    route: UserRoutes,
  },
  {
    path: "/auth",
    route: AuthRouter,
  },
  {
    path: "/otp",
    route: OtpRouter,
  },
  // user auth ends here
  {
    path: "/agen-management",
    route: AgenManagementRoutes,
  },
  // agent management ends here
  {
    path: "/instances",
    route: InstanceMessageRoutes,
  },
  {
    path: "/messages",
    route: MessageRoutes,
  },
  // instance message ends here
  {
    path: "/admin",
    route: AdminRoutes,
  },
  {
    path: "/experience",
    route: ExperienceRoutes,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});