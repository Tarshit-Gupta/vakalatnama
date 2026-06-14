<template>
  <AppLayout title="Clients">
    <template #topbar-actions>
      <button class="btn btn-gold btn-sm" @click="showAddModal = true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Client
      </button>
    </template>

    <div class="clients-page">
      <!-- Page heading -->
      <div class="page-heading">
        <div>
          <h2>Clients</h2>
          <p>Manage and view all your registered clients</p>
        </div>
        <div class="client-count-badge">
          <span>{{ filteredClients.length }} Clients</span>
        </div>
      </div>

      <!-- Search bar -->
      <div class="search-wrapper">
        <div class="search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input
          id="client-search"
          v-model="searchQuery"
          type="text"
          class="form-input"
          style="padding-left: 40px; max-width: 400px;"
          placeholder="Search clients by name, city, or phone..."
        />
      </div>

      <!-- Skeleton loader -->
      <div v-if="loading" class="grid-cards">
        <div v-for="i in 6" :key="i" class="skeleton" style="height:200px;border-radius:16px;"></div>
      </div>

      <!-- Client cards grid -->
      <div v-else-if="filteredClients.length" class="grid-cards">
        <div
          v-for="client in filteredClients"
          :key="client.id"
          class="card card-hover client-card"
          :class="{ 'inactive-card': !isClientActive(client.id) }"
          @click="toggleClientStatus(client.id)"
          style="cursor: pointer;"
        >
          <!-- Card header -->
          <div class="client-card-header">
            <div class="client-avatar-lg" :class="{ 'inactive-avatar': !isClientActive(client.id) }">{{ client.initials }}</div>
            <div class="client-actions-col">
              <div style="display: flex; gap: 8px;">
                <button class="btn-icon-bordered" @click.stop="editClient(client)" title="Edit Client">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button class="btn-icon-bordered text-danger" @click.stop="deleteClient(client)" title="Delete Client">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                </button>
              </div>
              <div class="active-badge" :class="{ 'inactive-badge': !isClientActive(client.id) }">
                <span :class="isClientActive(client.id) ? 'active-dot' : 'inactive-dot'"></span>
                {{ isClientActive(client.id) ? 'Active' : 'Inactive' }}
              </div>
            </div>
          </div>

          <!-- Client info -->
          <h3 style="margin-bottom: 4px;">{{ client.name }}</h3>
          <div class="client-meta">
            <span class="meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.65 3.37 2 2 0 0 1 3.62 1.18h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.27a16 16 0 0 0 5.55 5.55l.86-.86a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0 1 21 16.92z"/></svg>
              {{ client.phone || '—' }}
            </span>
            <span v-if="client.email" class="meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              {{ client.email }}
            </span>
            <span class="meta-item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              {{ client.city || '—' }}
            </span>
          </div>

          <div class="divider" style="margin: 14px 0;"></div>

          <div style="display:flex;align-items:center;justify-content:space-between;">
            <div>
              <div style="font-size:0.6875rem;color:var(--text-muted);margin-bottom:2px;">Latest Case</div>
              <div style="font-size:0.8125rem;color:var(--text-subtle);font-weight:500;">{{ client.latestCase }}</div>
            </div>
            <router-link to="/dashboard" class="btn btn-outline btn-sm">
              View Cases
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </router-link>
          </div>
        </div>
      </div>

      <!-- Empty state: no clients at all -->
      <div v-else-if="!loading && clients.length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <h3>No clients yet</h3>
        <p>Add your first client to get started</p>
        <button class="btn btn-gold" style="margin-top:16px;" @click="showAddModal = true">
          Add First Client
        </button>
      </div>

      <!-- Empty state: search no results -->
      <div v-else-if="!loading && filteredClients.length === 0" class="empty-state">
        <div class="empty-icon">🔍</div>
        <h3>No clients found</h3>
        <p>Try adjusting your search query</p>
      </div>
    </div>

    <!-- FAB -->
    <button class="fab" title="Add Client" @click="showAddModal = true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
    </button>

    <!-- ════════════════════════════════════════
         ADD CLIENT MODAL
    ═════════════════════════════════════════════ -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showAddModal" class="modal-overlay" @click.self="closeModal">
          <div class="modal-card">
            <div class="modal-header">
              <h3>{{ isEditing ? 'Edit Client' : 'Add New Client' }}</h3>
              <button class="btn btn-icon btn-ghost" @click="closeModal">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div class="modal-form">
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">Full Name <span style="color:var(--accent-gold)">*</span></label>
                  <input id="modal-name" v-model="newClient.name" type="text" class="form-input" placeholder="e.g. Priya Mehta" />
                  <div v-if="modalErrors.name" class="field-error">{{ modalErrors.name }}</div>
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number <span style="color:var(--accent-gold)">*</span></label>
                  <input id="modal-phone" v-model="newClient.phone" type="tel" class="form-input" placeholder="+91 98765 43210" />
                  <div v-if="modalErrors.phone" class="field-error">{{ modalErrors.phone }}</div>
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">Email <span class="opt-label">(optional)</span></label>
                <input id="modal-email" v-model="newClient.email" type="email" class="form-input" placeholder="client@example.com" />
              </div>
              <div class="form-row-2">
                <div class="form-group">
                  <label class="form-label">City <span style="color:var(--accent-gold)">*</span></label>
                  <input id="modal-city" v-model="newClient.city" type="text" class="form-input" placeholder="e.g. Mumbai" />
                  <div v-if="modalErrors.city" class="field-error">{{ modalErrors.city }}</div>
                </div>
                <div class="form-group">
                  <label class="form-label">Address <span class="opt-label">(optional)</span></label>
                  <input id="modal-address" v-model="newClient.address" type="text" class="form-input" placeholder="Street address" />
                </div>
              </div>
            </div>

            <div class="modal-actions">
              <button class="btn btn-ghost" @click="closeModal">Cancel</button>
              <button class="btn btn-gold" @click="saveClient" :disabled="addingClient">
                <div v-if="addingClient" class="spinner" style="width:14px;height:14px;border-width:2px;"></div>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                {{ addingClient ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Client') }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </AppLayout>
</template>

<script setup>
import { ref, computed, watch, onMounted, reactive, inject } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const showToast = inject('showToast')

const loading      = ref(true)
const searchQuery  = ref('')
const debouncedQuery = ref('')
const showAddModal = ref(false)
const addingClient = ref(false)
const clients      = ref([])

const newClient = reactive({ name: '', phone: '', email: '', city: '', address: '' })
const modalErrors = reactive({})

const isEditing = ref(false)
const editingClientId = ref(null)
const inactiveClients = ref(new Set())

// ── Helpers ───────────────────────────────────────
function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?'
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
const filteredClients = computed(() => {
  const q = debouncedQuery.value.toLowerCase().trim()
  if (!q) return clients.value
  return clients.value.filter(c =>
    c.name.toLowerCase().includes(q) ||
    c.city?.toLowerCase().includes(q) ||
    c.phone?.includes(q)
  )
})

// ── Fetch ─────────────────────────────────────────
async function fetchClients() {
  const uid = authStore.user?.id
  if (!uid) return
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*, cases(id, status)')
      .eq('advocate_id', uid)
      .order('created_at', { ascending: false })
    if (error) throw error

    clients.value = (data || []).map(c => {
      const allCases    = c.cases || []
      const activeCases = allCases.filter(cs => cs.status !== 'Pending').length
      const latest      = allCases.length
        ? `${allCases.length} case${allCases.length > 1 ? 's' : ''}`
        : 'No cases yet'
      return {
        ...c,
        initials:    getInitials(c.name),
        totalCases:  allCases.length,
        activeCases,
        latestCase:  latest,
      }
    })
  } catch (err) {
    console.error('[Clients] fetch:', err.message)
  } finally {
    loading.value = false
  }
}

// ── Active Status Mock ────────────────────────────────
function isClientActive(id) {
  return !inactiveClients.value.has(id)
}
function toggleClientStatus(id) {
  if (inactiveClients.value.has(id)) {
    inactiveClients.value.delete(id)
  } else {
    inactiveClients.value.add(id)
  }
}

// ── Edit & Delete ─────────────────────────────────
function editClient(client) {
  isEditing.value = true
  editingClientId.value = client.id
  Object.assign(newClient, {
    name: client.name || '',
    phone: client.phone || '',
    email: client.email || '',
    city: client.city || '',
    address: client.address || ''
  })
  showAddModal.value = true
}

async function deleteClient(client) {
  const caseText = client.totalCases === 1 ? '1 case is' : `${client.totalCases} cases are`;
  const confirmMessage = client.totalCases > 0 
    ? `Are you sure you want to delete ${client.name}?\n\nWarning: ${caseText} mapped to this client.`
    : `Are you sure you want to delete ${client.name}?`;
    
  if (!confirm(confirmMessage)) return
  
  try {
    const { error } = await supabase.from('clients').delete().eq('id', client.id)
    if (error) throw error
    showToast('Client deleted', '✅')
    await fetchClients()
  } catch (err) {
    showToast(err.message || 'Failed to delete client', '❌')
  }
}

// ── Add/Edit client ───────────────────────────────
function closeModal() {
  showAddModal.value = false
  isEditing.value = false
  editingClientId.value = null
  Object.assign(newClient, { name: '', phone: '', email: '', city: '', address: '' })
  Object.keys(modalErrors).forEach(k => delete modalErrors[k])
}

async function saveClient() {
  const uid = authStore.user?.id
  if (!uid) return

  // Validate
  Object.keys(modalErrors).forEach(k => delete modalErrors[k])
  if (!newClient.name.trim())  modalErrors.name  = 'Name is required'
  if (!newClient.phone.trim()) modalErrors.phone = 'Phone is required'
  if (!newClient.city.trim())  modalErrors.city  = 'City is required'
  if (Object.keys(modalErrors).length) return

  addingClient.value = true
  try {
    let errorObj
    if (isEditing.value) {
      const { error } = await supabase.from('clients').update({
        name:        newClient.name.trim(),
        phone:       newClient.phone.trim(),
        email:       newClient.email.trim() || null,
        city:        newClient.city.trim(),
        address:     newClient.address.trim() || null,
      }).eq('id', editingClientId.value)
      errorObj = error
    } else {
      const { error } = await supabase.from('clients').insert({
        advocate_id: uid,
        name:        newClient.name.trim(),
        phone:       newClient.phone.trim(),
        email:       newClient.email.trim() || null,
        city:        newClient.city.trim(),
        address:     newClient.address.trim() || null,
      })
      errorObj = error
    }
    if (errorObj) throw errorObj
    showToast(isEditing.value ? 'Client updated!' : 'Client added!', '✅')
    closeModal()
    await fetchClients()
  } catch (err) {
    showToast(err.message || 'Failed to add client', '❌')
  } finally {
    addingClient.value = false
  }
}

onMounted(fetchClients)
</script>

<style scoped>
.clients-page { display: flex; flex-direction: column; gap: 24px; }

.page-heading {
  display: flex; align-items: flex-start;
  justify-content: space-between; flex-wrap: wrap; gap: 12px;
}
.client-count-badge {
  padding: 8px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent-gold);
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

/* Client card */
.client-card { cursor: default; }
.client-card-header {
  display: flex; align-items: flex-start;
  justify-content: space-between; margin-bottom: 14px;
}
.client-avatar-lg {
  width: 52px; height: 52px;
  border-radius: var(--radius-md);
  background: linear-gradient(135deg, var(--accent-gold-dim), rgba(201,168,76,0.05));
  border: 1.5px solid rgba(201,168,76,0.2);
  color: var(--accent-gold);
  font-size: 1rem; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
}
.badges-row { display: flex; flex-direction: column; gap: 5px; align-items: flex-end; }
.cases-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 4px 10px;
  background: rgba(201,168,76,0.08);
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 99px;
  font-size: 0.72rem; font-weight: 600;
  color: var(--accent-gold);
}
.active-badge {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 8px;
  background: rgba(34,197,94,0.1);
  border: 1px solid rgba(34,197,94,0.2);
  border-radius: 99px;
  font-size: 0.68rem; font-weight: 600;
  color: var(--success);
}
.active-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
  background: var(--success);
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

