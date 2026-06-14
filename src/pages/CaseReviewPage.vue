<template>
  <AppLayout title="Case Review">

    <!-- ════════════════════════════════════════
         FULL-PAGE LOADING OVERLAY
    ═════════════════════════════════════════════ -->
    <Teleport to="body">
      <transition name="overlay-fade">
        <div v-if="generating" class="gen-overlay">
          <div class="gen-overlay-inner">
            <div class="gen-spinner-ring">
              <div class="gen-spinner-arc"></div>
              <div class="gen-icon">⚖️</div>
            </div>
            <transition name="msg-fade" mode="out-in">
              <p :key="loadingMsgIndex" class="gen-message">{{ loadingMessages[loadingMsgIndex] }}</p>
            </transition>
            <div class="gen-dots">
              <span v-for="i in 3" :key="i" class="gen-dot" :style="{ animationDelay: (i-1)*0.2+'s' }"></span>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ════════════════════════════════════════
         LIMIT REACHED MODAL
    ═════════════════════════════════════════════ -->
    <Teleport to="body">
      <transition name="overlay-fade">
        <div v-if="showLimitModal" class="modal-backdrop" @click.self="showLimitModal = false">
          <div class="modal-box">
            <div class="modal-icon">🚫</div>
            <h3 class="modal-title">Daily Limit Reached</h3>
            <p class="modal-body">
              You have used all <strong>5 free drafts</strong> today.
              Upgrade to Premium for unlimited drafts and priority AI processing.
            </p>
            <div class="modal-actions">
              <router-link to="/upgrade" class="btn btn-gold btn-lg" style="justify-content:center;">
                ✨ Upgrade to Premium
              </router-link>
              <button class="btn btn-ghost" @click="showLimitModal = false">Cancel</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ════════════════════════════════════════
         EDIT BACK CONFIRM MODAL
    ═════════════════════════════════════════════ -->
    <Teleport to="body">
      <transition name="overlay-fade">
        <div v-if="showBackModal" class="modal-backdrop" @click.self="showBackModal = false">
          <div class="modal-box">
            <div class="modal-icon">✏️</div>
            <h3 class="modal-title">Go Back to Edit?</h3>
            <p class="modal-body">Going back will allow you to edit the case details. Any unsaved changes will be preserved in Supabase. Continue?</p>
            <div class="modal-actions">
              <button class="btn btn-gold" @click="confirmGoBack">Yes, Edit Case</button>
              <button class="btn btn-ghost" @click="showBackModal = false">Cancel</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ════════════════════════════════════════
         PAGE CONTENT
    ═════════════════════════════════════════════ -->
    <div class="review-page" :class="{ 'has-bottom-bar': true }">

      <!-- Skeleton -->
      <div v-if="loading" class="review-skeleton">
        <div class="skeleton" style="height:60px;margin-bottom:16px;border-radius:12px;"></div>
        <div class="skeleton" style="height:140px;margin-bottom:16px;border-radius:12px;"></div>
        <div class="skeleton" style="height:110px;margin-bottom:16px;border-radius:12px;"></div>
        <div class="skeleton" style="height:200px;margin-bottom:16px;border-radius:12px;"></div>
        <div class="skeleton" style="height:100px;border-radius:12px;"></div>
      </div>

      <template v-else-if="caseData">

        <!-- Page heading -->
        <div class="review-heading">
          <div>
            <h2 class="review-title">Review Your Case</h2>
            <p class="review-subtitle">Please review all details carefully before generating the draft</p>
          </div>
          <button class="btn btn-ghost" @click="showBackModal = true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            Edit Case
          </button>
        </div>

        <!-- ── CARD 1: Client & Case Info ───────────── -->
        <div class="card review-card">
          <div class="review-card-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)"
                 stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Client &amp; Case Info
          </div>

          <!-- Plaintiff vs Defendant banner -->
          <div class="vs-banner">
            <div class="vs-party plaintiff">
              <div class="vs-party-label">Plaintiff / Petitioner</div>
              <div class="vs-party-name">{{ caseData.plaintiff_name || '—' }}</div>
            </div>
            <div class="vs-divider">vs.</div>
            <div class="vs-party defendant">
              <div class="vs-party-label">Defendant / Respondent</div>
              <div class="vs-party-name">{{ caseData.defendant_name || '—' }}</div>
            </div>
          </div>

          <div class="review-info-grid">
            <div class="rif">
              <span class="rif-label">Client</span>
              <span class="rif-value">{{ caseData.clients?.name || '—' }}</span>
            </div>
            <div class="rif">
              <span class="rif-label">Phone</span>
              <span class="rif-value">{{ caseData.clients?.phone || '—' }}</span>
            </div>
            <div class="rif">
              <span class="rif-label">Email</span>
              <span class="rif-value">{{ caseData.clients?.email || '—' }}</span>
            </div>
            <div class="rif">
              <span class="rif-label">City</span>
              <span class="rif-value">{{ caseData.clients?.city || '—' }}</span>
            </div>
            <div class="rif">
              <span class="rif-label">Case Type</span>
              <span class="badge badge-gold">{{ caseData.case_type || '—' }}</span>
            </div>
            <div class="rif">
              <span class="rif-label">Court Level</span>
              <span class="badge badge-muted">{{ caseData.court_level || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- ── CARD 2: Incident Details ─────────────── -->
        <div class="card review-card">
          <div class="review-card-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)"
                 stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Incident Details
          </div>
          <div class="review-info-grid">
            <div class="rif">
              <span class="rif-label">Incident Date</span>
              <span class="rif-value">{{ formatDate(caseData.incident_date) }}</span>
            </div>
            <div class="rif">
              <span class="rif-label">Incident Place</span>
              <span class="rif-value">{{ caseData.incident_place || '—' }}</span>
            </div>
            <div class="rif">
              <span class="rif-label">State</span>
              <span class="rif-value">{{ caseData.state || '—' }}</span>
            </div>
          </div>
          <div class="rif" style="margin-top:16px;">
            <span class="rif-label">Evidence Available</span>
            <div class="pill-group" style="margin-top:8px;">
              <template v-if="evidenceList.length">
                <span v-for="ev in evidenceList" :key="ev" class="pill selected" style="cursor:default;">{{ ev }}</span>
              </template>
              <span v-else class="rif-value">None specified</span>
            </div>
          </div>
        </div>

        <!-- ── CARD 3: Facts of the Case ────────────── -->
        <div class="card review-card">
          <div class="review-card-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)"
                 stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Facts of the Case
          </div>
          <div class="facts-box">
            <p class="facts-body">{{ caseData.facts_text || 'No facts provided.' }}</p>
          </div>
          <div class="facts-count">{{ (caseData.facts_text || '').length }} characters</div>
        </div>

        <!-- ── CARD 4: Relief Sought ─────────────────── -->
        <div class="card review-card">
          <div class="review-card-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)"
                 stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            Relief Sought
          </div>
          <p class="facts-body">{{ caseData.relief_sought || 'No relief specified.' }}</p>
        </div>

        <!-- ── CARD 5: Applicable Acts ───────────────── -->
        <div class="card review-card">
          <div class="review-card-header">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)"
                 stroke-width="2" stroke-linecap="round"><path d="M3 6l9-4 9 4v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V6z"/></svg>
            Applicable Acts &amp; Statutes
          </div>
          <div class="pill-group" style="margin-top:4px;">
            <template v-if="actsList.length">
              <span v-for="act in actsList" :key="act" class="pill selected" style="cursor:default;">{{ act }}</span>
            </template>
            <span v-else class="rif-value">None selected</span>
          </div>
        </div>

      </template>

      <!-- Error state -->
      <div v-else-if="!loading" class="error-state">
        <div style="font-size:3rem;margin-bottom:12px;">⚠️</div>
        <h3>Failed to Load Case</h3>
        <p>Could not fetch case data. Please go back and try again.</p>
        <router-link to="/dashboard" class="btn btn-gold" style="margin-top:20px;">Go to Dashboard</router-link>
      </div>

    </div>

    <!-- ════════════════════════════════════════
         FIXED BOTTOM ACTION BAR
    ═════════════════════════════════════════════ -->
    <div class="bottom-action-bar">

      <!-- Upgrade banner (free + limit hit) -->
      <transition name="banner-slide">
        <div v-if="isFreePlan && draftsUsed >= 5" class="upgrade-banner">
          <span>🚀 You've reached your free daily limit.</span>
          <router-link to="/upgrade" class="btn btn-gold btn-sm">Upgrade to Premium</router-link>
        </div>
      </transition>

      <div class="bottom-bar-inner">
        <!-- Left: quota info -->
        <div class="quota-info">
          <template v-if="isFreePlan">
            <div class="quota-label">Drafts used today</div>
            <div class="quota-track">
              <div class="quota-fill" :style="{ width: Math.min(draftsUsed/5*100, 100)+'%' }"></div>
            </div>
            <div class="quota-count" :class="{ 'quota-warn': draftsUsed >= 4 }">
              {{ draftsUsed }} / 5
            </div>
          </template>
          <template v-else>
            <span class="premium-badge">✨ Premium Plan — Unlimited Drafts</span>
          </template>
        </div>

        <!-- Right: Generate button -->
        <div style="display:flex;align-items:center;gap:12px;">
          <div v-if="isFreePlan && draftsUsed >= 5" class="limit-tip">
            Daily limit reached. Upgrade to continue.
          </div>
          <button
            class="btn btn-gold btn-lg"
            :disabled="!caseData || generating || (isFreePlan && draftsUsed >= 5)"
            @click="handleGenerate"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            Generate Draft
          </button>
        </div>
      </div>
    </div>

  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { inject } from 'vue'
import AppLayout from '../components/AppLayout.vue'
import { supabase } from '../lib/supabase'
import { generateDraft } from '../lib/generateDraft'
import { useAuthStore } from '../stores/auth'

const route     = useRoute()
const router    = useRouter()
const showToast = inject('showToast')
const authStore = useAuthStore()

// ── State ────────────────────────────────────────────────────────
const loading        = ref(true)
const caseData       = ref(null)
const draftsUsed     = ref(0)
const isFreePlan     = ref(true)

const generating     = ref(false)
const showLimitModal = ref(false)
const showBackModal  = ref(false)

// Loading overlay messages
const loadingMessages = [
  'Analyzing case facts...',
  'Identifying applicable laws...',
  'Drafting your petition...',
  'Finalizing the document...',
]
const loadingMsgIndex = ref(0)
let msgTimer = null

// ── Computed helpers ─────────────────────────────────────────────
const evidenceList = computed(() =>
  Array.isArray(caseData.value?.evidence_available) ? caseData.value.evidence_available : []
)
const actsList = computed(() =>
  Array.isArray(caseData.value?.applicable_acts) ? caseData.value.applicable_acts : []
)

// ── Lifecycle ────────────────────────────────────────────────────
onMounted(async () => {
  const caseId = route.params.id
  const uid    = authStore.user?.id

  await Promise.all([fetchCase(caseId), fetchQuota(uid)])
  loading.value = false
})

onUnmounted(() => clearInterval(msgTimer))

async function fetchCase(caseId) {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*, clients(name, phone, email, city)')
      .eq('id', caseId)
      .single()
    if (error) throw error
    caseData.value = data
  } catch (err) {
    console.error('[CaseReview] fetchCase:', err.message)
  }
}

