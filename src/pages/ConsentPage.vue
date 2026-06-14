<template>
  <AppLayout title="Consent">
    <template #topbar-actions>
      <router-link :to="`/case-detail/${route.params.id}`" class="btn btn-ghost btn-sm">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
             stroke-width="2.5" stroke-linecap="round"><polyline points="15 18 9 12 15 6"/></svg>
        Back to Draft
      </router-link>
    </template>

    <div class="consent-page">

      <!-- ═══════════════════════════════════════
           SKELETON
      ════════════════════════════════════════════ -->
      <div v-if="loading" class="consent-skeleton">
        <div class="skeleton" style="height:56px;border-radius:12px;"></div>
        <div class="skeleton" style="height:500px;border-radius:12px;"></div>
        <div class="skeleton" style="height:180px;border-radius:12px;"></div>
        <div class="skeleton" style="height:260px;border-radius:12px;"></div>
      </div>

      <template v-else-if="caseData">

        <!-- ─────────────────────────────────────
             PAGE HEADING + STEP INDICATOR
        ──────────────────────────────────────── -->
        <div class="consent-heading">
          <div>
            <h2 class="consent-title">Proofread &amp; Consent</h2>
            <p class="consent-subtitle">Read the complete draft carefully before providing consent</p>
          </div>

          <!-- Visual step indicator (non-clickable) -->
          <div class="step-track">
            <div class="step-pip" :class="{ active: true, done: consentDone }">
              <span v-if="!consentDone">1</span>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="step-track-line" :class="{ done: consentDone }"></div>
            <div class="step-pip" :class="{ active: consentDone, done: consentDone }">
              <span v-if="!consentDone">2</span>
              <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="3" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div class="step-track-line" :class="{ done: consentDone }"></div>
            <div class="step-pip" :class="{ active: consentDone }">
              <span>3</span>
            </div>
            <div class="step-labels">
              <span>Read Draft</span>
              <span>Confirm</span>
              <span>Export</span>
            </div>
          </div>
        </div>

        <!-- ═══════════════════════════════════════
             ALREADY CONSENTED STATE
        ════════════════════════════════════════════ -->
        <template v-if="consentDone">
          <div class="card consent-done-card">
            <div class="done-icon">✅</div>
            <h3 class="done-title">Consent Already Recorded</h3>
            <p class="done-body">
              Your consent was recorded on
              <strong>{{ formatDateTime(existingConsent?.consented_at) }}</strong>
            </p>
            <p class="done-body" style="margin-top:6px;">
              Case: <strong>{{ caseData.plaintiff_name }}</strong> vs
              <strong>{{ caseData.defendant_name }}</strong>
            </p>
            <div class="done-actions">
              <button class="btn btn-export btn-lg" :disabled="isExporting" @click="handleExport">
                <div v-if="isExporting" class="spinner" style="width:16px;height:16px;border-width:2px;"></div>
                <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {{ isExporting ? 'Preparing document...' : '📄 Download Word Document' }}
              </button>
              <router-link :to="`/case-detail/${route.params.id}`" class="btn btn-ghost">
                ← Back to Case
              </router-link>
            </div>
          </div>
        </template>

        <!-- ═══════════════════════════════════════
             CONSENT FLOW (not yet consented)
        ════════════════════════════════════════════ -->
        <template v-else>

          <!-- ─────────────────────────────────────
               SECTION 1 — FULL DRAFT DISPLAY
          ──────────────────────────────────────── -->
          <div class="card draft-section">
            <div class="section-header">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)"
                   stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Complete Legal Draft — Read Carefully
            </div>

            <!-- Scroll container with read-tracking -->
            <div
              ref="draftScrollEl"
              class="draft-read-box"
              @scroll="onDraftScroll"
            >
              <pre class="draft-read-text">{{ draftData?.draft_text || 'No draft found.' }}</pre>
            </div>

            <!-- Scroll indicator -->
            <transition name="fade-hint">
              <div v-if="!hasScrolledDraft" class="scroll-hint">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                Please scroll to read the complete draft
              </div>
            </transition>

            <!-- Collapsible Identified Laws -->
            <div class="laws-collapsible">
              <button class="laws-toggle" @click="showLaws = !showLaws">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2" stroke-linecap="round"
                     :style="{ transform: showLaws ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
                View Applicable Laws ({{ identifiedLaws.length }} sections identified)
              </button>
              <transition name="expand">
                <div v-if="showLaws" class="laws-list">
                  <div v-for="law in identifiedLaws" :key="law.section + law.act" class="law-row">
                    <span class="law-section">{{ law.section }}</span>
                    <div class="law-body">
                      <div class="law-act">{{ law.act }}</div>
                      <div class="law-desc">{{ law.explanation || law.description }}</div>
                    </div>
                  </div>
                  <div v-if="!identifiedLaws.length" class="law-empty">No laws identified.</div>
                </div>
              </transition>
            </div>
          </div>

          <!-- ─────────────────────────────────────
               SECTION 2 — ADVOCATE DETAILS
          ──────────────────────────────────────── -->
          <div class="card details-section">
            <div class="section-header">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)"
                   stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Confirm Your Details
            </div>
            <div class="details-grid">
              <div class="detail-field">
                <span class="detail-label">Advocate Name</span>
                <span class="detail-value">{{ authStore.advocate?.name || '—' }}</span>
              </div>
              <div class="detail-field">
                <span class="detail-label">Bar Council No.</span>
                <span class="detail-value">{{ authStore.advocate?.bar_council_no || '—' }}</span>
              </div>
              <div class="detail-field">
                <span class="detail-label">Date</span>
                <span class="detail-value">{{ todayReadable }}</span>
              </div>
              <div class="detail-field">
                <span class="detail-label">Case</span>
                <span class="detail-value">
                  {{ caseData.plaintiff_name || '—' }} vs {{ caseData.defendant_name || '—' }}
                </span>
              </div>
              <div class="detail-field">
                <span class="detail-label">Court</span>
                <span class="detail-value">{{ caseData.court_level || '—' }}</span>
              </div>
            </div>
          </div>

          <!-- ─────────────────────────────────────
               SECTION 3 — DECLARATION CHECKBOXES
          ──────────────────────────────────────── -->
          <div class="card declaration-section">
            <div class="section-header">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)"
                   stroke-width="2" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              Declaration &amp; Consent
            </div>
            <p class="declaration-sub">
              All four declarations must be checked to enable the consent button.
            </p>

            <div class="checkbox-list">
              <label
                v-for="(item, idx) in declarations"
                :key="idx"
                class="decl-item"
                :class="{
                  checked: checks[idx],
                  highlight: highlightUnchecked && !checks[idx]
                }"
                @click="toggleCheck(idx)"
              >
                <div class="decl-checkbox">
                  <transition name="check-pop">
                    <svg v-if="checks[idx]" width="12" height="12" viewBox="0 0 24 24" fill="none"
                         stroke="var(--accent-gold)" stroke-width="3.5" stroke-linecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </transition>
                </div>
                <span class="decl-text">{{ item }}</span>
              </label>
            </div>
          </div>

          <!-- ─────────────────────────────────────
               CONSENT BUTTON
          ──────────────────────────────────────── -->
          <div class="consent-action">
            <div v-if="highlightUnchecked" class="consent-warn">
              ⚠ Please check all four declarations above to proceed.
            </div>
            <button
              class="btn btn-gold btn-lg consent-btn"
              :class="{ 'consent-btn-disabled': !allChecked }"
              :disabled="recordingConsent"
              @click="handleConsent"
            >
              <div v-if="recordingConsent" class="spinner" style="width:16px;height:16px;border-width:2px;"></div>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="2.5" stroke-linecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
              {{ recordingConsent ? 'Recording your consent...' : '✅ I Consent & Proceed to Export' }}
            </button>
          </div>

          <!-- ─────────────────────────────────────
               SUCCESS STATE (shown after consent)
          ──────────────────────────────────────── -->
          <transition name="success-reveal">
            <div v-if="justConsented" class="card consent-success-card">
              <div class="success-icon">🎉</div>
              <h3 class="success-title">Consent Recorded Successfully</h3>
              <p class="success-body">
                Your consent has been recorded at <strong>{{ consentTimestamp }}</strong>
              </p>
              <div class="success-meta">
                <div class="success-row">
                  <span class="smeta-label">Case</span>
                  <span class="smeta-value">{{ caseData.plaintiff_name }} vs {{ caseData.defendant_name }}</span>
                </div>
                <div class="success-row">
                  <span class="smeta-label">Advocate</span>
                  <span class="smeta-value">{{ authStore.advocate?.name }}</span>
                </div>
                <div class="success-row">
                  <span class="smeta-label">Bar Council</span>
                  <span class="smeta-value">{{ authStore.advocate?.bar_council_no }}</span>
                </div>
              </div>
              <button class="btn btn-export btn-lg" :disabled="isExporting" @click="handleExport">
                <div v-if="isExporting" class="spinner" style="width:16px;height:16px;border-width:2px;"></div>
                <svg v-else width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     stroke-width="2.5" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                {{ isExporting ? 'Preparing document...' : '📄 Download Word Document' }}
              </button>
            </div>
          </transition>

        </template>
      </template>

      <!-- Error state: case not found -->
      <div v-else-if="!loading && !caseData" class="error-state">
        <div style="font-size:2.5rem;margin-bottom:12px;">⚠️</div>
        <h3>Case Not Found</h3>
        <p style="margin-bottom:20px;color:var(--text-muted);font-size:0.9rem;">
          This case could not be loaded or does not exist.
        </p>
        <router-link to="/dashboard" class="btn btn-gold">← Back to Dashboard</router-link>
      </div>

      <!-- Error state: no draft available -->
      <div v-else-if="!loading && caseData && !draftData" class="error-state">
        <div style="font-size:2.5rem;margin-bottom:12px;">📄</div>
        <h3>No Draft Available</h3>
        <p style="margin-bottom:20px;color:var(--text-muted);font-size:0.9rem;">
          Generate a draft first before you can provide consent.
        </p>
        <router-link :to="`/case-review/${route.params.id}`" class="btn btn-gold">
          Generate Draft First
        </router-link>
      </div>

    </div>
  </AppLayout>
