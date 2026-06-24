<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { InterventoCalendario ,InterventiXstatNotValidate,InterventiXstatRetard,Manutenzione, Risorsa} from '../types';
import { Qalendar } from 'qalendar';
import 'qalendar/dist/style.css';
import '../style.css';
import { formatDate } from '../utils/funzRiusabili';

export default defineComponent({
  name: 'CalendarioInterventi',
  components: { Qalendar },
  data() {
    return {
      clickTimer: null as number | null,
      datiInterventi: [] as InterventoCalendario[],
      eventiCalendario: [] as any[],
      interventiNonValidati: [] as InterventiXstatNotValidate[],
      interventiRitardo: [] as InterventiXstatRetard[],
      manutenzioni: [] as Manutenzione[],
      Risorse: [] as Risorsa[],
      errorMessage: '',
      successMessage: '',
      loadingGenerazione: false,
      configCalendario: {
        dayBoundaries: {start: 8, end: 13,},
        defaultMode: 'month',
        week: { startsOn: 'monday', scrollToHour: 1, hideWeekend: false },
        eventDialog: { isCustom: false },
        style: { fontFamily: 'sans-serif' },
      },
    };
  },
  methods: {
    onDateClick(datetimeStr: string) {
      if (!this.clickTimer) {
        this.clickTimer = window.setTimeout(() => {
          this.clickTimer = null;
        }, 300);
      } else {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
        this.$router.push({
          path: '/Interventi',
          query: { date: datetimeStr }
        });
      }
    }, 
    onEventClick(payload: { clickedEvent: { id: string } }) {
      if (!this.clickTimer) {
        this.clickTimer = window.setTimeout(() => {this.clickTimer = null;}, 300);
        } else {
          clearTimeout(this.clickTimer);
          this.clickTimer = null;
              if (!payload?.clickedEvent?.id) {
                console.error('Struttura evento non valida:', payload)
              return
              }
          const eventId = payload.clickedEvent.id
          this.$router.push({name: 'Intervento',params: { id: eventId }})
          }
    },
    onClickNotValidated(intId: string) {
      if (!this.clickTimer) {
        this.clickTimer = window.setTimeout(() => {
        this.clickTimer = null;
        }, 300);
      } else {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
        this.$router.push({
        path: '/Fatture',
        query: { intId }
        });
      }
    },
    formatDate,

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
    fetchScheduleInt() {
      this.loadingGenerazione = true; 
      this.errorMessage = ''; 
      this.successMessage = ''; 

      axios.get('/api/genera-interventi')
      .then(res => {
          this.datiInterventi = res.data as any; 
          this.eventiCalendario = this.mappaEventiPerCalendario(res.data as any[]); 
          this.errorMessage = ''; 
          this.successMessage = `Generazione eseguita. Creati ${res.data?.length || 0} interventi. Aggiornamento calendario...`;
        })
        .catch(error => {
          console.error('Errore nella generazione via fetchScheduleInt:', error);
          this.errorMessage = 'Errore durante la generazione o l\'aggiornamento: ' + (error.response?.data?.message || error.message || error);
          this.successMessage = ''; 
        })
       .finally(() => {
           this.loadingGenerazione = false; 
       });
    },

    fetchInterventi() {
      axios
        .get('/api/InterventiCalendario')
        .then(res => {
          this.datiInterventi = res.data;
          this.eventiCalendario = this.mappaEventiPerCalendario(res.data);
          this.errorMessage = '';
          this.successMessage = 'Calendario caricato con successo.';
        })
        .catch(() => {
          this.errorMessage = 'Errore nel recupero degli interventi.';
          this.successMessage = '';
        });
    },
    fetchNonValidati() {
      axios
        .get('/api/InterventiNonValidati')
        .then(res => {
          this.interventiNonValidati = res.data;
        })
        .catch(() => {
          console.error('Errore fetching non validati');
        });
    },
    fetchRitardo() {
      axios
        .get('/api/InterventiRitardo')
        .then(res => {this.interventiRitardo = res.data;})
        .catch(() => {
          console.error('Errore fetching ritardo');
        });
    },
    
    mappaEventiPerCalendario(interventi: InterventoCalendario[]) {
      return interventi.map(e => ({
        title: `Intervento #${e.IntId}`,
        time: {start: `${e.DataIntPrev.split('T')[0]} ${(e.OraInizio ?? '08:00').slice(0,5)}`,
               end:   `${e.DataIntPrev.split('T')[0]} ${(e.OraFine   ?? '08:30').slice(0,5)}`},
        description: `${e.DescMan} su ${e.ModMacc}`,
        color: 'green',
        isEditable: false,
        id: e.IntId
      }));
    }
},
  mounted() {
    this.fetchRitardo();
    this.fetchRisorse();
    this.fetchInterventi();
    this.fetchNonValidati();

  },
});
</script>

