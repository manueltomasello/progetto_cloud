package com.gestionale.fatturazione.controller;

import com.gestionale.fatturazione.entity.Fattura;
import com.gestionale.fatturazione.repository.FatturaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class FatturaController {

    private final FatturaRepository repo;
    public FatturaController(FatturaRepository repo) { this.repo = repo; }

    @GetMapping("/VisualizzazioneFatture")
    public List<Fattura> getFatture() { return repo.findAll(); }

    @PostMapping("/CreaFattura")
    public ResponseEntity<?> create(@RequestBody Fattura f) {
        repo.save(f);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Fattura creata con successo"));
    }

    @PutMapping("/ModificaFattura/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Fattura in) {
        return repo.findById(id).<ResponseEntity<?>>map(f -> {
            if (in.getIntId() != null) f.setIntId(in.getIntId());
            if (in.getImpFatt() != null) f.setImpFatt(in.getImpFatt());
            if (in.getNoteFatt() != null) f.setNoteFatt(in.getNoteFatt());
            repo.save(f);
            return ResponseEntity.ok(Map.of("message", "Fattura modificata con successo"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Fattura non trovata")));
    }

    @DeleteMapping("/CancellaFattura/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Fattura non trovata"));
        }
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Fattura eliminata con successo"));
    }
}
