<template>
  <section class="not-found-wrapper" aria-labelledby="nf-titolo">
    <div class="not-found-card">
      <p
        class="display-1 fw-bold mb-2"
        style="color: var(--color-primary-600);"
        aria-hidden="true"
      >
        404
      </p>
      <h1 id="nf-titolo" class="h3 mb-3">Pagina non trovata</h1>
      <p class="lead mb-2">La pagina che cerchi non è disponibile.</p>
      <p class="text-muted mb-4">
        L'indirizzo potrebbe essere errato o il contenuto è stato spostato.
      </p>
      <RouterLink to="/" class="btn btn-primary">
        Torna alla home
      </RouterLink>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import '../style.css'

export default defineComponent({
  name: 'NotFound',
})
</script>
