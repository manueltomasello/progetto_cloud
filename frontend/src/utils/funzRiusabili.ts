import * as XLSX from 'xlsx';

// Funzione per formattare una stringa data (ISO) in formato italiano (gg/mm/aaaa)
export function formatDate(dateStr: string): string {
    if (!dateStr) return ''; // Se la stringa è vuota, restituisce stringa vuota
    const date = new Date(dateStr); // Crea un oggetto Date dalla stringa
    return date.toLocaleDateString('it-IT'); // Ritorna la data in formato italiano
}

// Funzione per creare una sfumatura verticale tra due colori (utile per grafici)
export function sfumatura(color1: string, color2: string) {
    // Crea un contesto canvas 2D temporaneo
    const ctx = document.createElement('canvas').getContext('2d')
    if (!ctx) return color1 // Se non supportato, ritorna solo il primo colore
    
    // Crea una sfumatura lineare verticale da color1 a color2
    const sfumatura = ctx.createLinearGradient(0, 0, 0, 400)
    sfumatura.addColorStop(0, color1)
    sfumatura.addColorStop(1, color2)
    return sfumatura // Ritorna l'oggetto sfumatura da usare come colore
}

// Funzione per generare una palette di n colori diversi (in HSL)
export function generateColors(n: number): string[] {
    const step = 360 / n; // Divide il cerchio cromatico in n parti
    // Genera n colori equidistanti usando HSL
    return Array.from({ length: n }, (_, i) => `hsl(${step * i}, 80%, 60%)`);
}

// Funzione per esportare i dati visualizzati in una tabella Excel
// Il this si aspetta di essere il componente Vue che chiama la funzione
export function exportToExcel(this: any) {
    let worksheet;
    let sheetName;
    let fileName;

    // Sceglie quale dataset esportare in base alla consultazione selezionata
    if (this.selectedConsultation === "costoRisorsa") {
        worksheet = XLSX.utils.json_to_sheet(this.costoRisorse);
        sheetName = 'Costo Risorsa';
        fileName = 'costo_risorsa.xlsx';
    } else if (this.selectedConsultation === "storicoInterventi") {
        worksheet = XLSX.utils.json_to_sheet(this.storicoInterventi);
        sheetName = 'Storico Interventi';
        fileName = 'storico_interventi.xlsx';
    } else if (this.selectedConsultation === "storicoRicambi") {
        worksheet = XLSX.utils.json_to_sheet(this.storicoRicambi);
        sheetName = 'Storico Ricambi';
        fileName = 'storico_ricambi.xlsx';
    } else if (this.selectedConsultation === "consumoComponenti") {
        worksheet = XLSX.utils.json_to_sheet(this.consumoComponenti);
        sheetName = 'Consumo Componenti';
        fileName = 'consumo_componenti.xlsx';
    } else if (this.selectedConsultation === "oreLavorateDip") {
        worksheet = XLSX.utils.json_to_sheet(this.oreLavorateDip);
        sheetName = 'Ore Dipendenti';
        fileName = 'ore_dipendenti.xlsx';
    } else if (this.selectedConsultation === "oreLavorateRis") {
        worksheet = XLSX.utils.json_to_sheet(this.oreLavorateRis);
        sheetName = 'Ore Risorse';
        fileName = 'ore_risorse.xlsx';
    } else {
        // Se la consultazione non è riconosciuta, mostra errore e termina
        console.error('Consultazione non valida');
        return;
    }

    // Crea un nuovo workbook Excel
    const workbook = XLSX.utils.book_new();
    // Aggiunge il foglio dati al workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    // Salva il file Excel con il nome scelto
    XLSX.writeFile(workbook, fileName);
}