</template>

<script setup>
import { ref, computed, reactive, onMounted, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { supabase } from '../lib/supabase'
import { exportCaseAsDoc } from '../lib/exportDoc'
import { useAuthStore } from '../stores/auth'

const route     = useRoute()
const router    = useRouter()
const showToast = inject('showToast')
const authStore = useAuthStore()

// ── State ────────────────────────────────────────────────────────
const loading          = ref(true)
const caseData         = ref(null)
const draftData        = ref(null)
const existingConsent  = ref(null)
const consentDone      = ref(false)

const recordingConsent = ref(false)
const justConsented    = ref(false)
const consentTimestamp = ref('')
const isExporting      = ref(false)

const showLaws         = ref(false)
const hasScrolledDraft = ref(false)
const highlightUnchecked = ref(false)
const draftScrollEl    = ref(null)

// Declaration checkboxes
const checks = reactive([false, false, false, false])

// ── Declarations text ─────────────────────────────────────────────
const declarations = computed(() => [
  'I have read and understood the complete legal draft generated above.',
  'I confirm that the facts, parties, and details mentioned in this draft are accurate to the best of my knowledge.',
  'I understand that this draft has been AI-assisted and must be verified by a qualified advocate before filing in any court of law.',
  `I, ${authStore.advocate?.name || 'the advocate'}, take full responsibility for reviewing this document and authorize VakalatNama to record this consent with timestamp.`,
])

const allChecked = computed(() => checks.every(Boolean))

// ── Computed ──────────────────────────────────────────────────────
const identifiedLaws = computed(() =>
  Array.isArray(draftData.value?.identified_laws) ? draftData.value.identified_laws : []
)

const todayReadable = new Date().toLocaleDateString('en-IN', {
  day: '2-digit', month: 'long', year: 'numeric'
})

// ── Lifecycle ─────────────────────────────────────────────────────
onMounted(async () => {
  const caseId = route.params.id
  await Promise.all([fetchCase(caseId), fetchDraft(caseId), checkConsent(caseId)])
  loading.value = false
})

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
    console.error('[Consent] fetchCase:', err.message)
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
    console.error('[Consent] fetchDraft:', err.message)
  }
}

