package com.gestionale.fatturazione.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "fatture")
public class Fattura {
    @Id
    @Column(name = "NFatt", length = 50)
    @JsonProperty("NFatt")
    private String nFatt;

    // Riferimento "soft" all'intervento (di proprieta' di manutenzioni-service)
    @Column(name = "IntId", nullable = false, length = 15)
    @JsonProperty("IntId")
    private String intId;

    @Column(name = "ImpFatt", nullable = false, precision = 10, scale = 2)
    @JsonProperty("ImpFatt")
    private BigDecimal impFatt = BigDecimal.ZERO;

    @Column(name = "NoteFatt", columnDefinition = "text")
    @JsonProperty("NoteFatt")
    private String noteFatt;

    public String getNFatt() { return nFatt; }
    public void setNFatt(String nFatt) { this.nFatt = nFatt; }
    public String getIntId() { return intId; }
    public void setIntId(String intId) { this.intId = intId; }
    public BigDecimal getImpFatt() { return impFatt; }
    public void setImpFatt(BigDecimal impFatt) { this.impFatt = impFatt; }
    public String getNoteFatt() { return noteFatt; }
    public void setNoteFatt(String noteFatt) { this.noteFatt = noteFatt; }
}
