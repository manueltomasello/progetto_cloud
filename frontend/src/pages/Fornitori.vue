<script lang="ts">
  import { defineComponent } from 'vue';
  import axios from 'axios';
  import { Fornitore } from '../types';
  import '../style.css';
  
  export default defineComponent({
    data() {
      return {
        fornitori: [] as Fornitore[],
        selectedFornitore: null as Fornitore | null,
        form: {
          IdFornitore: '',
          RagSoc: '',
        } as Fornitore,
        currentPage: 1,       
        perPage: 12,  
        errorMessage: '',
        successMessage: '',
      };
    },
    computed: {
    totalPages(): number {
      return Math.ceil(this.fornitori.length / this.perPage);
    },
    FornitoriPaginati(): Fornitore[] {
      const start = (this.currentPage - 1) * this.perPage;
      return this.fornitori.slice(start, start + this.perPage);
    },
  },
    methods: {
      fetchFornitori() {
        axios
          .get('/api/VisualizzaFornitore')
          .then((res) => {
            this.fornitori = res.data;
          })
          .catch(() => {
            this.errorMessage = 'Errore durante il caricamento dei fornitori.';
          });
      },
      saveFornitore() {
        const data: Fornitore = {
          ...this.form,
          ...(this.selectedFornitore ? { IdFornitore: this.selectedFornitore.IdFornitore } : {}),
        };
  
        const request = this.selectedFornitore 
          ? axios.put(`/api/ModificaFornitore/${data.IdFornitore}`, data)
          : axios.post('/api/CreaFornitore', data);
  
        request
          .then(() => {
            this.successMessage = this.selectedFornitore
              ? 'Fornitore aggiornato con successo.'
              : 'Fornitore aggiunto con successo.';
            this.resetForm();
            this.fetchFornitori();
          })
          .catch(() => {
            this.errorMessage = 'Errore durante il salvataggio.';
          });
      },
      editFornitore(f: Fornitore) {
        this.selectedFornitore = f;
        this.form = { ...f };
      },
      deleteFornitore(id: string) {
          axios.delete(`/api/CancellaFornitore/${id}`)
            .then(() => {
              this.successMessage = 'Fornitore eliminato.';
              this.fetchFornitori();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            })
            .catch(() => {
              this.errorMessage = 'Errore durante l\'eliminazione.';
              window.scrollTo({ top: 0, behavior: 'smooth' });
            });
      },
      resetForm() {
        this.selectedFornitore = null;
        this.form = {
          IdFornitore: '',
          RagSoc: '',
         };
         this.errorMessage = ''; 
         this.successMessage = '';
      },
    },
    mounted() {
      this.fetchFornitori();
    },
  });
</script>
<template>
    <div class="wider-container" aria-labelledby="forn-titolo">
      <h1 id="forn-titolo" class="mb-4 text-center">Gestione Fornitori</h1>
      <div class="row g-4">
        <!-- FORM -->
        <div class="col-12 col-md-4">
          <section class="card shadow-sm" aria-labelledby="forn-form-titolo">
            <h2 id="forn-form-titolo" class="h6 card-header text-white mb-0" style="background-color: var(--color-primary-700);">
              {{ selectedFornitore ? 'Modifica fornitore' : 'Nuovo fornitore' }}
            </h2>
            <div class="card-body">
              <form @submit.prevent="saveFornitore" class="vstack gap-2">
                <div>
                  <label for="IdFornitore" class="form-label">ID Fornitore</label>
                  <input
                    id="IdFornitore"
                    type="text"
                    v-model="form.IdFornitore"
                    class="form-control"
                    :readonly="selectedFornitore !== null"
                    required
                    aria-required="true"
                  />
                </div>
                <div>
                  <label for="RagSoc" class="form-label">Ragione Sociale</label>
                  <input
                    id="RagSoc"
                    type="text"
                    v-model="form.RagSoc"
                    class="form-control"
                    required
                    aria-required="true"
                  />
                </div>
                <div class="d-grid gap-2 mt-3">
                  <button type="submit" class="btn btn-primary">
                    {{ selectedFornitore ? 'Salva Modifiche' : 'Aggiungi Fornitore' }}
                  </button>
                  <button v-if="selectedFornitore" @click="resetForm" type="button" class="btn btn-secondary">
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
  
          <div class="table-responsive">
  <table class="table table-hover table-bordered align-middle text-center table-sm" aria-label="Elenco fornitori">
    <thead class="table-dark">
      <tr>
        <th scope="col">ID Fornitore</th>
        <th scope="col">Ragione Sociale</th>
        <th scope="col">Azioni</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="fornitore in FornitoriPaginati"
        :key="fornitore.IdFornitore"
        @click="editFornitore(fornitore)"
        @keydown.enter.prevent="editFornitore(fornitore)"
        @keydown.space.prevent="editFornitore(fornitore)"
        style="cursor: pointer"
        :class="{ 'table-active': selectedFornitore?.IdFornitore === fornitore.IdFornitore }"
        tabindex="0"
        role="button"
        :aria-label="`Seleziona fornitore ${fornitore.RagSoc}`"
      >
          <td>{{ fornitore.IdFornitore }}</td>
          <td>{{ fornitore.RagSoc }}</td>
          <td>
            <button class="btn btn-danger btn-sm" @click.stop="deleteFornitore(fornitore.IdFornitore)"aria-label="Elimina fornitore"
              title="Elimina">
              <span aria-hidden="true">Canc</span>
              <span class="visually-hidden">Elimina</span>
                  </button>
                </td>
                </tr>
                <tr v-if="fornitori.length === 0">
                  <td colspan="3">Nessun fornitore trovato.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <nav v-if="totalPages > 1" class="d-flex justify-content-center gap-2" aria-label="Navigazione pagine elenco fornitori">
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
  
