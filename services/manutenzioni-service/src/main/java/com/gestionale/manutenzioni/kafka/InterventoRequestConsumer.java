package com.gestionale.manutenzioni.kafka;

import com.gestionale.manutenzioni.config.KafkaTopicsConfig;
import com.gestionale.manutenzioni.entity.Intervento;
import com.gestionale.manutenzioni.event.InterventoRequestedEvent;
import com.gestionale.manutenzioni.service.InterventoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

/**
 * Consuma le richieste di intervento provenienti dall'ai-agent-service e crea
 * l'intervento corrispondente nel database del manutenzioni-service.
 */
@Component
public class InterventoRequestConsumer {

    private static final Logger log = LoggerFactory.getLogger(InterventoRequestConsumer.class);

    private final InterventoService service;

    public InterventoRequestConsumer(InterventoService service) {
        this.service = service;
    }

    @KafkaListener(topics = KafkaTopicsConfig.TOPIC_INTERVENTI_REQUESTED,
            groupId = "manutenzioni-service")
    public void onInterventoRequested(InterventoRequestedEvent evt) {
        log.info("Ricevuta richiesta intervento da '{}' per risorsa {}",
                evt.getOrigine(), evt.getNomeRisorsaInt());
        Intervento i = new Intervento();
        i.setManId(evt.getManId() != null ? evt.getManId() : 0);
        i.setNomeRisorsaInt(evt.getNomeRisorsaInt() != null ? evt.getNomeRisorsaInt() : 0);
        i.setDataIntPrev(evt.getDataIntPrev() != null
                ? LocalDate.parse(evt.getDataIntPrev()) : LocalDate.now());
        i.setNoteIntervento(evt.getNoteIntervento());
        i.setTipoGuastoId(evt.getTipoGuastoId());
        i.setEsitoMan(false);
        i.setValidataMan(false);
        i.setOriginInt(1); // 1 = generato automaticamente (email/AI)
        if (evt.getDipendenti() != null) i.setDipendenti(evt.getDipendenti());
        if (evt.getFornitoriEsterni() != null) i.setFornitoriEsterni(evt.getFornitoriEsterni());
        Intervento saved = service.create(i);
        log.info("Creato intervento {} da richiesta AI", saved.getIntId());
    }
}
