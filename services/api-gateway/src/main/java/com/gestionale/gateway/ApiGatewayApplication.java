package com.gestionale.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto di ingresso unico del sistema a microservizi.
 * Tutte le chiamate del frontend (path /api/**) transitano da qui e vengono
 * instradate al microservizio competente in base al path.
 */
@SpringBootApplication
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
