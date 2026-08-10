package com.gestionale.anagrafiche;

import com.gestionale.anagrafiche.entity.*;
import com.gestionale.anagrafiche.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Popola le anagrafiche con dati di esempio al primo avvio, cosi' la demo ha
 * subito risorse, fornitori, articoli e causali di guasto su cui lavorare.
 * NB: gli ID delle risorse (101..104) sono richiamati come riferimenti "soft"
 * dagli interventi del manutenzioni-service.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final RisorsaRepository risorse;
    private final FornitoreRepository fornitori;
    private final ArticoloRepository articoli;
    private final CausaGuastoRepository guasti;

    public DataSeeder(RisorsaRepository risorse, FornitoreRepository fornitori,
                      ArticoloRepository articoli, CausaGuastoRepository guasti) {
        this.risorse = risorse;
        this.fornitori = fornitori;
        this.articoli = articoli;
        this.guasti = guasti;
    }

    @Override
    public void run(String... args) {
        seedGuasti();
        seedRisorse();
        seedFornitori();
        seedArticoli();
    }

    private void seedGuasti() {
        if (guasti.count() > 0) return;
        String[] causali = {
            "Usura normale", "Errore operatore", "Difetto di fabbrica",
            "Mancata manutenzione", "Sovraccarico", "Corto circuito",
            "Surriscaldamento", "Guasto meccanico"
        };
        for (String c : causali) {
            CausaGuasto g = new CausaGuasto();
            g.setDescrizione(c);
            guasti.save(g);
        }
    }

    private void seedRisorse() {
        if (risorse.count() > 0) return;
        creaRisorsa(101, "Tornio CNC Mazak QT-200", "Tornio a controllo numerico, reparto meccanica", "45.00");
        creaRisorsa(102, "Pressa idraulica Schuler 250t", "Pressa idraulica per stampaggio lamiera", "60.00");
        creaRisorsa(103, "Nastro trasportatore linea A", "Nastro di collegamento tra reparto 1 e 2", "20.00");
        creaRisorsa(104, "Compressore Atlas Copco GA30", "Compressore aria centrale", "35.00");
    }

    private void creaRisorsa(int id, String modello, String desc, String costo) {
        Risorsa r = new Risorsa();
        r.setNomeRisorsa(id);
        r.setModMacc(modello);
        r.setDescMacc(desc);
        r.setCostoOrarioFermo(new BigDecimal(costo));
        risorse.save(r);
    }

    private void seedFornitori() {
        if (fornitori.count() > 0) return;
        creaFornitore("F001", "Ricambi Rossi S.r.l.");
        creaFornitore("F002", "Tecno Service S.p.A.");
        creaFornitore("F003", "Elettromeccanica Bianchi");
    }

    private void creaFornitore(String id, String ragSoc) {
        Fornitore f = new Fornitore();
        f.setIdFornitore(id);
        f.setRagSoc(ragSoc);
        fornitori.save(f);
    }

    private void seedArticoli() {
        if (articoli.count() > 0) return;
        creaArticolo("Cuscinetto SKF 6205", "Cuscinetto a sfere", "pezzi", "12.50");
        creaArticolo("Cinghia trapezoidale A-42", "Cinghia di trasmissione", "pezzi", "8.90");
        creaArticolo("Olio idraulico ISO VG 46", "Olio per circuiti idraulici", "litri", "4.20");
        creaArticolo("Filtro aria compressore", "Elemento filtrante", "pezzi", "22.00");
        creaArticolo("Guarnizione OR 3200", "Guarnizione o-ring", "pezzi", "1.30");
    }

    private void creaArticolo(String nome, String desc, String udm, String prezzo) {
        ArticoloConsumabile a = new ArticoloConsumabile();
        a.setNomeArt(nome);
        a.setDescArtBreve(desc);
        a.setUdm(udm);
        a.setPrezzoStandard(new BigDecimal(prezzo));
        articoli.save(a);
    }
}
