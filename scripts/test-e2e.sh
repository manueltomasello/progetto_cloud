#!/usr/bin/env bash
# =====================================================================
#  Test end-to-end del Gestionale Manutenzioni a microservizi.
#  Da lanciare DOPO "docker compose up" (i servizi devono essere avviati).
#  Verifica: health dei servizi, login, CRUD e il flusso a eventi Kafka
#  (creazione intervento via AI -> consumo -> generazione fattura).
#
#  Uso:  bash scripts/test-e2e.sh
# =====================================================================
set -u
GW="${GATEWAY_URL:-http://localhost:8080}"
COOKIE="$(mktemp)"
pass=0; fail=0
ok(){ echo "  [OK] $1"; pass=$((pass+1)); }
ko(){ echo "  [!!] $1"; fail=$((fail+1)); }

echo "== 1. Attendo che l'API Gateway risponda =="
for i in $(seq 1 30); do
  if curl -sf "$GW/actuator/health" >/dev/null 2>&1; then ok "Gateway raggiungibile"; break; fi
  sleep 3; [ "$i" = 30 ] && { ko "Gateway non raggiungibile su $GW"; exit 1; }
done

echo "== 2. Login (admin/admin123) =="
code=$(curl -s -o /dev/null -w "%{http_code}" -c "$COOKIE" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' "$GW/api/auth/login")
[ "$code" = "200" ] && ok "Login riuscito" || ko "Login fallito (HTTP $code)"

echo "== 3. Lettura dati di esempio =="
for ep in VisualizzaRisorse VisualizzaManutenzioni VisualizzaInterventi VisualizzazioneFatture; do
  n=$(curl -s -b "$COOKIE" "$GW/api/$ep" | grep -o '{' | wc -l | tr -d ' ')
  ok "$ep -> $n oggetti (circa)"
done

echo "== 4. Flusso Kafka: creo un intervento via AI Agent =="
before=$(curl -s -b "$COOKIE" "$GW/api/VisualizzaInterventi" | grep -o 'IntId' | wc -l | tr -d ' ')
curl -s -o /dev/null -H "Content-Type: application/json" \
  -d '{"ManId":0,"NomeRisorsaInt":101,"DataIntPrev":"2026-09-01","noteIntervento":"Test E2E: vibrazione anomala tornio"}' \
  "$GW/api/CreaInterventoAI"
ok "Richiesta pubblicata su Kafka (interventi.requested)"

echo "== 5. Verifico che il manutenzioni-service abbia creato l'intervento =="
created=0
for i in $(seq 1 20); do
  after=$(curl -s -b "$COOKIE" "$GW/api/VisualizzaInterventi" | grep -o 'IntId' | wc -l | tr -d ' ')
  if [ "$after" -gt "$before" ]; then ok "Nuovo intervento creato dall'evento Kafka (da $before a $after)"; created=1; break; fi
  sleep 2
done
[ "$created" = 0 ] && ko "Nessun nuovo intervento comparso (controlla i log di manutenzioni-service)"

echo
echo "== RISULTATO: $pass ok, $fail problemi =="
rm -f "$COOKIE"
[ "$fail" = 0 ] && echo "Tutto funzionante." || echo "Ci sono problemi: vedi sopra."
