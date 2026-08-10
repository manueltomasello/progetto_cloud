package com.gestionale.aiagent.kafka;

import com.gestionale.aiagent.event.InterventoRequestedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class InterventoProducer {

    public static final String TOPIC_INTERVENTI_REQUESTED = "interventi.requested";
    private static final Logger log = LoggerFactory.getLogger(InterventoProducer.class);

    private final KafkaTemplate<String, Object> kafka;

    public InterventoProducer(KafkaTemplate<String, Object> kafka) { this.kafka = kafka; }

    public void publish(InterventoRequestedEvent evt) {
        kafka.send(TOPIC_INTERVENTI_REQUESTED, evt);
        log.info("Pubblicata richiesta intervento (origine={}, risorsa={}) su {}",
                evt.getOrigine(), evt.getNomeRisorsaInt(), TOPIC_INTERVENTI_REQUESTED);
    }
}
