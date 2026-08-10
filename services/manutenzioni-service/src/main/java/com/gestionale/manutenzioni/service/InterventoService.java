package com.gestionale.manutenzioni.service;

import com.gestionale.manutenzioni.config.KafkaTopicsConfig;
import com.gestionale.manutenzioni.entity.Intervento;
import com.gestionale.manutenzioni.event.InterventoCompletedEvent;
import com.gestionale.manutenzioni.repository.InterventoRepository;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.Year;

/**
 * Logica applicativa degli interventi: generazione della chiave IntId e
 * pubblicazione dell'evento di completamento verso il fatturazione-service.
 */
@Service
public class InterventoService {

    private static final double TARIFFA_ORARIA_DEFAULT = 50.0;

    private final InterventoRepository repo;
    private final KafkaTemplate<String, Object> kafka;

    public InterventoService(InterventoRepository repo, KafkaTemplate<String, Object> kafka) {
        this.repo = repo;
        this.kafka = kafka;
    }

    /** Genera una chiave nel formato INT-YY-NNNNN progressiva per anno. */
    public synchronized String generateIntId() {
        String yy = String.format("%02d", Year.now().getValue() % 100);
        String prefix = "INT-" + yy + "-";
        long seq = repo.countByPrefix(prefix) + 1;
        return prefix + String.format("%05d", seq);
    }

    public Intervento create(Intervento intervento) {
        if (intervento.getIntId() == null || intervento.getIntId().isBlank()) {
            intervento.setIntId(generateIntId());
        }
        Intervento saved = repo.save(intervento);
        publishIfCompleted(saved);
        return saved;
    }

    public void publishIfCompleted(Intervento i) {
        if (Boolean.TRUE.equals(i.getEsitoMan()) && Boolean.TRUE.equals(i.getValidataMan())) {
            double importo = i.getTmpInt() != null
                    ? (i.getTmpInt() / 60.0) * TARIFFA_ORARIA_DEFAULT
                    : 0.0;
            InterventoCompletedEvent evt = new InterventoCompletedEvent(
                    i.getIntId(), i.getNomeRisorsaInt(), i.getTmpInt(),
                    Math.round(importo * 100.0) / 100.0);
            kafka.send(KafkaTopicsConfig.TOPIC_INTERVENTI_COMPLETED, i.getIntId(), evt);
        }
    }

    public LocalDate today() { return LocalDate.now(); }
}
