<template>
  <AppLayout title="New Case">
    <div class="new-case-wrapper">
      
      <!-- PROGRESS HEADER (compact) -->
      <div class="progress-header">
        <div class="ph-top">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h2>New Case</h2>
            <div class="step-indicator" style="font-size: 0.85rem; font-weight: 600; color: var(--accent-gold); background: rgba(201,168,76, 0.1); padding: 4px 12px; border-radius: 999px; border: 1px solid rgba(201,168,76, 0.2);">{{ currentSlide }} / 2</div>
          </div>
          <div class="title-underline"></div>
        </div>
        <div class="stepper">
          <div :class="['step-item', { active: currentSlide >= 1 }]" @click="goToSlide1">
            <div class="step-circle">1</div>
            <span class="step-text">Client Info</span>
          </div>
          <div :class="['step-line', { active: currentSlide === 2 }]"></div>
          <div :class="['step-item', { active: currentSlide === 2 }]" @click="goToSlide2">
            <div class="step-circle">2</div>
            <span class="step-text">Case Details</span>
          </div>
        </div>
      </div>

      <!-- SLIDE 1 -->
      <transition :name="slideTransitionName" mode="out-in">
        <div v-if="currentSlide === 1" key="slide1" class="slide-container">
          
          <!-- CLIENT CARD -->
          <div class="compact-card client-card">
            <div class="card-header-row">
              <div class="left-header">
                <span class="ch-title">Client Details</span>
                <span class="ch-subtitle">⚠️ Used for Client ID & case record</span>
              </div>
              <div class="right-header">
                <div class="toggle-pill">
                  <button type="button" :class="{ active: caseForm.primary_role === 'petitioner' }" @click="caseForm.primary_role = 'petitioner'">Petitioner</button>
                  <button type="button" :class="{ active: caseForm.primary_role === 'defendant' }" @click="caseForm.primary_role = 'defendant'">Defendant</button>
                </div>
              </div>
            </div>

            <div class="tight-grid">
              <div class="form-group"><label>Full Name*</label><input v-model="caseForm.client.full_name" type="text" placeholder="Full Name" @blur="checkExistingClient"></div>
              <div class="form-group"><label>Father's Name</label><input v-model="caseForm.client.father_name" type="text" placeholder="Father's Name"></div>
              
              <div class="form-group"><label>Aadhar (mask: XXXX XXXX XXXX)</label><input v-model="caseForm.client.aadhar" type="text" placeholder="XXXX XXXX XXXX" maxlength="14" @input="formatAadhar"></div>
              <div class="form-group"><label>Phone*</label><input v-model="caseForm.client.phone" type="text" placeholder="10-digit mobile" maxlength="10" @blur="checkExistingClient"></div>
              
              <div class="form-group full-width"><label>Address*</label><textarea v-model="caseForm.client.address" rows="2" placeholder="House/Flat No., Street, Area"></textarea></div>
            </div>

            <div class="tight-grid three-col">
              <div class="form-group"><label>City*</label><input v-model="caseForm.client.city" type="text" placeholder="City"></div>
              <div class="form-group"><label>State*</label><input v-model="caseForm.client.state" type="text" placeholder="State"></div>
              <div class="form-group"><label>PIN</label><input v-model="caseForm.client.pin" type="text" placeholder="PIN Code" maxlength="6"></div>
            </div>

            <div class="client-id-preview">
              <span class="cid-label">🪪 Client ID:</span>
              <span v-if="clientIdPreview" class="cid-value">{{ clientIdPreview }}</span>
              <span v-else class="cid-empty">Fill name & phone to generate</span>
            </div>
          </div>

          <!-- VS DIVIDER -->
          <div class="vs-divider">
            <span class="vs-badge">VS</span>
          </div>

          <!-- OPPOSITE PARTY CARD -->
          <div class="compact-card opposite-card">
            <div class="card-header-row">
              <span class="ch-title text-white">Opposite Party — {{ oppositeRole.toUpperCase() }}</span>
              <span class="muted-badge">Optional details</span>
            </div>

            <div class="tight-grid">
              <div class="form-group"><label>Full Name*</label><input v-model="caseForm.opposite.full_name" type="text" placeholder="Full Name"></div>
              <div class="form-group"><label>Father's Name (optional)</label><input v-model="caseForm.opposite.father_name" type="text" placeholder="Father's Name"></div>
              
              <div class="form-group"><label>Phone (optional)</label><input v-model="caseForm.opposite.phone" type="text" placeholder="10-digit mobile" maxlength="10"></div>
              <div class="form-group"><label>Address (optional)</label><input v-model="caseForm.opposite.address" type="text" placeholder="Address details"></div>
              
              <div class="form-group"><label>City (optional)</label><input v-model="caseForm.opposite.city" type="text" placeholder="City"></div>
              <div class="form-group"><label>State (optional)</label><input v-model="caseForm.opposite.state" type="text" placeholder="State"></div>
            </div>
          </div>

          <!-- FIR SECTION -->
          <div class="compact-card fir-card">
            <div class="card-header-row">
              <div class="left-header">
                <span class="ch-title text-white">FIR Details</span>
                <span class="ch-subtitle">Has an FIR been filed?</span>
              </div>
              <div class="right-header">
                <div class="yes-no-buttons">
                  <button type="button" :class="['yn-btn', caseForm.fir_filed === true ? 'yes-active' : '']" @click="caseForm.fir_filed = true">✓ Yes</button>
                  <button type="button" :class="['yn-btn', caseForm.fir_filed === false ? 'no-active' : '']" @click="caseForm.fir_filed = false">✗ No</button>
                </div>
              </div>
            </div>

            <transition name="slide-down">
              <div v-if="caseForm.fir_filed" class="fir-fields mt-14">
                <div class="tight-grid">
                  <div class="form-group"><label>FIR Number*</label><input v-model="caseForm.fir.number" type="text" placeholder="FIR No."></div>
                  <div class="form-group"><label>Date of FIR*</label><input v-model="caseForm.fir.date" type="date"></div>
                  
                  <div class="form-group"><label>Police Station*</label><input v-model="caseForm.fir.police_station" type="text" placeholder="Police Station"></div>
                  <div class="form-group"><label>District*</label><input v-model="caseForm.fir.district" type="text" placeholder="District"></div>
                  
                  <div class="form-group full-width">
                    <label>Sections in FIR</label>
                    <textarea v-model="caseForm.fir.sections" rows="2" placeholder="e.g. IPC 420, 406, 34"></textarea>
                    <div class="field-hint mt-4">Enter sections as mentioned in FIR document</div>
                  </div>
                </div>
              </div>
            </transition>
          </div>

          <!-- SLIDE 1 BOTTOM -->
          <div class="slide1-bottom">
            <button class="btn-next" @click="goToSlide2">Next — Case Details →</button>
          </div>

        </div>

        <!-- SLIDE 2 -->
        <div v-else key="slide2" class="slide-container">
          
          <button class="btn-back-top" @click="goToSlide1">← Client Info</button>

          <!-- INCIDENT DETAILS -->
          <div class="section-label">⚡ Incident Details</div>
          <div class="compact-card mb-16">
            <div class="tight-grid">
              <div class="form-group"><label>Date*</label><input v-model="caseForm.incident_date" type="date"></div>
              <div class="form-group"><label>Time (optional)</label><input v-model="caseForm.incident_time" type="time"></div>
              
              <div class="form-group"><label>Place*</label><input v-model="caseForm.incident_place" type="text" placeholder="Incident Place"></div>
              <div class="form-group"><label>District</label><input v-model="caseForm.incident_district" type="text" placeholder="District"></div>
              
              <div class="form-group"><label>State*</label><input v-model="caseForm.incident_state" type="text" placeholder="State"></div>
              <div class="form-group"><label>PIN (optional)</label><input v-model="caseForm.incident_pin" type="text" placeholder="PIN Code"></div>
            </div>
          </div>

          <!-- EVIDENCE AVAILABLE -->
          <div class="compact-card mb-24">
            <div class="section-label">🔍 Evidence Available</div>
            <div class="section-subtitle">Select all currently in possession</div>
            <div class="evidence-grid" style="margin-bottom: 0;">
              <label v-for="item in evidenceOptionsList" :key="item.value" :class="['evidence-item', { checked: caseForm.evidence_available.includes(item.value) }]">
                <div class="custom-checkbox">
                  <span v-if="caseForm.evidence_available.includes(item.value)">✓</span>
                </div>
                <span class="e-icon">{{ item.icon }}</span>
                <span class="e-label">{{ item.label }}</span>
                <input type="checkbox" :value="item.value" v-model="caseForm.evidence_available" style="display: none;">
              </label>
            </div>
          </div>

          <!-- FACTS & RELIEF -->
          <div class="compact-card mb-24">
            <!-- FACTS OF THE CASE -->
            <div class="section-label">📋 Facts of the Case</div>
            <div class="section-subtitle">Describe events chronologically</div>
            <textarea v-model="caseForm.facts_text" class="fact-textarea" placeholder="Describe what happened, when, where, and who was involved..."></textarea>
            <div class="textarea-bottom">
              <span class="hint">Include dates, amounts, and sequence of events</span>
              <span :class="charCounterClass">{{ factsLength < 100 ? `${factsLength} chars (min 100)` : (factsLength >= 300 ? `✓ ${factsLength} chars` : `${factsLength} chars`) }}</span>
            </div>

            <!-- RELIEF SOUGHT -->
            <div class="section-label mt-16">⚖️ Relief Sought</div>
            <div class="section-subtitle">What outcome does your client seek?</div>
            <textarea v-model="caseForm.relief_sought" class="relief-textarea" placeholder="Compensation, injunction, specific performance, etc."></textarea>
          </div>

          <!-- APPLICABLE LAWS / ACTS -->
          <div class="compact-card mb-24">
            <div class="section-label">📚 Applicable Laws & Acts</div>
            <div class="section-subtitle">Select all that may apply</div>
            <div class="laws-pills">
              <button v-for="law in lawsList" :key="law" type="button" :class="['law-pill', { selected: caseForm.applicable_acts.includes(law) }]" @click="toggleLaw(law)">{{ law }}</button>
            </div>
            <input v-model="caseForm.applicable_acts_other" type="text" class="form-input mt-8" placeholder="Other acts or specific sections...">
          </div>

          <!-- CASE TYPE + COURT LEVEL -->
          <div class="compact-card mb-24">
            <div class="type-court-grid">
              <div class="tc-col" style="min-width: 0;">
                <div class="section-label tc-label" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span>Case Type</span>
                  <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn-scroll" @click="scrollCards('case', -1)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button type="button" class="btn-scroll" @click="scrollCards('case', 1)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </div>
                </div>
                <div class="tc-cards" ref="caseTypeScroll">
                  <label v-for="type in caseTypesList" :key="type.value" :class="['tc-card', { selected: caseForm.case_type === type.value }]">
                    <span class="tc-icon">{{ type.icon }}</span>
                    <div class="tc-info">
                      <div class="tc-title">{{ type.label }}</div>
                      <div class="tc-desc">{{ type.desc }}</div>
                    </div>
                    <input type="radio" :value="type.value" v-model="caseForm.case_type" style="display: none;">
                  </label>
                </div>
              </div>
              <div class="tc-col" style="min-width: 0;">
                <div class="section-label tc-label" style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                  <span>Court Level</span>
                  <div style="display: flex; gap: 8px;">
                    <button type="button" class="btn-scroll" @click="scrollCards('court', -1)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                    </button>
                    <button type="button" class="btn-scroll" @click="scrollCards('court', 1)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                    </button>
                  </div>
                </div>
                <div class="tc-cards" ref="courtLevelScroll" style="margin-bottom: 0;">
                  <label v-for="court in courtLevelsList" :key="court.value" :class="['tc-card', { selected: caseForm.court_level === court.value }]">
                    <span class="tc-icon">{{ court.icon }}</span>
                    <div class="tc-info">
                      <div class="tc-title">{{ court.label }}</div>
                      <div class="tc-desc">{{ court.icon === '🏛️' ? 'Civil & criminal cases' : court.icon === '⚖️' ? 'Serious offences' : court.icon === '🏢' ? 'State appellate court' : court.icon === '🔱' ? 'Highest court' : court.icon === '📋' ? 'Specialized body' : 'Any other forum' }}</div>
                    </div>
                    <input type="radio" :value="court.value" v-model="caseForm.court_level" style="display: none;">
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- ADDITIONAL INFO -->
          <div class="additional-info-section mt-16">
            <div class="ai-header" @click="showAdditionalInfo = !showAdditionalInfo">
              <div class="ai-header-left">
                <span class="ai-title">Additional Information</span>
                <span class="ai-badge">Optional</span>
              </div>
              <div class="ai-header-right">
                <span class="ai-toggle">{{ showAdditionalInfo ? '▲ Hide' : '▼ Add' }}</span>
              </div>
            </div>
            <transition name="slide-down">
              <div v-if="showAdditionalInfo" class="ai-body">
                <textarea v-model="caseForm.additional_info" class="relief-textarea" placeholder="Prior notices, related cases, urgency, other details..."></textarea>
              </div>
            </transition>
          </div>

          <!-- AI ANALYSIS CARD (Temporarily disabled) -->
          <!--
          <div class="ai-analysis-card">
            <div class="ai-ac-left">
              <div class="ai-ac-title">🤖 AI Case Analysis</div>
              <div class="ai-ac-subtitle">Complete case review — like a senior advocate</div>
              <div class="ai-ac-pill" v-if="isPremium && assistsRemaining !== null">{{ assistsRemaining }} assists remaining</div>
              <div class="ai-ac-pill" style="color: var(--danger); border-color: var(--danger);" v-else-if="isPremium && assistsRemaining === 0">Daily limit reached</div>
              <div class="ai-ac-pill" style="background: var(--bg-surface); color: var(--text-muted); border-color: var(--border);" v-else>✨ Premium Feature</div>
            </div>
            <div class="ai-ac-right">
              <button 
                class="btn-ai-analyze" 
                :class="{ 'disabled-ai': isPremium && assistsRemaining === 0 }"
                type="button" 
                @click="isPremium ? runAIAnalysis() : showUpgradeModal = true"
              >🤖 Analyze Case</button>
            </div>
          </div>
          -->

          <!-- BOTTOM NAV -->
          <div class="bottom-nav-bar">
            <button class="btn-back-bottom" @click="goToSlide1">← Back</button>
            <span class="premium-text">✨ Unlimited</span>
            <button class="btn-save" @click="saveCase" :disabled="isLoading">{{ isLoading ? 'Saving...' : 'Save & Continue →' }}</button>
          </div>

        </div>
      </transition>

      <!-- EXISTING CLIENT MODAL -->
      <transition name="slide-up">
        <div v-if="existingClientData" class="existing-client-modal">
          <div class="modal-header">
            <span style="font-size: 1.2rem;">👤</span>
            <h4 style="margin: 0; color: var(--text-primary);">Existing Client Found</h4>
          </div>
          <div class="modal-body">
            <p style="margin: 4px 0; color: var(--text-muted);">Name: <strong style="color: var(--text-primary);">{{ existingClientData.name }}</strong></p>
            <p style="margin: 4px 0; color: var(--text-muted);">Phone: <strong style="color: var(--text-primary);">{{ existingClientData.phone }}</strong></p>
          </div>
          <div class="modal-actions" style="margin-top: 20px;">
            <button class="btn-save" style="width: 100%; margin-bottom: 12px; font-weight: 600; padding: 8px;" @click="useExistingClient">Use Existing Client Details</button>
            <button class="btn-back-bottom" style="width: 100%; text-align: center; justify-content: center; padding: 8px;" @click="ignoreExistingClient">Continue with New Entry</button>
          </div>
        </div>
      </transition>

    </div>
  </AppLayout>
