import { Router } from 'express';
import * as CrudRisorsa from "../controllers/risorsa-controller"

const router: Router = Router()

router.get("/api/VisualizzaRisorse", CrudRisorsa.getRisorse);
router.get("/api/FiltraRisorsa/:id", CrudRisorsa. getRisorsaById);
router.post("/api/CreaRisorsa", CrudRisorsa.createRisorsa);
router.put("/api/ModificaRisorsa/:id",CrudRisorsa.updateRisorsa);
router.delete("/api/CancellaRisorsa/:id", CrudRisorsa.deleteRisorsa);



export default router