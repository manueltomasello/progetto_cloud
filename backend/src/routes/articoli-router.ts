import { Router, RequestHandler } from "express"
import * as articoliController from "../controllers/articoli-controller"

const router: Router = Router()
//reuqesthandler serve per forzare i tipi,
router.get("/api/VisualizzazioneArticoli", articoliController.getArticoli)
router.post("/api/CreaArticoli", articoliController.createArticolo)
router.put("/api/ModificaArticoli/:id", articoliController.updateArticolo as RequestHandler)
router.delete("/api/CancellaArticoli/:id", articoliController.deleteArticolo as RequestHandler)


export default router
