package com.gestionale.aiagent.job;

import com.gestionale.aiagent.event.InterventoRequestedEvent;
import com.gestionale.aiagent.kafka.InterventoProducer;
import com.gestionale.aiagent.service.OpenAiService;
import jakarta.mail.*;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.search.FlagTerm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Properties;

/**
 * Job periodico che legge le email non lette dalla casella configurata, le fa
 * interpretare all'LLM e pubblica la richiesta di intervento su Kafka.
 * Disabilitato di default (ai-agent.email.enabled=false): si abilita fornendo
 * le credenziali IMAP e la API key dell'LLM.
 */
@Component
public class EmailAgentJob {

    private static final Logger log = LoggerFactory.getLogger(EmailAgentJob.class);

    private final OpenAiService openAi;
    private final InterventoProducer producer;

    @Value("${ai-agent.email.enabled:false}")
    private boolean enabled;
    @Value("${ai-agent.email.host:}")
    private String host;
    @Value("${ai-agent.email.port:993}")
    private int port;
    @Value("${ai-agent.email.user:}")
    private String user;
    @Value("${ai-agent.email.password:}")
    private String password;

    public EmailAgentJob(OpenAiService openAi, InterventoProducer producer) {
        this.openAi = openAi;
        this.producer = producer;
    }

    @Scheduled(fixedDelayString = "${ai-agent.email.poll-ms:120000}")
    public void leggiEmail() {
        if (!enabled) return;
        try {
            Properties props = new Properties();
            props.put("mail.store.protocol", "imaps");
            Session session = Session.getInstance(props);
            Store store = session.getStore("imaps");
            store.connect(host, port, user, password);

            Folder inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_WRITE);
            Message[] messages = inbox.search(new FlagTerm(new Flags(Flags.Flag.SEEN), false));
            log.info("Email non lette trovate: {}", messages.length);

            for (Message m : messages) {
                String testo = estraiTesto((MimeMessage) m);
                InterventoRequestedEvent evt = openAi.interpretaEmail(testo);
                if (evt != null) {
                    producer.publish(evt);
                    m.setFlag(Flags.Flag.SEEN, true);
                }
            }
            inbox.close(false);
            store.close();
        } catch (Exception e) {
            log.error("Errore nel job email: {}", e.getMessage());
        }
    }

    private String estraiTesto(MimeMessage m) throws Exception {
        Object content = m.getContent();
        if (content instanceof String s) return s;
        if (content instanceof Multipart mp) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < mp.getCount(); i++) {
                Object part = mp.getBodyPart(i).getContent();
                if (part instanceof String s) sb.append(s);
            }
            return sb.toString();
        }
        return String.valueOf(content);
    }
}