</template>

<script setup>
import { ref, reactive, computed, inject } from 'vue'
import { useRouter } from 'vue-router'
import AppLayout from '../components/AppLayout.vue'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import { getAIAssist } from '../lib/aiAssist'

const router = useRouter()
const authStore = useAuthStore()
const showToast = inject('showToast')
const toast = {
  success: (msg) => { if(showToast) showToast(msg, '✅') },
  error: (msg) => { if(showToast) showToast(msg, '❌') }
}


// State
const currentSlide = ref(1)
const showAdditionalInfo = ref(false)
const slideTransitionName = ref('slide-left')

const caseTypeScroll = ref(null)
const courtLevelScroll = ref(null)

function scrollCards(refName, direction) {
  const el = refName === 'case' ? caseTypeScroll.value : courtLevelScroll.value
  if (el) {
    el.scrollBy({ left: direction * 250, behavior: 'smooth' })
  }
}

// Reactive Form State
const caseForm = reactive({
  primary_role: 'petitioner',
  
  client: {
    full_name: '',
    father_name: '',
    aadhar: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pin: ''
  },
  
  opposite: {
    full_name: '',
    father_name: '',
    phone: '',
    address: '',
    city: '',
    state: ''
  },
  
  fir_filed: null,
  fir: {
    number: '',
    police_station: '',
    district: '',
    date: '',
    sections: ''
  },
  
  incident_date: '',
  incident_time: '',
  incident_place: '',
  incident_state: '',
  incident_district: '',
  evidence_available: [],
  facts_text: '',
  relief_sought: '',
  applicable_acts: [],
  applicable_acts_other: '',
  case_type: '',
  court_level: '',
  additional_info: ''
})