async function fetchQuota(uid) {
  if (!uid) return
  try {
    // Check advocate plan
    const { data: adv } = await supabase
      .from('advocates')
      .select('plan')
      .eq('id', uid)
      .maybeSingle()

    isFreePlan.value = !adv?.plan || adv.plan.toLowerCase() !== 'premium'

    if (!isFreePlan.value) return

    // Count today's drafts from token_usage
    const today = new Date().toISOString().slice(0, 10)
    const { count } = await supabase
      .from('token_usage')
      .select('id', { count: 'exact', head: true })
      .eq('advocate_id', uid)
      .gte('created_at', today)

    draftsUsed.value = count ?? 0
  } catch (err) {
    console.error('[CaseReview] fetchQuota:', err.message)
  }
}

// ── Helpers ──────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
}

function confirmGoBack() {
  showBackModal.value = false
  router.push('/new-case')
}

// ── Loading overlay message rotator ─────────────────────────────
function startMsgRotation() {
  loadingMsgIndex.value = 0
  msgTimer = setInterval(() => {
    loadingMsgIndex.value = (loadingMsgIndex.value + 1) % loadingMessages.length
  }, 2000)
}
function stopMsgRotation() {
  clearInterval(msgTimer)
  msgTimer = null
}

// ── Generate Draft ───────────────────────────────────────────────
async function handleGenerate() {
  if (!caseData.value) return

  generating.value = true
  startMsgRotation()

  try {
    const result = await generateDraft(caseData.value)

    // Save draft to Supabase
    const { data: draft, error: draftErr } = await supabase
      .from('drafts')
      .insert({
        case_id:         caseData.value.id,
        identified_laws: result.identified_laws,
        draft_text:      result.draft_text,
        version:         1,
      })
      .select()
      .single()
    if (draftErr) throw draftErr

    // Update case status
    await supabase
      .from('cases')
      .update({ status: 'In Progress' })
      .eq('id', caseData.value.id)

    generating.value = false
    stopMsgRotation()
    router.push(`/case-detail/${caseData.value.id}`)

  } catch (err) {
    generating.value = false
    stopMsgRotation()

    const msg = err.message || ''

    if (msg.toLowerCase().includes('limit') || msg.includes('429')) {
      showLimitModal.value = true
    } else if (msg.toLowerCase().includes('session') || msg.includes('401')) {
      showToast('Session expired. Please login again.', '❌')
      router.push('/login')
    } else {
      showToast('Something went wrong. Please try again.', '❌')
    }
    console.error('[CaseReview] generate:', err.message)
  }
}
</script>

