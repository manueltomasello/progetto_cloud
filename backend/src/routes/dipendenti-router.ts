import { Router, RequestHandler } from 'express';
import * as CrudDipendenti from "../controllers/dipendenti-controller"

const router: Router = Router()

router.get("/api/VisualizzaDipendente", CrudDipendenti.getDipendente);
router.post("/api/CreaDipendente", CrudDipendenti.createDipendente as RequestHandler);
router.put("/api/ModificaDipendente/:id",CrudDipendenti.updateDipendente as RequestHandler);
router.put("/api/CancellaDipendente/:id", CrudDipendenti.disableDipendente as RequestHandler);



export default router