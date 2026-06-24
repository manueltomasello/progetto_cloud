<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { Articolo } from '../types';
import '../style.css';

export default defineComponent({
  data() {
    return {
      datiArticoli: [] as Articolo[],
      selectedArticolo: null as Articolo | null,
      form: {
        NomeArt: '',
        DescArtBreve: '',
        DescArtLunga: '',
        Udm: 'pezzi',
        PrezzoStandard: 0,
      } as Omit<Articolo, 'Articolo'>,
      currentPage: 1,
      perPage: 18,
      errorMessage: '',
      successMessage: '',
    };
  },
  computed: {
    totalPages(): number {
      return Math.ceil(this.datiArticoli.length / this.perPage);
    },// math.ceil arrotonda per eccesso il numero di pagine
    /*const start = (this.currentPage - 1) * this.perPage;
Qui si calcola da quale posizione dell’array degli articoli bisogna iniziare a mostrare gli articoli nella pagina attuale.

Se sei alla pagina 1: (1-1)*18 = 0 → parti dal primo articolo.
Se sei alla pagina 2: (2-1)*18 = 18 → parti dal diciannovesimo articolo.
E così via. */
    articoliPaginati(): Articolo[] {
      const start = (this.currentPage - 1) * this.perPage;
      return this.datiArticoli.slice(start, start + this.perPage);
    },
  },
  methods: {
    getArticoli() {
      axios
        .get('/api/VisualizzazioneArticoli')
        .then((response) => {
          this.datiArticoli = response.data;
        })
        .catch((error) => {
          console.error('Errore nel recupero degli articoli', error);
          this.errorMessage = 'Errore nel recupero degli articoli.';
        });
    },
    deleteArticolo(articoloID: number) {
        axios.delete(`/api/CancellaArticoli/${articoloID}`)
          .then(() => {
            this.getArticoli();
            this.successMessage = 'Articolo eliminato con successo.';
          })
          .catch((error) => {
            console.error("Errore nell'eliminazione", error);
            this.errorMessage = "Errore nell'eliminazione dell'articolo.";
          });
    },
    editArticolo(articolo: Articolo) {
      this.selectedArticolo = articolo;
      this.form = { ...articolo };
    },
    saveArticolo() {
      const requestData: Articolo = {
        ...this.form,
        ...(this.selectedArticolo ? { Articolo: this.selectedArticolo.Articolo } : {}),
      };

      const request = this.selectedArticolo
        ? axios.put(`/api/ModificaArticoli/${this.selectedArticolo.Articolo}`, requestData)
        : axios.post('/api/CreaArticoli', this.form);

      request
        .then(() => {
          this.selectedArticolo = null;
          this.getArticoli();
          this.successMessage = this.selectedArticolo
            ? 'Articolo aggiornato con successo.'
            : 'Articolo aggiunto con successo.';
          this.resetForm();
        })
        .catch((error) => {
          console.error('Errore nel salvataggio', error);
          this.errorMessage = 'Errore nel salvataggio dell\'articolo.';
        });
    },
    resetForm() {
      this.selectedArticolo = null;
      this.form = {
        NomeArt: '',
        DescArtBreve: '',
        DescArtLunga: '',
        Udm: 'pezzi',
        PrezzoStandard: 0,
      };
      this.errorMessage = ''; 
      this.successMessage = '';
    },
  },
  mounted() {
    this.getArticoli();
  },
});
</script>

<template>
  <div class="wider-container" aria-labelledby="art-titolo">
    <h1 id="art-titolo" class="mb-4 text-center">Anagrafica Articoli</h1>

    <div class="row g-4">
      <!-- Form -->
      <section class="col-12 col-md-4" aria-labelledby="art-form-titolo">
        <h2 id="art-form-titolo" class="h5 mb-3">
          {{ selectedArticolo ? 'Modifica' : 'Aggiungi' }} articolo
        </h2>
        <p class="form-text mb-3">
          I campi con <span aria-hidden="true">*</span>
          <span class="visually-hidden">asterisco</span> sono obbligatori.
        </p>

        <form @submit.prevent="saveArticolo" class="vstack gap-3" novalidate>
          <div>
            <label for="nomeArt" class="form-label">Articolo *</label>
            <input id="nomeArt" v-model="form.NomeArt" type="text" class="form-control" required />
          </div>

          <div>
            <label for="descArtBreve" class="form-label">Descrizione Breve</label>
            <input id="descArtBreve" v-model="form.DescArtBreve" type="text" class="form-control" />
          </div>

          <div>
            <label for="descArtLunga" class="form-label">Descrizione Lunga</label>
            <textarea id="descArtLunga" v-model="form.DescArtLunga" class="form-control" rows="2" />
          </div>

          <div>
            <label for="udm" class="form-label">Unità *</label>
            <select id="udm" v-model="form.Udm" class="form-select" required>
              <option value="pezzi">Pezzi</option>
              <option value="litri">Litri</option>
              <option value="kg">Kg</option>
              <option value="metri">Metri</option>
              <option value="altro">Altro</option>
            </select>
          </div>

          <div>
            <label for="prezzoStandard" class="form-label">Prezzo (€) </label>
            <input
              id="prezzoStandard"
              v-model="form.PrezzoStandard"
              type="number"
              class="form-control"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div class="d-grid gap-2">
            <button type="submit" class="btn btn-primary">
              {{ selectedArticolo ? 'Aggiorna' : 'Aggiungi' }} articolo
            </button>
            <button v-if="selectedArticolo" @click="resetForm" type="button" class="btn btn-outline-primary">
              Annulla modifica
            </button>
          </div>
        </form>
      </section>

      <!-- TAB Art -->
      <div class="col-12 col-md-8">
        <div v-if="errorMessage" class="alert alert-danger" role="alert" aria-live="polite">
          {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="alert alert-success" role="alert" aria-live="polite">
          {{ successMessage }}
        </div>

        <div class="table-responsive mb-3" v-if="articoliPaginati.length > 0">
  <table class="table table-hover table-bordered align-middle text-center table-sm" aria-label="Elenco articoli">
    <thead class="table-dark">
      <tr>
        <th scope="col">Articolo</th>
        <th scope="col">Desc Breve</th>
        <th scope="col">Desc Completa</th>
        <th scope="col">Unità</th>
        <th scope="col">Prezzo</th>
        <th scope="col">Azioni</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="articolo in articoliPaginati"
        :key="articolo.Articolo"
        @click="editArticolo(articolo)"
        @keydown.enter.prevent="editArticolo(articolo)"
        @keydown.space.prevent="editArticolo(articolo)"
        style="cursor: pointer"
        :class="{ 'table-active': selectedArticolo?.Articolo === articolo.Articolo }"
        tabindex="0"
        role="button"
        :aria-label="`Seleziona articolo ${articolo.NomeArt}`"
      >
        <td>{{ articolo.NomeArt }}</td>
        <td>{{ articolo.DescArtBreve || 'N/A' }}</td>
        <td>{{ articolo.DescArtLunga || 'N/A' }}</td>
        <td>{{ articolo.Udm }}</td>
        <td>{{ articolo.PrezzoStandard }}€</td>
        <td>
          <button
            @click.stop="deleteArticolo(articolo.Articolo!)"
            class="btn btn-danger btn-sm"
            aria-label="Elimina articolo"
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

        <!-- Paginazione -->
        <nav v-if="totalPages > 1" class="d-flex justify-content-center gap-2" aria-label="Navigazione pagine elenco articoli">
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




