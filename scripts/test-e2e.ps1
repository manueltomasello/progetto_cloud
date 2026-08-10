# =====================================================================
#  Test end-to-end (Windows PowerShell) del Gestionale a microservizi.
#  Da lanciare DOPO "docker compose up".
#  Uso:  powershell -ExecutionPolicy Bypass -File scripts\test-e2e.ps1
# =====================================================================
$ErrorActionPreference = "SilentlyContinue"
$GW = if ($env:GATEWAY_URL) { $env:GATEWAY_URL } else { "http://localhost:8080" }
$pass = 0; $fail = 0
function Ok($m){ Write-Host "  [OK] $m" -ForegroundColor Green; $script:pass++ }
function Ko($m){ Write-Host "  [!!] $m" -ForegroundColor Red;   $script:fail++ }

Write-Host "== 1. Attendo l'API Gateway ==" -ForegroundColor Cyan
$up = $false
for ($i=0; $i -lt 30; $i++) {
  try { Invoke-RestMethod "$GW/actuator/health" -TimeoutSec 5 | Out-Null; $up=$true; break } catch { Start-Sleep 3 }
}
if ($up) { Ok "Gateway raggiungibile" } else { Ko "Gateway non raggiungibile su $GW"; return }

Write-Host "== 2. Login (admin/admin123) ==" -ForegroundColor Cyan
try {
  $body = '{"username":"admin","password":"admin123"}'
  Invoke-RestMethod "$GW/api/auth/login" -Method Post -ContentType "application/json" -Body $body -SessionVariable sess | Out-Null
  Ok "Login riuscito"
} catch { Ko "Login fallito" }

Write-Host "== 3. Lettura dati di esempio ==" -ForegroundColor Cyan
foreach ($ep in @("VisualizzaRisorse","VisualizzaManutenzioni","VisualizzaInterventi","VisualizzazioneFatture")) {
  try { $r = Invoke-RestMethod "$GW/api/$ep" -WebSession $sess; Ok "$ep -> $($r.Count) oggetti" }
  catch { Ko "$ep non raggiungibile" }
}

Write-Host "== 4. Flusso Kafka: creo un intervento via AI Agent ==" -ForegroundColor Cyan
$before = (Invoke-RestMethod "$GW/api/VisualizzaInterventi" -WebSession $sess).Count
$ai = '{"ManId":0,"NomeRisorsaInt":101,"DataIntPrev":"2026-09-01","noteIntervento":"Test E2E: vibrazione anomala tornio"}'
try { Invoke-RestMethod "$GW/api/CreaInterventoAI" -Method Post -ContentType "application/json" -Body $ai | Out-Null; Ok "Richiesta pubblicata su Kafka" }
catch { Ko "Pubblicazione fallita" }

Write-Host "== 5. Verifico la creazione dall'evento ==" -ForegroundColor Cyan
$created = $false
for ($i=0; $i -lt 20; $i++) {
  $after = (Invoke-RestMethod "$GW/api/VisualizzaInterventi" -WebSession $sess).Count
  if ($after -gt $before) { Ok "Nuovo intervento creato via Kafka (da $before a $after)"; $created=$true; break }
  Start-Sleep 2
}
if (-not $created) { Ko "Nessun nuovo intervento comparso (controlla i log di manutenzioni-service)" }

Write-Host ""
Write-Host "== RISULTATO: $pass ok, $fail problemi ==" -ForegroundColor Yellow
if ($fail -eq 0) { Write-Host "Tutto funzionante." -ForegroundColor Green } else { Write-Host "Ci sono problemi: vedi sopra." -ForegroundColor Red }
