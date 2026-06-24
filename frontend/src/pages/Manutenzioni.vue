<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { Manutenzione } from '../types';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import '../style.css';
import { formatDate } from '../utils/funzRiusabili';

export default defineComponent({
  components: { Multiselect },
  data() {
    return {
      manutenzioni: [] as Manutenzione[],
      Risorse: [] as Array<{ NomeRisorsa: number; ModMacc: string }>,
      selectedRisorsa: null as { NomeRisorsa: number; ModMacc: string } | null,
      selectedManutenzione: null as Manutenzione | null,
      form: {
        MaccIdMan: 0,
        Tipo: 'Conduzione',
        FreqGiorni: undefined as number | undefined,
        DescMan: '',
        noteMan: '',
        DurataSTAT: 0,
        DataInserimento: new Date().toISOString().substring(0, 10),
      } as Omit<Manutenzione, 'ManId'>,
      errorMessage: '',
      successMessage: '',
      currentPage: 1,      
      perPage: 15,
    };
  },
  computed: {
    totalPages(): number {
      return Math.ceil(this.manutenzioni.length / this.perPage); 
    },
    ManutenzioniPaginati(): Manutenzione[] {
      const start = (this.currentPage - 1) * this.perPage;
      return this.manutenzioni.slice(start, start + this.perPage); 
    },
  },
  methods: {
    fetchManutenzioni() {
      axios.get('/api/VisualizzaManutenzioni')
        .then((res) => this.manutenzioni = res.data)
        .catch(() => this.errorMessage = 'Errore durante il caricamento delle manutenzioni.');
    },
    fetchRisorse() {
      axios.get('/api/VisualizzaRisorse')
        .then((res) => this.Risorse = res.data)
        .catch(() => this.errorMessage = 'Errore durante il caricamento delle risorse.');
    },
    saveManutenzione() {
  if (this.selectedRisorsa) {
    this.form.MaccIdMan = this.selectedRisorsa.NomeRisorsa;
  }
  
  const payload = {
    MaccIdMan: this.form.MaccIdMan,
    Tipo: this.form.Tipo,
    FreqGiorni: this.form.FreqGiorni || null,
    DurataSTAT: this.form.DurataSTAT,
    DescMan: this.form.DescMan || null,
    noteMan: this.form.noteMan || null
  };

  const axiosCall = this.selectedManutenzione 
    ? axios.put(`/api/ModificaManutenzione/${this.selectedManutenzione.ManId}`, payload)
    : axios.post('/api/CreaManutenzione', payload);

  axiosCall
    .then(() => {
      this.successMessage = this.selectedManutenzione 
        ? 'Manutenzione aggiornata!' 
        : 'Manutenzione creata!';
      this.resetForm();
      this.fetchManutenzioni();
    })
    .catch(error => {
      console.error('Errore:', error.response?.data || error.message);
      this.errorMessage = 'Errore durante l\'operazione. Verifica la console per i dettagli.';
    });
},
    editManutenzione(m: Manutenzione) {
      this.selectedManutenzione = m;
      this.form = { ...m };
      this.selectedRisorsa = this.Risorse.find(r => r.NomeRisorsa === m.MaccIdMan) || null;
      this.$nextTick(() => this.$forceUpdate());
    },
    deleteManutenzione(id: number) {
        axios.delete(`/api/CancellaManutenzione/${id}`)
          .then(() => this.fetchManutenzioni())
          .catch(() => this.errorMessage = 'Errore durante l\'eliminazione.');
          },
    resetForm() {
      this.selectedManutenzione = null;
      this.selectedRisorsa = null;
      this.form = {
        MaccIdMan: 0,
        Tipo: 'Conduzione',
        FreqGiorni: undefined,
        DurataSTAT:0,
        DescMan: '',
        noteMan: '',
        DataInserimento: new Date().toISOString().substring(0, 10),
      };
      this.errorMessage = ''; 
      this.successMessage = '';
    },
    handleSuccess() {
      this.successMessage = this.selectedManutenzione 
        ? 'Manutenzione aggiornata con successo!' 
        : 'Manutenzione creata con successo!';
      this.resetForm();
      this.fetchManutenzioni();
    },
    handleError(error: any) {
      console.error('Errore:', error.response?.data || error.message);
      this.errorMessage = 'Errore durante l\'operazione. Verifica la console per i dettagli.';
    },
    formatDate,
  },
  mounted() {
    this.fetchRisorse();
    this.fetchManutenzioni();
  }
});
</script>

