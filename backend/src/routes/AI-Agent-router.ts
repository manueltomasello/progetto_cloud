import { Router } from 'express';
import  *  as CrudInt from "../controllers/AI-agent-Controller"


const router: Router = Router()
router.post("/api/CreaInterventoAI",CrudInt.createInterventoAI);

export default router