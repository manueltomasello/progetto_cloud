# Deploy in cloud dell'AI Agent Service

L'`ai-agent-service` e' il microservizio progettato per essere deployato in
cloud in modo indipendente dal resto del sistema. Comunica con gli altri
servizi **solo** tramite eventi Kafka (topic `interventi.requested`), quindi non
ha bisogno di condividere database o rete privata con i servizi di dominio:
gli basta raggiungere il broker Kafka.

## Architettura del deploy

```
   [Cloud provider: Render / Fly.io]           [Kafka gestito: Confluent Cloud]
        ai-agent-service  ── SASL_SSL ─────────────►  topic interventi.requested
                                                             │
                                                             ▼
   [On-prem / altro cloud]  manutenzioni-service  ◄── consuma gli eventi
```

## Passi

1. **Provisioning di un broker Kafka gestito** (Confluent Cloud, Redpanda Cloud
   o Aiven). Creare un cluster e generare una coppia *API key / API secret*.
   Creare (o lasciare autocreare) il topic `interventi.requested`.

2. **Deploy del servizio** con uno dei manifest in questa cartella:
   - Render: collegare la repo e usare `render.yaml`.
   - Fly.io: `fly launch` con `fly.toml`.

3. **Impostare le variabili d'ambiente / segreti**:
   - `SPRING_PROFILES_ACTIVE=cloud`
   - `KAFKA_BOOTSTRAP_SERVERS` (endpoint del broker gestito)
   - `KAFKA_API_KEY`, `KAFKA_API_SECRET`
   - `OPEN_AI_KEY` (se si vuole abilitare l'interpretazione delle email)
   - `EMAIL_ENABLED=true` + credenziali IMAP per attivare il job email

4. **Collegare il manutenzioni-service** allo stesso broker gestito impostando le
   sue variabili Kafka con le stesse credenziali, cosi' consuma gli eventi
   prodotti dall'ai-agent in cloud.

## Verifica

Chiamare l'endpoint dell'AI Agent deployato:

```bash
curl -X POST https://<url-del-servizio>/api/CreaInterventoAI \
  -H "Content-Type: application/json" \
  -d '{"ManId":0,"NomeRisorsaInt":0,"DataIntPrev":"2026-07-20","noteIntervento":"Test dal cloud"}'
```

Se il `manutenzioni-service` e' in ascolto sullo stesso broker, comparira' un
nuovo intervento generato dall'evento.