<template>
  <div class="wider-container" aria-labelledby="man-titolo">
    <h1 id="man-titolo" class="mb-4 text-center">Anagrafica Manutenzioni</h1>
    <div class="row g-4">
      <!-- FORM -->
      <div class="col-12 col-md-4">
        <section class="card shadow-sm" aria-labelledby="man-form-titolo">
          <h2 id="man-form-titolo" class="h6 card-header text-white mb-0" style="background-color: var(--color-primary-700);">
            {{ selectedManutenzione ? 'Modifica manutenzione' : 'Nuova manutenzione' }}
          </h2>
          <div class="card-body">
            <form @submit.prevent="saveManutenzione" class="vstack gap-2">
              <div>
                <label for="Risorsa" class="form-label">Seleziona risorsa *</label>
                <multiselect
                  id="Risorsa"
                  v-model="selectedRisorsa"
                  :options="Risorse"
                  label="ModMacc"
                  track-by="NomeRisorsa"
                  placeholder="Seleziona macchina"
                  :searchable="true"
                  required
                  :aria-invalid="!selectedRisorsa"
                  aria-describedby="risorsa-help"
                >
                  <template v-slot:option="{ option }">
                    (ID: {{ option.NomeRisorsa }}) {{ option.ModMacc }}
                  </template>
                  <template v-slot:noResult>Nessuna risorsa corrispondente.</template>
                </multiselect>
                <div id="risorsa-help" v-if="!selectedRisorsa" class="invalid-feedback" role="alert">
                  Seleziona una risorsa valida.
                </div>
              </div>
              <div>
                <label for="TipoManutenzione" class="form-label">Tipo manutenzione *</label>
                <select id="TipoManutenzione" v-model="form.Tipo" class="form-select" required>
                  <option disabled value="">Seleziona tipo</option>
                  <option>Conduzione</option>
                  <option>Guasto</option>
                  <option>Miglioramento</option>
                  <option>Preventiva</option>
                  <option>Uscita Esterna</option>
                </select>
              </div>
              <div>
                <label for="Frequenza" class="form-label">Intervallo (giorni)</label>
                <input id="Frequenza" type="number" min="0" v-model="form.FreqGiorni" class="form-control" />
                <small class="form-text">Lascia vuoto se la manutenzione non è ricorrente.</small>
              </div>
              <div>
                <label for="DurataInt" class="form-label">Durata standard (ore) *</label>
                <input id="DurataInt" type="number" min="0" step="0.5" v-model="form.DurataSTAT" class="form-control" required />
              </div>
              <div>
                <label for="Descrizione" class="form-label">Descrizione *</label>
                <input id="Descrizione" type="text" v-model="form.DescMan" class="form-control" required />
              </div>

              <div>
                <label for="Note" class="form-label">Note</label>
                <input id="Note" type="text" v-model="form.noteMan" class="form-control" />
              </div>
              <div class="d-grid gap-2 mt-3">
                <button type="submit" class="btn btn-primary">
                  {{ selectedManutenzione ? 'Salva modifiche' : 'Aggiungi manutenzione' }}
                </button>
                <button
                  v-if="selectedManutenzione"
                  @click="resetForm"
                  type="button"
                  class="btn btn-outline-primary"
                >
                  Annulla
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>

      <!-- TABELLA -->
      <div class="col-12 col-md-8">
        <div v-if="errorMessage" class="alert alert-danger" role="alert" aria-live="polite">{{ errorMessage }}</div>
        <div v-if="successMessage" class="alert alert-success" role="status" aria-live="polite">{{ successMessage }}</div>

        <div class="table-responsive" v-if="ManutenzioniPaginati.length > 0">
  <table class="table table-hover table-bordered align-middle text-center table-sm" aria-label="Elenco manutenzioni">
    <thead class="table-dark">
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Macchina</th>
        <th scope="col">Tipo</th>
        <th scope="col">Frequenza</th>
        <th scope="col">Descrizione</th>
        <th scope="col">Note</th>
        <th scope="col">Data</th>
        <th scope="col">Elimina</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="m in ManutenzioniPaginati"
        :key="m.ManId"
        :class="{ 'table-active': selectedManutenzione?.ManId === m.ManId }"
        @click="editManutenzione(m)"
        @keydown.enter.prevent="editManutenzione(m)"
        @keydown.space.prevent="editManutenzione(m)"
        style="cursor: pointer"
        tabindex="0"
        role="button"
        :aria-label="`Seleziona manutenzione ${m.ManId}`"
      >
        <td>{{ m.ManId }}</td>
        <td>{{ m.MaccIdMan }}</td>
        <td>{{ m.Tipo }}</td>
        <td>{{ m.FreqGiorni ?? '-' }}</td>
        <td>{{ m.DescMan ?? '-' }}</td>
        <td>{{ m.noteMan ?? '-' }}</td>
        <td>{{ formatDate(m.DataInserimento) }}</td>
        <td>
            <button class="btn btn-danger btn-sm" @click.stop="deleteManutenzione(m.ManId!)"title="Elimina"
              aria-label="Elimina manutenzione">
              <span aria-hidden="true">Canc</span>
              <span class="visually-hidden">Elimina</span>
            </button>
                  </td>
                </tr>
                <tr v-if="manutenzioni.length === 0">
                  <td colspan="8">Nessuna manutenzione trovata.</td>
                </tr>
            </tbody>
          </table>
        </div>
        <nav v-if="totalPages > 1" class="d-flex justify-content-center gap-2" aria-label="Navigazione pagine elenco manutenzioni">
          <button type="button" class="btn btn-outline-primary btn-sm" :disabled="currentPage === 1" @click="currentPage--" aria-label="Pagina precedente">
            <span aria-hidden="true">⭠</span>
          </button>
          <span class="align-self-center" aria-live="polite" aria-atomic="true">Pagina {{ currentPage }} di {{ totalPages }}</span>
          <button type="button" class="btn btn-outline-primary btn-sm" :disabled="currentPage === totalPages" @click="currentPage++" aria-label="Pagina successiva">
            <span aria-hidden="true">⭢</span>
          </button>
        </nav>
      </div>
    </div>
  </div>
</template>