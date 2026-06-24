import { Router, RequestHandler} from "express"
import * as fatturaController from "../controllers/fattura-controller"

const router: Router = Router()

router.get("/api/VisualizzazioneFatture", fatturaController.getFatture)
router.post("/api/CreaFattura", fatturaController.createFattura)
router.put("/api/ModificaFattura/:id", fatturaController.updateFattura)
router.delete("/api/CancellaFattura/:id", fatturaController.deleteFattura as RequestHandler)


export default router