<style scoped>
/* ── Page wrapper ──────────────────────────────── */
.review-page {
  max-width: 760px;
  margin: 0 auto;
  padding-bottom: 120px; /* space for fixed bottom bar */
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Heading ───────────────────────────────────── */
.review-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 8px;
}
.review-title   { color: var(--accent-gold); margin-bottom: 4px; }
.review-subtitle{ font-size: 0.875rem; }

/* ── Cards ─────────────────────────────────────── */
.review-card { padding: 22px 24px; }

.review-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 18px;
}

/* ── Plaintiff vs Defendant ────────────────────── */
.vs-banner {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  margin-bottom: 20px;
}
.vs-party { flex: 1; }
.vs-party.defendant { text-align: right; }
.vs-party-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin-bottom: 4px;
}
.vs-party-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
}
.vs-divider {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent-gold);
  background: var(--accent-gold-dim);
  border: 1px solid rgba(201,168,76,0.25);
  border-radius: 99px;
  padding: 4px 10px;
  flex-shrink: 0;
}

/* ── Info grid ─────────────────────────────────── */
.review-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.rif { display: flex; flex-direction: column; gap: 4px; }
.rif-label {
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}
.rif-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

/* ── Facts box ─────────────────────────────────── */
.facts-box {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 16px 18px;
  margin-bottom: 8px;
  max-height: 260px;
  overflow-y: auto;
}
.facts-body {
  font-size: 0.875rem;
  color: var(--text-subtle);
  line-height: 1.85;
  white-space: pre-line;
}
.facts-count {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: right;
}