// Computed
const oppositeRole = computed(() => caseForm.primary_role === 'petitioner' ? 'defendant' : 'petitioner')

const clientIdPreview = computed(() => {
  const name = caseForm.client.full_name.trim()
  const phone = caseForm.client.phone.trim()
  
  if (name && phone.length >= 4) {
    const firstName = name.split(' ')[0].toLowerCase().replace(/[^a-z]/g, '')
    const lastFour = phone.slice(-4)
    if (firstName) {
      return `${firstName}${lastFour}`
    }
  }
  return null
})

// Methods
const formatAadhar = (e) => {
  let val = e.target.value.replace(/\s/g, '')
  if (val.length > 0) {
    val = val.match(/.{1,4}/g)?.join(' ') || val
  }
  caseForm.client.aadhar = val
}

const existingClientData = ref(null)

const checkExistingClient = async () => {
  const phone = caseForm.client.phone.replace(/\s/g, '')
  if (phone.length !== 10) return
  
  if (!authStore.user) return

  try {
    const { data, error } = await supabase
      .from('clients')
      .select('id, name, phone, email, address, city')
      .eq('advocate_id', authStore.user.id)
      .eq('phone', phone)
      .maybeSingle()
      
    if (data) {
      existingClientData.value = data
    } else {
      existingClientData.value = null
    }
  } catch (err) {
    console.error('Error checking existing client:', err)
  }
}

