<template>
  <div class="layout-wrapper">
    <AppSidebar :mobileOpen="mobileOpen" @close="mobileOpen = false" />
    <div class="main-content">
      <!-- Topbar -->
      <header class="topbar">
        <div class="topbar-left" style="display:flex;align-items:center;gap:12px;">
          <button class="mobile-menu-btn" @click="mobileOpen = !mobileOpen" aria-label="Toggle menu">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <h1 class="topbar-title">{{ title }}</h1>
        </div>

        <!-- Global Search Bar (Center) -->
        <div class="search-container" ref="searchContainerRef">
          <div class="search-input-wrapper">
            <svg class="search-input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
              v-model="searchQuery"
              type="text"
              placeholder="Search cases, clients..."
              class="topbar-search-input"
              @input="handleSearchInput"
              @blur="onSearchBlur"
            />
          </div>
          
          <!-- Dropdown Results -->
          <div v-if="showResults && (searchResults.cases.length || searchResults.clients.length)" class="search-results-dropdown">
            <div v-if="searchResults.cases.length" class="result-section">
              <div class="result-section-title">Cases</div>
              <div
                v-for="c in searchResults.cases"
                :key="c.id"
                class="result-item"
                @click="goToResult('case', c.id)"
              >
                <span class="result-icon">⚖️</span>
                <div class="result-meta">
                  <div class="result-name">{{ c.plaintiff_name }} vs {{ c.defendant_name }}</div>
                  <div class="result-sub">{{ c.case_type }}</div>
                </div>
              </div>
            </div>
            
            <div v-if="searchResults.clients.length" class="result-section">
              <div class="result-section-title">Clients</div>
              <div
                v-for="cl in searchResults.clients"
                :key="cl.id"
                class="result-item"
                @click="goToResult('client', cl.id, cl.name)"
              >
                <span class="result-icon">👤</span>
                <div class="result-meta">
                  <div class="result-name">{{ cl.name }}</div>
                  <div class="result-sub">{{ cl.phone }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="topbar-right">
          <slot name="topbar-actions" />
          
          <!-- Today's Draft Usage Pill -->
          <div :class="['usage-pill', usageClass]">
            {{ isFreePlan ? `${draftsUsedToday}/5 drafts` : '✨ Premium' }}
          </div>

          <!-- Notification Bell -->
          <div class="notification-container">
            <button class="notification-btn" @click="showNotifications = !showNotifications">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            <div v-if="showNotifications" class="notifications-dropdown">
              <div class="notifications-header">Notifications</div>
              <div class="notifications-body">No notifications</div>
            </div>
          </div>

          <!-- User Avatar with initials -->
          <div style="display:flex;align-items:center;gap:8px;">
            <div class="advocate-avatar" style="width:32px;height:32px;font-size:0.75rem;cursor:pointer;" @click="router.push('/settings')">
              {{ advocateInitials }}
            </div>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-body">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

defineProps({
  title: { type: String, default: '' }
})

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const mobileOpen = ref(false)

// Initials
const advocateInitials = computed(() => {
  const name = authStore.advocate?.name || ''
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
  || 'AV'
})

// Search State
const searchQuery = ref('')
const showResults = ref(false)
const searchResults = ref({ cases: [], clients: [] })
let debounceTimeout = null

// Reset search on navigation
watch(route, () => {
  searchQuery.value = ''
  showResults.value = false
  searchResults.value = { cases: [], clients: [] }
})

function handleSearchInput() {
  if (debounceTimeout) clearTimeout(debounceTimeout)
  // Clear results immediately if query is empty
  if (!searchQuery.value.trim()) {
    searchResults.value = { cases: [], clients: [] }
    showResults.value = false
    return
  }
  debounceTimeout = setTimeout(performSearch, 300)
}

// Dismiss results on blur after a small delay (allow click on result first)
function onSearchBlur() {
  setTimeout(() => { showResults.value = false }, 200)
}

async function performSearch() {
  const queryStr = searchQuery.value.trim()
  if (!queryStr) {
    searchResults.value = { cases: [], clients: [] }
    showResults.value = false
    return
  }

  try {
    const uid = authStore.user?.id
    if (!uid) return

    const [casesRes, clientsRes] = await Promise.all([
      supabase
        .from('cases')
        .select('id, plaintiff_name, defendant_name, case_type')
        .eq('advocate_id', uid)
        .or(`plaintiff_name.ilike.%${queryStr}%,defendant_name.ilike.%${queryStr}%,case_type.ilike.%${queryStr}%`)
        .limit(5),
      supabase
        .from('clients')
        .select('id, name, phone')
        .eq('advocate_id', uid)
        .or(`name.ilike.%${queryStr}%,phone.ilike.%${queryStr}%`)
        .limit(5)
    ])

    searchResults.value = {
      cases: casesRes.data || [],
      clients: clientsRes.data || []
    }
    showResults.value = true
  } catch (err) {
    console.error('Search error:', err)
  }
}

function goToResult(type, id, name) {
  showResults.value = false
  searchQuery.value = ''
  if (type === 'case') {
    router.push(`/case-detail/${id}`)
  } else if (type === 'client') {
    // Navigate to clients page with search pre-filled so the client is visible
    router.push({ path: '/clients', query: { search: name } })
  }
}

// Notifications State
const showNotifications = ref(false)

// Today's usage state
const draftsUsedToday = ref(0)
const isFreePlan = ref(true)

const usageClass = computed(() => {
  if (!isFreePlan.value) return 'premium'
  if (draftsUsedToday.value < 3) return 'free-gold'
  if (draftsUsedToday.value < 5) return 'free-yellow'
  return 'free-red'
})

async function fetchUsage() {
  const uid = authStore.user?.id
  if (!uid) return

  try {
    // Read plan from the already-fetched authStore.advocate (avoids an extra DB round-trip per page navigation)
    const plan = authStore.advocate?.plan || 'free'
    isFreePlan.value = plan.toLowerCase() !== 'premium'

    if (isFreePlan.value) {
      const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })
      const { data: usage } = await supabase
        .from('token_usage')
        .select('draft_calls_used')
        .eq('advocate_id', uid)
        .eq('date', today)
        .maybeSingle()
      
      draftsUsedToday.value = usage?.draft_calls_used ?? 0
    }
  } catch (err) {
    console.error('Error fetching usage stats in layout:', err)
  }
}