<template>
  <div class="wider-container" aria-labelledby="home-titolo">
    <h1 id="home-titolo" class="visually-hidden">
      Cruscotto interventi e calendario manutenzioni
    </h1>

    <!-- Live region per messaggi di stato -->
    <div aria-live="polite" aria-atomic="true" class="visually-hidden">
      {{ successMessage || errorMessage }}
    </div>

    <div v-if="errorMessage" class="alert alert-danger" role="alert">
      <strong>Errore:</strong> {{ errorMessage }}
    </div>

    <div class="row g-3">
      <!-- Calendario -->
      <section class="col-12 col-md-7" aria-labelledby="cal-titolo">
        <div class="card shadow-sm mb-4">
          <div
            class="card-header d-flex justify-content-between align-items-center"
            style="background-color: var(--color-primary-700); color: var(--color-text-inverse);"
          >
            <h2 id="cal-titolo" class="h5 mb-0">Calendario interventi</h2>
            <button
              type="button"
              @click="fetchScheduleInt"
              class="btn btn-sm btn-light"
              :disabled="loadingGenerazione"
              :aria-busy="loadingGenerazione"
              aria-describedby="genera-help"
            >
              <span
                v-if="loadingGenerazione"
                class="spinner-border spinner-border-sm me-1"
                role="status"
                aria-hidden="true"
              ></span>
              {{ loadingGenerazione ? 'Generazione in corso…' : 'Genera interventi' }}
            </button>
          </div>
          <p id="genera-help" class="visually-hidden">
            Avvia la generazione automatica degli interventi pianificati in base alle frequenze.
          </p>
          <div class="card-body p-0">
            <div class="calendar-wrapper" role="region" aria-label="Calendario interventi pianificati">
              <Qalendar
                :events="eventiCalendario"
                :config="configCalendario"
                @datetime-was-clicked="onDateClick"
                @date-was-clicked="onDateClick"
                @event-was-clicked="onEventClick"
              />
            </div>
          </div>
        </div>
      </section>

      <!-- Interventi in ritardo -->
      <section class="col-12 col-md-3" aria-labelledby="ritardo-titolo">
        <div class="card shadow-sm">
          <div
            class="card-header"
            style="background-color: var(--color-danger); color: var(--color-text-inverse);"
          >
            <h2 id="ritardo-titolo" class="h6 mb-0">Interventi in ritardo</h2>
          </div>
          <div class="card-body p-2">
            <div class="overflow-auto">
              <table class="table table-sm mb-0">
                <caption class="visually-hidden">
                  Elenco degli interventi pianificati con data superata. Clic su una riga per aprirne il dettaglio.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Id</th>
                    <th scope="col">Risorsa</th>
                    <th scope="col">Manutenzione</th>
                    <th scope="col">Data prevista</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="evt in interventiRitardo"
                    :key="evt.IntId"
                    @click="onEventClick({ clickedEvent: { id: String(evt.IntId) } })"
                    @keydown.enter="onEventClick({ clickedEvent: { id: String(evt.IntId) } })"
                    @keydown.space.prevent="onEventClick({ clickedEvent: { id: String(evt.IntId) } })"
                    tabindex="0"
                    role="button"
                    :aria-label="`Apri intervento in ritardo ${evt.IntId}`"
                    style="cursor: pointer;"
                  >
                    <td class="ritardo">{{ evt.IntId }}</td>
                    <td class="ritardo">{{ evt.risorsa }}</td>
                    <td class="ritardo">{{ evt.noteIntervento }}</td>
                    <td class="ritardo">{{ evt.DataIntPrev ? formatDate(evt.DataIntPrev) : '' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-if="interventiRitardo.length === 0" class="text-center text-muted my-2">
              Nessun intervento in ritardo.
            </p>
          </div>
        </div>
      </section>

      <!-- Interventi da contabilizzare -->
      <section class="col-12 col-md-2" aria-labelledby="contab-titolo">
        <div class="card shadow-sm mb-4">
          <div
            class="card-header"
            style="background-color: var(--color-warning-bg); color: var(--color-warning);"
          >
            <h2 id="contab-titolo" class="h6 mb-0">Interventi da contabilizzare</h2>
          </div>
          <div class="card-body p-2">
            <div class="overflow-auto">
              <table class="table table-sm mb-0">
                <caption class="visually-hidden">
                  Interventi esterni in attesa di fattura. Clic su una riga per registrare la fattura.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Id</th>
                    <th scope="col">Fornitore</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="evt in interventiNonValidati"
                    :key="evt.IntId"
                    @click="onClickNotValidated(evt.IntId)"
                    @keydown.enter="onClickNotValidated(evt.IntId)"
                    @keydown.space.prevent="onClickNotValidated(evt.IntId)"
                    tabindex="0"
                    role="button"
                    :aria-label="`Registra fattura per intervento ${evt.IntId}`"
                    style="cursor: pointer;"
                  >
                    <td class="NotValidate">{{ evt.IntId }}</td>
                    <td class="NotValidate">{{ evt.RagSoc }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-if="interventiNonValidati.length === 0" class="text-center text-muted my-2">
              Nessun intervento da contabilizzare.
            </p>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>







