import { Router, RequestHandler } from 'express';
import * as CrudGuasti from "../controllers/guasti-controller"

const router: Router = Router()

router.get("/api/VisualizzaGuasti", CrudGuasti.getGuasti as RequestHandler);
router.post("/api/CreaGuasto", CrudGuasti.createGuasto as RequestHandler);
router.put("/api/ModificaGuasto/:id", CrudGuasti.updateGuasto as RequestHandler);
router.delete("/api/CancellaGuasto/:id", CrudGuasti.deleteGuasto as RequestHandler);



export default router