// Template refs for click-outside detection
const searchContainerRef = ref(null)

// Click outside handling
function handleClickOutside(e) {
  // Search
  // Search — use Vue template ref instead of fragile querySelector
  if (searchContainerRef.value && !searchContainerRef.value.contains(e.target)) {
    showResults.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
  fetchUsage()
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
/* Search Container & Input */
.search-container {
  position: relative;
  flex: 1;
  max-width: 380px;
  margin: 0 16px;
}
.search-input-wrapper {
  position: relative;
  width: 100%;
}
.search-input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  pointer-events: none;
}
.topbar-search-input {
  width: 100%;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-primary);
  border-radius: 99px;
  padding: 8px 16px 8px 34px;
  font-size: 0.85rem;
  font-family: inherit;
  outline: none;
  transition: all 0.2s ease;
}
.topbar-search-input:focus {
  border-color: var(--accent-gold);
  box-shadow: 0 0 10px rgba(201, 168, 76, 0.15);
}

/* Results Dropdown */
.search-results-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  padding: 8px 0;
}
.result-section {
  border-bottom: 1px solid var(--border);
}
.result-section:last-child {
  border-bottom: none;
}
.result-section-title {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 6px 16px;
  letter-spacing: 0.05em;
}
.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
}
.result-item:hover {
  background: rgba(201, 168, 76, 0.05);
}
.result-icon {
  font-size: 1.1rem;
}
.result-meta {
  display: flex;
  flex-direction: column;
}
.result-name {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 280px;
}
.result-sub {
  font-size: 0.72rem;
  color: var(--text-muted);
}

/* Notification bell styling */
.notification-container {
  position: relative;
}
.notification-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}
.notification-btn:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}
.notifications-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: -10px;
  width: 240px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 12px 14px;
  z-index: 1000;
}
.notifications-header {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  padding-bottom: 6px;
  margin-bottom: 8px;
}
.notifications-body {
  font-size: 0.8125rem;
  color: var(--text-subtle);
  padding: 4px 0;
}

/* Usage Pill */
.usage-pill {
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 0.72rem;
  font-weight: 600;
  border: 1px solid currentColor;
  line-height: 1.3;
}
.usage-pill.premium {
  color: var(--success);
  background: rgba(34, 197, 94, 0.1);
  border-color: rgba(34, 197, 94, 0.2);
}
.usage-pill.free-gold {
  color: var(--accent-gold);
  background: rgba(201, 168, 76, 0.1);
  border-color: rgba(201, 168, 76, 0.2);
}
.usage-pill.free-yellow {
  color: var(--warning);
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.2);
}
.usage-pill.free-red {
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.2);
}

@media (max-width: 768px) {
  .search-container {
    display: none; /* Hide global search on small mobile view header to prevent cramped topbar */
  }
}
</style>
