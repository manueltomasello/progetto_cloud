package com.gestionale.manutenzioni.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "manutenzioni")
public class Manutenzione {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ManId")
    @JsonProperty("ManId")
    private Integer manId;

    // Riferimento "soft" alla risorsa (di proprieta' di anagrafiche-service)
    @Column(name = "MaccIdMan", nullable = false)
    @JsonProperty("MaccIdMan")
    private Integer maccIdMan;

    @Column(name = "Tipo", nullable = false, length = 20)
    @JsonProperty("Tipo")
    private String tipo;

    @Column(name = "FreqGiorni")
    @JsonProperty("FreqGiorni")
    private Integer freqGiorni;

    @Column(name = "DescMan", columnDefinition = "text")
    @JsonProperty("DescMan")
    private String descMan;

    @Column(name = "noteMan", columnDefinition = "text")
    @JsonProperty("noteMan")
    private String noteMan;

    @Column(name = "DataInserimento", nullable = false)
    @JsonProperty("DataInserimento")
    private LocalDate dataInserimento = LocalDate.now();

    @Column(name = "DurataSTAT", nullable = false)
    @JsonProperty("DurataSTAT")
    private Integer durataSTAT = 0;

    public Integer getManId() { return manId; }
    public void setManId(Integer manId) { this.manId = manId; }
    public Integer getMaccIdMan() { return maccIdMan; }
    public void setMaccIdMan(Integer maccIdMan) { this.maccIdMan = maccIdMan; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public Integer getFreqGiorni() { return freqGiorni; }
    public void setFreqGiorni(Integer freqGiorni) { this.freqGiorni = freqGiorni; }
    public String getDescMan() { return descMan; }
    public void setDescMan(String descMan) { this.descMan = descMan; }
    public String getNoteMan() { return noteMan; }
    public void setNoteMan(String noteMan) { this.noteMan = noteMan; }
    public LocalDate getDataInserimento() { return dataInserimento; }
    public void setDataInserimento(LocalDate d) { this.dataInserimento = d; }
    public Integer getDurataSTAT() { return durataSTAT; }
    public void setDurataSTAT(Integer durataSTAT) { this.durataSTAT = durataSTAT; }
}
