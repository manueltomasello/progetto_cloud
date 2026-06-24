import { createApp } from "vue"
import { createRouter, createWebHistory, Router } from "vue-router"
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale,ChartOptions,ChartData, ArcElement } from 'chart.js'
import axios from 'axios';


import 'bootstrap'
import "bootstrap/dist/css/bootstrap.min.css"
import "./style.css"
import "qalendar/dist/style.css";
import App from "./App.vue"
import Login from "./pages/Login.vue"
import NotFound from "./pages/NotFound.vue"
import Articolo from "./pages/Articolo.vue"
import Consultazioni from "./pages/Consultazioni.vue"
import Dipendenti from "./pages/dipendenti.vue"
import Manutenzioni from "./pages/Manutenzioni.vue"
import Fornitori from "./pages/Fornitori.vue"
import Risorse from "./pages/Risorse.vue"
import Fatture from "./pages/Fatture.vue"
import Interventi from "./pages/Interventi.vue"
import Home from "./pages/Home.vue"

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement)


const router: Router = createRouter({
  history: createWebHistory(),
  routes: [

    { path: "/login", component: Login },
    { path: "/", component: Home, meta: { requiresAuth: true } },
    { path: "/:pathMatch(.*)*", component: NotFound },
    { path: "/articolo", component: Articolo, meta: { requiresAuth: true } },
    { path: "/Consultazioni", component: Consultazioni, meta: { requiresAdmin: true } },
    { path: "/Dipendenti", component: Dipendenti, meta: { requiresAdmin: true } },
    { path: "/Manutenzioni", component: Manutenzioni, meta: { requiresAuth: true } },
    { path: "/Fornitori", component: Fornitori, meta: { requiresAuth: true } },
    { path: "/Risorse", component: Risorse, meta: { requiresAuth: true } },
    { path: "/Fatture", component: Fatture, meta: { requiresAdmin: true } },
    { path: "/Interventi", component: Interventi, meta: { requiresAuth: true } },
    {
      path: "/intervento/:id",
      name: "Intervento",
      component: Interventi,
      props: true,
      meta: { requiresAuth: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.meta.requiresAuth
  const requiresAdmin = to.meta.requiresAdmin

  try {
    const res = await axios.get("/api/auth/getProfile")
    const user = res.data

    if (requiresAdmin && user?.ruolo !== "admin") {
      alert("Accesso riservato agli amministratori")
      return next("/login")
    }

    if (requiresAuth && !user) {
      return next("/login")
    }

    next()
  } catch (error) {
    // Qualsiasi errore (es. non loggato): blocca accesso a rotte protette
    if (requiresAuth || requiresAdmin) {
      return next("/login")
    }

    next()
  }
})


createApp(App)
  .use(router)
  .mount("#app")
