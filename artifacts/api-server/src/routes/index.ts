import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mwanaRouter from "./mwana";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/mwana", mwanaRouter);

export default router;
