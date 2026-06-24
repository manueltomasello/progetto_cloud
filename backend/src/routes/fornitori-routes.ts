import { Router } from 'express';
import * as CrudFornitori from "../controllers/fornitori-controller"

const router: Router = Router()

router.get("/api/VisualizzaFornitore", CrudFornitori.getFornitori);
router.post("/api/CreaFornitore", CrudFornitori.createFornitore);
router.put("/api/ModificaFornitore/:id",CrudFornitori.updateFornitore);
router.delete("/api/CancellaFornitore/:id", CrudFornitori.deleteFornitore);



export default router