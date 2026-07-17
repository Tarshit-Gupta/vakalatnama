<template>
  <AppLayout title="Dashboard">
    <div class="dashboard">

      <!-- Welcome header -->
      <div class="welcome-header">
        <div>
          <h1>Good {{ timeOfDay }}, <span class="gold-text">{{ authStore.advocate?.name?.startsWith('Adv') ? authStore.advocate.name : (authStore.advocate?.name ? 'Adv. ' + authStore.advocate.name : 'Advocate') }}</span></h1>
          <p>Here's what's happening with your cases today.</p>
        </div>
        <div class="welcome-date">
          <div class="date-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            {{ todayDate }}
          </div>
        </div>
      </div>

      <!-- Stats Row -->
      <div class="grid-4 stats-grid">
        <div
          v-for="stat in stats"
          :key="stat.label"
          class="card card-hover stat-card"
          @click="router.push(stat.route)"
          style="cursor: pointer;"
        >
          <div v-if="statsLoading" class="skeleton stat-skeleton"></div>
          <template v-else>
            <div class="stat-icon" :style="{ background: stat.iconBg }">
              <span v-html="stat.icon"></span>
            </div>
            <div class="stat-value">{{ stat.value }}</div>
            <div class="stat-label">{{ stat.label }}</div>
            <div class="stat-change" :class="stat.up ? 'up' : 'down'">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
                <polyline :points="stat.up ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
              </svg>
              {{ stat.change }}
            </div>
          </template>
        </div>
      </div>

      <!-- Today's Usage bar -->
      <div class="card usage-bar-card">
        <div v-if="statsLoading" class="skeleton" style="height:32px;border-radius:8px;"></div>
        <template v-else>
          <div class="usage-row" v-if="isFreePlan">
            <span class="usage-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              Drafts today
            </span>
            <div class="usage-track">
              <div class="usage-fill" :style="{ width: Math.min((draftsToday / 5) * 100, 100) + '%' }"></div>
            </div>
            <span class="usage-count" :class="{ 'usage-warn': draftsToday >= 4 }">{{ draftsToday }} / 5</span>
            <router-link v-if="draftsToday >= 5" to="/upgrade" class="btn btn-gold btn-sm">Upgrade</router-link>
          </div>
          <div class="usage-row" v-else>
            <span class="premium-pill">✨ Premium Plan — Unlimited Drafts</span>
          </div>
        </template>
      </div>

      <!-- Recent Cases Table -->
      <div class="card" style="padding: 0; overflow: hidden; margin-top: 4px;">
        <div class="table-header">
          <div>
            <h3>Recent Cases</h3>
            <p style="font-size:0.8125rem;margin-top:2px;">Latest case activities and drafts</p>
          </div>
          <router-link to="/new-case" class="btn btn-gold btn-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New Case
          </router-link>
        </div>

        <!-- Table skeleton -->
        <div v-if="tableLoading" class="table-skeleton-wrap">
          <div v-for="i in 4" :key="i" class="skeleton" style="height:52px;border-radius:0;margin-bottom:1px;"></div>
        </div>

        <!-- Empty state -->
        <div v-else-if="!tableLoading && recentCases.length === 0" class="empty-state">
          <div class="empty-icon">⚖️</div>
          <h3>No cases yet</h3>
          <p>Create your first case to get started</p>
          <router-link to="/new-case" class="btn btn-gold" style="margin-top:16px;">
            Create New Case →
          </router-link>
        </div>

        <!-- Table rows -->
        <div v-else class="table-wrapper" style="border: none; border-radius: 0;">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Case Type</th>
                <th>Court</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="case_ in recentCases"
                :key="case_.id"
                class="table-row-clickable"
                @click="router.push(`/case-detail/${case_.id}`)"
              >
                <td>
                  <div style="display:flex;align-items:center;gap:10px;">
                    <div class="client-avatar">{{ case_.initials }}</div>
                    {{ case_.client }}
                  </div>
                </td>
                <td>
                  <span class="badge badge-muted">{{ case_.type || '—' }}</span>
                </td>
                <td>{{ case_.court || '—' }}</td>
                <td style="color: var(--text-muted);">{{ case_.date }}</td>
                <td>
                  <span class="badge" :class="statusBadge(case_.status)">
                    <span style="width:6px;height:6px;border-radius:50%;background:currentColor;"></span>
                    {{ case_.status }}
                  </span>
                </td>
                <td @click.stop>
                  <router-link :to="`/case-detail/${case_.id}`" class="btn btn-ghost btn-sm">
                    View
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- FAB -->
    <router-link to="/new-case" class="fab" title="New Case">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </router-link>
  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router    = useRouter()

