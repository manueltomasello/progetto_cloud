package com.gestionale.anagrafiche.entity;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.*;

@Entity
@Table(name = "cause_guasto")
public class CausaGuasto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdGuasto")
    @JsonProperty("IdGuasto")
    private Integer idGuasto;

    @Column(name = "Descrizione", nullable = false, length = 255)
    @JsonProperty("Descrizione")
    private String descrizione;

    public Integer getIdGuasto() { return idGuasto; }
    public void setIdGuasto(Integer idGuasto) { this.idGuasto = idGuasto; }
    public String getDescrizione() { return descrizione; }
    public void setDescrizione(String descrizione) { this.descrizione = descrizione; }
}
