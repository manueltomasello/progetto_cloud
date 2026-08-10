package com.gestionale.manutenzioni;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ManutenzioniServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(ManutenzioniServiceApplication.class, args);
    }
}