const useExistingClient = () => {
  if (existingClientData.value) {
    caseForm.client.full_name = existingClientData.value.name || ''
    caseForm.client.address = existingClientData.value.address || ''
    caseForm.client.city = existingClientData.value.city || ''
    toast.success('Client details loaded')
  }
  existingClientData.value = null
}

const ignoreExistingClient = () => {
  existingClientData.value = null
}

const goToSlide2 = () => {
  slideTransitionName.value = 'slide-left'
  currentSlide.value = 2
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToSlide1 = () => {
  slideTransitionName.value = 'slide-right'
  currentSlide.value = 1
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// SLIDE 2 OPTIONS & LOGIC
const evidenceOptionsList = [
  { value: 'documents', label: 'Documents', icon: '📄' },
  { value: 'cctv', label: 'CCTV Footage', icon: '📹' },
  { value: 'witnesses', label: 'Witnesses', icon: '👥' },
  { value: 'medical', label: 'Medical Reports', icon: '🏥' },
  { value: 'financial', label: 'Financial Records', icon: '💰' },
  { value: 'digital', label: 'Digital Evidence', icon: '📱' },
  { value: 'call_records', label: 'Call Records', icon: '📞' },
  { value: 'agreement', label: 'Written Agreement', icon: '📝' },
  { value: 'photographs', label: 'Photographs', icon: '📸' },
  { value: 'forensic', label: 'Forensic Report', icon: '🔬' },
  { value: 'court_orders', label: 'Court Orders', icon: '⚖️' },
  { value: 'other', label: 'Other Documents', icon: '📋' }
]

const lawsList = [
  'IPC', 'CrPC', 'CPC', 'Evidence Act', 'Consumer Protection Act',
  'IT Act', 'NDPS Act', 'Motor Vehicles Act', 'Specific Relief Act',
  'Registration Act', 'Transfer of Property Act', 'Companies Act',
  'GST Act', 'Income Tax Act', 'Domestic Violence Act', 'SC/ST Act',
  'POCSO Act', 'Negotiable Instruments Act'
]

const caseTypesList = [
  { value: 'Criminal', label: 'Criminal', icon: '⚖️', desc: 'Involves violation of law, FIR, police action' },
  { value: 'Civil', label: 'Civil', icon: '🏛️', desc: 'Property, contracts, compensation disputes' },
  { value: 'Family', label: 'Family', icon: '👨‍👩‍👧', desc: 'Divorce, custody, maintenance, inheritance' },
  { value: 'Consumer', label: 'Consumer', icon: '🛒', desc: 'Consumer rights, product/service disputes' },
  { value: 'Labour', label: 'Labour', icon: '👷', desc: 'Employment, wages, workplace disputes' },
  { value: 'Other', label: 'Other', icon: '📋', desc: 'Any other type of case' }
]

const courtLevelsList = [
  { value: 'District Court', label: 'District Court', icon: '🏛️' },
  { value: 'Sessions Court', label: 'Sessions Court', icon: '⚖️' },
  { value: 'High Court', label: 'High Court', icon: '🏢' },
  { value: 'Supreme Court', label: 'Supreme Court', icon: '🔱' },
  { value: 'Tribunal', label: 'Tribunal/Commission', icon: '📋' },
  { value: 'Other', label: 'Other', icon: '📝' }
]

const toggleEvidence = (val) => {
  const idx = caseForm.evidence_available.indexOf(val)
  if (idx > -1) {
    caseForm.evidence_available.splice(idx, 1)
  } else {
    caseForm.evidence_available.push(val)
  }
}

const toggleLaw = (val) => {
  const idx = caseForm.applicable_acts.indexOf(val)
  if (idx > -1) {
    caseForm.applicable_acts.splice(idx, 1)
  } else {
    caseForm.applicable_acts.push(val)
  }
}

const factsLength = computed(() => caseForm.facts_text.length)
const charCounterClass = computed(() => {
  if (factsLength.value < 100) return 'counter-red'
  if (factsLength.value < 300) return 'counter-yellow'
  return 'counter-green'
})

// AI Plan Real State
const isPremium = computed(() => (authStore.advocate?.plan || 'free').toLowerCase() === 'premium')
const assistsRemaining = ref(null)
const showUpgradeModal = ref(false)

const isAnalyzing = ref(false)
const showAnalysisResult = ref(false)
const analysisResultData = ref(null)

const lastAnalysisParamsStr = ref(null)
const loadingMessageIdx = ref(0)
const loadingMessages = [
  "Reading case facts...",
  "Checking jurisdiction and court level...",
  "Identifying applicable laws...",
  "Analyzing strength of relief sought...",
  "Reviewing evidence completeness...",
  "Preparing recommendations..."
]
let msgInterval = null

const suggestionsApplied = ref(0)
const applyCaseType = (type) => {
  caseForm.case_type = type
  suggestionsApplied.value++
}
const applyCourtLevel = (lvl) => {
  caseForm.court_level = lvl
  suggestionsApplied.value++
}
const appendRelief = (text, idx) => {
  caseForm.relief_sought += '\n\n' + text
  analysisResultData.value.relief_analysis.missing_relief[idx]._applied = true
  suggestionsApplied.value++
}
const addMissingAct = (actText, idx) => {
  if (!caseForm.applicable_acts.includes(actText)) {
    caseForm.applicable_acts.push(actText)
  }
  analysisResultData.value.acts_analysis.missing_acts[idx]._applied = true
  suggestionsApplied.value++
}

const runAIAnalysis = async () => {
  const completeCase = {
    case_type: caseForm.case_type,
    court_level: caseForm.court_level,
    plaintiff_name: caseForm.primary_role === 'petitioner' ? caseForm.client.full_name : caseForm.opposite.full_name,
    defendant_name: caseForm.primary_role === 'defendant' ? caseForm.client.full_name : caseForm.opposite.full_name,
    incident_date: caseForm.incident_date,
    incident_place: caseForm.incident_place,
    evidence_available: caseForm.evidence_available,
    facts_text: caseForm.facts_text,
    relief_sought: caseForm.relief_sought,
    applicable_acts: caseForm.applicable_acts
  }

  if (factsLength.value < 100) {
    toast.error("Please write detailed facts (min 100 chars) for accurate AI analysis")
    return
  }
  if (!completeCase.case_type) {
    toast.error("Please select Case Type first")
    return
  }
  if (!completeCase.relief_sought) {
    toast.error("Please fill Relief Sought before AI analysis")
    return
  }

  const currentParamsStr = JSON.stringify(completeCase)
  if (lastAnalysisParamsStr.value === currentParamsStr && analysisResultData.value) {
    // Cache hit
    showAnalysisResult.value = true
    return
  }

  isAnalyzing.value = true
  loadingMessageIdx.value = 0
  msgInterval = setInterval(() => {
    loadingMessageIdx.value = (loadingMessageIdx.value + 1) % loadingMessages.length
  }, 2500)

  try {
    const res = await getAIAssist('complete_case_analysis', JSON.stringify(completeCase), completeCase)
    analysisResultData.value = res.result
    assistsRemaining.value = res.assists_remaining
    lastAnalysisParamsStr.value = currentParamsStr
    suggestionsApplied.value = 0
    showAnalysisResult.value = true
  } catch (err) {
    if (err.code === 'PREMIUM_REQUIRED') {
      showUpgradeModal.value = true
    } else {
      toast.error(err.message || 'AI Analysis failed. Please try again.')
    }
  } finally {
    isAnalyzing.value = false
    clearInterval(msgInterval)
  }
}

const isLoading = ref(false)
const saveCase = async () => {
  if (factsLength.value === 0) {
    alert("Please enter Facts of the Case")
    return
  }
  if (!caseForm.case_type) {
    alert("Please select Case Type")
    return
  }
  if (!caseForm.court_level) {
    alert("Please select Court Level")
    return
  }
  if (!caseForm.relief_sought.trim()) {
    alert("Please enter Relief Sought")
    return
  }

  isLoading.value = true
  
  try {
    const uid = authStore.user.id
    
    // ─── STEP 1: Generate Client ID ───
    const firstName = caseForm.client.full_name
      .trim()
      .split(' ')[0]
      .toLowerCase()
      .replace(/[^a-z]/g, '')
    
    const lastFour = caseForm.client.phone
      .replace(/\D/g, '')
      .slice(-4)
    
    const clientId = firstName + lastFour

    // ─── STEP 2: Check if client exists ───
    const { data: existingClient } = await supabase
      .from('clients')
      .select('id')
      .eq('advocate_id', uid)
      .eq('phone', caseForm.client.phone)
      .maybeSingle()

    let clientDbId

    if (existingClient) {
      clientDbId = existingClient.id
      
      await supabase
        .from('clients')
        .update({
          name: caseForm.client.full_name,
          address: caseForm.client.address,
          city: caseForm.client.city
        })
        .eq('id', existingClient.id)

    } else {
      // ─── STEP 3: Create new client ───
      const { data: newClient, error: clientError } = 
        await supabase
          .from('clients')
          .insert({
            advocate_id: uid,
            name: caseForm.client.full_name,
            phone: caseForm.client.phone,
            address: caseForm.client.address,
            city: caseForm.client.city
          })
          .select()
          .single()
      
      if (clientError) {
        console.error('Client creation error:', clientError)
        toast.error('Failed to create client record.')
        return
      }
      clientDbId = newClient.id
    }

    // ─── STEP 4: Save Case ───
    const casePayload = {
      advocate_id: uid,
      client_id: clientDbId,
      
      primary_role: caseForm.primary_role,
      plaintiff_name: caseForm.primary_role === 'petitioner'
        ? caseForm.client.full_name
        : caseForm.opposite.full_name,
      defendant_name: caseForm.primary_role === 'defendant'
        ? caseForm.client.full_name
        : caseForm.opposite.full_name,
      
      opposite_party_name: caseForm.opposite.full_name,
      opposite_party_phone: caseForm.opposite.phone,
      opposite_party_address: caseForm.opposite.address,
      
      fir_filed: caseForm.fir_filed,
      fir_number: caseForm.fir_filed ? caseForm.fir.number : null,
      fir_police_station: caseForm.fir_filed ? caseForm.fir.police_station : null,
      fir_district: caseForm.fir_filed ? caseForm.fir.district : null,
      fir_date: caseForm.fir_filed ? caseForm.fir.date : null,
      fir_sections: caseForm.fir_filed ? caseForm.fir.sections : null,
      
      incident_date: caseForm.incident_date,
      incident_time: caseForm.incident_time,
      incident_place: caseForm.incident_place,
      incident_district: caseForm.incident_district,
      incident_state: caseForm.incident_state,
      
      evidence_available: caseForm.evidence_available,
      facts_text: caseForm.facts_text,
      relief_sought: caseForm.relief_sought,
      applicable_acts: caseForm.applicable_acts,
      applicable_acts_other: caseForm.applicable_acts_other,
      case_type: caseForm.case_type,
      court_level: caseForm.court_level,
      additional_info: caseForm.additional_info,
      
      status: 'Pending',
      is_draft_saved: false,
      consent_given: false
    }

    const { data: savedCase, error: caseError } = 
      await supabase
        .from('cases')
        .insert(casePayload)
        .select()
        .single()
    
    if (caseError) throw caseError

    // ─── STEP 5: Audit Log ───
    await supabase.from('audit_logs').insert({
      advocate_id: uid,
      case_id: savedCase.id,
      action: 'case_created',
      metadata: {
        client_id: clientDbId,
        case_type: caseForm.case_type,
        fir_filed: caseForm.fir_filed
      }
    })

    // ─── STEP 6: Navigate ───
    toast.success('Case saved successfully! ✅')
    router.push(`/case-review/${savedCase.id}`)

  } catch (err) {
    console.error('Save error:', err)
    toast.error('Failed to save case. Please try again.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* MAIN LAYOUT */
.new-case-wrapper {
  max-width: 800px;
  margin: 0 auto;
  padding: 12px 24px 60px;
}

/* SLEEK PROGRESS HEADER */
.progress-header {
  margin-bottom: 32px;
}
.ph-top {
  margin-bottom: 24px;
}
.ph-top h2 {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.5px;
}
.title-underline {
  width: 100%;
  height: 4px;
  background: var(--accent-gold);
  border-radius: 4px;
}
.stepper {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
}
.step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  opacity: 0.5;
  cursor: pointer;
  transition: all 0.3s;
}
.step-item:hover {
  opacity: 0.8;
}
.step-item.active {
  opacity: 1;
}
.step-circle {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-surface);
  border: 2px solid var(--border);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 700;
}
.step-item.active .step-circle {
  background: rgba(201,168,76, 0.1);
  border-color: var(--accent-gold);
  color: var(--accent-gold);
}
.step-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}
.step-line {
  flex-grow: 1;
  max-width: 100px;
  height: 2px;
  background: var(--border);
  transition: all 0.3s;
}
.step-line.active {
  background: var(--accent-gold);
}

/* CARDS */
.compact-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s, box-shadow 0.2s;
}
.compact-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}
.client-card { border-top: 3px solid var(--accent-gold); }

