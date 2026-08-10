package com.gestionale.auth.config;

import com.gestionale.auth.entity.Operatore;
import com.gestionale.auth.repository.OperatoreRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Crea l'utente amministratore e alcuni dipendenti di esempio al primo avvio.
 * Gli ID generati (1=admin, 2=Mario Rossi, 3=Luca Bianchi, 4=Giulia Verdi)
 * sono richiamati come riferimenti "soft" dagli interventi.
 * Tutte le password di esempio valgono "admin123".
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final OperatoreRepository repo;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public DataSeeder(OperatoreRepository repo) {
        this.repo = repo;
    }

    @Override
    public void run(String... args) {
        if (repo.count() > 0) return;
        crea(1001, "Amministratore", "Sistema", "admin@gestionale.local", "admin", "admin", "0.00");
        crea(1002, "Mario", "Rossi", "m.rossi@gestionale.local", "mrossi", "user", "28.00");
        crea(1003, "Luca", "Bianchi", "l.bianchi@gestionale.local", "lbianchi", "user", "26.50");
        crea(1004, "Giulia", "Verdi", "g.verdi@gestionale.local", "gverdi", "admin", "32.00");
    }

    private void crea(int matricola, String nome, String cogn, String email,
                      String username, String ruolo, String costo) {
        Operatore o = new Operatore();
        o.setMatricola(matricola);
        o.setNomeDip(nome);
        o.setCognDip(cogn);
        o.setEmailDip(email);
        o.setUsername(username);
        o.setRuolo(ruolo);
        o.setPassDip(encoder.encode("admin123"));
        o.setCostoOrario(new BigDecimal(costo));
        o.setAbilitato(1);
        repo.save(o);
    }
}
