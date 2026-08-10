package com.gestionale.manutenzioni.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicsConfig {

    public static final String TOPIC_INTERVENTI_REQUESTED = "interventi.requested";
    public static final String TOPIC_INTERVENTI_COMPLETED = "interventi.completed";

    @Bean
    public NewTopic interventiRequestedTopic() {
        return TopicBuilder.name(TOPIC_INTERVENTI_REQUESTED).partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic interventiCompletedTopic() {
        return TopicBuilder.name(TOPIC_INTERVENTI_COMPLETED).partitions(1).replicas(1).build();
    }
}
