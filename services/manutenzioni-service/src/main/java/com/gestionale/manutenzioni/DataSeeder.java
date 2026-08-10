package com.gestionale.manutenzioni;

import com.gestionale.manutenzioni.entity.ArticoloUsato;
import com.gestionale.manutenzioni.entity.Intervento;
import com.gestionale.manutenzioni.entity.Manutenzione;
import com.gestionale.manutenzioni.repository.InterventoRepository;
import com.gestionale.manutenzioni.repository.ManutenzioneRepository;
import com.gestionale.manutenzioni.service.InterventoService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

/**
 * Popola manutenzioni e interventi di esempio. Gli interventi richiamano (come
 * riferimenti "soft") le risorse 101..104 di anagrafiche-service, i dipendenti
 * 2..4 di auth-service, le causali di guasto e gli articoli.
 * Gli interventi vengono salvati direttamente (senza pubblicare eventi Kafka
 * all'avvio); il flusso a eventi resta dimostrabile a runtime dall'utente.
 */
@Component
@Order(1)
public class DataSeeder implements CommandLineRunner {

    private final ManutenzioneRepository manRepo;
    private final InterventoRepository intRepo;
    private final InterventoService interventoService;

    public DataSeeder(ManutenzioneRepository manRepo, InterventoRepository intRepo,
                      InterventoService interventoService) {
        this.manRepo = manRepo;
        this.intRepo = intRepo;
        this.interventoService = interventoService;
    }

    @Override
    public void run(String... args) {
        if (manRepo.count() > 0) return;

        Integer m1 = creaManutenzione(101, "Preventiva", 30, "Ingrassaggio e controllo cuscinetti tornio");
        Integer m2 = creaManutenzione(102, "Preventiva", 90, "Revisione impianto idraulico pressa");
        Integer m3 = creaManutenzione(103, "Guasto", null, "Interventi su guasto nastro trasportatore");
        Integer m4 = creaManutenzione(104, "Conduzione", 7, "Controllo settimanale compressore");

        // Intervento completato e validato (con dipendenti e articoli usati)
        Intervento i1 = base(m1, 101, LocalDate.now().minusDays(10));
        i1.setDataIntEff(LocalDate.now().minusDays(10));
        i1.setOraInizio(LocalTime.of(8, 0));
        i1.setOraFine(LocalTime.of(10, 0));
        i1.setTmpInt(120);
        i1.setEsitoMan(true);
        i1.setValidataMan(true);
        i1.setNoteIntervento("Sostituzione cuscinetti e ingrassaggio");
        i1.setDipendenti(List.of(2, 3));
        i1.setArticoliUsati(List.of(new ArticoloUsato(1, 2), new ArticoloUsato(5, 4)));
        salva(i1);

        // Intervento su guasto meccanico, eseguito ma non ancora validato
        Intervento i2 = base(m3, 103, LocalDate.now().minusDays(3));
        i2.setDataIntEff(LocalDate.now().minusDays(3));
        i2.setTmpInt(90);
        i2.setEsitoMan(true);
        i2.setValidataMan(false);
        i2.setTipoGuastoId(8); // Guasto meccanico
        i2.setNoteIntervento("Blocco nastro: sostituzione cinghia");
        i2.setDipendenti(List.of(2));
        i2.setArticoliUsati(List.of(new ArticoloUsato(2, 1)));
        salva(i2);

        // Intervento pianificato in futuro con fornitore esterno
        Intervento i3 = base(0, 102, LocalDate.now().plusDays(5));
        i3.setEsitoMan(false);
        i3.setValidataMan(false);
        i3.setNoteIntervento("Controllo pressione e taratura valvole (ditta esterna)");
        i3.setFornitoriEsterni(List.of("F002"));
        salva(i3);

        // Intervento in ritardo (previsto nel passato, non ancora eseguito)
        Intervento i4 = base(m4, 104, LocalDate.now().minusDays(2));
        i4.setEsitoMan(false);
        i4.setValidataMan(false);
        i4.setNoteIntervento("Controllo settimanale compressore - da eseguire");
        i4.setDipendenti(List.of(4));
        salva(i4);
    }

    private Integer creaManutenzione(int risorsa, String tipo, Integer freq, String desc) {
        Manutenzione m = new Manutenzione();
        m.setMaccIdMan(risorsa);
        m.setTipo(tipo);
        m.setFreqGiorni(freq);
        m.setDescMan(desc);
        m.setDataInserimento(LocalDate.now().minusMonths(2));
        m.setDurataSTAT(0);
        return manRepo.save(m).getManId();
    }

    private Intervento base(int manId, int risorsa, LocalDate prevista) {
        Intervento i = new Intervento();
        i.setIntId(interventoService.generateIntId());
        i.setManId(manId);
        i.setNomeRisorsaInt(risorsa);
        i.setDataIntPrev(prevista);
        i.setOriginInt(0);
        return i;
    }

    private void salva(Intervento i) {
        intRepo.save(i);
    }
}
