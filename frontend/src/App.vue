<script lang="ts">
import axios from "axios"
import { defineComponent } from "vue"
import { Dipendente } from "./types"

/**
 * Layout principale dell'applicazione.
 *
 * Implementa le linee guida WCAG 2.1 AA:
 *  - Skip link iniziale (criterio 2.4.1 Bypass Blocks)
 *  - Landmark semantici: <header>, <nav>, <main>, <footer> (1.3.1)
 *  - Attributo lang="it" globale (3.1.1)
 *  - Aria-current sulla rotta attiva, aria-expanded sui dropdown,
 *    aria-haspopup, aria-live per i feedback
 *  - Focus management: il pulsante di logout torna alla home dopo
 *    l'azione e l'app annuncia gli stati allo screen reader
 */
export default defineComponent({
  data() {
    return {
      user: null as Dipendente | null,
      announcer: '' as string,
    }
  },
  methods: {
    async getUser() {
      try {
        const res = await axios.get("/api/auth/getProfile")
        this.user = res.data
      } catch (e) {
        this.user = null
      }
    },
    async logout() {
      try {
        await axios.post("/api/auth/logout")
        this.user = null
        this.announcer = 'Logout effettuato con successo. Reindirizzamento al login in corso.'
        this.$router.push("/login")
      } catch (err) {
        this.announcer = 'Errore durante il logout. Riprovare più tardi.'
      }
    },
  },
  mounted() {
    this.getUser()
  },
  watch: {
    $route(to) {
      // Annuncio rotta corrente per utenti screen reader
      const titoli: Record<string, string> = {
        '/': 'Home',
        '/login': 'Accesso',
        '/Dipendenti': 'Dipendenti',
        '/Fornitori': 'Fornitori',
        '/Fatture': 'Fatture',
        '/Risorse': 'Risorse',
        '/Articolo': 'Articoli',
        '/Manutenzioni': 'Manutenzioni',
        '/Interventi': 'Interventi',
        '/Consultazioni': 'Consultazioni',
      }
      const t = titoli[to.path] ?? to.name?.toString() ?? 'Pagina aggiornata'
      this.announcer = `Pagina ${t} caricata`
      document.title = `${t} – ManuTenz`
    },
  },
})
</script>

<template>
  <div class="d-flex flex-column min-vh-100 bg-light text-dark" lang="it">
    <!-- Skip link: primo elemento focusabile della pagina -->
    <a href="#contenuto-principale" class="skip-link">
      Salta al contenuto principale
    </a>

    <!-- Live region per annunci dinamici (route, logout, errori) -->
    <div class="visually-hidden" aria-live="polite" aria-atomic="true">{{ announcer }}</div>

    <!-- Intestazione brand: marcata come banner -->
    <header class="py-3" role="banner" style="background-color: var(--color-primary-700);">
      <div class="container d-flex align-items-center">
        <div class="d-inline-flex align-items-center bg-white rounded-pill px-3 py-1">
          <h1 class="h3 m-0 me-3" style="color: var(--color-primary-700);">ManuTenz</h1>
          <img
            src="../img/salami.png"
            alt="Logo Salami S.p.A."
            style="max-height: 30px; width: auto;"
          />
        </div>
      </div>
    </header>

    <!-- Navigazione primaria -->
    <nav
      v-if="user"
      class="navbar navbar-expand-lg sticky-top shadow-sm"
      aria-label="Navigazione principale"
    >
      <div class="container-fluid">
        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Apri o chiudi il menu di navigazione"
        >
          <span class="navbar-toggler-icon" aria-hidden="true"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarContent">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link
                to="/"
                class="nav-link"
                active-class="active"
                exact-active-class="active"
                aria-label="Vai alla home"
              >
                Home
              </router-link>
            </li>

            <li v-if="user?.ruolo === 'admin'" class="nav-item dropdown">
              <button
                class="nav-link dropdown-toggle btn btn-link"
                id="anagraficheDropdown"
                type="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Anagrafiche
              </button>
              <ul class="dropdown-menu" aria-labelledby="anagraficheDropdown">
                <li><router-link to="/Dipendenti" class="dropdown-item">Dipendenti</router-link></li>
                <li><router-link to="/Fornitori" class="dropdown-item">Fornitori</router-link></li>
                <li><router-link to="/Fatture"   class="dropdown-item">Fatture</router-link></li>
                <li><router-link to="/Risorse"   class="dropdown-item">Risorse</router-link></li>
                <li><router-link to="/Articolo"  class="dropdown-item">Articoli</router-link></li>
              </ul>
            </li>

            <li v-if="user" class="nav-item dropdown">
              <button
                class="nav-link dropdown-toggle btn btn-link"
                id="interventiDropdown"
                type="button"
                data-bs-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                Gestione
              </button>
              <ul class="dropdown-menu" aria-labelledby="interventiDropdown">
                <li><router-link to="/Manutenzioni" class="dropdown-item">Manutenzioni</router-link></li>
                <li><router-link to="/Interventi"   class="dropdown-item">Interventi</router-link></li>
              </ul>
            </li>

            <li v-if="user?.ruolo === 'admin'" class="nav-item">
              <router-link
                to="/Consultazioni"
                class="nav-link"
                active-class="active"
                exact-active-class="active"
              >
                Consultazioni
              </router-link>
            </li>
          </ul>

          <div class="d-flex ms-auto align-items-center">
            <span class="text-white me-3" v-if="user">
              <span class="visually-hidden">Utente connesso: </span>
              {{ user.NomeDip }}
              <span class="badge bg-light text-dark ms-1" aria-label="Ruolo">
                {{ user.ruolo }}
              </span>
            </span>
            <button
              type="button"
              @click="logout"
              class="btn btn-danger"
              aria-label="Esci dall'applicazione"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Contenuto principale: marcato esplicitamente per screen reader -->
    <main
      id="contenuto-principale"
      class="flex-grow-1 p-3"
      role="main"
      tabindex="-1"
    >
      <div class="container bg-white shadow-sm rounded p-4 wider-container">
        <router-view v-slot="{ Component }">
          <transition name="card-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

    <!-- Footer (visibile sempre per utenti non autenticati) -->
    <footer
      v-if="!user"
      class="text-center py-3 mt-auto"
      role="contentinfo"
    >
      <small>
        Gestionale Manutenzioni – Ingegneria dei sistemi web,
        Università di Bologna · Progetto Salami S.p.A.
      </small>
    </footer>
  </div>
</template>
