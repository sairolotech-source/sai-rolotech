import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import saiRolotechRouter from "./sai-rolotech.js";
import assistantRouter from "./assistant.js";
import geminiRouter from "./gemini/index.js";
import videoStreamRouter from "../lib/video-stream.js";
import securityRouter from "./security.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(saiRolotechRouter);
router.use(assistantRouter);
router.use(geminiRouter);
router.use(videoStreamRouter);
router.use(securityRouter);

export default router;