async function checkConsent(caseId) {
  try {
    const { data, error } = await supabase
      .from('consents')
      .select('id, consented_at')
      .eq('case_id', caseId)
      .maybeSingle()
    if (error) throw error
    if (data) {
      existingConsent.value = data
      consentDone.value = true
    }
  } catch (err) {
    console.error('[Consent] checkConsent:', err.message)
  }
}

// ── Helpers ───────────────────────────────────────────────────────
function toggleCheck(idx) {
  checks[idx] = !checks[idx]
  if (allChecked.value) highlightUnchecked.value = false
}

function formatDateTime(d) {
  if (!d) return '—'
  return new Date(d).toLocaleString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

// ── Draft scroll tracker ──────────────────────────────────────────
function onDraftScroll() {
  if (hasScrolledDraft.value) return
  const el = draftScrollEl.value
  if (!el) return
  const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 80
  if (nearBottom) hasScrolledDraft.value = true
}

// ── Record Consent ────────────────────────────────────────────────
async function handleConsent() {
  if (!allChecked.value) {
    highlightUnchecked.value = true
    return
  }

  recordingConsent.value = true
  const now = new Date().toISOString()

  try {
    // 1. Insert consent
    const { error: consentErr } = await supabase.from('consents').insert({
      case_id:      route.params.id,
      advocate_id:  authStore.user.id,
      draft_id:     draftData.value?.id,
      consented_at: now,
      user_agent:   navigator.userAgent,
      ip_address:   'recorded-client-side',
    })
    if (consentErr) throw consentErr

    // 2. Update case
    const { error: caseErr } = await supabase
      .from('cases')
      .update({ consent_given: true, status: 'Drafted' })
      .eq('id', route.params.id)
    if (caseErr) throw caseErr

    // 3. Audit log
    await supabase.from('audit_logs').insert({
      advocate_id: authStore.user.id,
      case_id:     route.params.id,
      action:      'consent_given',
      metadata: {
        draft_id:     draftData.value?.id,
        draft_version: draftData.value?.version,
        consented_at: now,
      }
    })

    existingConsent.value  = { consented_at: now }
    consentTimestamp.value = formatDateTime(now)
    justConsented.value    = true
    consentDone.value      = true
    showToast('Consent recorded! Your document is ready for export.', '✅')

  } catch (err) {
    console.error('[Consent] handleConsent:', err.message)
    showToast('Something went wrong. Please try again.', '❌')
  } finally {
    recordingConsent.value = false
  }
}

// ── Export ────────────────────────────────────────────────────────
async function handleExport() {
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
      advocate_id: authStore.user.id,
      case_id:     route.params.id,
      action:      'document_exported',
      metadata: {
        draft_version: draftData.value.version,
        exported_at:   new Date().toISOString()
      }
    })
  } catch (err) {
    console.error('[Consent] handleExport:', err)
    showToast('Export failed. Please try again.', '❌')
  } finally {
    isExporting.value = false
  }
}
</script>

