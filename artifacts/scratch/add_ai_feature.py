import re
import os

file_path = r"e:\Projects\Gateway\LexDraftAI\src\pages\NewCasePage.vue"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Imports
imports_search = """import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'"""
imports_replace = """import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'
import { getAIAssist } from '../lib/aiAssist'"""
if "import { getAIAssist }" not in content:
    content = content.replace(imports_search, imports_replace)

# 2. State & `runAIAnalysis`
state_search = """// AI Plan Mock State
const isPremium = ref(true) // Mocked as premium for testing
const assistsRemaining = ref(10)
const showUpgradeModal = ref(false)

const isAnalyzing = ref(false)
const showAnalysisResult = ref(false)

const runAIAnalysis = () => {
  if (factsLength.value < 100) {
    toast.error("Please add more case facts for accurate analysis (min 100 chars)")
    return
  }
  if (!caseForm.case_type) {
    toast.error("Please select Case Type first")
    return
  }
  
  // Simulate AI Thinking
  isAnalyzing.value = true
  setTimeout(() => {
    isAnalyzing.value = false
    showAnalysisResult.value = true
  }, 2500)
}"""

state_replace = """// AI Plan Real State
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
  caseForm.relief_sought += '\\n\\n' + text
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
    const res = await getAIAssist('complete_case_analysis', completeCase, completeCase)
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
}"""
if "const applyCaseType" not in content:
    content = content.replace(state_search, state_replace)

# 3. HTML Button Update
button_search = """        <!-- AI ANALYSIS BUTTON -->
        <div class="ai-button-wrapper">
          <button 
            class="btn btn-ai-analyze"
            :class="{ 'premium-pulse': isPremium }"
            @click="isPremium ? runAIAnalysis() : showUpgradeModal = true"
          >
            <span class="ai-icon">🤖</span> Analyze Case with AI
          </button>
          <div class="ai-limit-text" v-if="isPremium">
            Uses 1 AI assist ({{ assistsRemaining }} remaining today)
          </div>
        </div>"""

button_replace = """        <!-- AI ANALYSIS BUTTON -->
        <div class="ai-button-wrapper">
          <button 
            class="btn btn-ai-analyze"
            :class="{ 'premium-pulse': isPremium, 'disabled-ai': !isPremium || assistsRemaining === 0 }"
            @click="isPremium ? runAIAnalysis() : showUpgradeModal = true"
          >
            <span class="ai-icon">🤖</span> Analyze Case with AI
          </button>
          <div class="ai-limit-text" v-if="isPremium && assistsRemaining !== null">
            Uses 1 AI assist ({{ assistsRemaining }} remaining today)
          </div>
          <div class="ai-limit-text" v-else-if="assistsRemaining === 0" style="color: var(--danger);">
            Daily limit reached. Resets at midnight IST.
          </div>
        </div>"""
if "'disabled-ai': !isPremium" not in content:
    content = content.replace(button_search, button_replace)

# 4. Remove old Result Modal & replace with New Modals and Overlays
old_modal_search = """    <!-- FAKE AI RESULT MODAL -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showAnalysisResult" class="modal-overlay" @click.self="showAnalysisResult = false">
          <div class="modal-card">
            <div class="modal-header">
              <h3>🤖 AI Case Analysis</h3>
              <button class="btn btn-icon btn-ghost" @click="showAnalysisResult = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <p>This feature requires the actual Supabase edge function to be running and a Gemini API Key.</p>
              <br>
              <p>Since this is a UI prototype, I have simulated the button click. The real logic will extract the facts, relief sought, case type, and court level, and send it to the AI for legal evaluation.</p>
            </div>
            <div class="modal-actions" style="margin-top: 24px;">
              <button class="btn btn-gold" @click="showAnalysisResult = false">Got it!</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>"""

