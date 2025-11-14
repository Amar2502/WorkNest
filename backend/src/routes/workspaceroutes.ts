import { Router } from "express";
import { CreateWorkspace, GetAllWorkspaces } from "../controllers/workspace";

const router = Router();

router.post("/create", CreateWorkspace);
router.get("/get", GetAllWorkspaces);

export default router;