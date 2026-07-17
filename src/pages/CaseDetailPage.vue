<template>
  <AppLayout title="Case Detail">
    <template #topbar-actions>
      <router-link to="/dashboard" class="btn btn-ghost btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Dashboard
      </router-link>
    </template>

    <!-- ════════════════════════════════════════
         FULL-PAGE LOADING OVERLAY (Regenerate)
    ═════════════════════════════════════════════ -->
    <Teleport to="body">
      <transition name="overlay-fade">
        <div v-if="regeneratingOverlay" class="gen-overlay">
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
         REGENERATE CONFIRM MODAL
    ═════════════════════════════════════════════ -->
    <Teleport to="body">
      <transition name="overlay-fade">
        <div v-if="showRegenModal" class="modal-backdrop" @click.self="showRegenModal = false">
          <div class="modal-box">
            <div class="modal-icon">🔄</div>
            <h3 class="modal-title">Regenerate Draft?</h3>
            <p class="modal-body">
              This will generate a new version of the draft using the same case data.
              The previous draft will remain in history. Continue?
            </p>
            <div class="modal-actions">
              <button class="btn btn-gold" :disabled="regenerating" @click="confirmRegenerate">
                <div v-if="regenerating" class="spinner" style="width:14px;height:14px;border-width:2px;"></div>
                Yes, Regenerate
              </button>
              <button class="btn btn-ghost" @click="showRegenModal = false">Cancel</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ════════════════════════════════════════
         SKELETON LOADER
    ═════════════════════════════════════════════ -->
    <div v-if="loading" class="case-layout">
      <div class="case-left">
        <div class="skeleton" style="height:80px;border-radius:12px;"></div>
        <div class="skeleton" style="height:300px;border-radius:12px;"></div>
        <div class="skeleton" style="height:420px;border-radius:12px;"></div>
      </div>
      <div class="case-right">
        <div class="skeleton" style="height:200px;border-radius:12px;"></div>
        <div class="skeleton" style="height:160px;border-radius:12px;"></div>
        <div class="skeleton" style="height:140px;border-radius:12px;"></div>
      </div>
    </div>

    <!-- ════════════════════════════════════════
         MAIN CONTENT
    ═════════════════════════════════════════════ -->
    <div v-else-if="caseData" class="case-layout">

      <!-- ══════════════════════════════
           LEFT COLUMN — Draft Content
      ═══════════════════════════════════ -->
      <div class="case-left">

        <!-- Draft Header -->
        <div class="card draft-header-card">
          <div class="ai-chip">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                 stroke-width="2" stroke-linecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            AI Generated
          </div>
          <h2 class="vs-title">
            <span class="plaintiff-name">{{ caseData.plaintiff_name || '—' }}</span>
            <span class="vs-text">vs.</span>
            <span class="defendant-name">{{ caseData.defendant_name || '—' }}</span>
          </h2>
          <div class="case-badges">
            <span class="badge badge-gold">{{ caseData.case_type || '—' }}</span>
            <span class="badge badge-muted">{{ caseData.court_level || '—' }}</span>
            <span class="badge" :class="statusBadgeClass">
              <span class="status-dot"></span>
              {{ caseData.status }}
            </span>
            <span v-if="draftData" class="badge badge-muted" style="font-family:monospace;">
              v{{ draftData.version }}
            </span>
          </div>
        </div>

        <!-- ── Section 1: Identified Laws ──────────── -->
        <div v-if="draftData" class="card laws-card">
          <div class="section-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)"
                 stroke-width="2" stroke-linecap="round"><path d="M3 6l9-4 9 4v6c0 5.55-3.84 10.74-9 12-5.16-1.26-9-6.45-9-12V6z"/></svg>
            Applicable Laws &amp; Sections
          </div>
          <p class="section-sub">AI has identified the following applicable sections based on case facts</p>

          <div class="laws-list">
            <div v-for="law in identifiedLaws" :key="law.section + law.act" class="law-card">
              <div class="law-section-badge">{{ law.section }}</div>
              <div class="law-info">
                <div class="law-act">{{ law.act }}</div>
                <div class="law-desc">{{ law.explanation || law.description }}</div>
              </div>
            </div>
            <div v-if="!identifiedLaws.length" class="empty-laws">
              No laws identified.
            </div>
          </div>
        </div>

        <!-- ── Section 2: Legal Draft ───────────────── -->
        <div v-if="draftData" class="card draft-card">
          <div class="draft-card-header">
            <div>
              <div class="section-title" style="margin-bottom:4px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)"
                     stroke-width="2" stroke-linecap="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                Generated Legal Draft
              </div>
              <p class="section-sub">AI-drafted legal document based on provided facts</p>
            </div>
            <!-- Edit button -->
            <button
              v-if="!isEditing"
              class="btn btn-outline btn-sm"
              @click="startEdit"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2.5" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Draft
            </button>
          </div>

          <!-- VIEW mode -->
          <div v-if="!isEditing" class="draft-box">
            <pre class="draft-text">{{ draftData.draft_text }}</pre>
          </div>

          <!-- EDIT mode -->
          <div v-else class="edit-mode">
            <textarea
              v-model="editedText"
              class="draft-edit-area"
              spellcheck="false"
            ></textarea>
            <div class="edit-actions">
              <button class="btn btn-gold btn-sm" :disabled="savingEdit" @click="saveDraftEdit">
                <div v-if="savingEdit" class="spinner" style="width:13px;height:13px;border-width:2px;"></div>
                <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2.5" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                {{ savingEdit ? 'Saving...' : 'Save Changes' }}
              </button>
              <button class="btn btn-ghost btn-sm" @click="cancelEdit">Cancel</button>
            </div>
          </div>
        </div>

        <!-- No draft state -->
        <div v-if="!draftData && !loading" class="card no-draft-card">
          <div class="no-draft-icon">📄</div>
          <h3 class="no-draft-title">No Draft Generated Yet</h3>
          <p class="no-draft-body">
            This case doesn't have an AI draft yet. Review the case details and generate your first draft.
          </p>
          <router-link :to="`/case-review/${caseData.id}`" class="btn btn-gold no-draft-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
            Generate AI Draft
          </router-link>
        </div>

      </div>

      <!-- ══════════════════════════════
           RIGHT COLUMN — Actions
      ═══════════════════════════════════ -->
      <div class="case-right">

        <!-- Case Info card -->
        <div class="card info-card">
          <div class="section-title" style="margin-bottom:12px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)"
                 stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Case Info
          </div>
          <div class="info-grid">
            <div class="info-field">
              <span class="info-label">Client</span>
              <span class="info-value">{{ caseData.clients?.name || '—' }}</span>
            </div>
            <div class="info-field">
              <span class="info-label">Phone</span>
              <span class="info-value">{{ caseData.clients?.phone || '—' }}</span>
            </div>
            <div class="info-field">
              <span class="info-label">Incident Date</span>
              <span class="info-value">{{ formatDate(caseData.incident_date) }}</span>
            </div>
            <div class="info-field">
              <span class="info-label">Place</span>
              <span class="info-value">{{ caseData.incident_place || '—' }}</span>
            </div>
            <div class="info-field">
              <span class="info-label">Case Type</span>
              <span class="badge badge-gold" style="font-size:0.7rem;">{{ caseData.case_type || '—' }}</span>
            </div>
            <div class="info-field">
              <span class="info-label">Court</span>
              <span class="badge badge-muted" style="font-size:0.7rem;">{{ caseData.court_level || '—' }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="card action-card">
          <div class="section-title" style="margin-bottom:14px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)"
                 stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
            Actions
          </div>
          <div class="action-list">

            <!-- 1. Regenerate -->
            <button
              class="btn btn-outline action-btn"
              :disabled="regenerating"
              @click="showRegenModal = true"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              🔄 Regenerate Draft
            </button>

            <!-- 2. Proceed to Consent (only if draft exists + no consent) -->
            <button
              v-if="draftData && !consentData"
              class="btn btn-gold action-btn"
              @click="router.push(`/consent/${caseData.id}`)"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="16 13 12 17 8 13"/><line x1="12" y1="17" x2="12" y2="9"/></svg>
              📋 Proceed to Consent
            </button>

            <!-- 3. Export (only if consent given) -->
            <button
              class="btn action-btn"
              :class="consentData ? 'btn-export' : 'btn-ghost btn-disabled-look'"
              :disabled="!consentData || isExporting"
              :title="!consentData ? 'Please complete the consent process first' : ''"
              @click="handleExport"
            >
              <div v-if="isExporting" class="spinner" style="width:14px;height:14px;border-width:2px;"></div>
              <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              {{ isExporting ? 'Exporting...' : '📄 Export as Word Doc' }}
            </button>

          </div>
        </div>

        <!-- Consent Status card -->
        <div class="card consent-card" :class="consentData ? 'consent-given' : 'consent-pending'">
          <template v-if="!consentData">
            <div class="consent-icon">⚠️</div>
            <div class="consent-title consent-title-warn">Consent Required</div>
            <p class="consent-body">
              You must proofread and provide consent before exporting this document.
            </p>
            <router-link
              v-if="draftData"
              :to="`/consent/${caseData.id}`"
              class="consent-link"
            >
              Proceed to Consent →
            </router-link>
          </template>
          <template v-else>
            <div class="consent-icon">✅</div>
            <div class="consent-title consent-title-ok">Consent Given</div>
            <p class="consent-body">
              Consented on: <strong>{{ formatDateTime(consentData.consented_at) }}</strong>
            </p>
            <p class="consent-body" style="margin-top:4px;">Document is ready for export.</p>
          </template>
        </div>

        <!-- Quota card -->
        <div class="card quota-card">
          <template v-if="isFreePlan">
            <div class="quota-header">
              <span class="quota-label">Drafts today</span>
              <span class="quota-count" :class="{ 'quota-warn': draftsUsed >= 4 }">
                {{ draftsUsed }} / 5
              </span>
            </div>
            <div class="quota-track">
              <div class="quota-fill" :style="{ width: Math.min(draftsUsed/5*100,100)+'%' }"></div>
            </div>
            <p v-if="draftsUsed >= 5" class="quota-tip">
              <router-link to="/upgrade">Upgrade to Premium</router-link> for unlimited drafts.
            </p>
          </template>
          <template v-else>
            <div class="premium-badge">✨ Premium Plan — Unlimited Drafts</div>
          </template>
        </div>

      </div>
    </div>

    <!-- Error state -->
    <div v-else class="error-state">
      <div style="font-size:3rem;margin-bottom:12px;">⚠️</div>
      <h3>Case Not Found</h3>
      <p style="margin-bottom:20px;">Could not load case data.</p>
      <router-link to="/dashboard" class="btn btn-gold">Go to Dashboard</router-link>
    </div>

  </AppLayout>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { supabase } from '../lib/supabase'
import { generateDraft } from '../lib/generateDraft'
import { exportCaseAsDoc } from '../lib/exportDoc'
import { useAuthStore } from '../stores/auth'

const route     = useRoute()
const router    = useRouter()
const showToast = inject('showToast')
const authStore = useAuthStore()

// ── State ─────────────────────────────────────────────────────────
const loading   = ref(true)
const caseData  = ref(null)
const draftData = ref(null)
const consentData = ref(null)
const draftsUsed  = ref(0)
const isFreePlan  = ref(true)

// Edit
const isEditing   = ref(false)
const editedText  = ref('')
const originalText = ref('')
const savingEdit  = ref(false)

// Regenerate
const regenerating       = ref(false)
const regeneratingOverlay = ref(false)
const showRegenModal     = ref(false)

// Export
const isExporting = ref(false)

// Loading overlay messages
const loadingMessages = [
  'Analyzing case facts...',
  'Identifying applicable laws...',
  'Drafting your petition...',
  'Finalizing the document...',
]
const loadingMsgIndex = ref(0)
let msgTimer = null

// ── Computed ──────────────────────────────────────────────────────
const identifiedLaws = computed(() =>
  Array.isArray(draftData.value?.identified_laws) ? draftData.value.identified_laws : []
)

const statusBadgeClass = computed(() => {
  const s = caseData.value?.status
  if (s === 'Drafted' || s === 'Consented') return 'badge-success'
  if (s === 'In Progress') return 'badge-warning'
  return 'badge-muted'
})

// ── Lifecycle ─────────────────────────────────────────────────────
onMounted(async () => {
  const caseId = route.params.id
  const uid    = authStore.user?.id
  await Promise.all([
    fetchCase(caseId),
    fetchDraft(caseId),
    fetchConsent(caseId),
    fetchQuota(uid),
  ])
  loading.value = false
})

onUnmounted(() => clearInterval(msgTimer))

// ── Data fetching ─────────────────────────────────────────────────
async function fetchCase(caseId) {
  try {
    const { data, error } = await supabase
      .from('cases')
      .select('*, clients(name, phone, email)')
      .eq('id', caseId)
      .single()
    if (error) throw error
    caseData.value = data
  } catch (err) {
    console.error('[CaseDetail] fetchCase:', err.message)
  }
}

async function fetchDraft(caseId) {
  try {
    const { data, error } = await supabase
      .from('drafts')
      .select('*')
      .eq('case_id', caseId)
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    draftData.value = data
  } catch (err) {
    console.error('[CaseDetail] fetchDraft:', err.message)
  }
}

async function fetchConsent(caseId) {
  try {
    const { data, error } = await supabase
      .from('consents')
      .select('id, consented_at')
      .eq('case_id', caseId)
      .maybeSingle()
    if (error) throw error
    consentData.value = data
  } catch (err) {
    console.error('[CaseDetail] fetchConsent:', err.message)
  }
}

async function fetchQuota(uid) {
  if (!uid) return
  try {
    const { data: adv } = await supabase
      .from('advocates')
      .select('plan')
      .eq('id', uid)
      .maybeSingle()
    isFreePlan.value = !adv?.plan || adv.plan.toLowerCase() !== 'premium'
    if (!isFreePlan.value) return
    const today = new Date().toISOString().slice(0, 10)
    const { count } = await supabase
      .from('token_usage')
      .select('id', { count: 'exact', head: true })
      .eq('advocate_id', uid)
      .gte('created_at', today)
    draftsUsed.value = count ?? 0
  } catch (err) {
    console.error('[CaseDetail] fetchQuota:', err.message)
  }
}

// ── Helpers ───────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
}
function formatDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// ── Draft edit ────────────────────────────────────────────────────
function startEdit() {
  originalText.value = draftData.value.draft_text
  editedText.value   = draftData.value.draft_text
  isEditing.value    = true
}
function cancelEdit() {
  isEditing.value  = false
  editedText.value = ''
}

