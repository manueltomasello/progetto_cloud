// Articoli consumabili----------------------------------------------------------
export interface Articolo {
  Articolo?: number;
  NomeArt: string;
  DescArtBreve?: string;
  DescArtLunga?: string;
  Udm: 'pezzi' | 'litri' | 'kg' | 'metri' | 'altro';
  PrezzoStandard: number;
}

//Dipendente---------------------------------------------------------------------
export interface Dipendente {
  IdDip: number;
  Matricola: number;      
  NomeDip: string;        
  CognDip: string;        
  EmailDip?: string;      
  PassDip: string;        
  CostoOrario: number;
  username: string;
  ruolo: 'admin' | 'user';
  abilitato: number;   
}

//Consultazioni---------------------------------------------------------------------
export interface CostoRisorsa {
  NomeRisorsa: string;
  ModMacc: string;
  CostoTotale: number;
}
export interface StoricoRicambi {
  InterventoID: number;
  Articolo: string;
  DescrizioneArticolo: string;
  Quantita: number;
  Unità: string;
  ArticoloID: number;
}
export interface StoricoInterventi {
  InterventoID: number;
  Risorsa: string;
  Modello: string;
  DataPianificata: string; 
  DataEffettiva?: string;            
  TempoEseguito: string;   
  OperatoreCoinvolto?: string;
  AziendaCoinvolta?: string;
  EsitoManutenzione?: string;
  TipoGuasto: string;
  TipoGuastoId: number;
  importo: number;
}
export interface ConsumoComponenti {
  quantitaConsumata: number;
  NomeArt: string;
  descArtBreve: string;
}
export interface OreLavorateDip {
  IdDip: number,
  Matricola: number;
  NomeDip: string;
  CognDip: string;
  OreLavorate: number; 
}
export interface OreLavorateRis {
  Risorsa: number;
  Modello: string;
  OreLavorate: number; 
}
export interface delayOperativo{
  percentualeRitardo: number;
  PercentualePuntualita: number;
}
//Manutenzioni---------------------------------------------------
export interface Manutenzione{
  ManId: number;
  MaccIdMan: number;
  Tipo: 'Conduzione' | 'Guasto' | 'Miglioramento' | 'Preventiva' | 'Uscita Esterna';
  FreqGiorni?: number;
  DescMan?: string;
  noteMan?: string;
  DataInserimento: string;
  DurataSTAT: number;
}
//Fornitori-----------------------------------------------
export interface Fornitore{
  IdFornitore: string;
   RagSoc: string;
}
//Risorsa--------------------------------------------------
export interface Risorsa{
  NomeRisorsa: number;
  ModMacc: string;
  DescMacc: string;
  CostoOrarioFermo: number;
}
export interface Fattura{
  NFatt: string;
  IntId: string;
  ImpFatt: number;
  NoteFatt:string;
}
//Intervento----------------------------------------
export interface CauseGuasto{
  IdGuasto: number;
  Descrizione: string;

}
export interface ArticoloUsato {
  ArtId: number ;
  qta: number;

}
export interface DipedenteCoinvolto{
  IntId: string,
  IdDip: number,
}
export interface FornitoreEsterno {
  IntId: string;
  IdFornitore: string;
}
export interface Intervento {
  IntId: string;
  ManId: number;
  NomeRisorsaInt: number;
  DataIntPrev: string; 
  DataIntEff?: string;
  TmpInt: number;    
  EsitoMan: boolean; 
  noteIntervento?: string; 
  TipoGuastoId?: number | null;
  OriginInt?: number;
  Dipendenti: number[]; 
  FornitoriEsterni: string[]; 
  ArticoliUsati: ArticoloUsato[];
}
//------------------------------------------------------
export interface InterventoCalendario {
  IntId: string;
  ManId: number;
  DataIntPrev: string;
  OraInizio?: string;
  OraFine?: string;
  DescMan?: string;  
  ModMacc: string;
 noteIntervento?: string;
 NomeRisorsaInt: number;
 OriginInt?: number;
}
export interface InterventiXstatNotValidate{
  IntId: string;
  RagSoc: string;
}
export interface InterventiXstatRetard{
  IntId: string;
  DataIntPrev: string;
  risorsa: number
  noteIntervento: string;
}
export interface NuovoInterventoInfo {
  ManId: number; 
  IntId: number; 
  DataSchedulata: string; 
  TipoCreazione: 'DataInserimento' | 'ProssimaData'; 
}
//reportistica-----------------------------------------------
export interface PDFInt {
  manutenzioni: Manutenzione[];
  risorse: Risorsa[];
  causeGuasto: CauseGuasto[];
  dipendenti: Dipendente[];
  fornitori: Fornitore[];
  articoli: Articolo[];
}