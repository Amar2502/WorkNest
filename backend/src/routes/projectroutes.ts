import { Router } from "express";
import { CreateProject, GetAllProjects, GetProjectById } from "../controllers/projects";

const router = Router();

router.post("/create", CreateProject);
router.get("/get", GetAllProjects);
router.get("/get/:projectId", GetProjectById);

export default router;