async function saveDraftEdit() {
  savingEdit.value = true
  try {
    const { error: updateErr } = await supabase
      .from('drafts')
      .update({
        draft_text:     editedText.value,
        is_edited:      true,
        last_edited_at: new Date().toISOString(),
      })
      .eq('id', draftData.value.id)
    if (updateErr) throw updateErr

    await supabase.from('draft_edits').insert({
      draft_id:       draftData.value.id,
      section_edited: 'draft_text',
      old_value:      originalText.value,
      new_value:      editedText.value,
    })

    draftData.value = { ...draftData.value, draft_text: editedText.value, is_edited: true }
    isEditing.value = false
    showToast('Draft saved successfully!', '✅')
  } catch (err) {
    console.error('[CaseDetail] saveDraftEdit:', err.message)
    showToast('Something went wrong. Please try again.', '❌')
  } finally {
    savingEdit.value = false
  }
}

// ── Regenerate ────────────────────────────────────────────────────
function startMsgRotation() {
  loadingMsgIndex.value = 0
  msgTimer = setInterval(() => {
    loadingMsgIndex.value = (loadingMsgIndex.value + 1) % loadingMessages.length
  }, 2000)
}
function stopMsgRotation() { clearInterval(msgTimer); msgTimer = null }

async function confirmRegenerate() {
  showRegenModal.value = false
  if (!caseData.value) return

  regeneratingOverlay.value = true
  regenerating.value = true
  startMsgRotation()

  try {
    const result = await generateDraft(caseData.value)
    const nextVersion = (draftData.value?.version || 0) + 1

    const { data, error } = await supabase
      .from('drafts')
      .insert({
        case_id:         caseData.value.id,
        identified_laws: result.identified_laws,
        draft_text:      result.draft_text,
        version:         nextVersion,
      })
      .select()
      .single()
    if (error) throw error

    // If consent was previously given, delete it because the draft changed
    if (consentData.value) {
      await supabase.from('consents').delete().eq('case_id', caseData.value.id)
      await supabase.from('cases').update({ status: 'Drafted' }).eq('id', caseData.value.id)
      consentData.value = null
      caseData.value.status = 'Drafted'
    }

    draftData.value = data
    showToast(`New draft generated! Version ${nextVersion}`, '✅')
  } catch (err) {
    console.error('[CaseDetail] regenerate:', err.message)
    showToast('Something went wrong. Please try again.', '❌')
  } finally {
    regeneratingOverlay.value = false
    regenerating.value = false
    stopMsgRotation()
  }
}

