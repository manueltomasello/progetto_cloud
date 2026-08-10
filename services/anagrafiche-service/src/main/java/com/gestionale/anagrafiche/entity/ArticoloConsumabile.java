package com.gestionale.anagrafiche.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "articoli_consumabili")
public class ArticoloConsumabile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Articolo")
    private Integer articolo;

    @Column(name = "NomeArt", nullable = false, length = 100)
    private String nomeArt;

    @Column(name = "DescArtBreve", columnDefinition = "text")
    private String descArtBreve;

    @Column(name = "DescArtLunga", columnDefinition = "text")
    private String descArtLunga;

    @Column(name = "Udm", nullable = false, length = 10)
    private String udm = "pezzi";

    @Column(name = "PrezzoStandard", nullable = false, precision = 10, scale = 2)
    private BigDecimal prezzoStandard = BigDecimal.ZERO;

    public Integer getArticolo() { return articolo; }
    public void setArticolo(Integer articolo) { this.articolo = articolo; }
    public String getNomeArt() { return nomeArt; }
    public void setNomeArt(String nomeArt) { this.nomeArt = nomeArt; }
    public String getDescArtBreve() { return descArtBreve; }
    public void setDescArtBreve(String v) { this.descArtBreve = v; }
    public String getDescArtLunga() { return descArtLunga; }
    public void setDescArtLunga(String v) { this.descArtLunga = v; }
    public String getUdm() { return udm; }
    public void setUdm(String udm) { this.udm = udm; }
    public BigDecimal getPrezzoStandard() { return prezzoStandard; }
    public void setPrezzoStandard(BigDecimal v) { this.prezzoStandard = v; }
}