/* SECTION HEADINGS */
.section-label {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 16px;
}

/* UTILITIES */
.mb-16 { margin-bottom: 16px; }
.mt-16 { margin-top: 16px; }
.mt-14 { margin-top: 14px; }
.mt-8 { margin-top: 8px; }
.mt-4 { margin-top: 4px; }

/* CARD HEADERS */
.card-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-light);
}
.ch-title {
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 700;
  display: block;
}
.ch-subtitle {
  color: var(--text-muted);
  font-size: 0.8rem;
  margin-top: 4px;
  display: block;
}
.muted-badge {
  color: var(--text-muted);
  font-size: 0.75rem;
  background: var(--bg-elevated);
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 500;
}

/* TOGGLE PILL (Sleek Radio) */
.toggle-pill {
  background: var(--bg-elevated);
  border-radius: 8px;
  padding: 4px;
  display: inline-flex;
  border: 1px solid var(--border);
}
.toggle-pill button {
  padding: 8px 18px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.toggle-pill button.active {
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* GRIDS */
.tight-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.tight-grid.three-col {
  grid-template-columns: 1fr 1fr 1fr;
}
.form-group.full-width { grid-column: 1 / -1; }

@media (max-width: 768px) {
  .tight-grid { grid-template-columns: 1fr; }
  .tight-grid.three-col { grid-template-columns: 1fr; }
}

/* PREMIUM INPUTS */
.form-group label {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: 6px;
  font-weight: 600;
  display: block;
}
.form-group input, .form-group textarea, .form-input {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 0.95rem;
  color: var(--text-primary);
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}
.form-group textarea {
  resize: vertical;
  min-height: 80px;
}
.form-group input:focus, .form-group textarea:focus, .form-input:focus {
  outline: none;
  border-color: var(--accent-gold);
  background: var(--bg-surface);
  box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
}
.form-group input::placeholder, .form-group textarea::placeholder {
  color: rgba(107, 114, 128, 0.5);
}
.field-hint {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: block;
}

/* YES/NO BUTTONS */
.yes-no-buttons {
  display: flex;
  gap: 8px;
}
.yn-btn {
  padding: 8px 20px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s;
}
.yn-btn:hover { background: var(--bg-surface); border-color: var(--border-light); }
.yes-active { background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.3); color: var(--success); }
.no-active  { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: var(--danger); }

/* DIVIDER */
.vs-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: -12px 0 24px 0;
  position: relative;
}
.vs-divider::before {
  content: "";
  position: absolute;
  width: 2px;
  height: 40px;
  background: var(--border-light);
  z-index: 0;
}
.vs-badge {
  background: var(--bg-base);
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 1px;
  position: relative;
  z-index: 1;
}

