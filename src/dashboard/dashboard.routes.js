import {Router} from "express";
import {getReport} from "./dashboard.controller.js";
import {adminUserGuard} from "../middlewares/authGuard.middleware.js";

const DashboardRouter = Router();

DashboardRouter.get("/report", adminUserGuard, getReport);

export default DashboardRouter;