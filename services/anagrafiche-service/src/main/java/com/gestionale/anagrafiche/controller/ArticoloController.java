package com.gestionale.anagrafiche.controller;

import com.gestionale.anagrafiche.entity.ArticoloConsumabile;
import com.gestionale.anagrafiche.repository.ArticoloRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ArticoloController {

    private final ArticoloRepository repo;
    public ArticoloController(ArticoloRepository repo) { this.repo = repo; }

    @GetMapping("/VisualizzazioneArticoli")
    public List<ArticoloConsumabile> getArticoli() { return repo.findAll(); }

    @PostMapping("/CreaArticoli")
    public ResponseEntity<?> create(@RequestBody ArticoloConsumabile a) {
        ArticoloConsumabile saved = repo.save(a);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Articolo creato con successo", "Articolo", saved.getArticolo()));
    }

    @PutMapping("/ModificaArticoli/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody ArticoloConsumabile in) {
        return repo.findById(id).<ResponseEntity<?>>map(a -> {
            if (in.getNomeArt() != null) a.setNomeArt(in.getNomeArt());
            if (in.getDescArtBreve() != null) a.setDescArtBreve(in.getDescArtBreve());
            if (in.getDescArtLunga() != null) a.setDescArtLunga(in.getDescArtLunga());
            if (in.getUdm() != null) a.setUdm(in.getUdm());
            if (in.getPrezzoStandard() != null) a.setPrezzoStandard(in.getPrezzoStandard());
            repo.save(a);
            return ResponseEntity.ok(Map.of("message", "Articolo modificato con successo"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Articolo non trovato")));
    }

    @DeleteMapping("/CancellaArticoli/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Articolo non trovato"));
        }
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Articolo eliminato con successo"));
    }
}
