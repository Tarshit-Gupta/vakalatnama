<template>
  <!-- Overlay for mobile -->
  <div class="sidebar-overlay" :class="{ open: mobileOpen }" @click="$emit('close')"></div>

  <!-- Sidebar -->
  <aside class="sidebar" :class="{ open: mobileOpen }">
    <!-- Logo -->
    <div class="sidebar-logo">
      <svg width="36" height="36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="50" cy="50" r="46" fill="rgba(201,168,76,0.08)" stroke="#C9A84C" stroke-width="2.5"/>
        <line x1="50" y1="16" x2="50" y2="84" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="22" y1="38" x2="78" y2="38" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"/>
        <circle cx="22" cy="50" r="11" fill="none" stroke="#E8C97A" stroke-width="2"/>
        <circle cx="78" cy="50" r="11" fill="none" stroke="#E8C97A" stroke-width="2"/>
        <line x1="17" y1="61" x2="27" y2="61" stroke="#C9A84C" stroke-width="2"/>
        <line x1="73" y1="61" x2="83" y2="61" stroke="#C9A84C" stroke-width="2"/>
        <line x1="36" y1="84" x2="64" y2="84" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
      <div>
        <div class="sidebar-logo-text">VakalatNama</div>
        <div class="sidebar-logo-sub">Legal Drafting Platform</div>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <p class="section-heading" style="padding: 0 4px; margin-bottom: 8px;">Menu</p>
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="nav-link"
        :class="{ active: $route.path === item.path }"
        @click="$emit('close')"
      >
        <span class="nav-icon" v-html="item.icon"></span>
        <span>{{ item.label }}</span>
        <span v-if="item.label === 'Cases' && totalCases > 0" class="nav-badge">{{ totalCases }}</span>
      </router-link>
    </nav>

    <!-- Footer -->
    <div class="sidebar-footer">
      <div class="advocate-info">
        <div class="advocate-avatar">{{ advocateInitials }}</div>
        <div>
          <div class="advocate-name" style="margin-bottom: 4px; line-height: 1.2;">
            {{ authStore.advocate?.name?.startsWith('Adv') ? authStore.advocate.name : (authStore.advocate?.name ? 'Adv. ' + authStore.advocate.name : 'Advocate') }}
          </div>
          <div style="display:flex; align-items:center; gap:6px;">
            <span :class="['plan-badge', isPremium ? 'premium' : 'free']">
              {{ isPremium ? 'PREMIUM' : 'FREE' }}
            </span>
          </div>
        </div>
      </div>
      <button class="btn btn-danger btn-sm" style="width:100%;" @click="handleLogout">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Logout
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { supabase } from '../lib/supabase'

defineProps({ mobileOpen: Boolean })
defineEmits(['close'])
const authStore = useAuthStore()

const totalCases = ref(0)

const isPremium = computed(() => {
  return authStore.advocate?.plan?.toLowerCase() === 'premium'
})

// Derive initials from stored advocate name
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

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>`
  },
  {
    path: '/cases',
    label: 'Cases',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
  },
  {
    path: '/clients',
    label: 'Clients',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
  },
  {
    path: '/new-case',
    label: 'New Case',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14M12 2v2m0 16v2M2 12h2m16 0h2"/></svg>`
  },
]

onMounted(async () => {
  try {
    const uid = authStore.user?.id
    if (!uid) return
    const { count } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .eq('advocate_id', uid)
    totalCases.value = count || 0
  } catch (err) {
    console.error('Error fetching total cases:', err)
  }
})

async function handleLogout() {
  // authStore.logout() handles redirect to /login automatically
  await authStore.logout()
}
</script>

<style scoped>
.plan-badge {
  font-size: 0.6rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: inline-block;
  line-height: 1.3;
}
.plan-badge.free {
  background: var(--border-light);
  color: var(--text-muted);
  border: 1px solid var(--border);
}
.plan-badge.premium {
  background: rgba(201, 168, 76, 0.15);
  color: var(--accent-gold);
  border: 1px solid rgba(201, 168, 76, 0.3);
}

.nav-badge {
  margin-left: auto;
  background: var(--accent-gold-dim);
  border: 1px solid rgba(201, 168, 76, 0.3);
  color: var(--accent-gold);
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 99px;
  line-height: 1.3;
}
</style>