<style scoped>
/* ── Page wrapper ──────────────────────────────── */
.consent-page {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-bottom: 48px;
}

/* ── Heading ───────────────────────────────────── */
.consent-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.consent-title    { color: var(--accent-gold); margin-bottom: 4px; }
.consent-subtitle { font-size: 0.875rem; }

/* ── Step track ────────────────────────────────── */
.step-track {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0;
  padding-top: 8px;
}
.step-pip {
  width: 32px; height: 32px;
  border-radius: 50%;
  border: 2px solid var(--border-light);
  background: var(--bg-elevated);
  color: var(--text-muted);
  display: flex; align-items: center; justify-content: center;
  font-size: 0.8rem; font-weight: 700;
  flex-shrink: 0;
  transition: all 0.3s;
}
.step-pip.active { border-color: var(--accent-gold); color: var(--accent-gold); background: var(--accent-gold-dim); }
.step-pip.done   { border-color: var(--success); background: rgba(34,197,94,0.12); color: var(--success); }
.step-track-line {
  width: 40px; height: 2px;
  background: var(--border-light);
  transition: background 0.4s;
}
.step-track-line.done { background: var(--success); }
.step-labels {
  position: absolute;
  top: calc(100% + 6px);
  left: 0; right: 0;
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 500;
  pointer-events: none;
}

