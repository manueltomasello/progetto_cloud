package com.gestionale.manutenzioni.controller;

import com.gestionale.manutenzioni.entity.Intervento;
import com.gestionale.manutenzioni.repository.InterventoRepository;
import com.gestionale.manutenzioni.service.HomeService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HomeController {

    private final InterventoRepository intRepo;
    private final HomeService homeService;

    public HomeController(InterventoRepository intRepo, HomeService homeService) {
        this.intRepo = intRepo;
        this.homeService = homeService;
    }

    @GetMapping("/InterventiCalendario")
    public List<Intervento> calendario() { return intRepo.findAll(); }

    @GetMapping("/InterventiNonValidati")
    public List<Intervento> nonValidati() { return intRepo.findByValidataManFalse(); }

    @GetMapping("/InterventiRitardo")
    public List<Intervento> inRitardo() {
        return intRepo.findByDataIntEffIsNullAndDataIntPrevBefore(LocalDate.now());
    }

    @GetMapping("/genera-interventi")
    public ResponseEntity<?> genera() {
        try {
            List<Intervento> generati = homeService.generaInterventiProgrammabili();
            return ResponseEntity.ok(Map.of("success", true, "generati", generati));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