// ── Date / time ───────────────────────────────────
const todayDate = new Date().toLocaleDateString('en-IN', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
})
const timeOfDay = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
})

// ── State ─────────────────────────────────────────
const statsLoading = ref(true)
const tableLoading = ref(true)

const totalCases      = ref('—')
const totalClients    = ref('—')
const draftsGenerated = ref('—')
const thisMonth       = ref('—')
const recentCases     = ref([])

const draftsToday  = ref(0)
const isFreePlan   = ref(true)

// ── Stats cards ───────────────────────────────────
const stats = computed(() => [
  {
    label: 'Total Cases',
    value: totalCases.value,
    change: 'All time',
    up: true,
    route: '/cases',
    iconBg: 'rgba(201,168,76,0.12)',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`
  },
  {
    label: 'Active Clients',
    value: totalClients.value,
    change: 'All time',
    up: true,
    route: '/clients',
    iconBg: 'rgba(34,197,94,0.1)',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  },
  {
    label: 'Drafts Generated',
    value: draftsGenerated.value,
    change: 'All time',
    up: true,
    route: '/cases',
    iconBg: 'rgba(99,102,241,0.1)',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818CF8" stroke-width="2" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`
  },
  {
    label: 'This Month',
    value: thisMonth.value,
    change: new Date().toLocaleString('en-IN', { month: 'long' }),
    up: true,
    route: '/cases',
    iconBg: 'rgba(239,68,68,0.1)',
    icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
  },
])

// ── Status badge class ────────────────────────────
function statusBadge(status) {
  if (status === 'Consented')   return 'badge-consented'  // purple/indigo
  if (status === 'Drafted')     return 'badge-success'     // green
  if (status === 'In Progress') return 'badge-warning'     // yellow
  if (status === 'Pending')     return 'badge-danger'      // red
  return 'badge-muted'
}

// ── Data fetch ────────────────────────────────────
onMounted(async () => {
  const uid = authStore.user?.id
  if (!uid) return

  // Stats + usage in parallel
  const now        = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const today      = now.toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

  try {
    const [casesRes, clientsRes, monthRes, advRes, usageRes] = await Promise.all([
      supabase.from('cases').select('*', { count: 'exact', head: true }).eq('advocate_id', uid),
      supabase.from('clients').select('*', { count: 'exact', head: true }).eq('advocate_id', uid),
      supabase.from('cases').select('*', { count: 'exact', head: true }).eq('advocate_id', uid).gte('created_at', monthStart),
      supabase.from('advocates').select('plan').eq('id', uid).maybeSingle(),
      supabase.from('token_usage').select('draft_calls_used, assist_calls_used').eq('advocate_id', uid).eq('date', today).maybeSingle(),
    ])

    totalCases.value   = casesRes.count   ?? 0
    totalClients.value = clientsRes.count ?? 0
    thisMonth.value    = monthRes.count   ?? 0
    isFreePlan.value   = !advRes.data?.plan || advRes.data.plan.toLowerCase() !== 'premium'
    draftsToday.value  = usageRes.data?.draft_calls_used ?? 0

    // Drafts count via case_ids
    const allCasesRes = await supabase.from('cases').select('id').eq('advocate_id', uid)
    if (allCasesRes.data?.length) {
      const ids = allCasesRes.data.map(c => c.id)
      const draftsRes = await supabase.from('drafts').select('*', { count: 'exact', head: true }).in('case_id', ids)
      draftsGenerated.value = draftsRes.count ?? 0
    } else {
      draftsGenerated.value = 0
    }
  } catch (err) {
    console.error('[Dashboard] stats fetch:', err.message)
  } finally {
    statsLoading.value = false
  }

  // Recent cases separately so table shows ASAP
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('id, case_type, court_level, status, created_at, clients(name)')
      .eq('advocate_id', uid)
      .order('created_at', { ascending: false })
      .limit(5)
    if (error) throw error
    recentCases.value = (data || []).map(c => ({
      id:      c.id,
      client:  c.clients?.name || 'Unknown Client',
      initials: (c.clients?.name || 'UK').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join(''),
      type:    c.case_type,
      court:   c.court_level,
      date:    new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      status:  c.status,
    }))
  } catch (err) {
    console.error('[Dashboard] recent cases fetch:', err.message)
  } finally {
    tableLoading.value = false
  }
})
</script>

