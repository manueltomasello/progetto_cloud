package com.gestionale.anagrafiche.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "fornitore")
public class Fornitore {
    @Id
    @Column(name = "IdFornitore", length = 5)
    private String idFornitore;

    @Column(name = "RagSoc", nullable = false, length = 100)
    private String ragSoc;

    public String getIdFornitore() { return idFornitore; }
    public void setIdFornitore(String idFornitore) { this.idFornitore = idFornitore; }
    public String getRagSoc() { return ragSoc; }
    public void setRagSoc(String ragSoc) { this.ragSoc = ragSoc; }
}
