package com.gestionale.aiagent.controller;

import com.gestionale.aiagent.dto.CreaInterventoAiRequest;
import com.gestionale.aiagent.event.InterventoRequestedEvent;
import com.gestionale.aiagent.kafka.InterventoProducer;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Riceve la richiesta di intervento (stesso contratto del monolite) e, invece
 * di scrivere direttamente sul database, la pubblica come evento su Kafka.
 * Questo disaccoppia l'AI Agent dal dominio manutenzioni.
 */
@RestController
@RequestMapping("/api")
public class AiAgentController {

    private final InterventoProducer producer;

    public AiAgentController(InterventoProducer producer) { this.producer = producer; }

    @PostMapping("/CreaInterventoAI")
    public ResponseEntity<?> creaInterventoAI(@RequestBody CreaInterventoAiRequest req) {
        InterventoRequestedEvent evt = new InterventoRequestedEvent();
        evt.setManId(req.ManId != null ? req.ManId : 0);
        evt.setNomeRisorsaInt(req.NomeRisorsaInt != null ? req.NomeRisorsaInt : 0);
        evt.setDataIntPrev(req.DataIntPrev);
        evt.setNoteIntervento(req.noteIntervento);
        evt.setTipoGuastoId(req.TipoGuastoId);
        evt.setDipendenti(req.Dipendenti);
        evt.setFornitoriEsterni(req.FornitoriEsterni);
        evt.setOrigine("api-ai");
        producer.publish(evt);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(Map.of("message", "Richiesta di intervento accettata e inoltrata al broker"));
    }
}
