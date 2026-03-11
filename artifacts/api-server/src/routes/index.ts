import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import saiRolotechRouter from "./sai-rolotech.js";
import assistantRouter from "./assistant.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(saiRolotechRouter);
router.use(assistantRouter);

export default router;