/* CLIENT ID PREVIEW */
.client-id-preview {
  margin-top: 20px;
  padding: 12px 16px;
  background: rgba(201,168,76,0.05);
  border: 1px dashed rgba(201,168,76,0.3);
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.cid-label { font-size: 0.8rem; color: var(--text-muted); font-weight: 600; }
.cid-value { font-size: 0.95rem; color: var(--accent-gold); font-weight: 700; font-family: monospace; letter-spacing: 1px; }
.cid-empty { font-size: 0.8rem; color: var(--text-muted); font-style: italic; }

/* NAVIGATION BUTTONS */
.slide1-bottom {
  display: flex;
  justify-content: flex-end;
  margin-top: 32px;
}
.btn-next {
  background: linear-gradient(135deg, var(--accent-gold), #E8C97A);
  color: #0A0E1A;
  border: none;
  padding: 14px 32px;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(201,168,76,0.3);
}
.btn-next:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(201,168,76,0.4);
}
.btn-back-top {
  background: transparent;
  color: var(--text-muted);
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  padding: 8px 0;
  margin-bottom: 24px;
  transition: color 0.2s;
  display: inline-flex;
  align-items: center;
}
.btn-back-top:hover { color: var(--text-primary); }

/* EVIDENCE GRID */
.evidence-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 32px;
}
.evidence-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
}
.evidence-item:hover {
  border-color: var(--border-light);
  background: var(--bg-surface);
}
.evidence-item.checked {
  background: rgba(201,168,76,0.08);
  border-color: var(--accent-gold);
  color: var(--accent-gold);
  box-shadow: inset 0 0 0 1px rgba(201,168,76,0.2);
}
.evidence-item input { margin-right: 12px; transform: scale(1.1); accent-color: var(--accent-gold); }