new_modals = """    <!-- PREMIUM UPGRADE MODAL -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showUpgradeModal" class="modal-overlay" @click.self="showUpgradeModal = false">
          <div class="modal-card" style="border: 1px solid var(--accent-gold);">
            <div class="modal-header">
              <h3 style="color: var(--accent-gold);">✨ Premium Feature</h3>
              <button class="btn btn-icon btn-ghost" @click="showUpgradeModal = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div class="modal-body">
              <p>AI Case Analysis studies your complete case and suggests:</p>
              <ul style="margin: 12px 0 24px 20px; color: var(--text-muted); line-height: 1.6;">
                <li>Correct case type & jurisdiction</li>
                <li>Stronger legal grounds</li>
                <li>Missing facts & evidence</li>
                <li>Additional applicable laws</li>
                <li>Better relief clauses</li>
              </ul>
              <p style="font-weight: 600;">All in ONE analysis — not guesswork.</p>
            </div>
            <div class="modal-actions" style="margin-top: 24px;">
              <button class="btn btn-ghost" @click="showUpgradeModal = false">Maybe Later</button>
              <button class="btn btn-gold">Upgrade to Premium →</button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- LOADING OVERLAY -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="isAnalyzing" class="ai-loading-overlay">
          <div class="loading-content">
            <div class="loading-icon">⚖️</div>
            <h2>Analyzing your case...</h2>
            <p class="subtitle">Our AI is studying all case details like a senior advocate would</p>
            <div class="rotating-message">
              <transition name="slide-up" mode="out-in">
                <p :key="loadingMessageIdx">{{ loadingMessages[loadingMessageIdx] }}</p>
              </transition>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- AI RESULT MODAL -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showAnalysisResult && analysisResultData" class="modal-overlay full-screen-overlay">
          <div class="modal-card full-screen-card">
            
            <div class="fs-header">
              <div style="display:flex; align-items:center; gap: 12px;">
                <h3>🤖 AI Case Analysis Results</h3>
                <div v-if="analysisResultData.overall_strength === 'strong'" class="strength-badge strong">💪 Strong Case</div>
                <div v-else-if="analysisResultData.overall_strength === 'weak'" class="strength-badge weak">⚠️ Needs Strengthening</div>
                <div v-else class="strength-badge moderate">⚡ Moderate Case</div>
              </div>
              <button class="btn btn-icon btn-ghost" @click="showAnalysisResult = false">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div class="fs-body">
              <p class="overall-summary">"{{ analysisResultData.overall_summary }}"</p>
              
              <!-- SECTION 1: Case Type -->
              <div class="ai-section" v-if="analysisResultData.case_type.has_suggestion">
                <h4>Case Type & Jurisdiction</h4>
                <div class="current-rec">
                  <div>Current: <span class="badge">{{ analysisResultData.case_type.current }}</span></div>
                  <div>Recommended: 
                    <span v-for="rec in analysisResultData.case_type.recommended" :key="rec" class="badge rec">{{ rec }}</span>
                  </div>
                </div>
                <div class="reasoning-box">{{ analysisResultData.case_type.reasoning }}</div>
                <div class="action-row">
                  <button class="btn btn-gold btn-sm" @click="applyCaseType(analysisResultData.case_type.recommended[0])">
                    ✓ Accept — Select {{ analysisResultData.case_type.recommended[0] }}
                  </button>
                </div>
              </div>

              <!-- SECTION 2: Court Level -->
              <div class="ai-section" v-if="analysisResultData.court_level.has_suggestion">
                <h4>Court Level</h4>
                <div class="current-rec">
                  <div>Current: <span class="badge">{{ analysisResultData.court_level.current }}</span></div>
                  <div>Recommended: <span class="badge rec">{{ analysisResultData.court_level.recommended }}</span></div>
                </div>
                <div class="reasoning-box">{{ analysisResultData.court_level.reasoning }}</div>
                <div class="action-row">
                  <button class="btn btn-gold btn-sm" @click="applyCourtLevel(analysisResultData.court_level.recommended)">
                    ✓ Accept — Change to {{ analysisResultData.court_level.recommended }}
                  </button>
                </div>
              </div>

              <!-- SECTION 3: Facts Analysis -->
              <div class="ai-section">
                <h4>Facts Analysis</h4>
                <div class="completeness">
                  <div class="comp-label">Completeness Score: {{ analysisResultData.facts_analysis.completeness_score }}%</div>
                  <div class="comp-bar"><div class="comp-fill" :style="{width: analysisResultData.facts_analysis.completeness_score + '%'}"></div></div>
                </div>
                <div class="strong-points" v-if="analysisResultData.facts_analysis.strong_points.length">
                  <h5>✅ Strong Points:</h5>
                  <ul>
                    <li v-for="pt in analysisResultData.facts_analysis.strong_points" :key="pt">{{ pt }}</li>
                  </ul>
                </div>
                <div class="missing-critical" v-if="analysisResultData.facts_analysis.missing_critical?.length">
                  <h5>⚠️ Missing Critical Details:</h5>
                  <div class="missing-card" v-for="mc in analysisResultData.facts_analysis.missing_critical" :key="mc.detail">
                    <div style="font-weight: 600; margin-bottom: 4px;">⚠️ [{{ mc.importance.toUpperCase() }}] {{ mc.detail }}</div>
                    <div style="color: var(--text-muted); font-size: 0.9rem;">"{{ mc.why_needed }}"</div>
                  </div>
                  <div style="margin-top: 12px;">
                    <button class="btn btn-outline btn-sm" @click="showAnalysisResult = false">
                      Got It — I'll Update My Facts
                    </button>
                  </div>
                </div>
              </div>

              <!-- SECTION 4: Relief Sought -->
              <div class="ai-section" v-if="analysisResultData.relief_analysis.has_suggestion">
                <h4>Relief Sought</h4>
                <div class="missing-critical">
                  <h5>Additional relief you can claim:</h5>
                  <div class="missing-card" v-for="(mr, idx) in analysisResultData.relief_analysis.missing_relief" :key="idx">
                    <div style="font-weight: 600; margin-bottom: 4px; color: var(--success);">+ {{ mr.relief }}</div>
                    <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 12px;">"{{ mr.why_add }}"</div>
                    <button class="btn btn-gold btn-sm" :disabled="mr._applied" @click="appendRelief(mr.append_text, idx)">
                      {{ mr._applied ? '✓ Added' : '+ Add to Relief' }}
                    </button>
                  </div>
                </div>
              </div>

              <!-- SECTION 5: Applicable Acts -->
              <div class="ai-section" v-if="analysisResultData.acts_analysis.has_suggestion">
                <h4>Applicable Acts</h4>
                <div class="missing-critical">
                  <h5>Missing Acts to Consider:</h5>
                  <div class="missing-card" v-for="(ma, idx) in analysisResultData.acts_analysis.missing_acts" :key="idx">
                    <div style="font-weight: 600; margin-bottom: 4px; color: var(--success);">+ {{ ma.act }} ({{ ma.section }})</div>
                    <div style="color: var(--text-muted); font-size: 0.9rem; margin-bottom: 12px;">"{{ ma.why_applies }}"</div>
                    <button class="btn btn-gold btn-sm" :disabled="ma._applied" @click="addMissingAct(ma.act, idx)">
                      {{ ma._applied ? '✓ Added' : '+ Add Act' }}
                    </button>
                  </div>
                </div>
              </div>

            </div>
            
            <div class="fs-footer">
              <div style="color: var(--text-muted);">{{ suggestionsApplied }} suggestions applied</div>
              <div style="display:flex; gap:12px;">
                <button class="btn btn-gold" @click="showAnalysisResult = false">✓ Done — Looks Good</button>
              </div>
            </div>

          </div>
        </div>
      </transition>
    </Teleport>"""
if "AI Case Analysis Results" not in content:
    content = content.replace(old_modal_search, new_modals)

# 5. Add CSS
css_search = """/* FIXES FOR BUTTONS AND TEXT OVERFLOW */"""
new_css = """/* AI OVERLAY & MODALS */
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
"""
if "ai-loading-overlay" not in content:
    content = content.replace(css_search, new_css + "\n" + css_search)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Updated NewCasePage.vue successfully")