// ── Export ────────────────────────────────────────────────────────
async function handleExport() {
  // Guard: ensure session is still active
  if (!authStore.user?.id) {
    showToast('Session expired. Please login again.', '⚠️')
    return
  }
  if (!consentData.value) {
    showToast('Please complete the consent process first. Redirecting...', '⚠️')
    router.push(`/consent/${caseData.value.id}`)
    return
  }
  if (!draftData.value) {
    showToast('No draft available to export.', '⚠️')
    return
  }

  isExporting.value = true
  try {
    await exportCaseAsDoc(
      caseData.value,
      draftData.value.identified_laws,
      draftData.value.draft_text,
      authStore.advocate,
      draftData.value
    )
    showToast('Document downloaded successfully!', '📄')

    await supabase.from('audit_logs').insert({
      advocate_id: authStore.user?.id ?? null,
      case_id:     route.params.id,
      action:      'document_exported',
      metadata: {
        draft_version: draftData.value.version,
        exported_at:   new Date().toISOString()
      }
    })
  } catch (err) {
    console.error('[CaseDetail] handleExport:', err)
    showToast('Export failed. Please try again.', '❌')
  } finally {
    isExporting.value = false
  }
}
</script>

<style scoped>
/* ── Layout ──────────────────────────────────────── */
.case-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 22px;
  align-items: start;
}
.case-left  { display: flex; flex-direction: column; gap: 18px; }
.case-right { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 88px; }

