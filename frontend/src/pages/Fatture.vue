<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { Fattura } from '../types';
import Multiselect from 'vue-multiselect';
import 'vue-multiselect/dist/vue-multiselect.css';
import '../style.css';
import * as XLSX from 'xlsx';


export default defineComponent({
  components: { Multiselect },
  data() {
    return {
      fatture: [] as Fattura[],
      interventi: [] as Array<{ IntId: string; }>, 
      selectedFattura: null as Fattura | null,
      selectedIntervento: null as { IntId: string;} | null, 
      form: {
        NFatt: '',
        IntId: '',
        ImpFatt: 0,
        NoteFatt: '',
      } as Fattura,
      currentPage: 1,       
      perPage: 10,
      errorMessage: '',
      successMessage: '',
    };
  },
  computed: {
    totalPages(): number {
      return Math.ceil(this.fatture.length / this.perPage);
    },
    FatturePaginati(): Fattura[] {
      const start = (this.currentPage - 1) * this.perPage;
      return this.fatture.slice(start, start + this.perPage);
    },
  },
  methods: {

    fetchInterventi() {
      axios.get('/api/visualizzaInterventiEsterni')
        .then(response => {
          this.interventi = response.data;
        })
        .catch(error => {
          console.error('Errore nel recupero degli interventi:', error);
          this.errorMessage = 'Errore nel caricamento degli interventi';
        });
    },

    getFatture() {
      axios
        .get('/api/VisualizzazioneFatture')
        .then((response) => {
          this.fatture = response.data;
        })
        .catch((error) => {
          console.error('Errore nel recupero delle fatture', error);
          this.errorMessage = 'Errore nel recupero delle fatture.';
        });
    },

    saveFattura() {
      // Aggiungi questa mappatura
      if (this.selectedIntervento) {
        this.form.IntId = this.selectedIntervento.IntId;
      }

      const requestData: Fattura = { ...this.form };

      const request = this.selectedFattura
        ? axios.put(`/api/modificaFattura/${this.selectedFattura.NFatt}`, requestData)
        : axios.post('/api/creaFattura', requestData);

      request
        .then(() => {
          this.successMessage = this.selectedFattura
            ? 'Fattura aggiornata con successo.'
            : 'Fattura aggiunta con successo.';
          this.resetForm();
          this.getFatture();
        })
        .catch((error) => {
          console.error('Errore nel salvataggio della fattura', error);
          this.errorMessage = 'Errore nel salvataggio della fattura.';
        });
    },

    resetForm() {
      this.selectedFattura = null;
      this.selectedIntervento = null; // Aggiungi questa riga
      this.form = {
        NFatt: '',
        IntId: '',
        ImpFatt: 0,
        NoteFatt: '',
      };
      this.errorMessage = ''; 
      this.successMessage = '';
    },

    editFattura(fattura: Fattura) {
      this.selectedFattura = fattura;
      this.form = { ...fattura };
      
      // Aggiungi questa logica per trovare l'intervento corrispondente
      this.selectedIntervento = this.interventi.find(
        i => i.IntId === fattura.IntId
      ) || null;
    },

    deleteFattura(NFatt: string) {
      axios
        .delete(`/api/CancellaFattura/${NFatt}`)
        .then(() => {
          this.successMessage = 'Fattura eliminata con successo.';
          this.getFatture();
        })
        .catch((error) => {
          console.error('Errore nell\'eliminazione della fattura', error);
          this.errorMessage = 'Errore nell\'eliminazione della fattura.';

        });
    },
    exportToExcel() {
     let worksheet = XLSX.utils.json_to_sheet(this.fatture);
     let sheetName = 'Fatture';
     let fileName = 'Fatture.xlsx';
     const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, fileName);

    }
  },
  mounted() {
    this.getFatture();
    this.fetchInterventi(); // Aggiungi questa chiamata
  },
});
</script>
<template>
  <div class="wider-container" aria-labelledby="fat-titolo">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 id="fat-titolo" class="mb-0">Gestione Fatture</h1>
      <button
        type="button"
        @click="exportToExcel"
        class="btn btn-sm btn-outline-primary"
        aria-label="Scarica l'elenco fatture in formato Excel"
      >
        <i class="bi bi-file-earmark-excel" aria-hidden="true"></i>
        Esporta in Excel
      </button>
    </div>

    <div class="row g-4">
      <section class="col-12 col-md-4" aria-labelledby="fat-form-titolo">
        <h2 id="fat-form-titolo" class="h5 mb-3">
          {{ selectedFattura ? 'Modifica' : 'Aggiungi' }} fattura
        </h2>

        <form @submit.prevent="saveFattura" class="vstack gap-3">
          <div>
            <label for="nfatt" class="form-label">Numero Fattura *</label>
            <input id="nfatt" v-model="form.NFatt" type="text" class="form-control" required />
          </div>

          <div>
            <label for="intId" class="form-label">Intervento *</label>
            <multiselect
              id="intId"
              v-model="selectedIntervento"
              :options="interventi"
              label="IntId"
              track-by="IntId"
              placeholder="Seleziona intervento"
              :searchable="true"
              :close-on-select="true"
              required
              class="form-control"
              aria-label="Selezione intervento collegato alla fattura"
            >
              <template v-slot:singleLabel="{ option }">({{ option.IntId }})</template>
              <template v-slot:noResult>Nessun intervento corrispondente.</template>
              <template v-slot:noOptions>Nessun intervento disponibile.</template>
            </multiselect>
         </div>

          <div>
            <label for="impFatt" class="form-label">Importo Fattura (€) *</label>
            <input id="impFatt" v-model="form.ImpFatt"type="number"class="form-control"min="0"step="0.01"required/>
          </div>

          <div>
            <label for="noteFatt" class="form-label">Note Fattura</label>
            <textarea id="noteFatt" v-model="form.NoteFatt" class="form-control" rows="2"></textarea>
          </div>

          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary">
              {{ selectedFattura ? 'Aggiorna' : 'Aggiungi' }} fattura
            </button>
            <button v-if="selectedFattura" @click="resetForm" type="button" class="btn btn-outline-primary">
              Annulla modifica
            </button>
          </div>
        </form>
      </section>

      <div class="col-12 col-md-8">
        <div v-if="errorMessage" class="alert alert-danger" role="alert" aria-live="polite">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="alert alert-success" role="alert" aria-live="polite">
          {{ successMessage }}
        </div>
        <div class="table-responsive mb-3" v-if="fatture.length > 0">
  <table class="table table-hover table-bordered align-middle text-center table-sm" aria-label="Elenco fatture">
    <thead class="table-dark">
      <tr>
        <th scope="col">Fattura</th>
        <th scope="col">Intervento</th>
        <th scope="col">Importo</th>
        <th scope="col">Note</th>
        <th scope="col">Azioni</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="fattura in FatturePaginati"
        :key="fattura.NFatt"
        @click="editFattura(fattura)"
        @keydown.enter.prevent="editFattura(fattura)"
        @keydown.space.prevent="editFattura(fattura)"
        style="cursor: pointer"
        :class="{ 'table-active': selectedFattura?.NFatt === fattura.NFatt }"
        tabindex="0"
        role="button"
        :aria-label="`Seleziona fattura ${fattura.NFatt}`"
      >
        <td>{{ fattura.NFatt }}</td>
        <td>{{ fattura.IntId }}</td>
        <td>{{ fattura.ImpFatt }}€</td>
        <td>{{ fattura.NoteFatt || 'N/A' }}</td>
        <td>
          <button
            @click.stop="deleteFattura(fattura.NFatt)"
            class="btn btn-danger btn-sm"
            aria-label="Elimina fattura"
            title="Elimina"
          >
            <span aria-hidden="true">Canc</span>
            <span class="visually-hidden">Elimina</span>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
        <nav v-if="totalPages > 1" class="d-flex justify-content-center gap-2" aria-label="Navigazione pagine elenco fatture">
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
