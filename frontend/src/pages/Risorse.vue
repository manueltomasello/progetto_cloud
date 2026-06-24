<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { Risorsa } from '../types';
import '../style.css';


export default defineComponent({
  data() {
    return {
      risorse: [] as Risorsa[],
      selectedRisorsa: null as Risorsa | null,
      form: {
        NomeRisorsa: 0,
        ModMacc: '',
        DescMacc: '',
        CostoOrarioFermo: 0,
      } as Risorsa,
      currentPage: 1,
      perPage: 10,
      errorMessage: '',
      successMessage: '',
    };
  },
  computed: {
    totalPages(): number {
      return Math.ceil(this.risorse.length / this.perPage);
    },
    risorsePaginati(): Risorsa[] {
      const start = (this.currentPage - 1) * this.perPage;
      return this.risorse.slice(start, start + this.perPage);
    },
  },
  methods: {
    fetchRisorsa() {
      axios
        .get('/api/VisualizzaRisorse')
        .then((res) => {
          this.risorse = res.data;
        })
        .catch(() => {
          this.errorMessage = 'Errore durante il caricamento delle Macchine.';
        });
    },
    saveRisorsa() {
      const data: Risorsa = {
        ...this.form,
        ...(this.selectedRisorsa ? { NomeRisorsa: this.selectedRisorsa.NomeRisorsa } : {}),
      };

      const request = this.selectedRisorsa
        ? axios.put(`/api/ModificaRisorsa/${data.NomeRisorsa}`, data)
        : axios.post('/api/CreaRisorsa', data);

      request
        .then(() => {
          this.successMessage = this.selectedRisorsa
            ? 'Risorsa aggiornata con successo.'
            : 'Risorsa aggiunta con successo.';
          this.resetForm();
          this.fetchRisorsa();
        })
        .catch(() => {
          this.errorMessage = 'Errore durante il salvataggio.';
        });
    },
    editRisorsa(r: Risorsa) {
      this.selectedRisorsa = r;
      this.form = { ...r };
    },
    deleteRisorsa(id: number) { 
        axios.delete(`/api/CancellaRisorsa/${id}`)
          .then(() => {
            this.successMessage = 'Risorsa eliminata.';
            this.fetchRisorsa();
          })
          .catch(() => {
            this.errorMessage = 'Errore durante l\'eliminazione.';
          });
    },
    resetForm() {
      this.selectedRisorsa = null;
      this.form = {
        NomeRisorsa: 0,
        ModMacc: '',
        DescMacc: '',
        CostoOrarioFermo: 0,
      };
      this.errorMessage = ''; 
      this.successMessage = '';
    },
  },
  mounted() {
    this.fetchRisorsa();
  },
});
</script>

<template>
    <div class="wider-container" aria-labelledby="risorse-titolo">
      <h1 id="risorse-titolo" class="mb-4 text-center">Anagrafica Risorse</h1>
      <div class="row g-4">
        <!-- FORM -->
        <div class="col-12 col-md-4">
          <section class="card shadow-sm" aria-labelledby="risorsa-form-titolo">
            <h2 id="risorsa-form-titolo" class="h6 card-header text-white mb-0" style="background-color: var(--color-primary-700);">
              {{ selectedRisorsa ? 'Modifica Risorsa' : 'Nuova Risorsa' }}
            </h2>
            <div class="card-body">
              <form @submit.prevent="saveRisorsa" class="vstack gap-2">
                <div>
                  <label for="NomeRisorsa" class="form-label">Identificativo Risorsa</label>
                  <input type="number" v-model="form.NomeRisorsa" class="form-control" placeholder="Risorsa" :readonly="selectedRisorsa !== null" required />
                </div>
                <div>
                  <label for="ModMacc" class="form-label">Modello Macchina</label>
                  <input type="text" v-model="form.ModMacc" class="form-control" placeholder="Modello Macchina" required />
                </div>
                <div>
                  <label for="DescMacc" class="form-label">Descrizione Macchina</label>
                  <input type="text" v-model="form.DescMacc" class="form-control" placeholder="Descrizione Macchina" />
                </div>
                <div>
                  <label for="CostoOrarioFermo" class="form-label">Costo Orario Di Fermo Macchina</label>
                  <input type="number" v-model="form.CostoOrarioFermo" class="form-control" placeholder="Costo Orario del Fermo" required />
                </div>
                <div class="d-grid gap-2 mt-3">
                  <button type="submit" class="btn btn-primary">
                    {{ selectedRisorsa ? 'Salva Modifiche' : 'Aggiungi Risorsa' }}
                  </button>
                  <button v-if="selectedRisorsa" @click="resetForm" type="button" class="btn btn-secondary">
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
          <div v-if="successMessage" class="alert alert-success" role="alert" aria-live="polite">{{ successMessage }}</div>
          <div class="table-responsive">
            <table class="table table-hover table-bordered align-middle text-center table-sm" aria-label="Elenco risorse">
              <thead class="table-dark">
                <tr>
                  <th scope="col">Risorsa</th>
                  <th scope="col">Modello</th>
                  <th scope="col">Descrizione</th>
                  <th scope="col">Costo Orario di Fermo</th>
                  <th scope="col">Azioni</th>
                </tr>
              </thead>
            <tbody>
          <tr v-for="risorsa in risorsePaginati":key="risorsa.NomeRisorsa"@click="editRisorsa(risorsa)"@keydown.enter.prevent="editRisorsa(risorsa)"
        @keydown.space.prevent="editRisorsa(risorsa)"
        style="cursor: pointer"
        :class="{ 'table-active': selectedRisorsa?.NomeRisorsa === risorsa.NomeRisorsa }"
        tabindex="0"
        role="button"
        :aria-label="`Seleziona risorsa ${risorsa.NomeRisorsa}`"
      >
        <td>{{ risorsa.NomeRisorsa }}</td>
        <td>{{ risorsa.ModMacc }}</td>
        <td>{{ risorsa.DescMacc }}</td>
        <td>{{ risorsa.CostoOrarioFermo }}€</td>
        <td>
          <button
            class="btn btn-danger btn-sm"
            @click.stop="deleteRisorsa(risorsa.NomeRisorsa)"
            title="Elimina"
            aria-label="Elimina risorsa"
          >
            <span aria-hidden="true">Canc</span>
            <span class="visually-hidden">Elimina</span>
          </button>
        </td>
      </tr>
      <tr v-if="risorse.length === 0">
        <td colspan="5">Nessuna Risorsa Trovata.</td>
      </tr>
    </tbody>
  </table>
        </div>
          <nav
            v-if="totalPages > 1"
            class="d-flex justify-content-center gap-2"
            aria-label="Navigazione pagine elenco risorse"
          >
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
        </div>
      </div>
    </div>
</template>
  
