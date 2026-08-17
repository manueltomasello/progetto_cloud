package com.gestionale.manutenzioni.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Intervento di manutenzione. La chiave IntId e' una stringa nel formato
 * "INT-YY-NNNNN" generata a livello applicativo (come nel monolite).
 * I riferimenti a risorsa, cause_guasto, dipendenti e fornitori sono "soft"
 * perche' quelle entita' appartengono ad altri microservizi.
 */
@Entity
@Table(name = "interventi")
public class Intervento {

    @Id
    @Column(name = "IntId", length = 15)
    @JsonProperty("IntId")
    private String intId;

    @Column(name = "ManId", nullable = false)
    @JsonProperty("ManId")
    private Integer manId = 0;

    @Column(name = "DataIntPrev", nullable = false)
    @JsonProperty("DataIntPrev")
    private LocalDate dataIntPrev;

    @Column(name = "DataIntEff")
    @JsonProperty("DataIntEff")
    private LocalDate dataIntEff;

    @Column(name = "TmpInt")
    @JsonProperty("TmpInt")
    private Integer tmpInt;

    @Column(name = "OraInizio")
    @JsonProperty("OraInizio")
    private LocalTime oraInizio;

    @Column(name = "OraFine")
    @JsonProperty("OraFine")
    private LocalTime oraFine;

    @Column(name = "EsitoMan", nullable = false)
    @JsonProperty("EsitoMan")
    private Boolean esitoMan = false;

    @Column(name = "ValidataMan", nullable = false)
    @JsonProperty("ValidataMan")
    private Boolean validataMan = false;

    @Column(name = "noteIntervento", columnDefinition = "text")
    @JsonProperty("noteIntervento")
    private String noteIntervento;

    @Column(name = "TipoGuastoId")
    @JsonProperty("TipoGuastoId")
    private Integer tipoGuastoId;

    @Column(name = "OriginInt", nullable = false)
    @JsonProperty("OriginInt")
    private Integer originInt = 0;

    @Column(name = "NomeRisorsaInt", nullable = false)
    @JsonProperty("NomeRisorsaInt")
    private Integer nomeRisorsaInt;

    @ElementCollection
    @CollectionTable(name = "interventi_dipendenti",
            joinColumns = @JoinColumn(name = "IntId"))
    @Column(name = "IdDip")
    @JsonProperty("Dipendenti")
    private List<Integer> dipendenti = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "interventi_esterni",
            joinColumns = @JoinColumn(name = "IntId"))
    @Column(name = "IdFornitore")
    @JsonProperty("FornitoriEsterni")
    private List<String> fornitoriEsterni = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "interventi_articoli",
            joinColumns = @JoinColumn(name = "IntId"))
    @JsonProperty("ArticoliUsati")
    private List<ArticoloUsato> articoliUsati = new ArrayList<>();

    public String getIntId() { return intId; }
    public void setIntId(String intId) { this.intId = intId; }
    public Integer getManId() { return manId; }
    public void setManId(Integer manId) { this.manId = manId; }
    public LocalDate getDataIntPrev() { return dataIntPrev; }
    public void setDataIntPrev(LocalDate d) { this.dataIntPrev = d; }
    public LocalDate getDataIntEff() { return dataIntEff; }
    public void setDataIntEff(LocalDate d) { this.dataIntEff = d; }
    public Integer getTmpInt() { return tmpInt; }
    public void setTmpInt(Integer tmpInt) { this.tmpInt = tmpInt; }
    public LocalTime getOraInizio() { return oraInizio; }
    public void setOraInizio(LocalTime t) { this.oraInizio = t; }
    public LocalTime getOraFine() { return oraFine; }
    public void setOraFine(LocalTime t) { this.oraFine = t; }
    public Boolean getEsitoMan() { return esitoMan; }
    public void setEsitoMan(Boolean esitoMan) { this.esitoMan = esitoMan; }
    public Boolean getValidataMan() { return validataMan; }
    public void setValidataMan(Boolean validataMan) { this.validataMan = validataMan; }
    public String getNoteIntervento() { return noteIntervento; }
    public void setNoteIntervento(String n) { this.noteIntervento = n; }
    public Integer getTipoGuastoId() { return tipoGuastoId; }
    public void setTipoGuastoId(Integer tipoGuastoId) { this.tipoGuastoId = tipoGuastoId; }
    public Integer getOriginInt() { return originInt; }
    public void setOriginInt(Integer originInt) { this.originInt = originInt; }
    public Integer getNomeRisorsaInt() { return nomeRisorsaInt; }
    public void setNomeRisorsaInt(Integer nomeRisorsaInt) { this.nomeRisorsaInt = nomeRisorsaInt; }
    public List<Integer> getDipendenti() { return dipendenti; }
    public void setDipendenti(List<Integer> dipendenti) { this.dipendenti = dipendenti; }
    public List<String> getFornitoriEsterni() { return fornitoriEsterni; }
    public void setFornitoriEsterni(List<String> f) { this.fornitoriEsterni = f; }
    public List<ArticoloUsato> getArticoliUsati() { return articoliUsati; }
    public void setArticoliUsati(List<ArticoloUsato> a) { this.articoliUsati = a; }
}