/* ── Error state ───────────────────────────────── */
.error-state {
  text-align: center;
  padding: 60px 24px;
  color: var(--text-subtle);
}

/* ── Bottom Action Bar ─────────────────────────── */
.bottom-action-bar {
  position: fixed;
  bottom: 0;
  left: var(--sidebar-width);
  right: 0;
  z-index: 200;
  background: rgba(17, 24, 39, 0.95);
  backdrop-filter: blur(16px);
  border-top: 1px solid var(--border-light);
}

.upgrade-banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 10px 24px;
  background: rgba(245, 158, 11, 0.1);
  border-bottom: 1px solid rgba(245, 158, 11, 0.2);
  font-size: 0.875rem;
  color: var(--warning);
  font-weight: 500;
}

.bottom-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 32px;
  max-width: 1200px;
  margin: 0 auto;
}

/* Quota indicator */
.quota-info { display: flex; align-items: center; gap: 12px; }
.quota-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  font-weight: 500;
  white-space: nowrap;
}
.quota-track {
  width: 100px;
  height: 6px;
  background: var(--border-light);
  border-radius: 99px;
  overflow: hidden;
}
.quota-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-gold), var(--accent-gold-light));
  border-radius: 99px;
  transition: width 0.4s ease;
}
.quota-count {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--text-subtle);
  white-space: nowrap;
}
.quota-warn { color: var(--warning) !important; }
.premium-badge {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--accent-gold);
  background: var(--accent-gold-dim);
  border: 1px solid rgba(201,168,76,0.25);
  border-radius: 99px;
  padding: 6px 14px;
}
.limit-tip {
  font-size: 0.8rem;
  color: var(--warning);
  max-width: 200px;
  text-align: right;
  line-height: 1.4;
}

