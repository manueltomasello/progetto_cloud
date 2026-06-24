import { Router } from 'express';
import * as auth from "../controllers/auth-controller"

const router: Router = Router()

router.post("/api/auth/login", auth.login);
router.post("/api/auth/logout", auth.logout);
router.get("/api/auth/getProfile", auth.getProfile);




export default router