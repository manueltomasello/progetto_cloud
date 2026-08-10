<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import Multiselect from 'vue-multiselect';
import { Intervento, Dipendente, Fornitore, Articolo, CauseGuasto, ArticoloUsato, Manutenzione} from '../types';
import { Risorsa } from '../types';
import '../style.css';
import { formatDate } from '../utils/funzRiusabili';
import { InterventoPDF } from '../utils/reportInt';

export default defineComponent({
  components: { Multiselect },
  props: {
    // Permette di ricevere un id di intervento come prop per la selezione diretta
    id: {
      type: String,
      default: null
    }
  },
  data() {
    return {
      // Array che conterranno i dati caricati dal backend
      interventi: [] as Intervento[],
      causeGuasto: [] as CauseGuasto[],
      dipendenti: [] as Dipendente[],
      fornitori: [] as Fornitore[],
      articoli: [] as Articolo[],
      manutenzioni: [] as Manutenzione[],
      Risorse: [] as Risorsa[],
      // Variabili di stato per la selezione e il form
      selectedManutenzione: null as Manutenzione | null,
      selectedIntervento: null as Intervento | null,
      selectedRisorsa: null as Risorsa | null,
      isInitialDataLoaded: false, // Flag per sapere se i dati sono caricati (utile per la watch su id)
      // Stato del form per creare/modificare un intervento
      form: {
        ManId: 0,
        DataIntPrev: '',
        DataIntEff: '',
        TmpInt: 0,
        EsitoMan: false,
        NomeRisorsaInt: 0,
        noteIntervento: '',
        TipoGuastoId: null as number | null,
        OriginInt: 0,
        Dipendenti: [] as number[],
        FornitoriEsterni: [] as string[],
        ArticoliUsati: [] as ArticoloUsato[],
      } as Omit<Intervento, 'IntId'>,
      // Selezioni multiple per i multiselect
      selectedDipendenti: [] as Dipendente[],
      selectedFornitori: [] as Fornitore[],
      // Messaggi di stato per l'utente
      errorMessage: '',
      successMessage: '',
      // Variabili per la paginazione della tabella
      currentPage: 1,      
      perPage: 20,
    };
  },
  computed: {
    // Calcola il numero totale di pagine per la paginazione
    totalPages(): number {
      return Math.ceil(this.interventi.length / this.perPage); 
    },
    // Restituisce solo gli interventi della pagina corrente
    InterventiPaginati(): Intervento[] {
      const start = (this.currentPage - 1) * this.perPage;
      return this.interventi.slice(start, start + this.perPage); 
    },
    // Restituisce la risorsa associata all'intervento selezionato (se presente)
    currentResource(): Risorsa | undefined {
      if (!this.selectedIntervento) return undefined;
      const manut = this.manutenzioni.find(m => m.ManId === this.selectedIntervento!.ManId);
      return this.Risorse.find(r => r.NomeRisorsa === manut?.MaccIdMan);
    }
  },
  methods: {
    // Carica tutti gli interventi dal backend
    fetchInterventi() {
      axios.get('/api/VisualizzaInterventi')
        .then(response => {
          // Formatto le date per evitare problemi di visualizzazione
          this.interventi = response.data.map((i: Intervento) => ({
            ...i,
            DataIntPrev: i.DataIntPrev.split('T')[0] || '',
            DataIntEff: i.DataIntEff?.split('T')[0] || ''
          }));
        })
        .catch(error => {
          console.error('Errore nel recupero degli interventi', error);
          this.errorMessage = 'Errore nel recupero degli interventi.';
        });
    },
    // Carica le cause di guasto
    fetchCauseGuasto() {
      axios.get('/api/VisualizzaGuasti')
        .then(response => {
          this.causeGuasto = response.data;
        })
        .catch(error => {
          console.error('Errore nel recupero delle cause di guasto', error);
          this.errorMessage = 'Errore nel recupero delle cause di guasto.';
        });
    },
    // Carica i dipendenti abilitati
    fetchDipendenti() {
      axios.get('/api/VisualizzaDipendente')
        .then(response => {
          // Filtro lato client per sicurezza (potresti farlo anche lato SQL)
          this.dipendenti = response.data.filter((d: Dipendente) => d.abilitato === 1);
        })
        .catch(error => {
          console.error('Errore nel recupero dei dipendenti', error);
          this.errorMessage = 'Errore nel recupero dei dipendenti.';
        });
    },
    // Carica i fornitori esterni
    fetchFornitori() {
      axios.get('/api/VisualizzaFornitore')
        .then(response => {
          this.fornitori = response.data;
        })
        .catch(error => {
          console.error('Errore nel recupero dei fornitori', error);
          this.errorMessage = 'Errore nel recupero dei fornitori.';
        });
    },
    // Carica gli articoli disponibili
    fetchArticoli() {
      axios.get('/api/VisualizzazioneArticoli')
        .then(response => {
          this.articoli = response.data;
        })
        .catch(error => {
          console.error('Errore nel recupero degli articoli', error);
          this.errorMessage = 'Errore nel recupero degli articoli.';
        });
    },
    // Carica tutte le manutenzioni
    fetchManutenzioni() {
      axios.get('/api/VisualizzaManutenzioni')
        .then((res) => this.manutenzioni = res.data)
        .catch(() => this.errorMessage = 'Errore durante il caricamento delle manutenzioni.');
    },
    // Carica tutte le risorse
    fetchRisorse() {
      axios.get('/api/VisualizzaRisorse')
        .then((res) => this.Risorse = res.data)
        .catch(() => this.errorMessage = 'Errore durante il caricamento delle risorse.');
    },
    // Salva un nuovo intervento o aggiorna uno esistente
    saveIntervento() {
      // Imposta l'id manutenzione dal selezionato
      this.form.ManId = this.selectedManutenzione?.ManId ?? 0;

      // Validazione: la data prevista è obbligatoria
      if (!this.form.DataIntPrev) {
        this.errorMessage = 'Data Prevista obbligatoria';
        return;
      }

      // Validazione: ogni articolo deve avere id e quantità valida
      if (this.form.ArticoliUsati.some(a => !a.ArtId || a.qta < 1)) {
        return;
      }
      // Validazione: se esito positivo, la data effettiva è obbligatoria
      if (this.form.EsitoMan && !this.form.DataIntEff) {
        this.errorMessage = 'Data effettiva obbligatoria per esito positivo'
        return
      }
      // Prepara il payload per la richiesta
      const payload = {
        ...this.form,
        Dipendenti: this.selectedDipendenti.map(d => d.IdDip),
        NomeRisorsaInt: this.selectedRisorsa?.NomeRisorsa || 0,
        FornitoriEsterni: this.selectedFornitori.map(f => f.IdFornitore),
        ArticoliUsati: this.form.ArticoliUsati.map(a => ({
          ArtId: Number(a.ArtId),
          qta: Number(a.qta)
        })),
        EsitoMan: Boolean(this.form.EsitoMan)
      };

      // Sceglie se fare una POST (nuovo) o PUT (modifica)
      const axiosCall = this.selectedIntervento 
        ? axios.put(`/api/Modificaintervento/${this.selectedIntervento.IntId}`, payload)
        : axios.post('/api/CreaIntervento', payload);

      axiosCall
        .then(response => {
          this.successMessage = this.selectedIntervento
            ? 'Intervento aggiornato con successo!'
            : 'Intervento creato con successo! ID: ' + response.data.newIntId;
          this.resetForm();
          this.fetchInterventi();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(error => {
          console.error('Errore nel salvataggio:', error.response?.data || error);
          this.errorMessage = 'Errore durante il salvataggio: ';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },
    // Prepara il form per la modifica di un intervento esistente
    editIntervento(intervento: Intervento) {
      this.selectedIntervento = intervento;
      // Aspetta che il DOM sia aggiornato prima di settare le selezioni
      this.$nextTick(() => {
        // Trova la manutenzione associata (se presente)
        this.selectedManutenzione = this.manutenzioni.find(m => m.ManId === intervento.ManId) || null;
        let resourceIdToFindFinal = null; 
        if (intervento.ManId !== 0 && this.selectedManutenzione) {
          resourceIdToFindFinal = this.selectedManutenzione.MaccIdMan;
        } else {
          resourceIdToFindFinal = intervento.NomeRisorsaInt;
        }

        if (resourceIdToFindFinal !== null && resourceIdToFindFinal !== undefined && resourceIdToFindFinal !== 0) {
          this.selectedRisorsa = this.Risorse.find(r => r.NomeRisorsa === resourceIdToFindFinal) || null;
        } else {
          this.selectedRisorsa = null;
        }

        // Debug per vedere cosa è stato selezionato
        console.log('selectedManutenzione DOPO nextTick:', this.selectedManutenzione);
        console.log('selectedRisorsa DOPO nextTick:', this.selectedRisorsa);
      });
      // Prepara i dati del form con i valori dell'intervento selezionato
      this.form = {
        ...this.form, 
        ManId: intervento.ManId,
        DataIntPrev: intervento.DataIntPrev.split('T')[0] || '',
        DataIntEff: intervento.DataIntEff?.split('T')[0] || '',
        TmpInt: intervento.TmpInt,
        NomeRisorsaInt: intervento.NomeRisorsaInt,
        EsitoMan: Boolean(intervento.EsitoMan),
        noteIntervento: intervento.noteIntervento || '',
        TipoGuastoId: intervento.TipoGuastoId ?? null,
        Dipendenti: [], 
        FornitoriEsterni: [], 
        ArticoliUsati: [],
      };
      // Seleziona i dipendenti e fornitori associati all'intervento
      this.selectedDipendenti = this.dipendenti.filter(d => 
        intervento.Dipendenti.includes(d.IdDip)
      );
      this.selectedFornitori = this.fornitori.filter(f => 
        intervento.FornitoriEsterni.includes(f.IdFornitore)
      );
      // Mappa gli articoli usati
      this.form.ArticoliUsati = intervento.ArticoliUsati.map(au => ({
        ArtId: Number(au.ArtId),
        qta: Number(au.qta)
      }));
    },
    // Elimina un intervento
    deleteIntervento(interventoId: string) {
      axios.delete(`/api/CancellaIntervento/${interventoId}`)
        .then(() => {
          this.successMessage = 'Intervento eliminato con successo!';
          this.fetchInterventi();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        })
        .catch(error => {
          console.error("Errore nell'eliminazione:", error);
          this.errorMessage = "Errore durante l'eliminazione: ";
          window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },
    // Reset del form e delle selezioni
    resetForm() {
      this.selectedIntervento = null;
      this.form = {
        ManId: 0,
        DataIntPrev: '',
        DataIntEff: '',
        TmpInt: 0,
        NomeRisorsaInt: 0,
        EsitoMan: false,
        noteIntervento: '',
        TipoGuastoId: null,
        Dipendenti: [],
        FornitoriEsterni: [],
        ArticoliUsati: [],
      };
      this.selectedDipendenti = [];
      this.selectedFornitori = [];
      this.errorMessage = ''; 
      this.successMessage = '';
    },
    // Aggiunge un nuovo articolo usato al form
    addArticolo() {
      this.form.ArticoliUsati.push({
        ArtId: 0,
        qta: 1
      });
    },
    // Rimuove un articolo usato dal form
    removeArticolo(index: number) {
      this.form.ArticoliUsati.splice(index, 1);
    },
    // Aggiorna l'articolo selezionato in una riga del form
    updateArticolo(index: number, selected: Articolo) {
      if (typeof selected.Articolo === 'number') {
        this.form.ArticoliUsati[index].ArtId = selected.Articolo;
      }
    },
    // Funzione di utilità per formattare le date (importata)
    formatDate,

    // Carica i dettagli di un intervento tramite id (usato per deep-link o modifica)
    async fetchInterventiId(id: string) {
      try {
        const response = await axios.get(`/api/VisualizzaInterventoById/${id}`);
        const intervento = response.data;
        // Formatto le date per evitare problemi di visualizzazione
        const processedIntervento = {...intervento,
          DataIntPrev: intervento.DataIntPrev?.split('T')[0] || '',
          DataIntEff: intervento.DataIntEff?.split('T')[0] || ''
        };
        this.editIntervento(processedIntervento);
      } catch (error) {
        console.error('Errore nel caricamento intervento:', error);
        this.errorMessage = 'Impossibile caricare l\'intervento selezionato';
      }
    },
    // Genera il PDF dell'intervento selezionato
    async printInterventoPDF() {
      if (!this.selectedIntervento) {
        this.errorMessage = 'Seleziona un intervento per stampare il PDF.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      try {
        await InterventoPDF(this.selectedIntervento, {
          manutenzioni: this.manutenzioni,
          risorse: this.Risorse,
          causeGuasto: this.causeGuasto,
          dipendenti: this.dipendenti,
          fornitori: this.fornitori,
          articoli: this.articoli
        });
        this.successMessage = 'PDF generato con successo!';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error('Errore nella generazione del PDF:', error);
        this.errorMessage = 'Errore durante la generazione del PDF.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
  },
  // Quando il componente viene montato, carica tutti i dati necessari in parallelo
  async mounted() {
    await Promise.all([
      this.fetchInterventi(),
      this.fetchRisorse(),
      this.fetchCauseGuasto(),
      this.fetchDipendenti(),
      this.fetchFornitori(),
      this.fetchArticoli(),
      this.fetchManutenzioni(),
    ])
    this.isInitialDataLoaded = true

    // Se è stato passato un id come prop, carica i dettagli di quell'intervento
    if (this.id) {
      await this.fetchInterventiId(this.id);
    }
  },
  watch: {
    // Se cambia la prop id (es. navigazione), carica il nuovo intervento
    async id(newId: string) {
      if (!newId) return
      // Aspetta che i dati di base siano caricati prima di procedere
      if (!this.isInitialDataLoaded) {
        await new Promise(resolve => {
          // Polling veloce finché il flag non diventa true
          const timer = setInterval(() => {
            if (this.isInitialDataLoaded) {
              clearInterval(timer)
              resolve(undefined)
            }
          }, 50)
        })
      }
      // Carica i dettagli del nuovo intervento
      await this.fetchInterventiId(newId)
    }
  },
})
</script>
<template>
  <div class="wider-container" aria-labelledby="gestione-interventi-title">
    <h1 class="mb-4 text-center" id="gestione-interventi-title">Gestione Interventi</h1>

    <div class="row g-4">
      <!-- FORM -->
      <section class="col-12 col-md-5" aria-labelledby="int-form-titolo">
        <div class="card shadow-sm">
          <h2 id="int-form-titolo" class="h6 card-header text-white mb-0" style="background-color: var(--color-primary-700);">
            {{ selectedIntervento ? 'Modifica intervento' : 'Nuovo intervento' }}
          </h2>
          <div class="card-body">
            <form @submit.prevent="saveIntervento" class="vstack gap-3" aria-describedby="form-help">
              <div class="form-check form-switch">
                <input id="esitoMan" v-model="form.EsitoMan" type="checkbox" class="form-check-input" aria-label="Esito positivo">
                <label class="form-check-label" for="esitoMan">Esito Positivo</label>
              </div>
              <!-- ManId -->
              <div class="row g-2">
                <div class="col-md-4" v-if="selectedIntervento">
                  <label for="IdIntervento" class="form-label">ID Intervento</label>
                  <input id="IdIntervento" type="text" class="form-control" :value="selectedIntervento!.IntId" disabled aria-readonly="true"/>
                </div>
                <div class="col-md-4" v-if="selectedIntervento && form.ManId !== 0">
                  <label for="Risorsa" class="form-label">Risorsa</label>
                  <input id="Risorsa" type="text" class="form-control" :value="manutenzioni.find(m => m.ManId === selectedIntervento!.ManId)?.MaccIdMan || ''" disabled aria-readonly="true"/>
                </div>
                <div class="col-md-4" v-if="selectedIntervento && form.ManId !== 0">
                  <label for="Descrizione" class="form-label">Descrizione</label>
                  <input id="Descrizione" type="text" class="form-control" :value="currentResource?.ModMacc || ''" disabled aria-readonly="true"/>
                </div>
              </div>
              <div v-if="form.ManId !== 0">
                <label class="form-label" for="manutenzione-multiselect">Manutenzione</label>
                <Multiselect
                  id="manutenzione-multiselect"
                  v-model="selectedManutenzione"
                  :options="manutenzioni"
                  label="DescMan"
                  track-by="ManId"
                  placeholder="Seleziona manutenzione"
                  aria-label="Seleziona Manutenzione"
                  disabled
                >
                  <template v-slot:option="{ option }">
                    <div>
                      (ID: {{ option.ManId }}, Macchina: {{ option.MaccIdMan }}) {{ option.DescMan }}
                    </div>
                  </template>
                </Multiselect>
              </div>
              <div v-if="form.ManId === 0">
                <label class="form-label" for="risorsa-multiselect">Risorsa</label>
                <Multiselect
                  id="risorsa-multiselect"
                  v-model="selectedRisorsa"
                  :options="Risorse"
                  label="ModMacc"
                  track-by="NomeRisorsa"
                  placeholder="Seleziona Risorsa"
                  aria-label="Seleziona Risorsa"
                  required
                  aria-required="true"
                >
                  <template v-slot:option="{ option }">
                    <div>(ID: {{ option.NomeRisorsa }}) {{ option.ModMacc }}</div>
                  </template>
                  <template v-slot:selected="{ option }">
                    <div>(ID: {{ option.NomeRisorsa }}) {{ option.ModMacc }}</div>
                  </template>
                </Multiselect>
              </div>
              <!-- Date e Orari -->
              <div class="row" v-if="selectedIntervento?.OriginInt === 1 ">
                <div class="col-md-6">
                  <label for="DataPrevista" class="form-label">Data Prevista *</label>
                  <input id="DataPrevista" v-model="form.DataIntPrev" type="date" class="form-control" disabled aria-readonly="true" aria-required="true">
                </div>
                <div class="col-md-6">
                  <label for="DataEffettiva" class="form-label">Data Effettiva</label>
                  <input id="DataEffettiva" v-model="form.DataIntEff" type="date" class="form-control" aria-label="Data Effettiva">
                </div>
              </div>
              <div class="row" v-if="selectedIntervento?.OriginInt === 0">
                <div class="col-md-4">
                  <label for="DataPrevista2" class="form-label">Data Prevista *</label>
                  <input id="DataPrevista2" v-model="form.DataIntPrev" type="date" class="form-control" required aria-required="true">
                </div>
                <div class="col-md-4">
                  <label for="DataEffettiva2" class="form-label">Data Effettiva</label>
                  <input id="DataEffettiva2" v-model="form.DataIntEff" type="date" class="form-control" aria-label="Data Effettiva">
                </div>
                <div class="col-md-4">
                  <label for="OreImpiegate2" class="form-label">Ore Impiegate*</label>
                  <input id="OreImpiegate2" v-model.number="form.TmpInt" type="number" class="form-control" placeholder="Ore" required aria-required="true" min="0">
                </div>
              </div>
              <div class="row" v-if="form.ManId === 0 && selectedIntervento === null">
                <div class="col-md-4">
                  <label for="DataPrevista3" class="form-label">Data Prevista *</label>
                  <input id="DataPrevista3" v-model="form.DataIntPrev" type="date" class="form-control" required aria-required="true">
                </div>
                <div class="col-md-4">
                  <label for="DataEffettiva3" class="form-label">Data Effettiva</label>
                  <input id="DataEffettiva3" v-model="form.DataIntEff" type="date" class="form-control" aria-label="Data Effettiva">
                </div>
                <div class="col-md-4">
                  <label for="OreImpiegate3" class="form-label">Ore Impiegate*</label>
                  <input id="OreImpiegate3" v-model.number="form.TmpInt" type="number" class="form-control" placeholder="Ore" required aria-required="true" min="0">
                </div>
              </div>
              <!-- Note -->
              <div class="row">
                <div class="col-md-7">
                  <label for="Note" class="form-label">Note</label>
                  <textarea id="Note" v-model="form.noteIntervento" class="form-control" rows="2" required aria-required="true" aria-describedby="noteHelp"></textarea>
                  <small id="noteHelp" class="form-text text-muted">Inserisci eventuali dettagli sull’intervento.</small>
                </div>
                <!-- Tipo Guasto -->
                <div class="col-md-5">
                  <label for="TipoGuasto" class="form-label">Tipo Guasto</label>
                  <select id="TipoGuasto" v-model="form.TipoGuastoId" class="form-select" aria-label="Tipo Guasto">
                    <option :value="null">Nessun guasto</option>
                    <option v-for="guasto in causeGuasto" :key="guasto.IdGuasto" :value="guasto.IdGuasto">
                      {{ guasto.Descrizione }}
                    </option>
                  </select>
                </div>
              </div>
              <!-- Dipendenti e Fornitori -->
              <div class="row">
                <div class="col-md-6">
                  <label for="dipendenti-multiselect" class="form-label">Dipendenti</label>
                  <Multiselect
                    id="dipendenti-multiselect"
                    v-model="selectedDipendenti"
                    :options="dipendenti"
                    :multiple="true"
                    label="CognDip"
                    track-by="IdDip"
                    aria-label="Seleziona dipendenti"
                    placeholder="Seleziona dipendenti"
                  />
                </div>
                <div class="col-md-6">
                  <label for="fornitori-multiselect" class="form-label">Fornitori Esterni</label>
                  <Multiselect
                    id="fornitori-multiselect"
                    v-model="selectedFornitori"
                    :options="fornitori"
                    :multiple="true"
                    label="RagSoc"
                    track-by="IdFornitore"
                    aria-label="Seleziona fornitori"
                    placeholder="Seleziona fornitori"
                  />
                </div>
              </div>
              <!-- Articoli Usati -->
              <div>
                <label class="form-label" for="articoli-usati-list">Articoli Impiegati</label>
                <div id="articoli-usati-list">
                  <div v-for="(articolo, index) in form.ArticoliUsati" :key="index" class="mb-2">
                    <div class="row g-1 align-items-baseline">
                      <div class="col-7">
                        <Multiselect
                          :id="'articolo-multiselect-' + index"
                          :model-value="articoli.find(a => a.Articolo === articolo.ArtId)"
                          :options="articoli"
                          label="NomeArt"
                          track-by="Articolo"
                          placeholder="Articolo"
                          aria-label="Articolo"
                          @update:modelValue="(val: Articolo | null) => val && updateArticolo(index, val)"
                        />
                      </div>
                      <div class="col-3">
                        <label :for="'Quantita-' + index" class="visually-hidden">Quantità</label>
                        <input
                          :id="'Quantita-' + index"
                          v-model.number="articolo.qta"
                          type="number"
                          min="1"
                          class="form-control"
                          placeholder="Qta"
                          aria-label="Quantità"
                          required
                          aria-required="true"
                        >
                      </div>
                      <div class="col-2 text-end">
                        <button
                          type="button"
                          @click="removeArticolo(index)"
                          class="btn btn-danger btn-sm"
                          title="Rimuovi articolo"
                          aria-label="Rimuovi articolo"
                        >
                          <span aria-hidden="true">×</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <button type="button" @click="addArticolo" class="btn btn-secondary btn-sm" aria-label="Aggiungi articolo">Aggiungi Articolo</button>
                </div>
              </div>
              <!-- Pulsanti -->
              <div class="d-grid gap-2 mt-4">
                <button type="submit" class="btn btn-primary" aria-label="Salva intervento">
                  {{ selectedIntervento ? 'Aggiorna' : 'Salva' }}
                </button>
                <button v-if="selectedIntervento" type="button" @click="resetForm" class="btn btn-outline-secondary" aria-label="Annulla modifica">
                  Annulla
                </button>
                <button v-if="selectedIntervento" type="button" @click="printInterventoPDF" class="btn btn-outline-warning" aria-label="Stampa PDF intervento">
                  Stampa PDF
                </button>
              </div>
              <div id="form-help" class="visually-hidden">
                I campi contrassegnati da asterisco sono obbligatori.
              </div>
            </form>
          </div>
        </div>
      </section>

      <!-- TABELLA -->
      <section class="col-12 col-md-7" aria-labelledby="int-tabella-titolo">
        <h2 id="int-tabella-titolo" class="visually-hidden">Elenco interventi</h2>
        <!-- Messaggi di stato -->
        <div v-if="errorMessage" class="alert alert-danger" role="alert" aria-live="assertive">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="alert alert-success" role="alert" aria-live="polite">
          {{ successMessage }}
        </div>

        <!-- Tabella interventi -->
        <div class="table-responsive" v-if="InterventiPaginati.length > 0">
          <table class="table table-hover table-bordered align-middle table-sm" aria-label="Elenco interventi">
            <thead class="table-dark">
              <tr>
                <th scope="col">ID Intervento</th>
                <th scope="col">Risorsa</th>
                <th scope="col">Manutenzione</th>
                <th scope="col">Data Prevista</th>
                <th scope="col">Data Esecuzione</th>
                <th scope="col">Esito</th>
                <th scope="col">Azioni</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="intervento in InterventiPaginati"
                :key="intervento.IntId"
                @click="editIntervento(intervento)"
                :class="{'risorse-int':intervento.ManId === 0,'risorse-man':intervento.ManId !== 0,
                        'desc-int':intervento.ManId === 0,'desc-man':intervento.ManId !== 0,
                        'bg-warning': intervento.OriginInt === 1, 'bg-white': intervento.OriginInt === 0,
                        'table-active': selectedIntervento?.IntId === intervento.IntId }"
                style="cursor: pointer"
                tabindex="0"
                role="button"
                :aria-label="`Seleziona intervento ${intervento.IntId}`"
              >
                <td :class="intervento.OriginInt === 1 ? 'bg-warning' : 'bg-white'">{{ intervento.IntId }}</td>
                <td class="risorse-man" v-if="intervento.ManId !== 0">{{ manutenzioni.find(m => m.ManId === intervento.ManId)?.MaccIdMan || intervento.ManId }}</td>
                <td class="risorse-int" v-if="intervento.ManId === 0">{{ intervento.NomeRisorsaInt }}</td>
                <td class="desc-man" v-if="intervento.ManId !== 0">{{ manutenzioni.find(m => m.ManId === intervento.ManId)?.DescMan || intervento.ManId }}</td>
                <td class="desc-int" v-if="intervento.ManId === 0">{{ intervento.noteIntervento }}</td>
                <td>{{ intervento.DataIntPrev ? formatDate(intervento.DataIntPrev) : '' }}</td>
                <td>{{ intervento.DataIntEff ? formatDate(intervento.DataIntEff) : '' }}</td>
                <td>
                  <span :class="intervento.EsitoMan ? 'text-success' : 'text-danger'">
                    <span v-if="intervento.EsitoMan" aria-label="Esito positivo" role="img">✔</span>
                    <span v-else aria-label="Esito negativo" role="img">✖</span>
                  </span>
                </td>
                <td>
                  <button
                    @click.stop="deleteIntervento(intervento.IntId)"
                    class="btn btn-danger btn-sm"
                    aria-label="Elimina intervento"
                  >
                    Canc
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <nav v-if="totalPages > 1" class="d-flex justify-content-center gap-2" aria-label="Navigazione pagine elenco interventi">
          <button
            type="button"
            class="btn btn-outline-primary btn-sm"
            :disabled="currentPage === 1"
            @click="currentPage--"
            aria-label="Pagina precedente"
          >
            <span aria-hidden="true">⭠</span>
          </button>
          <span class="align-self-center" aria-live="polite" aria-atomic="true">
            Pagina {{ currentPage }} di {{ totalPages }}
          </span>
          <button
            type="button"
            class="btn btn-outline-primary btn-sm"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
            aria-label="Pagina successiva"
          >
            <span aria-hidden="true">⭢</span>
          </button>
        </nav>
      </section>
    </div>
  </div>
</template>
