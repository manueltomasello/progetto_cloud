package com.gestionale.fatturazione;

import com.gestionale.fatturazione.entity.Fattura;
import com.gestionale.fatturazione.repository.FatturaRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Crea una fattura di esempio al primo avvio, collegata (riferimento "soft")
 * all'intervento completato INT-26-00001 del manutenzioni-service. In esercizio
 * queste bozze vengono generate automaticamente dagli eventi Kafka.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final FatturaRepository repo;

    public DataSeeder(FatturaRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;
        Fattura f = new Fattura();
        f.setNFatt("FATT-2026-00001");
        f.setIntId("INT-26-00001");
        f.setImpFatt(new BigDecimal("100.00"));
        f.setNoteFatt("Fattura per sostituzione cuscinetti tornio CNC");
        repo.save(f);
    }
}
