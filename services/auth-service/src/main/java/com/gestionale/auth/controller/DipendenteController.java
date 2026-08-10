package com.gestionale.auth.controller;

import com.gestionale.auth.entity.Operatore;
import com.gestionale.auth.repository.OperatoreRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * CRUD dell'anagrafica dipendenti (operatori). La cancellazione e' logica
 * (campo abilitato = 0) come nel monolite originale.
 */
@RestController
@RequestMapping("/api")
public class DipendenteController {

    private final OperatoreRepository repo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public DipendenteController(OperatoreRepository repo) {
        this.repo = repo;
    }

    @GetMapping("/VisualizzaDipendente")
    public List<Operatore> getDipendente() {
        return repo.findAll();
    }

    @PostMapping("/CreaDipendente")
    public ResponseEntity<?> createDipendente(@RequestBody Operatore in) {
        if (in.getPassDip() != null && !in.getPassDip().isBlank()) {
            in.setPassDip(encoder.encode(in.getPassDip()));
        }
        if (in.getAbilitato() == null) in.setAbilitato(1);
        Operatore saved = repo.save(in);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of("message", "Dipendente creato con successo", "IdDip", saved.getIdDip()));
    }

    @PutMapping("/ModificaDipendente/{id}")
    public ResponseEntity<?> updateDipendente(@PathVariable Integer id, @RequestBody Operatore in) {
        Optional<Operatore> found = repo.findById(id);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Nessun dipendente trovato con questo ID"));
        }
        Operatore op = found.get();
        if (in.getNomeDip() != null) op.setNomeDip(in.getNomeDip());
        if (in.getCognDip() != null) op.setCognDip(in.getCognDip());
        if (in.getEmailDip() != null) op.setEmailDip(in.getEmailDip());
        if (in.getMatricola() != null) op.setMatricola(in.getMatricola());
        if (in.getCostoOrario() != null) op.setCostoOrario(in.getCostoOrario());
        if (in.getRuolo() != null) op.setRuolo(in.getRuolo());
        if (in.getUsername() != null) op.setUsername(in.getUsername());
        if (in.getPassDip() != null && !in.getPassDip().isBlank()) {
            op.setPassDip(encoder.encode(in.getPassDip()));
        }
        repo.save(op);
        return ResponseEntity.ok(Map.of("message", "Dipendente modificato con successo"));
    }

    // La rotta originale usa PUT per disabilitare (soft-delete)
    @PutMapping("/CancellaDipendente/{id}")
    public ResponseEntity<?> disableDipendente(@PathVariable Integer id) {
        Optional<Operatore> found = repo.findById(id);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Nessun dipendente trovato con questo ID"));
        }
        Operatore op = found.get();
        op.setAbilitato(0);
        repo.save(op);
        return ResponseEntity.ok(Map.of("message", "Dipendente disabilitato con successo"));
    }
}
