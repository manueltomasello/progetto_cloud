package com.gestionale.manutenzioni.controller;

import com.gestionale.manutenzioni.entity.Manutenzione;
import com.gestionale.manutenzioni.repository.ManutenzioneRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class ManutenzioneController {

    private final ManutenzioneRepository repo;
    public ManutenzioneController(ManutenzioneRepository repo) { this.repo = repo; }

    @GetMapping("/VisualizzaManutenzioni")
    public List<Manutenzione> getManutenzioni() { return repo.findAll(); }

    @PostMapping("/CreaManutenzione")
    public ResponseEntity<?> create(@RequestBody Manutenzione m) {
        Manutenzione saved = repo.save(m);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Manutenzione creata con successo", "ManId", saved.getManId()));
    }

    @PutMapping("/ModificaManutenzione/{id}")
    public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody Manutenzione in) {
        return repo.findById(id).<ResponseEntity<?>>map(m -> {
            if (in.getMaccIdMan() != null) m.setMaccIdMan(in.getMaccIdMan());
            if (in.getTipo() != null) m.setTipo(in.getTipo());
            if (in.getFreqGiorni() != null) m.setFreqGiorni(in.getFreqGiorni());
            if (in.getDescMan() != null) m.setDescMan(in.getDescMan());
            if (in.getNoteMan() != null) m.setNoteMan(in.getNoteMan());
            if (in.getDurataSTAT() != null) m.setDurataSTAT(in.getDurataSTAT());
            repo.save(m);
            return ResponseEntity.ok(Map.of("message", "Manutenzione modificata con successo"));
        }).orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("message", "Manutenzione non trovata")));
    }

    @DeleteMapping("/CancellaManutenzione/{id}")
    public ResponseEntity<?> delete(@PathVariable Integer id) {
        if (!repo.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Manutenzione non trovata"));
        }
        repo.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "Manutenzione eliminata con successo"));
    }
}
