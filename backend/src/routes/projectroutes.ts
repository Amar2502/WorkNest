import { Router } from "express";
import { CreateProject, GetAllProjects } from "../controllers/projects";

const router = Router();

router.post("/create", CreateProject);
router.get("/get", GetAllProjects);

export default router;