<style scoped>
.dashboard { display: flex; flex-direction: column; gap: 24px; }

.welcome-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.welcome-header h1 { font-size: 1.5rem; margin-bottom: 4px; }
.gold-text { color: var(--accent-gold); }
.date-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  color: var(--text-muted);
}

/* Stats */
.stats-grid { margin: 0; }
.stat-card  { display: flex; flex-direction: column; gap: 6px; min-height: 120px; }
.stat-skeleton { height: 90px; border-radius: var(--radius-md); }
.stat-icon {
  width: 44px; height: 44px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 4px;
}
.stat-value  { font-size: 2rem; font-weight: 800; color: var(--text-primary); line-height: 1; }
.stat-label  { font-size: 0.8125rem; color: var(--text-muted); font-weight: 500; }
.stat-change { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 500; margin-top: 4px; }
.stat-change.up   { color: var(--success); }
.stat-change.down { color: var(--danger); }

/* Usage bar */
.usage-bar-card { padding: 14px 20px; }
.usage-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.usage-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-subtle);
  white-space: nowrap;
}
.usage-track {
  flex: 1;
  max-width: 200px;
  height: 6px;
  background: var(--border-light);
  border-radius: 99px;
  overflow: hidden;
}
.usage-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-gold), var(--accent-gold-light));
  border-radius: 99px;
  transition: width 0.6s ease;
}
.usage-count { font-size: 0.8rem; font-weight: 700; color: var(--text-subtle); white-space: nowrap; }
.usage-warn  { color: var(--warning) !important; }
.premium-pill {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--success);
  background: rgba(34,197,94,0.1);
  border: 1px solid rgba(34,197,94,0.2);
  border-radius: 99px;
  padding: 5px 14px;
}

/* Table */
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  border-bottom: 1px solid var(--border);
}
.table-skeleton-wrap { display: flex; flex-direction: column; }
.table-row-clickable { cursor: pointer; transition: background var(--transition); }
.table-row-clickable:hover { background: rgba(201,168,76,0.05) !important; }

/* Status badges */
.badge-consented {
  background: rgba(99,102,241,0.12);
  color: #818CF8;
  border: 1px solid rgba(99,102,241,0.25);
}

/* Empty state */
.empty-state { text-align: center; padding: 60px 24px; }
.empty-icon  { font-size: 3.5rem; margin-bottom: 16px; }
.empty-state h3 { margin-bottom: 6px; }

/* Avatar */
.client-avatar {
  width: 30px; height: 30px;
  border-radius: 50%;
  background: var(--accent-gold-dim);
  border: 1px solid rgba(201,168,76,0.2);
  color: var(--accent-gold);
  font-size: 0.6875rem;
  font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.fab { text-decoration: none; }
</style>
