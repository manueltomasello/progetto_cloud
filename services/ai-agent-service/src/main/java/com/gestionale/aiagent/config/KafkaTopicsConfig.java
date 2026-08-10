package com.gestionale.aiagent.config;

import com.gestionale.aiagent.kafka.InterventoProducer;
import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicsConfig {
    @Bean
    public NewTopic interventiRequestedTopic() {
        return TopicBuilder.name(InterventoProducer.TOPIC_INTERVENTI_REQUESTED)
                .partitions(1).replicas(1).build();
    }
}
