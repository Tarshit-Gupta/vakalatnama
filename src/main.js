import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import { supabase } from './lib/supabase'

// Initialize Theme (Dark Mode default)
const savedTheme = localStorage.getItem('vakalatnama_theme') || 'dark'
if (savedTheme === 'light') {
  document.documentElement.classList.add('light-theme')
} else {
  document.documentElement.classList.remove('light-theme')
}

// ── Lazy-load all pages for better performance ────────────────────────
const LoginPage    = () => import('./pages/LoginPage.vue')
const DashboardPage = () => import('./pages/DashboardPage.vue')
const ClientsPage  = () => import('./pages/ClientsPage.vue')
const CasesPage    = () => import('./pages/CasesPage.vue')
const NewCasePage  = () => import('./pages/NewCasePage.vue')
const CaseDetailPage = () => import('./pages/CaseDetailPage.vue')
const CaseReviewPage = () => import('./pages/CaseReviewPage.vue')
const ConsentPage  = () => import('./pages/ConsentPage.vue')
const SettingsPage = () => import('./pages/SettingsPage.vue')
const UpgradePage  = () => import('./pages/UpgradePage.vue')

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/dashboard', component: DashboardPage },
  { path: '/cases', component: CasesPage },
  { path: '/clients', component: ClientsPage },
  { path: '/new-case', component: NewCasePage },
  { path: '/case-detail/:id', component: CaseDetailPage },
  { path: '/case-review/:id',  component: CaseReviewPage },
  { path: '/consent/:id',      component: ConsentPage },
  { path: '/settings',         component: SettingsPage },
  { path: '/upgrade',          component: UpgradePage },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// ── Public routes (no auth required) ─────────────────────────────────
const publicRoutes = ['/login']

// ── Route guard ───────────────────────────────────────────────────────
router.beforeEach(async (to) => {
  try {
    const { data: { session } } = await supabase.auth.getSession()

    // Redirect unauthenticated users to login
    if (!session && !publicRoutes.includes(to.path)) return '/login'

    // Redirect authenticated users away from login
    if (session && to.path === '/login') return '/dashboard'

    // Case ownership check — prevent accessing other advocates' cases
    if (session && to.params.id && (to.path.includes('/case-detail') || to.path.includes('/case-review') || to.path.includes('/consent'))) {
      const { data: caseData } = await supabase
        .from('cases')
        .select('advocate_id')
        .eq('id', to.params.id)
        .maybeSingle()

      if (caseData && caseData.advocate_id !== session.user.id) {
        console.warn('[Route Guard] Unauthorized access to case:', to.params.id)
        return '/dashboard'
      }
    }
  } catch {
    if (!publicRoutes.includes(to.path)) return '/login'
  }
})

// ── Dynamic page titles ────────────────────────────────────────────────
router.afterEach((to) => {
  const titles = {
    '/dashboard': 'Cases — VakalatNama',
    '/clients':   'Clients — VakalatNama',
    '/new-case':  'New Case — VakalatNama',
    '/settings':  'Settings — VakalatNama',
    '/upgrade':   'Upgrade — VakalatNama',
    '/login':     'Login — VakalatNama',
  }
  // Dynamic titles for parameterised routes
  if (to.path.startsWith('/case-detail/')) {
    document.title = 'Case Detail — VakalatNama'
  } else if (to.path.startsWith('/case-review/')) {
    document.title = 'Review Case — VakalatNama'
  } else if (to.path.startsWith('/consent/')) {
    document.title = 'Consent — VakalatNama'
  } else {
    document.title = titles[to.path] || 'VakalatNama'
  }
})

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

// Bootstrap auth state (fetch session + set advocate) before mounting
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
authStore.initAuth().then(() => {
  app.mount('#app')
})
