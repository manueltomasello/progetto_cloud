import Imap from 'imap';
import { simpleParser } from 'mailparser';
import axios from 'axios';

/*
for cybersecurity reasons, sensitive data are stored in .env 
TO DO URGENT: implement not duplicate function!
*/
const imap = new Imap({
  user: process.env.EMAIL_USER!,
  password: process.env.EMAIL_PASS!,
  host: process.env.EMAIL_HOST!,
  port: parseInt(process.env.EMAIL_PORT || '993', 10),
  tls: true,
});


const OPENAI_API_KEY = process.env.OPEN_AI_KEY;
const GESTIONALE_BASE_URL = 'http://localhost:3000';


function openInbox(cb: (err: Error | null, box: any) => void) {
  imap.openBox('INBOX', false, cb);
}


function extractJsonFromContent(content: string): string {
  const codeBlockMatch =
    content.match(/```json([\s\S]*?)```/i) ||
    content.match(/```([\s\S]*?)```/i);

  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }

  // Caso: testo con JSON inline → prendi da { a }
  const firstBrace = content.indexOf('{');
  const lastBrace = content.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return content.slice(firstBrace, lastBrace + 1).trim();
  }

  // Ultima spiaggia: restituisci tutto, e il parse fallirà (gestito a catch)
  return content.trim();
}

// Chiede al modello di generare il body JSON per l'API CreaInterventoAI
async function generaBodyInterventoDaEmail(testoEmail: string): Promise<any> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY non configurata nelle variabili ambiente');
  }

  const prompt = `
Sei un assistente per un gestionale di manutenzioni industriali.

Devi restituire un JSON ESATTAMENTE con questi campi:

{
  "ManId": number,
  "NomeRisorsaInt": number,
  "DataIntPrev": "YYYY-MM-DD",
  "DataIntEff": null,
  "TmpInt": null,
  "EsitoMan": false,
  "noteIntervento": string,
  "TipoGuastoId": number | null,
  "Dipendenti": number[],
  "FornitoriEsterni": string[],
  "ArticoliUsati": []
}

Regole:
- Se la mail parla di un singolo intervento e non di una manutenzione periodica, usa "ManId": 0.
- Se non sai quale macchina è, metti "NomeRisorsaInt": 0.
- "DataIntPrev": interpreta frasi come "entro fine settimana", "domani" in una data precisa (YYYY-MM-DD).
- "DataIntEff" deve essere sempre null.
- "TmpInt" lascia null.
- "EsitoMan" deve essere sempre false.
- "noteIntervento": breve riassunto chiaro della richiesta.
- "TipoGuastoId": se è guasto meccanico usa 8, altrimenti null.
- "Dipendenti", "FornitoriEsterni", "ArticoliUsati": per ora sempre [].

Rispondi SOLO con JSON valido, senza testo aggiuntivo, senza blocchi \`\`\` e senza commenti.

Email:
"${testoEmail}"
`;

  try {
    const resp = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: 'Sei un assistente che restituisce SOLO JSON valido.' },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const content: string = resp.data.choices[0].message.content;
    console.log('Risposta LLM grezza:', content);

    const jsonText = extractJsonFromContent(content);
    console.log('JSON estratto:', jsonText);

    return JSON.parse(jsonText);
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response?.status === 429) {
      console.error('Rate limit OpenAI raggiunto (429). Nessun intervento creato per questa email.');
      throw new Error('LLM non disponibile: intervento non creato');
    }
    console.error('Errore chiamando il modello LLM:', err.message || err);
    throw new Error('Errore LLM: intervento non creato');
  }
}

// Chiama il tuo backend per creare l'intervento AI
async function creaInterventoNelGestionale(body: any): Promise<void> {
  await axios.post(`${GESTIONALE_BASE_URL}/api/CreaInterventoAI`, body, {
    headers: { 'Content-Type': 'application/json' },
  });
}

// Processa una singola email (testo → LLM → API)
async function processEmail(testo: string): Promise<void> {
  console.log('Email letta:\n', testo);

  try {
    const body = await generaBodyInterventoDaEmail(testo);
    console.log('Body generato per API:', body);
    await creaInterventoNelGestionale(body);
    console.log('Intervento creato con successo dal worker email.');
  } catch (err: any) {
    console.error('Intervento NON creato per questa email:', err?.message || err);
  }
}

// ---------- LOOP IMAP ----------

imap.once('ready', () => {
  console.log('IMAP pronto, apro INBOX...');
  openInbox((err, box) => {
    if (err) throw err;

    imap.search(['UNSEEN'], (err, results: number[]) => {
      if (err) throw err;
      if (!results || results.length === 0) {
        console.log('Nessuna nuova email non letta.');
        return;
      }

      console.log('Email non lette trovate:', results.length);

      const f = imap.fetch(results, { bodies: '' });

      f.on('message', (msg, seqno) => {
        let buffer = '';

        msg.on('body', (stream, info) => {
          stream.on('data', (chunk) => {
            buffer += chunk.toString('utf8');
          });

          stream.once('end', async () => {
            try {
              const mail = await simpleParser(buffer);
              const testo =
                (mail as any).text ||
                (mail as any).html ||
                '';

              await processEmail(testo);
            } catch (err) {
              console.error('Errore nel parsing/processo email:', err);
            }
          });
        });

        msg.once('end', () => {
          console.log('Messaggio %d finito', seqno);
        });
      });

      f.once('error', (err) => {
        console.error('Errore fetch IMAP:', err);
      });

      f.once('end', () => {
        console.log('Fetch IMAP terminato.');
      });
    });
  });
});

imap.once('error', (err) => {
  console.error('Errore IMAP:', err);
});

imap.once('end', () => {
  console.log('Connessione IMAP chiusa.');
});

// Avvia la connessione
imap.connect();



