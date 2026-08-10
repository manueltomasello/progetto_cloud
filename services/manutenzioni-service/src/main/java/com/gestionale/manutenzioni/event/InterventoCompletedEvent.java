package com.gestionale.manutenzioni.event;

/**
 * Evento pubblicato sul topic "interventi.completed" quando un intervento
 * viene validato con esito positivo. Il fatturazione-service lo consuma per
 * generare una bozza di fattura.
 */
public class InterventoCompletedEvent {
    private String intId;
    private Integer nomeRisorsaInt;
    private Integer tmpInt;            // minuti
    private Double importoStimato;

    public InterventoCompletedEvent() {}
    public InterventoCompletedEvent(String intId, Integer nomeRisorsaInt, Integer tmpInt, Double importoStimato) {
        this.intId = intId;
        this.nomeRisorsaInt = nomeRisorsaInt;
        this.tmpInt = tmpInt;
        this.importoStimato = importoStimato;
    }
    public String getIntId() { return intId; }
    public void setIntId(String intId) { this.intId = intId; }
    public Integer getNomeRisorsaInt() { return nomeRisorsaInt; }
    public void setNomeRisorsaInt(Integer v) { this.nomeRisorsaInt = v; }
    public Integer getTmpInt() { return tmpInt; }
    public void setTmpInt(Integer tmpInt) { this.tmpInt = tmpInt; }
    public Double getImportoStimato() { return importoStimato; }
    public void setImportoStimato(Double v) { this.importoStimato = v; }
}
