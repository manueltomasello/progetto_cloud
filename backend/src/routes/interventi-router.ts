import { Router } from 'express';
import  *  as CrudInt from "../controllers/interventi-controller"
import { RequestHandler } from 'express';

const router: Router = Router()

router.get("/api/VisualizzaInterventi", CrudInt.getInterventi);
router.delete("/api/CancellaIntervento/:id",CrudInt.deleteIntervento);
router.get("/api/VisualizzaInterventiEsterni",CrudInt.getInterventiEsterni)
router.post("/api/CreaIntervento",CrudInt.createIntervento);
router.put("/api/Modificaintervento/:id", CrudInt.updateIntervento as RequestHandler);
router.get('/api/VisualizzaInterventoById/:id', CrudInt.getInterventoById as RequestHandler);




export default router