package com.gestionale.anagrafiche.controller;

import com.gestionale.anagrafiche.entity.Fornitore;
import com.gestionale.anagrafiche.repository.FornitoreRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class FornitoreController {

    private final FornitoreRepository repo;
    public FornitoreController(FornitoreRepository repo) { this.repo = repo; }

    @GetMapping("/VisualizzaFornitore")
    public List<Fornitore> getFornitori() { return repo.findAll(); }

    @PostMapping("/CreaFornitore")
    public ResponseEntity<?> create(@RequestBody Fornitore f) {
        repo.save(f);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Fornitore creato con successo"));
    }

    @PutMapping("/ModificaFornitore/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Fornitore in) {
        return repo.findById(id).<ResponseEntity<?>>map(f -> {
            if (in.getRagSoc() != null) f.setRagSoc(in.getRagSoc());
            repo.save(f);
            return ResponseEntity.ok(Map.of("message", "Fornitore modificato con successo"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Fornitore non trovato")));
    }

    @DeleteMapping("/CancellaFornitore/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Fornitore non trovato"));
        }
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Fornitore eliminato con successo"));
    }
}
