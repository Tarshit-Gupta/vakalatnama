import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from './lib/supabase'

// ── Lazy-load all pages for better performance ────────────────────────
const LoginPage      = () => import('./pages/LoginPage.vue')
const DashboardPage  = () => import('./pages/DashboardPage.vue')
const ClientsPage    = () => import('./pages/ClientsPage.vue')
const CasesPage      = () => import('./pages/CasesPage.vue')
const NewCasePage    = () => import('./pages/NewCasePage.vue')
const CaseDetailPage = () => import('./pages/CaseDetailPage.vue')
const CaseReviewPage = () => import('./pages/CaseReviewPage.vue')
const ConsentPage    = () => import('./pages/ConsentPage.vue')
const SettingsPage   = () => import('./pages/SettingsPage.vue')
const UpgradePage    = () => import('./pages/UpgradePage.vue')

const routes = [
  { path: '/',                redirect: '/login' },
  { path: '/login',           component: LoginPage },
  { path: '/dashboard',       component: DashboardPage },
  { path: '/cases',           component: CasesPage },
  { path: '/clients',         component: ClientsPage },
  { path: '/new-case',        component: NewCasePage },
  { path: '/case-detail/:id', component: CaseDetailPage },
  { path: '/case-review/:id', component: CaseReviewPage },
  { path: '/consent/:id',     component: ConsentPage },
  { path: '/settings',        component: SettingsPage },
  { path: '/upgrade',         component: UpgradePage },
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

    if (session) {
      // Fetch advocate row — includes deletion_requested_at
      const { data: advocateRow } = await supabase
        .from('advocates')
        .select('id, deletion_requested_at')
        .eq('id', session.user.id)
        .maybeSingle()

      // Orphan-session guard: advocate row gone (admin-deleted) → force sign-out
      // Retry once after 500ms (reduced from 1s) to avoid false positives on brand-new signups
      // (the DB trigger needs a moment to create the row, but usually fires in <100ms)
      if (!advocateRow) {
        await new Promise(r => setTimeout(r, 500))
        const { data: retryRow } = await supabase
          .from('advocates')
          .select('id, deletion_requested_at')
          .eq('id', session.user.id)
          .maybeSingle()

        if (!retryRow) {
          await supabase.auth.signOut()
          return '/login'
        }
        // Row now exists — update advocateRow reference and continue
        Object.assign(advocateRow, retryRow)
      }

      // ── Deferred deletion logic ────────────────────────────────────────
      if (advocateRow.deletion_requested_at) {
        const requestedAt = new Date(advocateRow.deletion_requested_at)
        const hoursSince = (Date.now() - requestedAt.getTime()) / (1000 * 60 * 60)

        if (hoursSince < 24) {
          // Within 24h: user logged back in → CANCEL the deletion
          await supabase
            .from('advocates')
            .update({ deletion_requested_at: null })
            .eq('id', session.user.id)
          console.info('[Route Guard] Account deletion cancelled — user logged back in within 24h')
          // Let them proceed normally (fall through)
        } else {
          // Past 24h: trigger actual deletion via edge function
          try {
            await fetch(
              `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/delete-account`,
              {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                  'Content-Type': 'application/json',
                },
              }
            )
          } catch (e) {
            console.error('[Route Guard] delete-account edge fn failed:', e)
          }
          await supabase.auth.signOut()
          return '/login'
        }
      }
      // ──────────────────────────────────────────────────────────────────

      // Redirect authenticated users away from login
      if (to.path === '/login') return '/dashboard'

      // Case ownership check — prevent accessing other advocates' cases
      if (to.params.id && (to.path.includes('/case-detail') || to.path.includes('/case-review') || to.path.includes('/consent'))) {
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

export default router
