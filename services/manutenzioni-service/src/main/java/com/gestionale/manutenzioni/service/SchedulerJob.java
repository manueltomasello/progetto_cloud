package com.gestionale.manutenzioni.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Riproduce il job cron delle 4:00 del monolite. */
@Component
public class SchedulerJob {

    private static final Logger log = LoggerFactory.getLogger(SchedulerJob.class);
    private final HomeService homeService;

    public SchedulerJob(HomeService homeService) { this.homeService = homeService; }

    @Scheduled(cron = "0 0 4 * * *")
    public void generaInterventiGiornalieri() {
        int n = homeService.generaInterventiProgrammabili().size();
        log.info("Generati {} interventi automatici alle 4:00", n);
    }
}
