package com.gestionale.anagrafiche.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import java.math.BigDecimal;

/** Macchina/risorsa oggetto di manutenzione. La chiave e' assegnata dall'utente. */
@Entity
@Table(name = "risorsa")
public class Risorsa {
    @Id
    @Column(name = "NomeRisorsa")
    @JsonProperty("NomeRisorsa")
    private Integer nomeRisorsa;

    @Column(name = "ModMacc", nullable = false, length = 100)
    @JsonProperty("ModMacc")
    private String modMacc;

    @Column(name = "DescMacc", columnDefinition = "text")
    @JsonProperty("DescMacc")
    private String descMacc;

    @Column(name = "CostoOrarioFermo", nullable = false, precision = 10, scale = 2)
    @JsonProperty("CostoOrarioFermo")
    private BigDecimal costoOrarioFermo = BigDecimal.ZERO;

    public Integer getNomeRisorsa() { return nomeRisorsa; }
    public void setNomeRisorsa(Integer nomeRisorsa) { this.nomeRisorsa = nomeRisorsa; }
    public String getModMacc() { return modMacc; }
    public void setModMacc(String modMacc) { this.modMacc = modMacc; }
    public String getDescMacc() { return descMacc; }
    public void setDescMacc(String descMacc) { this.descMacc = descMacc; }
    public BigDecimal getCostoOrarioFermo() { return costoOrarioFermo; }
    public void setCostoOrarioFermo(BigDecimal v) { this.costoOrarioFermo = v; }
}
