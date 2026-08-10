package com.gestionale.manutenzioni.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

/** Riga di consumo articolo su un intervento (junction interventi_articoli). */
@Embeddable
public class ArticoloUsato {
    @Column(name = "ArtId")
    private Integer artId;
    @Column(name = "qta")
    private Integer qta;

    public ArticoloUsato() {}
    public ArticoloUsato(Integer artId, Integer qta) { this.artId = artId; this.qta = qta; }
    public Integer getArtId() { return artId; }
    public void setArtId(Integer artId) { this.artId = artId; }
    public Integer getQta() { return qta; }
    public void setQta(Integer qta) { this.qta = qta; }
}
