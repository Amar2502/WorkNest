import { Router } from "express";
import { RegisterUser, LoginUser } from "../controllers/users";

const router = Router();

router.post("/register", RegisterUser);
router.post("/login", LoginUser);

export default router;