/* Inactive State Styles */
.inactive-card {
  opacity: 0.6;
  filter: grayscale(80%);
  background: var(--bg-surface-alt);
}
.inactive-avatar {
  background: var(--bg-elevated) !important;
  color: var(--text-muted) !important;
  border-color: var(--border) !important;
}
.inactive-badge {
  background: rgba(150, 150, 150, 0.1) !important;
  color: var(--text-muted) !important;
}
.inactive-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--text-muted);
}
.client-actions-col {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}
.btn-icon-bordered {
  background: transparent;
  border: 1px solid var(--border-light);
  border-radius: 8px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}
.btn-icon-bordered:hover {
  background: var(--bg-surface);
  border-color: var(--border);
  color: var(--text-primary);
}
.btn-icon-bordered.text-danger:hover {
  border-color: #ef4444;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.05);
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
.client-meta { display: flex; flex-direction: column; gap: 6px; margin-top: 8px; }
.meta-item {
  display: flex; align-items: center; gap: 7px;
  font-size: 0.8125rem; color: var(--text-muted);
}

/* Empty state */
.empty-state { text-align: center; padding: 60px 20px; }
.empty-icon  { font-size: 3rem; margin-bottom: 16px; }
.empty-state h3 { margin-bottom: 6px; }

/* Modal */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.72);
  backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  z-index: 500; padding: 20px;
}
.modal-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: 28px 30px;
  width: 100%; max-width: 520px;
  box-shadow: var(--shadow-lg);
}
.modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0; }
.modal-form   { display: flex; flex-direction: column; gap: 14px; margin-top: 22px; }
.form-row-2   { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 22px; }
.field-error   { font-size: 0.75rem; color: var(--danger); margin-top: 4px; }
.field-error::before { content: '⚠ '; }
.opt-label     { font-size: 0.72rem; color: var(--text-muted); font-weight: 400; }

/* Modal transition */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to       { opacity: 0; }

@media (max-width: 540px) {
  .form-row-2 { grid-template-columns: 1fr; }
}
</style>
