package com.gestionale.fatturazione.kafka;

import com.gestionale.fatturazione.config.KafkaTopicsConfig;
import com.gestionale.fatturazione.entity.Fattura;
import com.gestionale.fatturazione.event.InterventoCompletedEvent;
import com.gestionale.fatturazione.repository.FatturaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Year;

/**
 * Alla ricezione di un intervento completato genera automaticamente una bozza
 * di fattura, evitando duplicati per lo stesso intervento (idempotenza).
 */
@Component
public class InterventoCompletedConsumer {

    private static final Logger log = LoggerFactory.getLogger(InterventoCompletedConsumer.class);
    private final FatturaRepository repo;

    public InterventoCompletedConsumer(FatturaRepository repo) { this.repo = repo; }

    @KafkaListener(topics = KafkaTopicsConfig.TOPIC_INTERVENTI_COMPLETED,
            groupId = "fatturazione-service")
    public void onInterventoCompleted(InterventoCompletedEvent evt) {
        if (evt.getIntId() == null) return;
        if (repo.existsByIntId(evt.getIntId())) {
            log.info("Fattura gia' presente per intervento {}, ignoro", evt.getIntId());
            return;
        }
        Fattura f = new Fattura();
        f.setNFatt(generaNumeroFattura());
        f.setIntId(evt.getIntId());
        f.setImpFatt(evt.getImportoStimato() != null
                ? BigDecimal.valueOf(evt.getImportoStimato()) : BigDecimal.ZERO);
        f.setNoteFatt("Bozza generata automaticamente dall'intervento " + evt.getIntId());
        repo.save(f);
        log.info("Creata bozza fattura {} per intervento {} (importo {})",
                f.getNFatt(), f.getIntId(), f.getImpFatt());
    }

    private synchronized String generaNumeroFattura() {
        String prefix = "FATT-" + Year.now().getValue() + "-";
        long seq = repo.countByPrefix(prefix) + 1;
        return prefix + String.format("%05d", seq);
    }
}
