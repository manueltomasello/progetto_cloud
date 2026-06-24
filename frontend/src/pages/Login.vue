<template>
  <section class="container mt-5" aria-labelledby="login-titolo">
    <Transition name="title-fade" appear>
      <h1 id="login-titolo" class="text-center mb-4">Accedi</h1>
    </Transition>

    <div class="row justify-content-center">
      <div class="col-md-5 col-lg-4">
        <Transition name="card-fade" appear>
          <form
            @submit.prevent="onSubmit"
            class="card p-4 shadow-sm"
            novalidate
            aria-describedby="login-aiuto"
          >
            <p id="login-aiuto" class="form-text mb-3">
              Inserisci le credenziali fornite dall'amministratore di sistema.
              I campi contrassegnati con <span aria-hidden="true">*</span>
              <span class="visually-hidden">asterisco</span> sono obbligatori.
            </p>

            <div class="mb-3">
              <label for="username" class="form-label">
                <span class="required-mark">Username</span>
              </label>
              <input
                v-model="username"
                type="text"
                id="username"
                class="form-control"
                autocomplete="username"
                required
                :aria-invalid="hasError"
                aria-describedby="username-help"
              />
              <small id="username-help" class="form-text">
                Lo username assegnato al tuo account.
              </small>
            </div>

            <div class="mb-3">
              <label for="password" class="form-label">
                <span class="required-mark">Password</span>
              </label>
              <input
                v-model="password"
                type="password"
                id="password"
                class="form-control"
                autocomplete="current-password"
                required
                :aria-invalid="hasError"
              />
            </div>

            <button
              type="submit"
              class="btn btn-primary w-100"
              :disabled="loading"
              :aria-busy="loading"
            >
              <span v-if="!loading">Login</span>
              <span v-else>
                <span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
                Accesso in corso…
              </span>
            </button>

            <Transition name="alert-slide-fade">
              <div
                v-if="errorMessage"
                class="alert alert-danger mt-3"
                role="alert"
                aria-live="assertive"
              >
                <strong>Errore:</strong> {{ errorMessage }}
              </div>
            </Transition>
          </form>
        </Transition>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import '../style.css'

export default defineComponent({
  data() {
    return {
      username: '',
      password: '',
      errorMessage: '',
      loading: false,
    }
  },
  computed: {
    hasError(): boolean {
      return this.errorMessage.length > 0
    },
  },
  methods: {
    async onSubmit() {
      this.errorMessage = ''
      this.loading = true
      try {
        await axios.post('/api/auth/login', {
          username: this.username,
          password: this.password,
        })
        location.href = '/'
      } catch (error: any) {
        if (error.response) {
          this.errorMessage = `${error.response.data}`
        } else {
          this.errorMessage = error.message ?? 'Errore sconosciuto'
        }
      } finally {
        this.loading = false
      }
    },
  },
})
</script>
