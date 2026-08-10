package com.gestionale.aiagent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Microservizio "AI Agent". E' pensato per essere deployato in cloud in modo
 * indipendente: legge le richieste di manutenzione (via email interpretata da
 * un LLM oppure via API REST) e le pubblica sul broker Kafka come eventi
 * "interventi.requested", che il manutenzioni-service consuma.
 */
@SpringBootApplication
@EnableScheduling
public class AiAgentServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AiAgentServiceApplication.class, args);
    }
}
