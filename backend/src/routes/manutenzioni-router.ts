import { Router } from 'express';
import * as CrudMan from "../controllers/manutenzioni-controller"

const router: Router = Router()

router.get("/api/VisualizzaManutenzioni", CrudMan.getManutezioni);
router.post("/api/CreaManutenzione", CrudMan.createManutenzione);
router.put("/api/ModificaManutenzione/:id", CrudMan.updateManutenzione);
router.delete("/api/CancellaManutenzione/:id",CrudMan.deleteManutenzione)


export default router