<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios';
import { Bar } from 'vue-chartjs'
import { Pie } from 'vue-chartjs'
import { ChartOptions } from 'chart.js';
import * as XLSX from 'xlsx';
import { CostoRisorsa, StoricoRicambi, StoricoInterventi, ConsumoComponenti, OreLavorateDip, OreLavorateRis, delayOperativo } from '../types';
import '../style.css';
import { formatDate, sfumatura, generateColors, exportToExcel } from '../utils/funzRiusabili';



export default defineComponent({
  data() {
    return {
      selectedConsultation: 'costoRisorsa',
      costoRisorse: [] as CostoRisorsa[],
      storicoRicambi: [] as StoricoRicambi[],
      storicoInterventi: [] as StoricoInterventi[],
      consumoComponenti: [] as ConsumoComponenti[],
      oreLavorateDip: [] as OreLavorateDip[],
      oreLavorateRis: [] as OreLavorateRis[],
      delayOperativo: [] as delayOperativo[],
      clickTimer: null as number | null,
    };
  },
  components: {
  Bar,
  Pie
  },
  computed: {
    chartOptions(): ChartOptions<'bar'>{
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#333',
              font: {
                size: 14
              }
            }
          },
          title: {
            display: true,
            color: '#2c3e50',
            font: {
              size: 18,
              weight: 'bold'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0,0,0,0.8)',
            titleFont: { size: 16 },
            bodyFont: { size: 14 },
            padding: 10
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f0f0f0' },
            ticks: { color: '#333', font: { size: 14 } }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#333', font: { size: 14 } }
          }
        },
        animation: {
          duration: 3000,
          easing: 'easeInOutQuart'
        }
      }
    },
    pieChartOptions(): ChartOptions<'pie'> {
  return {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#333',
          font: { size: 14 }
        }
      },
      title: {
            display: true,
            color: 'black',
            font: {
              size: 18,
              weight: 'bold'
            }
       },
       
    }

  };
    },

    costoRisorsaChartData() {
      const labels = this.costoRisorse.map(r => r.ModMacc);
      const data = this.costoRisorse.map(r => r.CostoTotale ?? 0);
      const colors = this.generateColors(data.length);
      return {
        labels,
        datasets: [{
          label: 'Costo Totale (€)',
          backgroundColor: colors,
          borderColor: 'white',
          borderWidth: 2,
          borderRadius: 5,
          data
        }]
      }
    },
    oreLavorateDipChartData() {
      const labels = this.oreLavorateDip.map(d => `${d.NomeDip} ${d.CognDip}`);
      const data = this.oreLavorateDip.map(d => d.OreLavorate || 0 / 3600);
      const colors = this.generateColors(data.length);
      return {
        labels,
        datasets: [{
          label: 'Ore Lavorate',
          backgroundColor: colors,         
          borderWidth: 2,
          borderRadius: 5,
          data
        }]
      }
    },
    oreLavorateRisChartData() {
      return {
        labels: this.oreLavorateRis.map(lr => `${lr.Modello} ${lr.Risorsa}` ),
        datasets: [{
          label: 'Ore Lavorate per Risorsa',
          backgroundColor: this.sfumatura('#3366cb', '#6699fd'),
          borderColor: '#3366cb',
          borderWidth: 2,
          borderRadius: 5,
          data: this.oreLavorateRis.map(lr => lr.OreLavorate),
        }]
      }
    },
    risorsaConPiuInterventiChartData() {
      const counts: Record<string, Record<string, number>> = {};

      // Raggruppo per modello e causa guasto
      this.storicoInterventi.forEach(intervento => {
        const modello = intervento.Modello;
        const causaDesc = intervento.TipoGuasto || `ID Guasto: ${intervento.TipoGuastoId}`; // Fallback se TipoGuasto è vuoto

        if (!counts[modello]) {
          counts[modello] = {};
        }
        if (!counts[modello][causaDesc]) {
          counts[modello][causaDesc] = 0;
        }
        counts[modello][causaDesc]++;
      });

      const modelli = Object.keys(counts);
      const causeGuastoSet = new Set<string>();

      modelli.forEach(modello => {
        Object.keys(counts[modello]).forEach(causa => {
          causeGuastoSet.add(causa);
        });
      });

      const causeGuasto = Array.from(causeGuastoSet);
      const colors = this.generateColors(causeGuasto.length);

      const datasets = causeGuasto.map((causa, index) => {
        return {
          label: causa,
          data: modelli.map(modello => counts[modello][causa] || 0),
          backgroundColor: colors[index],
          stack: 'stack-1',
          borderRadius: 4,
        };
      });

      return {
        labels: modelli,
        datasets
      };
    },
    consumoComponentiChartData() {
      return {
        labels: this.consumoComponenti.map(c => c.NomeArt),
        datasets: [{
          label: 'Quantità Consumata',
          backgroundColor: this.sfumatura('#ff9f40', '#ffbf73'),
          borderColor: '#ff9f40',
          borderWidth: 2,
          borderRadius: 5,
          data: this.consumoComponenti.map(c => c.quantitaConsumata ?? 0),
        }]
      }
    },
    delayOperativoPieData() {
      const dato = this.delayOperativo[0]; //prima passavo un array di array di numeri, che mandava il alert tutto
      return {
        labels: ['Interventi in Ritardo', 'Interventi Puntuali'],
        datasets: [{
        data: [dato.percentualeRitardo, dato.PercentualePuntualita],
        backgroundColor: ['red', 'gray'],
        hoverOffset: 10,
        }]
      };
    }

  },
 

  methods: {
    // facendo così faccio 7chiamate http in contemporanea, se un giorno voglio aggrare più report o grafici non ho problemi
    fetchData() {
      Promise.all([
        axios.get('/api/ConsCosto'),
        axios.get('/api/storico-ricambi'),
        axios.get('/api/ConsStoricoInterventi'),
        axios.get('/api/ConsumoComponenti'),
        axios.get('/api/OreLavorateDip'),
        axios.get('/api/OrelavoratePerRis'),
        axios.get('/api/delayOperativo')
      ])
      .then(([costoResponse, ricambiResponse, interventiResponse, componentiResponse, oreDipResponse, oreRisResponse,delayOperativoResponse]) => {
        this.costoRisorse = costoResponse.data;
        this.storicoRicambi = ricambiResponse.data;
        this.storicoInterventi = interventiResponse.data;
        this.consumoComponenti = componentiResponse.data;
        this.oreLavorateDip = oreDipResponse.data;
        this.oreLavorateRis = oreRisResponse.data;
        this.delayOperativo = delayOperativoResponse.data;

      })
    .catch(error => {
      console.error('Errore nel recupero dei dati', error);
    });
    },
    sfumatura,
    formatDate,
    generateColors,
    exportToExcel,
  
    

    onEventClick(payload: { clickedEvent: { id: string } }) {
      if (!this.clickTimer) {
        this.clickTimer = window.setTimeout(() => {
          this.clickTimer = null;
        }, 300);
      } else {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
    if (!payload?.clickedEvent?.id) {
      console.error('Struttura evento non valida:', payload)
      return
    }
    const eventId = payload.clickedEvent.id
    this.$router.push({
      name: 'Intervento',
      params: { id: eventId }
    })
  }
},
  },
  mounted() {
    this.fetchData();
  },
});
</script>
<template>
  <div class="row mb-4" aria-labelledby="cons-titolo">
    <div class="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between mb-4 gap-3">
      <h1 id="cons-titolo" class="h3 m-0">Consultazioni</h1>
      <button
        type="button"
        @click="exportToExcel"
        class="btn btn-sm btn-outline-primary"
        aria-label="Esporta la consultazione corrente in formato Excel"
      >
        <i class="bi bi-file-earmark-excel" aria-hidden="true"></i>
        Esporta in Excel
      </button>
    </div>

    <!-- Selettore consultazione -->
    <div class="mb-4">
      <label for="consultationSelect" class="form-label">Seleziona una consultazione</label>
      <select
        id="consultationSelect"
        v-model="selectedConsultation"
        class="form-select"
        aria-describedby="consultation-help"
      >
        <option value="costoRisorsa">Costo Risorsa</option>
        <option value="storicoRicambi">Storico Ricambi</option>
        <option value="storicoInterventi">Storico Interventi</option>
        <option value="consumoComponenti">Consumo Componenti</option>
        <option value="oreLavorateDip">Ore Lavorate per Dipendente</option>
        <option value="oreLavorateRis">Ore Lavorate per Risorsa</option>
        <option value="delayOperativo">Delay Operativo</option>
      </select>
      <small id="consultation-help" class="form-text">
        Cambiando la selezione si aggiorna grafico e tabella sottostanti.
      </small>
    </div>

    <!-- Consultazioni -->
    <div class="row" v-if="selectedConsultation === 'costoRisorsa'">
      <div  class="chart-container mb-4 col-md-6">
        <Bar :data="costoRisorsaChartData" :options="{...chartOptions,plugins: {...chartOptions.plugins,
        title: { ...chartOptions.plugins?.title, text: 'Costo Risorsa per Modello Macchina' }}}"/>
    </div>
    <div class="col-md-6 table-responsive">
      <table class="table table-hover table-striped table-bordered table-sm">
        <thead class="table-light">
          <tr>
            <th scope="col">Nome Risorsa</th>
            <th scope="col">Modello Macchina</th>
            <th scope="col">Costi Totali</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="risorsa in costoRisorse" :key="risorsa.NomeRisorsa">
            <td>{{ risorsa.NomeRisorsa }}</td>
            <td>{{ risorsa.ModMacc }}</td>
            <td>{{ risorsa.CostoTotale }}€</td>
          </tr>
        </tbody>
      </table>
      </div>
    </div>

    <div v-if="selectedConsultation === 'delayOperativo'" class="chart-container">
  <Pie :data="delayOperativoPieData" :options="{...pieChartOptions, plugins: {...pieChartOptions.plugins,
      title: {...pieChartOptions.plugins?.title, text:'% Ritardo sull\'operatività'}}}" />
    </div>


    <div v-if="selectedConsultation === 'storicoRicambi'">
      <h2 class="h3 mb-3">Storico Ricambi</h2>
      <div class="col-md-12 table-responsive">
      <table class="table table-hover table-striped table-bordered table-responsive-sm table-sm">
        <thead class="table-light">
          <tr>
            <th scope="col">Intervento ID</th>
            <th scope="col">Articolo</th>
            <th scope="col">Descrizione</th>
            <th scope="col">Quantità</th>
            <th scope="col">Unità</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="ricambio in storicoRicambi" :key="ricambio.ArticoloID">
            <td>{{ ricambio.InterventoID }}</td>
            <td>{{ ricambio.Articolo }}</td>
            <td>{{ ricambio.DescrizioneArticolo }}</td>
            <td>{{ ricambio.Quantita }}</td>
            <td>{{ ricambio.Unità }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    </div>

    <div v-if="selectedConsultation === 'storicoInterventi'">
      <h2 class="h3 mb-3">Storico Interventi</h2>
      <div class="chart-container mb-4">
      <Bar :data="risorsaConPiuInterventiChartData" :options="{...chartOptions,plugins: {...chartOptions.plugins,
            title: { ...chartOptions.plugins?.title, text: 'Interventi e causali di guasto per Risorsa' }}}"/>
    </div>
    <div class="table-responsive">
      <table class="table table-hover table-striped table-bordered table-sm">
        <thead class="table-light">
          <tr>
            <th scope="col">Intervento ID</th>
            <th scope="col">Risorsa</th>
            <th scope="col">Modello</th>
            <th scope="col">Data Pianificata</th>
            <th scope="col">Data Effettiva</th>
            <th scope="col">Durata</th>
            <th scope="col">Operatori</th>
            <th scope="col">Fornitori</th>
            <th scope="col">Importo</th>

            <th scope="col">Esito</th>
            <th scope="col">Tipo Guasto</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="intervento in storicoInterventi" :key="intervento.InterventoID">
            <td @click="onEventClick({ clickedEvent: { id: String(intervento.InterventoID) } })" style="cursor: pointer;">
              {{ intervento.InterventoID }}</td>
            <td>{{ intervento.Risorsa }}</td>
            <td>{{ intervento.Modello }}</td>
            <td>{{ formatDate(intervento.DataPianificata) }}</td>
            <td>{{intervento.DataEffettiva ? formatDate(intervento.DataEffettiva):'' }}</td>
            <td v-if="intervento.TempoEseguito === null">{{ intervento.TempoEseguito }}</td>
            <td v-if="intervento.TempoEseguito !== null">{{ intervento.TempoEseguito }} h</td>
            <td>{{ intervento.OperatoreCoinvolto }}</td>
            <td>{{ intervento.AziendaCoinvolta }}</td>
            <td v-if="intervento.importo === null">{{ intervento.importo }}</td>
            <td v-if="intervento.importo !== null">{{ intervento.importo }} €</td>
            <td>{{ intervento.EsitoManutenzione }}</td>
            <td>{{ intervento.TipoGuasto }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

    <div class="row"v-if="selectedConsultation === 'consumoComponenti'">
      <h2 class="h3 mb-3">Consumo Componenti</h2>
      <div class="chart-container mb-4 col-md-8">
      <Bar :data="consumoComponentiChartData" :options="{  ...chartOptions, plugins: {...chartOptions.plugins,
            title: { ...chartOptions.plugins?.title, text: 'Consumo Componenti' }} }"/>
    </div>
    <div class="col-md-4 table-responsive">
      <table class="table table-hover table-striped table-bordered table-sm">
        <thead class="table-light">
          <tr>
            <th scope="col">Nome Articolo</th>
            <th scope="col">Quantità Consumata</th>
            <th scope="col">Descrizione Breve</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="componente in consumoComponenti" :key="componente.NomeArt">
            <td>{{ componente.NomeArt }}</td>
            <td>{{ componente.quantitaConsumata }}</td>
            <td>{{ componente.descArtBreve }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

    <div class="row" v-if="selectedConsultation === 'oreLavorateDip'">
      <h2 class="h3 mb-3">Ore Lavorate per Dipendente</h2>
      <div  class="chart-container mb-4 col-md-6">
        <Bar :data="oreLavorateDipChartData" :options="{...chartOptions,plugins: { ...chartOptions.plugins,
            title: { ...chartOptions.plugins?.title, text: 'Ore Lavorate per Dipendente' }}}"/>
    </div>
    <div class="col-md-6 table-responsive">
      <table class="table table-hover table-striped table-bordered table-sm">
        <thead class="table-light">
          <tr>
            <th scope="col">Matricola</th>
            <th scope="col">Nome</th>
            <th scope="col">Cognome</th>
            <th scope="col">Ore Lavorate</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="dipendente in oreLavorateDip" :key="dipendente.IdDip">
            <td>{{ dipendente.Matricola }}</td>
            <td>{{ dipendente.NomeDip }}</td>
            <td>{{ dipendente.CognDip }}</td>
            <td>{{ dipendente.OreLavorate }} h</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

    <div class="row" v-if="selectedConsultation === 'oreLavorateRis'">
      <h2 class="h3 mb-3">Ore Lavorate per Risorsa</h2>
      <div class="chart-container mb-4 col-md-6">
      <Bar :data="oreLavorateRisChartData" :options="{...chartOptions,plugins: {...chartOptions.plugins,
            title: { ...chartOptions.plugins?.title, text: 'Tempo Eseguito per Risorsa' }}}"/>
      </div>
      <div class="col-md-6 table-responsive">
      <table class="table table-hover table-striped table-bordered table-sm">
        <thead class="table-light">
          <tr>
            <th scope="col">Risorsa</th>
            <th scope="col">Modello</th>
            <th scope="col">Ore Lavorate</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="risorsa in oreLavorateRis" :key="risorsa.Risorsa">
            <td>{{ risorsa.Risorsa }}</td>
            <td>{{ risorsa.Modello }}</td>
            <td>{{ risorsa.OreLavorate }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>
</template>



  
  