/* ── Draft header card ───────────────────────────── */
.draft-header-card { padding: 22px 24px; }

.ai-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 12px;
  background: rgba(201,168,76,0.1);
  border: 1px solid rgba(201,168,76,0.2);
  border-radius: 99px;
  font-size: 0.65rem;
  font-weight: 700;
  color: var(--accent-gold);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 14px;
}

.vs-title {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 14px;
  font-size: 1.25rem;
  line-height: 1.4;
}
.plaintiff-name { color: var(--text-primary); font-weight: 700; }
.vs-text        { font-size: 0.875rem; color: var(--text-muted); font-weight: 400; }
.defendant-name { color: var(--text-subtle); font-weight: 500; }

.case-badges { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.status-dot {
  display: inline-block;
  width: 6px; height: 6px;
  border-radius: 50%;
  background: currentColor;
  vertical-align: middle;
}

/* ── Section headers ─────────────────────────────── */
.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--text-primary);
  margin-bottom: 6px;
}
.section-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}

/* ── Laws card ───────────────────────────────────── */
.laws-card  { padding: 20px; }
.laws-list  { display: flex; flex-direction: column; gap: 10px; }
.law-card {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  transition: border-color 0.2s;
}
.law-card:hover { border-color: rgba(201,168,76,0.3); }
.law-section-badge {
  flex-shrink: 0;
  padding: 4px 10px;
  height: fit-content;
  background: rgba(201,168,76,0.12);
  border: 1px solid rgba(201,168,76,0.25);
  border-radius: var(--radius-sm);
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--accent-gold);
  font-family: 'Courier New', monospace;
  white-space: nowrap;
}
.law-info { display: flex; flex-direction: column; gap: 3px; }
.law-act  { font-size: 0.8125rem; font-weight: 600; color: var(--text-primary); }
.law-desc { font-size: 0.75rem; color: var(--text-muted); line-height: 1.5; }
.empty-laws { font-size: 0.875rem; color: var(--text-muted); text-align: center; padding: 16px; }

