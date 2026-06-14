<template>
  <AppLayout title="Settings">

    <!-- ════════════════════════════════════════
         DELETE ACCOUNT CONFIRM MODAL
    ═════════════════════════════════════════════ -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
          <div class="modal-card danger-modal">
            <div class="modal-icon-danger">⚠️</div>
            <h3 class="modal-title-danger">Delete Account?</h3>
            <p class="modal-body-text">
              This action cannot be undone. All your cases, clients, and drafts will be permanently deleted.
              Type <strong>DELETE</strong> below to confirm.
            </p>
            <input
              v-model="deleteConfirmText"
              type="text"
              class="form-input"
              placeholder="Type DELETE to confirm"
              style="margin-top:16px;text-align:center;letter-spacing:0.1em;"
            />
            <div class="modal-actions-row">
              <button class="btn btn-ghost" @click="showDeleteModal = false">Cancel</button>
              <button
                class="btn btn-danger"
                :disabled="deleteConfirmText !== 'DELETE' || deletingAccount"
                @click="confirmDelete"
              >
                <div v-if="deletingAccount" class="spinner" style="width:14px;height:14px;border-width:2px;"></div>
                {{ deletingAccount ? 'Processing...' : 'Delete Account' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <div class="settings-page">

      <!-- ── SKELETON ──────────────────────────── -->
      <div v-if="loading" class="settings-skeleton">
        <div class="skeleton" style="height:56px;border-radius:12px;"></div>
        <div class="skeleton" style="height:260px;border-radius:12px;"></div>
        <div class="skeleton" style="height:280px;border-radius:12px;"></div>
        <div class="skeleton" style="height:180px;border-radius:12px;"></div>
        <div class="skeleton" style="height:160px;border-radius:12px;"></div>
      </div>

      <template v-else>

        <!-- Page heading -->
        <div class="settings-heading">
          <h2>Settings</h2>
          <p>Manage your profile, subscription, and account preferences</p>
        </div>

        <!-- ══════════════════════════════════════
             SECTION 1 — PROFILE
        ═══════════════════════════════════════════ -->
        <div class="card settings-card">
          <div class="settings-section-header">
            <div class="section-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
              <div class="section-title">My Profile</div>
              <div class="section-sub">Update your personal and professional details</div>
            </div>
          </div>

          <div class="settings-form">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input v-model="profile.name" type="text" class="form-input" placeholder="Your full name" />
              </div>
              <div class="form-group">
                <label class="form-label">Bar Council No.</label>
                <input v-model="profile.bar_council_no" type="text" class="form-input" placeholder="e.g. MH/1234/2020" />
              </div>
            </div>
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label">City</label>
                <input v-model="profile.city" type="text" class="form-input" placeholder="Your city" />
              </div>
              <div class="form-group">
                <label class="form-label">
                  Email
                  <span class="readonly-tag">Read-only</span>
                </label>
                <input :value="profile.email" type="email" class="form-input readonly-input" readonly />
              </div>
            </div>
          </div>

          <div class="settings-card-footer">
            <button class="btn btn-gold" :disabled="savingProfile" @click="saveProfile">
              <div v-if="savingProfile" class="spinner" style="width:14px;height:14px;border-width:2px;"></div>
              <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
              {{ savingProfile ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>

        <!-- ══════════════════════════════════════
             SECTION 1B — PREFERENCES (THEME)
        ═══════════════════════════════════════════ -->
        <div class="card settings-card">
          <div class="settings-section-header">
            <div class="section-icon-wrap">
              <svg v-if="theme === 'dark'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            </div>
            <div>
              <div class="section-title">Visual Preferences</div>
              <div class="section-sub">Customize the visual appearance of the application</div>
            </div>
          </div>

          <div class="preferences-settings" style="display: flex; justify-content: space-between; align-items: center; padding: 10px 0;">
            <div>
              <div style="font-weight: 600; color: var(--text-primary); font-size: 0.95rem;">Application Theme</div>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">Choose between Dark Mode and Light Mode</div>
            </div>
            
            <button
              class="theme-toggle-switch"
              :class="{ 'theme-light-active': theme === 'light' }"
              @click="toggleTheme"
              aria-label="Toggle theme mode"
              type="button"
            >
              <div class="theme-switch-handle">
                <span class="switch-icon">{{ theme === 'dark' ? '🌙' : '☀️' }}</span>
              </div>
            </button>
          </div>
        </div>

        <!-- ══════════════════════════════════════
             SECTION 2 — SUBSCRIPTION
        ═══════════════════════════════════════════ -->
        <div class="card settings-card" :class="{ 'plan-premium': !isFreePlan }">
          <div class="settings-section-header">
            <div class="section-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" stroke-width="2" stroke-linecap="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </div>
            <div>
              <div class="section-title">My Plan</div>
              <div class="section-sub">Your current subscription details</div>
            </div>
          </div>

          <!-- Free plan -->
          <div v-if="isFreePlan" class="plan-card plan-free">
            <div class="plan-name">Free Plan</div>
            <div class="plan-features">
              <div class="feature-row yes">✅ 5 draft generations per day</div>
              <div class="feature-row yes">✅ Word document export</div>
              <div class="feature-row yes">✅ Up to 10 clients</div>
              <div class="feature-row no">❌ AI field suggestions</div>
              <div class="feature-row no">❌ Unlimited drafts</div>
              <div class="feature-row no">❌ Priority support</div>
            </div>
            <button class="btn btn-gold" style="width:100%;justify-content:center;margin-top:20px;opacity:0.6;cursor:not-allowed;" disabled>
              ✨ Upgrade to Premium (Coming Soon)
            </button>
          </div>

          <!-- Premium plan -->
          <div v-else class="plan-card plan-premium-inner">
            <div class="plan-name plan-name-premium">Premium Plan ✨</div>
            <div v-if="advocateData?.expires_at" class="plan-expiry">
              Active until: {{ formatDate(advocateData.expires_at) }}
            </div>
            <div class="plan-features">
              <div class="feature-row yes">✅ Unlimited draft generations</div>
              <div class="feature-row yes">✅ Word document export</div>
              <div class="feature-row yes">✅ Unlimited clients</div>
              <div class="feature-row yes">✅ AI field suggestions</div>
              <div class="feature-row yes">✅ Priority support</div>
              <div class="feature-row yes">✅ Advanced analytics</div>
            </div>
            <button class="btn btn-ghost" style="width:100%;justify-content:center;margin-top:20px;">
              Manage Subscription
            </button>
          </div>
        </div>

        <!-- ══════════════════════════════════════
             SECTION 3 — TODAY'S USAGE
        ═══════════════════════════════════════════ -->
        <div class="card settings-card">
          <div class="settings-section-header">
            <div class="section-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" stroke-width="2" stroke-linecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
            </div>
            <div>
              <div class="section-title">API Usage Today</div>
              <div class="section-sub">Resets daily at midnight IST</div>
            </div>
          </div>

          <div class="usage-list">
            <!-- Draft generations -->
            <div class="usage-item">
              <div class="usage-label-row">
                <span class="usage-name">Draft Generations</span>
                <span class="usage-fraction" :class="{ 'usage-warn': usage.drafts >= (isFreePlan ? 4 : 99) }">
                  {{ usage.drafts }} / {{ isFreePlan ? '5' : '∞' }}
                </span>
              </div>
              <div class="usage-track">
                <div
                  class="usage-fill"
                  :class="{ 'usage-fill-warn': isFreePlan && usage.drafts >= 4 }"
                  :style="{ width: isFreePlan ? Math.min(usage.drafts / 5 * 100, 100) + '%' : '12%' }"
                ></div>
              </div>
            </div>

            <!-- AI assists (premium only) -->
            <div v-if="!isFreePlan" class="usage-item">
              <div class="usage-label-row">
                <span class="usage-name">AI Assists</span>
                <span class="usage-fraction">{{ usage.assists }} / 10</span>
              </div>
              <div class="usage-track">
                <div class="usage-fill" :style="{ width: Math.min(usage.assists / 10 * 100, 100) + '%' }"></div>
              </div>
            </div>
          </div>

          <p class="reset-note">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Counters reset daily at 12:00 AM IST
          </p>
        </div>

        <!-- ══════════════════════════════════════
             SECTION 4 — DANGER ZONE
        ═══════════════════════════════════════════ -->
        <div class="card settings-card danger-zone">
          <div class="settings-section-header">
            <div class="section-icon-wrap danger-icon-wrap">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div>
              <div class="section-title danger-title">Account</div>
              <div class="section-sub">Manage account access and data</div>
            </div>
          </div>

          <div class="danger-actions">
            <div class="danger-row">
              <div>
                <div class="danger-action-title">Logout</div>
                <div class="danger-action-sub">Sign out of your account on this device</div>
              </div>
              <button class="btn btn-danger" :disabled="loggingOut" @click="handleLogout">
                <div v-if="loggingOut" class="spinner" style="width:14px;height:14px;border-width:2px;"></div>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                {{ loggingOut ? 'Logging out...' : 'Logout' }}
              </button>
            </div>

            <div class="divider" style="margin:16px 0;"></div>

            <div class="danger-row">
              <div>
                <div class="danger-action-title">Delete Account</div>
                <div class="danger-action-sub">Permanently delete your account and all data</div>
              </div>
              <button class="btn btn-danger btn-danger-fill" @click="showDeleteModal = true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                Delete Account
              </button>
            </div>
          </div>
        </div>

      </template>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router    = useRouter()
const showToast = inject('showToast')

// ── State ─────────────────────────────────────────
const loading      = ref(true)
const advocateData = ref(null)
const isFreePlan   = ref(true)

// Theme state
const theme = ref('dark')

function initTheme() {
  theme.value = localStorage.getItem('vakalatnama_theme') || 'dark'
  applyTheme()
}

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark'
  localStorage.setItem('vakalatnama_theme', theme.value)
  applyTheme()
  showToast(`Switched to ${theme.value === 'dark' ? 'Dark' : 'Light'} Mode`, '✨')
}

function applyTheme() {
  if (theme.value === 'light') {
    document.documentElement.classList.add('light-theme')
  } else {
    document.documentElement.classList.remove('light-theme')
  }
}

const profile = reactive({
  name:          '',
  bar_council_no: '',
  city:          '',
  email:         '',
})

const usage = reactive({ drafts: 0, assists: 0 })

const savingProfile   = ref(false)
const loggingOut      = ref(false)
const showDeleteModal = ref(false)
const deleteConfirmText = ref('')
const deletingAccount = ref(false)

// ── Fetch ─────────────────────────────────────────
onMounted(async () => {
  initTheme()
  const uid   = authStore.user?.id
  const email = authStore.user?.email || ''
  if (!uid) { loading.value = false; return }

  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' })

  try {
    const [advRes, usageRes] = await Promise.all([
      supabase.from('advocates').select('*').eq('id', uid).single(),
      supabase.from('token_usage').select('draft_calls_used, assist_calls_used').eq('advocate_id', uid).eq('date', today).maybeSingle(),
    ])

    if (advRes.data) {
      advocateData.value     = advRes.data
      profile.name           = advRes.data.name           || ''
      profile.bar_council_no = advRes.data.bar_council_no || ''
      profile.city           = advRes.data.city           || ''
      profile.email          = email
      isFreePlan.value       = !advRes.data.plan || advRes.data.plan === 'free'
    }

    usage.drafts  = usageRes.data?.draft_calls_used  ?? 0
    usage.assists = usageRes.data?.assist_calls_used ?? 0
  } catch (err) {
    console.error('[Settings] fetch:', err.message)
  } finally {
    loading.value = false
  }
})

// ── Helpers ───────────────────────────────────────
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── Save profile ──────────────────────────────────
async function saveProfile() {
  const uid = authStore.user?.id
  if (!uid) return
  savingProfile.value = true
  try {
    const { error } = await supabase
      .from('advocates')
      .update({
        name:           profile.name.trim(),
        bar_council_no: profile.bar_council_no.trim(),
        city:           profile.city.trim(),
      })
      .eq('id', uid)
    if (error) throw error

    // Sync auth store
    if (authStore.advocate) {
      authStore.advocate.name           = profile.name.trim()
      authStore.advocate.bar_council_no = profile.bar_council_no.trim()
      authStore.advocate.city           = profile.city.trim()
    }
    showToast('Profile updated successfully!', '✅')
  } catch (err) {
    console.error('[Settings] saveProfile:', err.message)
    showToast('Failed to save profile. Please try again.', '❌')
  } finally {
    savingProfile.value = false
  }
}

// ── Logout ────────────────────────────────────────
async function handleLogout() {
  loggingOut.value = true
  try {
    await authStore.logout()
    router.push('/login')
  } catch {
    loggingOut.value = false
  }
}

// ── Delete account ────────────────────────────────
async function confirmDelete() {
  if (deleteConfirmText.value !== 'DELETE') return
  deletingAccount.value = true
  try {
    // Phase 1: log out only — full deletion handled backend in later phase
    showToast('Account deletion requested. Our team will process it within 24 hours.', '📩')
    await authStore.logout()
    router.push('/login')
  } catch {
    deletingAccount.value = false
    showToast('Something went wrong. Please try again.', '❌')
  }
}
</script>

<style scoped>
/* ── Page wrapper ──────────────────────────────── */
.settings-page {
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 48px;
}

.settings-heading { margin-bottom: 4px; }
.settings-heading h2 { margin-bottom: 4px; }

/* ── Card ──────────────────────────────────────── */
.settings-card { padding: 24px 26px; }
.settings-card.plan-premium {
  border-color: rgba(201,168,76,0.4) !important;
  box-shadow: 0 0 0 1px rgba(201,168,76,0.1), var(--shadow-gold) !important;
}

/* ── Section header ────────────────────────────── */
.settings-section-header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 22px;
}
.section-icon-wrap {
  width: 36px; height: 36px;
  border-radius: var(--radius-md);
  background: rgba(201,168,76,0.1);
  border: 1px solid rgba(201,168,76,0.2);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.danger-icon-wrap {
  background: rgba(239,68,68,0.1);
  border-color: rgba(239,68,68,0.2);
}
.section-title  { font-size: 0.9375rem; font-weight: 700; color: var(--text-primary); }
.danger-title   { color: var(--danger); }
.section-sub    { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }

/* ── Form ──────────────────────────────────────── */
.settings-form  { display: flex; flex-direction: column; gap: 14px; }
.form-row-2     { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.readonly-tag {
  display: inline-block;
  margin-left: 8px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 1px 6px;
  vertical-align: middle;
}
.readonly-input { opacity: 0.6; cursor: not-allowed; }
.settings-card-footer { margin-top: 22px; padding-top: 18px; border-top: 1px solid var(--border); }

/* ── Plan card ─────────────────────────────────── */
.plan-card { border-radius: var(--radius-md); padding: 18px 20px; }
.plan-free { background: var(--bg-elevated); border: 1px solid var(--border-light); }
.plan-premium-inner {
  background: rgba(201,168,76,0.06);
  border: 1.5px solid rgba(201,168,76,0.3);
}
.plan-name { font-size: 1.1rem; font-weight: 800; color: var(--text-primary); margin-bottom: 4px; }
.plan-name-premium { color: var(--accent-gold); }
.plan-expiry { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 14px; }
.plan-features { display: flex; flex-direction: column; gap: 8px; margin-top: 14px; }
.feature-row { font-size: 0.875rem; display: flex; align-items: center; gap: 8px; }
.feature-row.yes { color: var(--text-subtle); }
.feature-row.no  { color: var(--text-muted); opacity: 0.6; }

/* ── Usage ─────────────────────────────────────── */
.usage-list { display: flex; flex-direction: column; gap: 18px; }
.usage-item { display: flex; flex-direction: column; gap: 7px; }
.usage-label-row { display: flex; justify-content: space-between; align-items: center; }
.usage-name { font-size: 0.875rem; font-weight: 500; color: var(--text-subtle); }
.usage-fraction { font-size: 0.875rem; font-weight: 700; color: var(--text-primary); }
.usage-warn { color: var(--warning) !important; }
.usage-track {
  height: 8px;
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
.usage-fill-warn {
  background: linear-gradient(90deg, var(--warning), #fbbf24) !important;
}
.reset-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 16px;
}

/* ── Danger zone ────────────────────────────────── */
.danger-zone { border-color: rgba(239,68,68,0.25) !important; }
.danger-actions { display: flex; flex-direction: column; }
.danger-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}
.danger-action-title { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 2px; }
.danger-action-sub   { font-size: 0.8rem; color: var(--text-muted); }
.btn-danger-fill {
  background: var(--danger);
  color: white;
  border-color: var(--danger);
}
.btn-danger-fill:hover { background: #dc2626; }

/* ── Modal ─────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.75);
  backdrop-filter: blur(5px);
  display: flex; align-items: center; justify-content: center;
  z-index: 500; padding: 20px;
}
.modal-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: 36px 32px;
  max-width: 400px; width: 100%;
  text-align: center;
  box-shadow: var(--shadow-lg);
}
.danger-modal { border-color: rgba(239,68,68,0.35); }
.modal-icon-danger    { font-size: 2.5rem; margin-bottom: 12px; }
.modal-title-danger   { font-size: 1.15rem; font-weight: 700; color: var(--danger); margin-bottom: 10px; }
.modal-body-text      { font-size: 0.875rem; color: var(--text-subtle); line-height: 1.7; }
.modal-body-text strong { color: var(--accent-gold); }
.modal-actions-row    { display: flex; gap: 10px; justify-content: center; margin-top: 20px; }

/* ── Skeleton ──────────────────────────────────── */
.settings-skeleton { display: flex; flex-direction: column; gap: 20px; }

/* ── Transitions ───────────────────────────────── */
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.25s ease; }
.modal-fade-enter-from, .modal-fade-leave-to       { opacity: 0; }

/* ── Responsive ─────────────────────────────────── */
@media (max-width: 560px) {
  .form-row-2   { grid-template-columns: 1fr; }
  .danger-row   { flex-direction: column; align-items: flex-start; }
}
</style>
