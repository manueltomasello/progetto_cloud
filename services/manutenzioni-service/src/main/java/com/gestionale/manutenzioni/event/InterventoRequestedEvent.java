package com.gestionale.manutenzioni.event;

import java.util.List;

/**
 * Evento in ingresso dal topic "interventi.requested": una richiesta di
 * intervento generata dall'ai-agent-service a partire da una email interpretata
 * dall'LLM. Il manutenzioni-service la consuma e crea l'intervento.
 */
public class InterventoRequestedEvent {
    private Integer manId;
    private Integer nomeRisorsaInt;
    private String dataIntPrev;      // ISO yyyy-MM-dd
    private String noteIntervento;
    private Integer tipoGuastoId;
    private List<Integer> dipendenti;
    private List<String> fornitoriEsterni;
    private String origine;          // es. "email-ai"

    public Integer getManId() { return manId; }
    public void setManId(Integer manId) { this.manId = manId; }
    public Integer getNomeRisorsaInt() { return nomeRisorsaInt; }
    public void setNomeRisorsaInt(Integer v) { this.nomeRisorsaInt = v; }
    public String getDataIntPrev() { return dataIntPrev; }
    public void setDataIntPrev(String v) { this.dataIntPrev = v; }
    public String getNoteIntervento() { return noteIntervento; }
    public void setNoteIntervento(String v) { this.noteIntervento = v; }
    public Integer getTipoGuastoId() { return tipoGuastoId; }
    public void setTipoGuastoId(Integer v) { this.tipoGuastoId = v; }
    public List<Integer> getDipendenti() { return dipendenti; }
    public void setDipendenti(List<Integer> v) { this.dipendenti = v; }
    public List<String> getFornitoriEsterni() { return fornitoriEsterni; }
    public void setFornitoriEsterni(List<String> v) { this.fornitoriEsterni = v; }
    public String getOrigine() { return origine; }
    public void setOrigine(String origine) { this.origine = origine; }
}
