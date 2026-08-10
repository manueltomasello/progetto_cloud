package com.gestionale.anagrafiche.controller;

import com.gestionale.anagrafiche.entity.CausaGuasto;
import com.gestionale.anagrafiche.repository.CausaGuastoRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class GuastoController {

    private final CausaGuastoRepository repo;
    public GuastoController(CausaGuastoRepository repo) { this.repo = repo; }

    @GetMapping("/VisualizzaGuasti")
    public List<CausaGuasto> getGuasti() { return repo.findAll(); }

    @PostMapping("/CreaGuasto")
    public ResponseEntity<?> create(@RequestBody CausaGuasto g) {
        repo.save(g);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Tipologia di guasto inserita con successo"));
    }

    @PutMapping("/ModificaGuasto/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody CausaGuasto in) {
        return repo.findById(id).<ResponseEntity<?>>map(g -> {
            if (in.getDescrizione() != null) g.setDescrizione(in.getDescrizione());
            repo.save(g);
            return ResponseEntity.ok(Map.of("message", "Causale di guasto modificata con successo"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Nessuna causale di guasto trovata con questo ID")));
    }

    @DeleteMapping("/CancellaGuasto/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Causale non trovata"));
        }
        try {
            repo.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Causale Guasto eliminata con successo"));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of(
                    "message", "Impossibile eliminare: causale collegata ad interventi esistenti"));
        }
    }
}