/* ── Section header ────────────────────────────── */
.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: var(--text-primary);
  margin-bottom: 16px;
}

/* ── Draft read box ────────────────────────────── */
.draft-section { padding: 24px; }
.draft-read-box {
  background: #FEFCF4;
  border: 1px solid #E8D5A0;
  border-radius: var(--radius-md);
  padding: 28px 32px;
  max-height: 520px;
  overflow-y: auto;
  margin-bottom: 10px;
}
.draft-read-text {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 15px;
  color: #1A1A1A;
  line-height: 1.85;
  white-space: pre-wrap;
  letter-spacing: 0.01em;
}
/* light scrollbar for white bg */
.draft-read-box::-webkit-scrollbar { width: 6px; }
.draft-read-box::-webkit-scrollbar-track { background: #F0E8CC; }
.draft-read-box::-webkit-scrollbar-thumb { background: #C9A84C; border-radius: 3px; }

/* Scroll hint */
.scroll-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.78rem;
  color: var(--accent-gold);
  font-weight: 500;
  margin-bottom: 16px;
  animation: pulse-hint 2s ease-in-out infinite;
}
@keyframes pulse-hint {
  0%, 100% { opacity: 0.7; }
  50%       { opacity: 1; }
}

/* ── Laws collapsible ──────────────────────────── */
.laws-collapsible { border-top: 1px solid var(--border); padding-top: 14px; }
.laws-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: var(--accent-gold);
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  padding: 0;
}
.laws-toggle:hover { color: var(--accent-gold-light); }
.laws-list { margin-top: 14px; display: flex; flex-direction: column; gap: 10px; }
.law-row {
  display: flex;
  gap: 12px;
  padding: 10px 14px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}
.law-section {
  flex-shrink: 0;
  padding: 3px 10px;
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
.law-body { display: flex; flex-direction: column; gap: 2px; }
.law-act  { font-size: 0.8rem; font-weight: 600; color: var(--text-primary); }
.law-desc { font-size: 0.75rem; color: var(--text-muted); line-height: 1.5; }
.law-empty { font-size: 0.875rem; color: var(--text-muted); padding: 8px 0; }

/* ── Details section ───────────────────────────── */
.details-section { padding: 22px 24px; }
.details-grid    { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.detail-field    { display: flex; flex-direction: column; gap: 3px; }
.detail-label {
  font-size: 0.65rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: 0.08em;
  color: var(--text-muted);
}
.detail-value { font-size: 0.875rem; font-weight: 500; color: var(--text-primary); }

/* ── Declaration checkboxes ────────────────────── */
.declaration-section { padding: 22px 24px; }
.declaration-sub { font-size: 0.8125rem; color: var(--text-muted); margin-bottom: 18px; }

.checkbox-list   { display: flex; flex-direction: column; gap: 12px; }
.decl-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 14px 16px;
  border: 1.5px solid var(--border-light);
  border-radius: var(--radius-md);
  background: var(--bg-elevated);
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}
.decl-item:hover { border-color: var(--accent-gold); }
.decl-item.checked {
  border-color: var(--accent-gold);
  background: rgba(201,168,76,0.06);
}
.decl-item.highlight {
  border-color: var(--danger) !important;
  background: rgba(239,68,68,0.06) !important;
  animation: shake 0.35s ease;
}
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25%       { transform: translateX(-4px); }
  75%       { transform: translateX(4px); }
}

