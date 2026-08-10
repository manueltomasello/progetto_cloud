package com.gestionale.manutenzioni.controller;

import com.gestionale.manutenzioni.entity.Intervento;
import com.gestionale.manutenzioni.repository.InterventoRepository;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

/**
 * Consultazioni/report. Lo storico interventi e' calcolato sui dati locali del
 * servizio. Le consultazioni che nel monolite univano dati di risorse, operatori
 * e articoli (ora di proprieta' di altri microservizi) sono esposte come
 * endpoint di composizione: in un'evoluzione userebbero API composition o un
 * servizio di reporting dedicato che aggrega gli eventi. Qui restituiscono la
 * struttura attesa dal frontend senza rompere l'interfaccia.
 */
@RestController
@RequestMapping("/api")
public class ConsultazioniController {

    private final InterventoRepository intRepo;
    public ConsultazioniController(InterventoRepository intRepo) { this.intRepo = intRepo; }

    @GetMapping("/ConsStoricoInterventi")
    public List<Intervento> storicoInterventi() { return intRepo.findAll(); }

    @GetMapping("/ConsCosto")
    public List<?> costoRisorsa() { return Collections.emptyList(); }

    @GetMapping("/storico-ricambi")
    public List<?> storicoRicambi() { return Collections.emptyList(); }

    @GetMapping("/ConsumoComponenti")
    public List<?> consumoComponenti() { return Collections.emptyList(); }

    @GetMapping("/OreLavorateDip")
    public List<?> oreLavorateDip() { return Collections.emptyList(); }

    @GetMapping("/OrelavoratePerRis")
    public List<?> oreLavoratePerRis() { return Collections.emptyList(); }

    @GetMapping("/delayOperativo")
    public List<?> delayOperativo() { return Collections.emptyList(); }
}
