package com.gestionale.aiagent.dto;

import java.util.List;

/** Body accettato da /api/CreaInterventoAI (compatibile con il monolite). */
public class CreaInterventoAiRequest {
    public Integer ManId;
    public Integer NomeRisorsaInt;
    public String DataIntPrev;
    public String DataIntEff;
    public Integer TmpInt;
    public Boolean EsitoMan;
    public String noteIntervento;
    public Integer TipoGuastoId;
    public List<Integer> Dipendenti;
    public List<String> FornitoriEsterni;
    public List<Object> ArticoliUsati;
}