/* ── Skeleton ──────────────────────────────────── */
.review-skeleton { display: flex; flex-direction: column; gap: 16px; }

/* ── Generation overlay ─────────────────────────── */
.gen-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10, 14, 26, 0.96);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.gen-overlay-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* Spinner ring */
.gen-spinner-ring {
  position: relative;
  width: 90px;
  height: 90px;
}
.gen-spinner-arc {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--accent-gold);
  border-right-color: rgba(201,168,76,0.3);
  animation: spin 1s linear infinite;
}
.gen-icon {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}
.gen-message {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
  text-align: center;
  letter-spacing: 0.01em;
}
.gen-dots { display: flex; gap: 8px; }
.gen-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--accent-gold);
  animation: bounce 1s ease-in-out infinite;
}

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
  40%            { transform: scale(1);   opacity: 1; }
}

/* ── Modals ─────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9998;
  padding: 20px;
}
.modal-box {
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: 36px 32px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  box-shadow: var(--shadow-lg);
}
.modal-icon { font-size: 2.5rem; margin-bottom: 12px; }
.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
}
.modal-body {
  font-size: 0.9rem;
  color: var(--text-subtle);
  line-height: 1.7;
  margin-bottom: 24px;
}
.modal-body strong { color: var(--accent-gold); }
.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ── Transitions ────────────────────────────────── */
.overlay-fade-enter-active, .overlay-fade-leave-active {
  transition: opacity 0.3s ease;
}
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }

.msg-fade-enter-active, .msg-fade-leave-active {
  transition: opacity 0.35s ease, transform 0.35s ease;
}
.msg-fade-enter-from { opacity: 0; transform: translateY(8px); }
.msg-fade-leave-to   { opacity: 0; transform: translateY(-8px); }

.banner-slide-enter-active, .banner-slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.banner-slide-enter-from, .banner-slide-leave-to {
  opacity: 0;
  max-height: 0;
}
.banner-slide-enter-to, .banner-slide-leave-from {
  opacity: 1;
  max-height: 60px;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Responsive ─────────────────────────────────── */
@media (max-width: 768px) {
  .bottom-action-bar { left: 0; }
  .bottom-bar-inner  { padding: 14px 16px; flex-wrap: wrap; gap: 12px; }
  .review-info-grid  { grid-template-columns: 1fr 1fr; }
  .vs-banner         { flex-direction: column; text-align: center; gap: 8px; }
  .vs-party.defendant { text-align: center; }
}
@media (max-width: 480px) {
  .review-info-grid { grid-template-columns: 1fr; }
}
</style>
