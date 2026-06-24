import { Router } from 'express';
import * as ConsController from "../controllers/consultazioni-controller"

const router: Router = Router()

router.get("/api/ConsCosto", ConsController.ConsCostoRisorsa);
router.get("/api/ConsStoricoInterventi", ConsController.ConsStoricoInterventi);
router.get("/api/storico-ricambi", ConsController.ConsStoricoRicambi);
router.get("/api/ConsumoComponenti", ConsController.ConsumoComponenti);
router.get("/api/OreLavorateDip",ConsController.OrelavoratePerDip);
router.get("/api/OrelavoratePerRis",ConsController.OrelavoratePerRis);
router.get("/api/delayOperativo", ConsController.delayOperazioni)



export default router