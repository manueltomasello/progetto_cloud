import cron from 'node-cron';
import { generaInterventiProgrammabili } from '../controllers/home-controller';


// Pianifica il job alle 4:00 di ogni giorno 
cron.schedule('0 4 * * *', async () => {
  try {
    const risultati = await generaInterventiProgrammabili();
    console.log(` Generati ${risultati.length} interventi automatici alle 4:00`);
  } catch (error) {
    console.error(' Errore durante l\'esecuzione del job schedulato:', error);
  }
});


cron.schedule('*/2 * * * *', () => {
  console.log('Avvio job lettura email...');
   require('./Agent-AI');
 }); 
 