/* HORIZONTAL SCROLL TYPE/COURT */
.horizontal-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 24px;
  scrollbar-width: none;
}
.horizontal-scroll::-webkit-scrollbar { display: none; }

.tc-card {
  flex-shrink: 0;
  width: 140px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s;
}
.tc-card:hover { border-color: var(--border-light); transform: translateY(-2px); }
.tc-card.selected {
  border-color: var(--accent-gold);
  background: rgba(201,168,76,0.08);
  box-shadow: 0 4px 15px rgba(201,168,76,0.1);
}
.tc-icon { font-size: 24px; }
.tc-title { font-size: 0.9rem; font-weight: 700; color: var(--text-primary); }
.tc-card.selected .tc-title { color: var(--accent-gold); }
.tc-desc { font-size: 0.75rem; color: var(--text-muted); line-height: 1.3; }

/* AI ANALYSIS CARD */
.ai-analysis-card {
  background: linear-gradient(145deg, var(--bg-surface), var(--bg-elevated));
  border: 1px solid rgba(201,168,76, 0.4);
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
  box-shadow: 0 8px 30px rgba(201,168,76,0.1);
  position: relative;
  overflow: hidden;
}
.ai-analysis-card::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at top right, rgba(201,168,76,0.15), transparent 70%);
  pointer-events: none;
}
.ai-ac-title { color: var(--accent-gold); font-size: 1.1rem; font-weight: 800; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;}
.ai-ac-subtitle { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 8px; }
.ai-ac-pill { color: var(--success); font-size: 0.75rem; background: rgba(34,197,94,0.15); padding: 4px 10px; border-radius: 999px; display: inline-block; font-weight: 600; border: 1px solid rgba(34,197,94,0.2); }

/* BOTTOM NAV BAR */
.bottom-nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 0 0;
  border-top: 1px solid var(--border);
  margin-top: 32px;
}
.premium-text { color: var(--accent-gold); font-size: 0.85rem; font-weight: 600; }
@media (max-width: 480px) { .premium-text { display: none; } }

/* TRANSITIONS */
.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active { transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-left-enter-from { opacity: 0; transform: translateX(40px); }
.slide-left-leave-to { opacity: 0; transform: translateX(-40px); }
.slide-right-enter-from { opacity: 0; transform: translateX(-40px); }
.slide-right-leave-to { opacity: 0; transform: translateX(40px); }

.slide-down-enter-active, .slide-down-leave-active { transition: all 0.3s ease-out; overflow: hidden; max-height: 500px; }
.slide-down-enter-from, .slide-down-leave-to { opacity: 0; max-height: 0; margin-top: 0; padding-top: 0; padding-bottom: 0; }

.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; transform: translateY(30px); }

/* EXISTING CLIENT MODAL */
.existing-client-modal {
  position: fixed;
  bottom: 32px;
  right: 32px;
  background: var(--bg-surface);
  border: 1px solid var(--border-light);
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  z-index: 1000;
  width: 340px;
}
.existing-client-modal .modal-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }

/* RESTORED AND ENHANCED MISSING CLASSES */

.fact-textarea, .relief-textarea {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 0.95rem;
  color: var(--text-primary);
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  resize: vertical;
  min-height: 100px;
  margin-bottom: 8px;
}
.fact-textarea:focus, .relief-textarea:focus {
  outline: none;
  border-color: var(--accent-gold);
  background: var(--bg-surface);
  box-shadow: 0 0 0 3px rgba(201, 168, 76, 0.15);
}
.textarea-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}
.textarea-bottom .hint { color: var(--text-muted); }
.char-count-bad { color: var(--danger); font-weight: 600; }
.char-count-good { color: var(--success); font-weight: 600; }

