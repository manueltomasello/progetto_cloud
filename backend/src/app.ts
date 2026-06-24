import express, { Express } from "express"
import bodyParser from "body-parser"
import cookieParser from "cookie-parser"
import authRouter from "./routes/auth-router"
import 'dotenv/config'

// routes componenti Progetto
import articoliRouter from "./routes/articoli-router"
import consultazioniRouter from "./routes/consultazioni-router"
import risorsaRouter from "./routes/risorsa-router"
import interventiRouter from "./routes/interventi-router"
import fornitoreRouter from "./routes/fornitori-routes"
import manutenzioneRouter from "./routes/manutenzioni-router"
import fatturaRouter from "./routes/fattura-router"
import DipendenteRouter from "./routes/dipendenti-router"
import GuastoRouter from "./routes/guasti-router"
import HomeRouter from "./routes/home-router"
import AIagentRouter from "./routes/AI-Agent-router"
import './jobs/scheduler' // importa il tuo scheduler che contiene i job
const app: Express = express()
const port: number = 3000

app.use(express.json())  
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

app.use(bodyParser.json())
app.use(cookieParser())
app.use(authRouter)

app.use(articoliRouter)
app.use(consultazioniRouter)
app.use(risorsaRouter)
app.use(interventiRouter)
app.use(fornitoreRouter)
app.use(manutenzioneRouter)
app.use(fatturaRouter)
app.use(DipendenteRouter)
app.use(GuastoRouter)
app.use(HomeRouter)
app.use(AIagentRouter)

app.use(function(req, res, next) {
  res.setHeader("Content-Type", "text/plain")
  res.status(404).send("Ops... Pagina non trovata")
})

app.listen(port, function() {
  console.log(`Listening on http://localhost:${port}`)
})
