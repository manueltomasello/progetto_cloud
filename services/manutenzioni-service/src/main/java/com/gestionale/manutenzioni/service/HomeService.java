package com.gestionale.manutenzioni.service;

import com.gestionale.manutenzioni.entity.Intervento;
import com.gestionale.manutenzioni.entity.Manutenzione;
import com.gestionale.manutenzioni.repository.InterventoRepository;
import com.gestionale.manutenzioni.repository.ManutenzioneRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Genera automaticamente gli interventi programmabili per le manutenzioni
 * periodiche (che hanno FreqGiorni valorizzato), come faceva il job cron del
 * monolite (generaInterventiProgrammabili).
 */
@Service
public class HomeService {

    private final ManutenzioneRepository manRepo;
    private final InterventoRepository intRepo;
    private final InterventoService interventoService;

    public HomeService(ManutenzioneRepository manRepo, InterventoRepository intRepo,
                       InterventoService interventoService) {
        this.manRepo = manRepo;
        this.intRepo = intRepo;
        this.interventoService = interventoService;
    }

    public List<Intervento> generaInterventiProgrammabili() {
        List<Intervento> generati = new ArrayList<>();
        List<Manutenzione> periodiche = manRepo.findByFreqGiorniIsNotNull();
        for (Manutenzione m : periodiche) {
            if (m.getFreqGiorni() == null || m.getFreqGiorni() <= 0) continue;
            LocalDate prossima = LocalDate.now().plusDays(m.getFreqGiorni());
            Intervento i = new Intervento();
            i.setManId(m.getManId());
            i.setNomeRisorsaInt(m.getMaccIdMan());
            i.setDataIntPrev(prossima);
            i.setEsitoMan(false);
            i.setValidataMan(false);
            i.setOriginInt(2); // 2 = generato da schedulazione periodica
            generati.add(interventoService.create(i));
        }
        return generati;
    }
}
