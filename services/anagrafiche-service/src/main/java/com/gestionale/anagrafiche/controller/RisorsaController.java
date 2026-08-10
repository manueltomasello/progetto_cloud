package com.gestionale.anagrafiche.controller;

import com.gestionale.anagrafiche.entity.Risorsa;
import com.gestionale.anagrafiche.repository.RisorsaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class RisorsaController {

    private final RisorsaRepository repo;
    public RisorsaController(RisorsaRepository repo) { this.repo = repo; }

    @GetMapping("/VisualizzaRisorse")
    public List<Risorsa> getRisorse() { return repo.findAll(); }

    @GetMapping("/FiltraRisorsa/{id}")
    public ResponseEntity<?> getRisorsaById(@PathVariable Integer id) {
        return repo.findById(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Risorsa non trovata")));
    }

    @PostMapping("/CreaRisorsa")
    public ResponseEntity<?> create(@RequestBody Risorsa r) {
        repo.save(r);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Risorsa creata con successo"));
    }

    @PutMapping("/ModificaRisorsa/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Risorsa in) {
        return repo.findById(id).<ResponseEntity<?>>map(r -> {
            if (in.getModMacc() != null) r.setModMacc(in.getModMacc());
            if (in.getDescMacc() != null) r.setDescMacc(in.getDescMacc());
            if (in.getCostoOrarioFermo() != null) r.setCostoOrarioFermo(in.getCostoOrarioFermo());
            repo.save(r);
            return ResponseEntity.ok(Map.of("message", "Risorsa modificata con successo"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Risorsa non trovata")));
    }

    @DeleteMapping("/CancellaRisorsa/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Risorsa non trovata"));
        }
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Risorsa eliminata con successo"));
    }
}
