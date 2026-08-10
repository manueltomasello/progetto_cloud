package com.gestionale.aiagent.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gestionale.aiagent.event.InterventoRequestedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

/**
 * Interroga un LLM (OpenAI-compatibile) per trasformare il testo di una email
 * nel payload strutturato di una richiesta di intervento.
 */
@Service
public class OpenAiService {

    private static final Logger log = LoggerFactory.getLogger(OpenAiService.class);
    private final ObjectMapper mapper = new ObjectMapper();
    private final RestClient http = RestClient.create();

    @Value("${ai-agent.openai.api-key:}")
    private String apiKey;
    @Value("${ai-agent.openai.model:gpt-4o-mini}")
    private String model;
    @Value("${ai-agent.openai.base-url:https://api.openai.com/v1}")
    private String baseUrl;

    public InterventoRequestedEvent interpretaEmail(String testoEmail) {
        String prompt = """
            Sei un assistente per un gestionale di manutenzioni industriali.
            Restituisci SOLO un JSON valido con questi campi:
            {"ManId": number, "NomeRisorsaInt": number, "DataIntPrev": "YYYY-MM-DD",
             "noteIntervento": string, "TipoGuastoId": number|null}
            Regole: se e' un singolo intervento usa ManId 0; se non sai la macchina usa NomeRisorsaInt 0;
            interpreta le date in formato YYYY-MM-DD; se guasto meccanico TipoGuastoId 8 altrimenti null.
            Email:
            """ + "\"" + testoEmail + "\"";

        Map<String, Object> body = Map.of(
                "model", model,
                "temperature", 0,
                "messages", List.of(
                        Map.of("role", "system", "content", "Rispondi SOLO con JSON valido."),
                        Map.of("role", "user", "content", prompt)));

        try {
            String resp = http.post()
                    .uri(baseUrl + "/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .body(body)
                    .retrieve()
                    .body(String.class);

            JsonNode root = mapper.readTree(resp);
            String content = root.at("/choices/0/message/content").asText();
            JsonNode json = mapper.readTree(estraiJson(content));

            InterventoRequestedEvent evt = new InterventoRequestedEvent();
            evt.setManId(json.path("ManId").asInt(0));
            evt.setNomeRisorsaInt(json.path("NomeRisorsaInt").asInt(0));
            evt.setDataIntPrev(json.path("DataIntPrev").asText(null));
            evt.setNoteIntervento(json.path("noteIntervento").asText(null));
            evt.setTipoGuastoId(json.hasNonNull("TipoGuastoId") ? json.get("TipoGuastoId").asInt() : null);
            evt.setOrigine("email-ai");
            return evt;
        } catch (Exception e) {
            log.error("Errore interpretazione email tramite LLM: {}", e.getMessage());
            return null;
        }
    }

    private String estraiJson(String content) {
        int a = content.indexOf('{');
        int b = content.lastIndexOf('}');
        return (a != -1 && b != -1 && b > a) ? content.substring(a, b + 1) : content;
    }
}
