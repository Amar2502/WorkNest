import { Router } from "express";
import { CreateWorkspace, GetAllWorkspaces, GetWorkspaceById } from "../controllers/workspace";

const router = Router();

router.post("/create", CreateWorkspace);
router.get("/get", GetAllWorkspaces);
router.get("/get/:workspaceId", GetWorkspaceById);

export default router;