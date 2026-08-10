package com.gestionale.manutenzioni.controller;

import com.gestionale.manutenzioni.entity.Intervento;
import com.gestionale.manutenzioni.repository.InterventoRepository;
import com.gestionale.manutenzioni.service.InterventoService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class InterventoController {

    private final InterventoRepository repo;
    private final InterventoService service;

    public InterventoController(InterventoRepository repo, InterventoService service) {
        this.repo = repo;
        this.service = service;
    }

    @GetMapping("/VisualizzaInterventi")
    public List<Intervento> getInterventi() { return repo.findAll(); }

    @GetMapping("/VisualizzaInterventoById/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Intervento non trovato")));
    }

    @GetMapping("/VisualizzaInterventiEsterni")
    public List<Intervento> getInterventiEsterni() {
        return repo.findAll().stream()
                .filter(i -> i.getFornitoriEsterni() != null && !i.getFornitoriEsterni().isEmpty())
                .toList();
    }

    @PostMapping("/CreaIntervento")
    public ResponseEntity<?> create(@RequestBody Intervento in) {
        Intervento saved = service.create(in);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Intervento creato con successo", "IntId", saved.getIntId()));
    }

    @PutMapping("/Modificaintervento/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Intervento in) {
        return repo.findById(id).<ResponseEntity<?>>map(i -> {
            if (in.getManId() != null) i.setManId(in.getManId());
            if (in.getDataIntPrev() != null) i.setDataIntPrev(in.getDataIntPrev());
            if (in.getDataIntEff() != null) i.setDataIntEff(in.getDataIntEff());
            if (in.getTmpInt() != null) i.setTmpInt(in.getTmpInt());
            if (in.getOraInizio() != null) i.setOraInizio(in.getOraInizio());
            if (in.getOraFine() != null) i.setOraFine(in.getOraFine());
            if (in.getEsitoMan() != null) i.setEsitoMan(in.getEsitoMan());
            if (in.getValidataMan() != null) i.setValidataMan(in.getValidataMan());
            if (in.getNoteIntervento() != null) i.setNoteIntervento(in.getNoteIntervento());
            if (in.getTipoGuastoId() != null) i.setTipoGuastoId(in.getTipoGuastoId());
            if (in.getNomeRisorsaInt() != null) i.setNomeRisorsaInt(in.getNomeRisorsaInt());
            if (in.getDipendenti() != null) i.setDipendenti(in.getDipendenti());
            if (in.getFornitoriEsterni() != null) i.setFornitoriEsterni(in.getFornitoriEsterni());
            if (in.getArticoliUsati() != null) i.setArticoliUsati(in.getArticoliUsati());
            Intervento saved = repo.save(i);
            // Se l'intervento e' stato validato con esito positivo notifica la fatturazione
            service.publishIfCompleted(saved);
            return ResponseEntity.ok(Map.of("message", "Intervento modificato con successo"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Intervento non trovato")));
    }

    @DeleteMapping("/CancellaIntervento/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Intervento non trovato"));
        }
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Intervento eliminato con successo"));
    }
}
