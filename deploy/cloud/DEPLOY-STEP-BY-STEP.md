# Deploy in cloud — guida passo-passo

Obiettivo: soddisfare il requisito **"una parte deployata in cloud"** mettendo
online l'`ai-agent-service` su un provider cloud, collegato a un **broker Kafka
gestito**. L'ai-agent è la scelta ideale perché comunica con il resto del
sistema solo tramite Kafka, quindi non serve rete privata né database condiviso.

Schema del deploy:

```
[Cloud: Render]  ai-agent-service ──SASL_SSL──► [Kafka gestito]  topic interventi.requested
                                                       │
[Sul tuo PC]  manutenzioni-service ◄──SASL_SSL─────────┘  (consuma e crea l'intervento)
```

Tutto il codice è già predisposto: profilo Spring `cloud` (SASL_SSL) nei servizi
`ai-agent-service`, `manutenzioni-service` e `fatturazione-service`, più i
manifest `render.yaml` e `fly.toml`.

---

## Prerequisiti
- Un account GitHub (per pubblicare la repo).
- Un account su **Render** (render.com) — piano free.
- Un account per un **Kafka gestito**: consigliato **Confluent Cloud**
  (confluent.cloud, cluster "Basic" con crediti gratuiti). Alternative:
  Redpanda Cloud, Aiven.

---

## Passo 1 — Pubblica la repo su GitHub
```bash
cd progetto_cloud
git add .
git commit -m "Sistema a microservizi"
git push
```
Prendi nota dell'URL della repo (es. `https://github.com/tuo-utente/progetto_cloud`).

## Passo 2 — Crea il broker Kafka gestito (Confluent Cloud)
1. Accedi a confluent.cloud e crea un **cluster Basic** (regione europea, es. eu-west).
2. Vai su **API Keys → Create key** (scope: il cluster). Salva **Key** e **Secret**.
3. In **Cluster settings** copia il **Bootstrap server** (es.
   `pkc-xxxxx.eu-west-1.aws.confluent.cloud:9092`).
4. Vai su **Topics → Add topic** e crea `interventi.requested` (1 partizione).
   Crea anche `interventi.completed` se vuoi il flusso completo.

Ti servono quindi tre valori:
- `KAFKA_BOOTSTRAP_SERVERS` = il bootstrap server
- `KAFKA_API_KEY` = la Key
- `KAFKA_API_SECRET` = il Secret

## Passo 3 — Deploy dell'ai-agent su Render
Opzione A (da manifest): nel file `deploy/cloud/render.yaml` sostituisci
`https://github.com/<utente>/progetto_cloud` con l'URL della tua repo, poi su
Render usa **New → Blueprint** e seleziona la repo.

Opzione B (manuale): su Render **New → Web Service → Build from a Dockerfile**:
- Repository: la tua repo
- Dockerfile path: `services/ai-agent-service/Dockerfile`
- Root directory / Docker context: `services/ai-agent-service`
- Health check path: `/actuator/health`

In entrambi i casi imposta le **Environment Variables**:
| Variabile | Valore |
|---|---|
| `SPRING_PROFILES_ACTIVE` | `cloud` |
| `KAFKA_BOOTSTRAP_SERVERS` | (dal Passo 2) |
| `KAFKA_API_KEY` | (dal Passo 2) |
| `KAFKA_API_SECRET` | (dal Passo 2) |
| `OPEN_AI_KEY` | (opzionale, per l'interpretazione email) |
| `EMAIL_ENABLED` | `false` |

Avvia il deploy e attendi che lo stato sia **Live**.

## Passo 4 — Verifica che l'ai-agent in cloud pubblichi su Kafka
Chiama l'endpoint del servizio online (URL fornito da Render):
```bash
curl -X POST https://<tuo-servizio>.onrender.com/api/CreaInterventoAI \
  -H "Content-Type: application/json" \
  -d '{"ManId":0,"NomeRisorsaInt":101,"DataIntPrev":"2026-09-01","noteIntervento":"Test dal cloud"}'
```
Su Confluent Cloud apri **Topics → interventi.requested → Messages**: dovresti
vedere il messaggio appena pubblicato. Questo dimostra il requisito cloud + Kafka.

## Passo 5 (opzionale) — Demo ibrida completa: cloud → PC
Per far sì che l'intervento generato dal cloud compaia nel tuo gestionale locale,
avvia i servizi locali collegandoli allo **stesso** Kafka gestito. Crea un file
`.env` con i valori del Passo 2, poi avvia con l'override cloud:
```bash
docker compose -f docker-compose.yml -f deploy/cloud/docker-compose.cloud-kafka.yml up --build
```
Ora una chiamata all'ai-agent in cloud farà comparire il nuovo intervento nel
frontend locale (http://localhost), perché il `manutenzioni-service` consuma
dallo stesso broker.

---

## Alternativa: Fly.io
```bash
fly launch --dockerfile services/ai-agent-service/Dockerfile
fly secrets set SPRING_PROFILES_ACTIVE=cloud \
  KAFKA_BOOTSTRAP_SERVERS=... KAFKA_API_KEY=... KAFKA_API_SECRET=...
fly deploy
```

## Problemi comuni
- **Il servizio non parte / errori SASL**: controlla che `KAFKA_API_KEY/SECRET`
  siano corretti e che `SPRING_PROFILES_ACTIVE=cloud` sia impostato.
- **Timeout verso Kafka**: verifica il `KAFKA_BOOTSTRAP_SERVERS` (host:porta) e
  che il topic esista.
- **Render "free" va in sleep**: al primo colpo dopo l'inattività il servizio
  impiega qualche secondo a ripartire; è normale.
