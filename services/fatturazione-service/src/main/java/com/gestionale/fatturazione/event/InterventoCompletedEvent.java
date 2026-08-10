package com.gestionale.fatturazione.event;

/** Copia locale dell'evento consumato dal topic "interventi.completed". */
public class InterventoCompletedEvent {
    private String intId;
    private Integer nomeRisorsaInt;
    private Integer tmpInt;
    private Double importoStimato;

    public String getIntId() { return intId; }
    public void setIntId(String intId) { this.intId = intId; }
    public Integer getNomeRisorsaInt() { return nomeRisorsaInt; }
    public void setNomeRisorsaInt(Integer v) { this.nomeRisorsaInt = v; }
    public Integer getTmpInt() { return tmpInt; }
    public void setTmpInt(Integer tmpInt) { this.tmpInt = tmpInt; }
    public Double getImportoStimato() { return importoStimato; }
    public void setImportoStimato(Double v) { this.importoStimato = v; }
}
