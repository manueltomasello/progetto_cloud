import {jsPDF} from 'jspdf'
import { Intervento } from '../types';
import {PDFInt} from '../types'
import { formatDate } from './funzRiusabili'
// report
export async function InterventoPDF(intervento: Intervento, data: PDFInt): Promise<void> {
    if (!intervento) {
      console.error('Nessun intervento fornito per la stampa PDF');
      return;
    }
  
    const doc = new jsPDF();
    let y = 10; // Posizione verticale iniziale
    const imgUrl = '/img/salReport.jpg'; 
    const imgWidth = 45; // Larghezza
    const imgHeight = 18; // Altezza
    try { 
       doc.addImage(imgUrl, 'PNG', 10, y, imgWidth, imgHeight); 
    } catch (error) {
      console.error("Errore nel caricamento o nell'aggiunta dell'immagine:", error);
      doc.text('Logo non disponibile', 10, y + imgHeight / 2);
    }
  
    // Titolo
    doc.setFontSize(18);
    doc.text(`Dettagli Intervento: ${intervento.IntId}`, 105, y + imgHeight / 2, { align: 'center' });
    y += Math.max(imgHeight, 20) + 10; // Spazio dopo logo/titolo
  
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0); // Colore testo nero
     // Dettagli Base
    doc.setFontSize(14);
    doc.text(`Origine: ${intervento.OriginInt === 1 ? 'Intervento generato dal sistema' : 'Intervento generato dall\'operatore'}`, 10, y);
    y += 10;
  
    doc.setFontSize(12);
    doc.text(`Data Prevista: ${formatDate(intervento.DataIntPrev)}`, 10, y);
    y += 7;
    doc.text(`Data Effettiva: ${intervento.DataIntEff ? formatDate(intervento.DataIntEff) : 'N/A'}`, 10, y);
    y += 10;
  
    // Recupera manutenzione e risorsa associate se presenti
    const ManutenzioneAssociata = data.manutenzioni.find(m => m.ManId === intervento.ManId);
    const RisorsaManAssociata = data.risorse.find(r => r.NomeRisorsa === ManutenzioneAssociata?.MaccIdMan);
    const RisorsaIntAssociata = data.risorse.find(r => r.NomeRisorsa === intervento.NomeRisorsaInt);
  
  
    if (intervento.ManId !== 0 && ManutenzioneAssociata) {
        const tempoPrevisto = ManutenzioneAssociata.DurataSTAT || 0;
        doc.text(`Tempo Previsto (statistico): ${tempoPrevisto} ore`, 10, y);
    } else {
        const tempoImpiegato = intervento.TmpInt || 0;
        doc.text(`Tempo Impiegato: ${tempoImpiegato} ore`, 10, y);
    }
    y += 7;
    doc.text(`Esito: ${intervento.EsitoMan ? 'Positivo ' : 'Negativo '}`, 10, y);
    y += 10;
  
    // Dettagli Risorsa/Manutenzione
    doc.setFontSize(14);
    if (intervento.ManId !== 0 && ManutenzioneAssociata) {
      doc.text('Manutenzione Effettuata:', 10, y);
      y += 7;
      doc.setFontSize(12);
      doc.text(`${ManutenzioneAssociata.DescMan || 'N/A'}`, 10, y);
      y += 7;
      doc.text(`- Risorsa: ${RisorsaManAssociata?.ModMacc || 'N/A'} (ID: ${ManutenzioneAssociata.MaccIdMan || 'N/A'})`, 10, y);
      y += 10;
    } else if (RisorsaIntAssociata) {
      doc.text('Associato a Risorsa:', 10, y);
      y += 7;
      doc.setFontSize(12);
      doc.text(`- Risorsa: ${intervento.NomeRisorsaInt || 'N/A'}(  ${RisorsaIntAssociata.ModMacc || 'N/A'})`, 10, y);
      y += 10;
    } else {
       doc.text('Nessuna Manutenzione o Risorsa Associata', 10, y);
       y += 10;
    }
  
  
    // Note
    doc.setFontSize(14);
    doc.text('Note Intervento:', 10, y);
    y += 7;
    doc.setFontSize(12);
    const notes = doc.splitTextToSize(intervento.noteIntervento || 'Nessuna nota.', 180);
    doc.text(notes, 10, y);
    y += (notes.length * 7) + 3;
  
    // Tipo Guasto
    doc.setFontSize(14);
    doc.text('Tipo Guasto:', 10, y);
    y += 7;
    doc.setFontSize(12);
    const tipoGuasto = data.causeGuasto.find(g => g.IdGuasto === intervento.TipoGuastoId);
    doc.text(tipoGuasto ? tipoGuasto.Descrizione : 'Nessun guasto specificato', 10, y);
    y += 10;
  
    // Dipendenti Coinvolti
    doc.setFontSize(14);
    doc.text('Operatori Coinvolti:', 10, y);
    y += 7;
    doc.setFontSize(12);
    if (intervento.Dipendenti && intervento.Dipendenti.length > 0) {
      intervento.Dipendenti.forEach(dipId => {
        const dip = data.dipendenti.find(d => d.IdDip === dipId);
        doc.text(`- ${dip ? `${dip.NomeDip} ${dip.CognDip}` : `ID Sconosciuto (${dipId})`}`, 10, y);
        y += 7;
      });
    } else {
      doc.text('- Nessun dipendente specificato.', 10, y);
      y += 7;
    }
    y += 3;
  
    // Fornitori Esterni Coinvolti
    doc.setFontSize(14);
    doc.text('Fornitori Esterni:', 10, y);
    y += 7;
    doc.setFontSize(12);
    if (intervento.FornitoriEsterni && intervento.FornitoriEsterni.length > 0) {
      intervento.FornitoriEsterni.forEach(fornId => {
        const forn = data.fornitori.find(f => f.IdFornitore === fornId);
        doc.text(`- ${forn ? forn.RagSoc : `ID Sconosciuto (${fornId})`}`, 10, y);
        y += 7;
      });
    } else {
      doc.text('- Nessun fornitore specificato.', 10, y);
      y += 7;
    }
    y += 3;
  
    // Articoli Usati
    doc.setFontSize(14);
    doc.text('Articoli Impiegati:', 10, y);
    y += 7;
    doc.setFontSize(12);
    if (intervento.ArticoliUsati && intervento.ArticoliUsati.length > 0) {
      intervento.ArticoliUsati.forEach(item => {
        const articolo = data.articoli.find(a => a.Articolo === item.ArtId);
        doc.text(`- ${articolo ? articolo.NomeArt : `ID Sconosciuto (${item.ArtId})`}: Qta ${item.qta} ${articolo?.Udm || ''}`, 10, y);
        y += 7;
      });
    } else {
      doc.text('- Nessun articolo impiegato.', 10, y);
      y += 7;
    }
    y += 3;
  
    doc.save(`intervento_${intervento.IntId}.pdf`);
  }