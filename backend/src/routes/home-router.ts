import { Router } from "express"
import * as HomeComponent from '../controllers/home-controller'
import { generaInterventiProgrammabili } from '../controllers/home-controller';


const router: Router = Router()
router.get("/api/InterventiCalendario", HomeComponent.getInterventiCalendario);
router.get("/api/InterventiNonValidati", HomeComponent.getInterventiNonValidate);
router.get("/api/InterventiRitardo", HomeComponent.getInterventiRitardo);
router.get("/api/genera-interventi", async (req, res) => {
  try {
    const risultati = await generaInterventiProgrammabili();
    res.status(200).json({ success: true, generati: risultati });
  } catch (error: any) {
    console.error('Errore API:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});


export default router
