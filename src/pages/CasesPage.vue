<template>
  <AppLayout title="Cases">
    <template #topbar-actions>
      <router-link to="/new-case" class="btn btn-gold btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Case
      </router-link>
    </template>

    <div class="cases-page">
      <!-- Page heading -->
      <div class="page-heading">
        <div>
          <h2>All Cases</h2>
          <p>Manage and view all your case activities and drafts</p>
        </div>
        <div class="case-count-badge">
          <span>{{ filteredCases.length }} Cases</span>
        </div>
      </div>

      <!-- Filters and Search -->
      <div class="filters-row">
        <!-- Search bar -->
        <div class="search-wrapper" style="flex: 1;">
          <div class="search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <input
            id="case-search"
            v-model="searchQuery"
            type="text"
            class="form-input"
            style="padding-left: 40px; width: 100%;"
            placeholder="Search cases by client, type, or court..."
          />
        </div>

        <!-- Case Type Filter -->
        <select v-model="selectedType" class="form-input filter-select">
          <option value="All">All Types</option>
          <option v-for="type in uniqueCaseTypes" :key="type" :value="type">{{ type }}</option>
        </select>

        <!-- Sort By -->
        <select v-model="sortOrder" class="form-input filter-select">
          <option value="date_desc">Newest First</option>
          <option value="date_asc">Oldest First</option>
          <option value="status">Status (Active first)</option>
          <option value="client_asc">Client (A-Z)</option>
        </select>
      </div>

      <!-- Skeleton loader -->
      <div v-if="loading" class="card" style="padding: 0; overflow: hidden;">
        <div class="table-skeleton-wrap">
          <div v-for="i in 6" :key="i" class="skeleton" style="height:52px;border-radius:0;margin-bottom:1px;"></div>
        </div>
      </div>

      <!-- Empty state: no cases at all -->
      <div v-else-if="!loading && cases.length === 0" class="empty-state">
        <div class="empty-icon">⚖️</div>
        <h3>No cases yet</h3>
        <p>Create your first case to get started</p>
        <router-link to="/new-case" class="btn btn-gold" style="margin-top:16px;">
          Create New Case →
        </router-link>
      </div>

      <!-- Empty state: search no results -->
      <div v-else-if="!loading && filteredCases.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No cases found</h3>
        <p>Try adjusting your search query</p>
      </div>

      <!-- Table rows -->
      <div v-else class="card" style="padding: 0; overflow: hidden;">
        <div class="table-wrapper" style="border: none; border-radius: 0;">
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
                v-for="case_ in filteredCases"
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
                <td @click.stop style="display: flex; gap: 8px;">
                  <router-link :to="`/case-detail/${case_.id}`" class="btn btn-ghost btn-sm">
                    View
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </router-link>
                  <button class="btn btn-ghost btn-sm" style="color: #ef4444; padding: 4px 8px;" @click="deleteCase(case_.id)" title="Delete Case">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                  </button>
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
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const loading = ref(true)
const cases = ref([])
const searchQuery = ref('')
const debouncedQuery = ref('')
const selectedType = ref('All')
const sortOrder = ref('date_desc')

const uniqueCaseTypes = computed(() => {
  const types = new Set(cases.value.map(c => c.type).filter(Boolean))
  return Array.from(types).sort()
})

// ── Status badge class ────────────────────────────
function statusBadge(status) {
  if (status === 'Drafted' || status === 'Consented') return 'badge-success'
  if (status === 'In Progress')                       return 'badge-warning'
  if (status === 'Pending')                           return 'badge-danger'
  if (status === 'Consented')                         return 'badge-consented'
  return 'badge-muted'
}

// ── Debounced search (300ms) ──────────────────────
let searchDebounce = null
watch(searchQuery, (val) => {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    debouncedQuery.value = val
  }, 300)
})

// ── Computed ──────────────────────────────────────
const filteredCases = computed(() => {
  const q = debouncedQuery.value.toLowerCase().trim()
  let result = cases.value

  // 1. Filter by Search Query
  if (q) {
    result = result.filter(c =>
      c.client.toLowerCase().includes(q) ||
      (c.type && c.type.toLowerCase().includes(q)) ||
      (c.court && c.court.toLowerCase().includes(q))
    )
  }

  // 2. Filter by Case Type
  if (selectedType.value !== 'All') {
    result = result.filter(c => c.type === selectedType.value)
  }

  // 3. Sort
  result = [...result]
  result.sort((a, b) => {
    if (sortOrder.value === 'date_desc') {
      return new Date(b.raw_date) - new Date(a.raw_date)
    } else if (sortOrder.value === 'date_asc') {
      return new Date(a.raw_date) - new Date(b.raw_date)
    } else if (sortOrder.value === 'client_asc') {
      return a.client.localeCompare(b.client)
    } else if (sortOrder.value === 'status') {
      const order = { 'In Progress': 1, 'Drafted': 2, 'Consented': 3, 'Pending': 4 }
      return (order[a.status] || 99) - (order[b.status] || 99)
    }
    return 0
  })

  return result
})

// ── Data fetch ────────────────────────────────────
onMounted(async () => {
  const uid = authStore.user?.id
  if (!uid) return

  loading.value = true
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('id, case_type, court_level, status, created_at, clients(name)')
      .eq('advocate_id', uid)
      .order('created_at', { ascending: false })
      
    if (error) throw error
    
    cases.value = (data || []).map(c => ({
      id:      c.id,
      client:  c.clients?.name || 'Unknown Client',
      initials: (c.clients?.name || 'UK').split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join(''),
      type:    c.case_type,
      court:   c.court_level,
      date:    new Date(c.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      raw_date: c.created_at,
      status:  c.status,
    }))
  } catch (err) {
    console.error('[Cases] fetch error:', err.message)
  } finally {
    loading.value = false
  }
})

// ── Delete Case ───────────────────────────────────
const deleteCase = async (id) => {
  if (!confirm('Are you sure you want to delete this case? This action cannot be undone.')) return
  
  try {
    const { error } = await supabase
      .from('cases')
      .delete()
      .eq('id', id)
      
    if (error) throw error
    
    // Remove from local state
    cases.value = cases.value.filter(c => c.id !== id)
  } catch (err) {
    console.error('[Cases] delete error:', err.message)
    alert('Failed to delete case.')
  }
}
</script>

<style scoped>
.cases-page { display: flex; flex-direction: column; gap: 24px; }

.page-heading {
  display: flex; align-items: flex-start;
  justify-content: space-between; flex-wrap: wrap; gap: 12px;
}
.case-count-badge {
  padding: 8px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent-gold);
}

/* Filters */
.filters-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.filter-select {
  width: auto;
  min-width: 150px;
  cursor: pointer;
  background-color: var(--bg-surface);
}

/* Search */
.search-wrapper { position: relative; }
.search-icon {
  position: absolute; left: 13px; top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  display: flex; align-items: center;
  pointer-events: none;
}

/* Table */
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
.empty-state { text-align: center; padding: 60px 24px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-xl); }
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