.decl-checkbox {
  width: 22px; height: 22px;
  border-radius: 5px;
  border: 2px solid var(--border-light);
  background: var(--bg-base);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
  transition: all 0.2s;
}
.decl-item.checked .decl-checkbox {
  border-color: var(--accent-gold);
  background: rgba(201,168,76,0.12);
}
.decl-item.highlight .decl-checkbox {
  border-color: var(--danger) !important;
}
.decl-text { font-size: 0.875rem; color: var(--text-subtle); line-height: 1.6; }
.decl-item.checked .decl-text { color: var(--text-primary); }

/* ── Consent action area ───────────────────────── */
.consent-action { text-align: center; }
.consent-warn {
  font-size: 0.8125rem;
  color: var(--danger);
  margin-bottom: 12px;
  font-weight: 500;
}
.consent-btn {
  width: 100%;
  justify-content: center;
  max-width: 460px;
  font-size: 1rem;
  padding: 16px 28px;
}
.consent-btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.3);
}
.consent-btn-disabled:hover { transform: none !important; filter: grayscale(0.3) !important; }

/* ── Success card ──────────────────────────────── */
.consent-success-card {
  border-color: rgba(34,197,94,0.4) !important;
  background: rgba(34,197,94,0.04);
  padding: 36px 28px;
  text-align: center;
}
.success-icon  { font-size: 2.5rem; margin-bottom: 12px; }
.success-title { color: var(--success); margin-bottom: 8px; }
.success-body  { font-size: 0.9rem; color: var(--text-subtle); line-height: 1.6; margin: 0; }
.success-body strong { color: var(--text-primary); }
.success-meta {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 14px 18px;
  margin: 20px 0;
  text-align: left;
}
.success-row  { display: flex; align-items: center; gap: 12px; padding: 5px 0; }
.smeta-label  { font-size: 0.7rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; color: var(--text-muted); min-width: 80px; }
.smeta-value  { font-size: 0.875rem; color: var(--text-primary); font-weight: 500; }

/* ── Already-consented card ────────────────────── */
.consent-done-card {
  border-color: rgba(34,197,94,0.35) !important;
  background: rgba(34,197,94,0.04);
  padding: 40px 32px;
  text-align: center;
}
.done-icon    { font-size: 3rem; margin-bottom: 14px; }
.done-title   { font-size: 1.25rem; color: var(--success); margin-bottom: 8px; }
.done-body    { font-size: 0.9rem; color: var(--text-subtle); }
.done-body strong { color: var(--text-primary); }
.done-actions { display: flex; flex-direction: column; gap: 10px; align-items: center; margin-top: 24px; }

/* ── Export button (green) ─────────────────────── */
.btn-export {
  background: linear-gradient(135deg, #16a34a, #22c55e);
  color: white;
  border: none;
  font-family: inherit;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(34,197,94,0.35);
  width: 100%;
  justify-content: center;
  max-width: 380px;
}
.btn-export:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(34,197,94,0.45);
}
.btn-export:disabled { opacity: 0.6; cursor: not-allowed; }

/* ── Skeleton ──────────────────────────────────── */
.consent-skeleton { display: flex; flex-direction: column; gap: 18px; }

/* ── Error state ───────────────────────────────── */
.error-state { text-align: center; padding: 80px 24px; color: var(--text-subtle); }

/* ── Transitions ───────────────────────────────── */
.fade-hint-enter-active, .fade-hint-leave-active { transition: opacity 0.5s ease; }
.fade-hint-enter-from, .fade-hint-leave-to       { opacity: 0; }

.expand-enter-active, .expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to { opacity: 0; max-height: 0; }
.expand-enter-to, .expand-leave-from { opacity: 1; max-height: 800px; }

.success-reveal-enter-active { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
.success-reveal-enter-from   { opacity: 0; transform: translateY(20px); }

.check-pop-enter-active { transition: all 0.15s cubic-bezier(0.34, 1.56, 0.64, 1); }
.check-pop-enter-from   { opacity: 0; transform: scale(0.4); }

/* ── Responsive ────────────────────────────────── */
@media (max-width: 640px) {
  .details-grid   { grid-template-columns: 1fr; }
  .consent-heading { flex-direction: column; }
  .draft-read-box { padding: 18px; }
  .draft-read-text { font-size: 14px; }
}
</style>
