package com.gestionale.auth.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

/**
 * Anagrafica operatore/dipendente. Corrisponde alla tabella "operatore" del
 * monolite originale; e' di proprieta' esclusiva dell'auth-service.
 */
@Entity
@Table(name = "operatore",
       uniqueConstraints = @UniqueConstraint(name = "uq_operatore_username", columnNames = "username"))
public class Operatore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdDip")
    private Integer idDip;

    @Column(name = "Matricola", nullable = false)
    private Integer matricola;

    @Column(name = "NomeDip", nullable = false, length = 100)
    private String nomeDip;

    @Column(name = "CognDip", nullable = false, length = 100)
    private String cognDip;

    @Column(name = "EmailDip", length = 150)
    private String emailDip;

    // Non viene mai serializzato verso il client
    @JsonIgnore
    @Column(name = "PassDip", nullable = false, length = 255)
    private String passDip;

    @Column(name = "CostoOrario", nullable = false, precision = 10, scale = 2)
    private BigDecimal costoOrario = BigDecimal.ZERO;

    @Column(name = "ruolo", nullable = false, length = 10)
    private String ruolo = "user";

    @Column(name = "username", nullable = false, length = 50)
    private String username;

    @Column(name = "abilitato", nullable = false)
    private Integer abilitato = 1;

    public Integer getIdDip() { return idDip; }
    public void setIdDip(Integer idDip) { this.idDip = idDip; }
    public Integer getMatricola() { return matricola; }
    public void setMatricola(Integer matricola) { this.matricola = matricola; }
    public String getNomeDip() { return nomeDip; }
    public void setNomeDip(String nomeDip) { this.nomeDip = nomeDip; }
    public String getCognDip() { return cognDip; }
    public void setCognDip(String cognDip) { this.cognDip = cognDip; }
    public String getEmailDip() { return emailDip; }
    public void setEmailDip(String emailDip) { this.emailDip = emailDip; }
    public String getPassDip() { return passDip; }
    public void setPassDip(String passDip) { this.passDip = passDip; }
    public BigDecimal getCostoOrario() { return costoOrario; }
    public void setCostoOrario(BigDecimal costoOrario) { this.costoOrario = costoOrario; }
    public String getRuolo() { return ruolo; }
    public void setRuolo(String ruolo) { this.ruolo = ruolo; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public Integer getAbilitato() { return abilitato; }
    public void setAbilitato(Integer abilitato) { this.abilitato = abilitato; }
}