/* ── Draft card ──────────────────────────────────── */
.draft-card { padding: 20px; }
.draft-card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

/* View mode */
.draft-box {
  background: #080C16;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 20px;
  max-height: 520px;
  overflow-y: auto;
}
.draft-text {
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  color: #D0D0D0;
  line-height: 1.95;
  white-space: pre-wrap;
  letter-spacing: 0.01em;
}

/* Edit mode */
.edit-mode { display: flex; flex-direction: column; gap: 12px; }
.draft-edit-area {
  background: #080C16;
  border: 1.5px solid var(--accent-gold);
  border-radius: var(--radius-md);
  padding: 18px;
  color: #D0D0D0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.8rem;
  line-height: 1.95;
  resize: vertical;
  min-height: 400px;
  outline: none;
  width: 100%;
  box-shadow: 0 0 0 3px rgba(201,168,76,0.1);
  transition: border-color 0.2s;
}
.edit-actions { display: flex; gap: 10px; }

/* ── Right column cards ──────────────────────────── */
.info-card    { padding: 18px 20px; }
.action-card  { padding: 18px 20px; }
.consent-card { padding: 20px; text-align: center; }
.quota-card   { padding: 16px 20px; }

.info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.info-field { display: flex; flex-direction: column; gap: 3px; }
.info-label {
  font-size: 0.62rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
}
.info-value { font-size: 0.8125rem; color: var(--text-primary); font-weight: 500; }