.laws-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.law-pill {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  color: var(--text-muted);
  padding: 8px 16px;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.law-pill:hover {
  background: var(--bg-surface);
  border-color: var(--border-light);
  color: var(--text-primary);
}
.law-pill.selected {
  background: rgba(201,168,76,0.1);
  border-color: var(--accent-gold);
  color: var(--accent-gold);
  box-shadow: inset 0 0 0 1px rgba(201,168,76,0.2);
}

.type-court-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (max-width: 768px) {
  .type-court-grid { grid-template-columns: 1fr; }
}
.tc-label { margin-bottom: 16px; }

.btn-scroll {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  color: var(--text-primary);
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-scroll:hover {
  background: var(--bg-elevated);
  border-color: var(--accent-gold);
  color: var(--accent-gold);
}

.tc-cards {
  display: flex;
  flex-direction: row;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 12px;
  scrollbar-width: none;
}
.tc-cards::-webkit-scrollbar {
  display: none;
}
.tc-card {
  flex: 0 0 140px;
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.tc-card:hover { border-color: var(--border-light); transform: translateY(-2px); }
.tc-card.selected {
  border-color: var(--accent-gold);
  background: rgba(201,168,76,0.08);
  box-shadow: 0 4px 15px rgba(201,168,76,0.1);
}
.tc-icon { font-size: 28px; flex-shrink: 0; line-height: 1; }
.tc-info { display: flex; flex-direction: column; gap: 4px; }
.tc-title { font-size: 1rem; font-weight: 700; color: var(--text-primary); }
.tc-card.selected .tc-title { color: var(--accent-gold); }
.tc-desc { font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; }

.custom-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: 1.5px solid var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  transition: all 0.2s;
}
.evidence-item.checked .custom-checkbox {
  background: var(--accent-gold);
  border-color: var(--accent-gold);
  color: #0A0E1A;
}
.custom-checkbox span { font-size: 12px; font-weight: bold; }
.e-icon { font-size: 20px; margin-right: 12px; }
.e-label { font-size: 0.95rem; font-weight: 500; }


/* AI OVERLAY & MODALS */
.ai-loading-overlay {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(10, 14, 26, 0.95);
  display: flex; align-items: center; justify-content: center;
  z-index: 9999;
  text-align: center;
}
.loading-content .loading-icon {
  font-size: 64px; margin-bottom: 24px;
  animation: pulse-icon 2s infinite ease-in-out;
}
.loading-content h2 { color: var(--accent-gold); margin-bottom: 8px; }
.loading-content .subtitle { color: var(--text-muted); margin-bottom: 32px; }
.rotating-message { color: var(--text-primary); font-size: 1.1rem; font-weight: 500; height: 30px; }
@keyframes pulse-icon { 0%, 100% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.1); opacity: 1; } }

.full-screen-overlay { background: rgba(10, 14, 26, 0.8); backdrop-filter: blur(8px); }
.full-screen-card { width: 90vw; max-width: 800px; height: 85vh; display: flex; flex-direction: column; padding: 0; }
.fs-header { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
.fs-body { flex: 1; overflow-y: auto; padding: 24px; }
.fs-footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; background: var(--bg-surface); border-radius: 0 0 16px 16px; }

.strength-badge { padding: 4px 12px; border-radius: 999px; font-size: 0.85rem; font-weight: 600; }
.strength-badge.strong { background: rgba(16, 185, 129, 0.1); color: #10B981; border: 1px solid rgba(16,185,129,0.3); }
.strength-badge.moderate { background: rgba(245, 158, 11, 0.1); color: #F59E0B; border: 1px solid rgba(245,158,11,0.3); }
.strength-badge.weak { background: rgba(239, 68, 68, 0.1); color: #EF4444; border: 1px solid rgba(239,68,68,0.3); }

.overall-summary { font-size: 1.1rem; font-style: italic; color: var(--text-muted); margin-bottom: 32px; padding-left: 16px; border-left: 3px solid var(--accent-gold); }

.ai-section { background: var(--bg-elevated); border: 1px solid var(--border-light); border-radius: 12px; padding: 20px; margin-bottom: 24px; }
.ai-section h4 { color: var(--accent-gold); margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 8px; }

.badge { display: inline-block; padding: 2px 8px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 4px; font-size: 0.85rem; margin: 0 4px; }
.badge.rec { border-color: var(--accent-gold); color: var(--accent-gold); }
.current-rec { margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px; font-size: 0.95rem; }
.reasoning-box { background: rgba(201, 168, 76, 0.05); border-left: 3px solid var(--accent-gold); padding: 12px; color: var(--text-primary); font-size: 0.9rem; line-height: 1.5; margin-bottom: 16px; }

.comp-bar { width: 100%; height: 8px; background: var(--bg-surface); border-radius: 4px; overflow: hidden; margin-top: 8px; margin-bottom: 20px;}
.comp-fill { height: 100%; background: var(--accent-gold); transition: width 1s ease-out; }
.strong-points ul { padding-left: 20px; color: var(--text-muted); font-size: 0.95rem; margin-bottom: 16px;}
.missing-card { background: var(--bg-surface); border: 1px dashed var(--border); padding: 12px; border-radius: 8px; margin-bottom: 12px; }

.disabled-ai { filter: grayscale(1); opacity: 0.6; cursor: not-allowed !important; pointer-events: none; }

/* FIXES FOR BUTTONS AND TEXT OVERFLOW */

.tc-title {
  word-break: break-word;
}

.btn-save {
  background: linear-gradient(135deg, var(--accent-gold), #E8C97A);
  color: #0A0E1A;
  border: none;
  padding: 12px 28px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 15px rgba(201,168,76,0.3);
}
.btn-save:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(201,168,76,0.4);
}
.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-back-bottom {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
}
.btn-back-bottom:hover {
  color: var(--text-primary);
  border-color: var(--text-muted);
  background: var(--bg-surface);
}

.btn-ai-analyze {
  background: var(--bg-surface);
  color: var(--accent-gold);
  border: 1px solid rgba(201,168,76,0.5);
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-ai-analyze:hover {
  background: rgba(201,168,76,0.1);
  border-color: var(--accent-gold);
}

</style>