/* Action list */
.action-list { display: flex; flex-direction: column; gap: 10px; }
.action-btn  { width: 100%; justify-content: center; }
.btn-export {
  background: rgba(34,197,94,0.12);
  color: var(--success);
  border: 1.5px solid rgba(34,197,94,0.3);
  font-family: inherit;
}
.btn-export:hover:not(:disabled) { background: rgba(34,197,94,0.2); }
.btn-disabled-look { opacity: 0.45; }

/* Consent card states */
.consent-pending {
  border-color: rgba(245,158,11,0.35) !important;
  background: rgba(245,158,11,0.04);
}
.consent-given {
  border-color: rgba(34,197,94,0.35) !important;
  background: rgba(34,197,94,0.04);
}
.consent-icon  { font-size: 1.8rem; margin-bottom: 8px; }
.consent-title { font-size: 0.875rem; font-weight: 700; margin-bottom: 6px; }
.consent-title-warn { color: var(--warning); }
.consent-title-ok   { color: var(--success); }
.consent-body {
  font-size: 0.8rem;
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: 0;
}
.consent-body strong { color: var(--text-subtle); }
.consent-link {
  display: inline-block;
  margin-top: 12px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent-gold);
}

/* Quota */
.quota-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.quota-label  { font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
.quota-track  { height: 6px; background: var(--border-light); border-radius: 99px; overflow: hidden; margin-bottom: 6px; }
.quota-fill   {
  height: 100%;
  background: linear-gradient(90deg, var(--accent-gold), var(--accent-gold-light));
  border-radius: 99px;
  transition: width 0.4s ease;
}
.quota-count  { font-size: 0.8rem; font-weight: 700; color: var(--text-subtle); }
.quota-warn   { color: var(--warning) !important; }
.quota-tip    { font-size: 0.75rem; color: var(--text-muted); margin-top: 6px; }
.premium-badge {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--accent-gold);
  text-align: center;
}

/* ── Error state ─────────────────────────────────── */
.error-state { text-align: center; padding: 80px 24px; color: var(--text-subtle); }

/* ── Generation overlay ──────────────────────────── */
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
.gen-overlay-inner { display: flex; flex-direction: column; align-items: center; gap: 24px; }
.gen-spinner-ring  { position: relative; width: 90px; height: 90px; }
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
.gen-message { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); text-align: center; }
.gen-dots    { display: flex; gap: 8px; }
.gen-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--accent-gold);
  animation: bounce 1s ease-in-out infinite;
}

/* ── Modals ──────────────────────────────────────── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.75);
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
.modal-icon  { font-size: 2.5rem; margin-bottom: 12px; }
.modal-title { font-size: 1.2rem; font-weight: 700; color: var(--text-primary); margin-bottom: 10px; }
.modal-body  { font-size: 0.9rem; color: var(--text-subtle); line-height: 1.7; margin-bottom: 24px; }
.modal-actions { display: flex; flex-direction: column; gap: 10px; }

/* ── Transitions ─────────────────────────────────── */
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity 0.3s ease; }
.overlay-fade-enter-from, .overlay-fade-leave-to       { opacity: 0; }

.msg-fade-enter-active, .msg-fade-leave-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.msg-fade-enter-from { opacity: 0; transform: translateY(8px); }
.msg-fade-leave-to   { opacity: 0; transform: translateY(-8px); }

@keyframes spin   { to { transform: rotate(360deg); } }
@keyframes bounce {
  0%, 80%, 100% { transform: scale(0.7); opacity: 0.4; }
  40%           { transform: scale(1);   opacity: 1; }
}

/* ── Responsive ──────────────────────────────────── */
@media (max-width: 1100px) {
  .case-layout { grid-template-columns: 1fr; }
  .case-right  { position: static; }
}
@media (max-width: 640px) {
  .info-grid  { grid-template-columns: 1fr; }
  .vs-title   { font-size: 1rem; }
}

/* ── No Draft Empty State ────────────────────────── */
.no-draft-card {
  text-align: center;
  padding: 56px 32px;
  border: 1.5px dashed var(--border-light);
  background: var(--bg-elevated);
}
.no-draft-icon { font-size: 3rem; margin-bottom: 18px; opacity: 0.8; }
.no-draft-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}
.no-draft-body {
  font-size: 0.875rem;
  color: var(--text-muted);
  line-height: 1.7;
  max-width: 360px;
  margin: 0 auto 24px;
}
.no-draft-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9375rem;
  padding: 12px 28px;
  box-shadow: 0 4px 16px rgba(201,168,76,0.35);
}
</style>
