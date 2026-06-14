<template>
  <div v-if="hasError" class="global-error-screen">
    <div class="error-card">
      <div class="error-icon">⚠️</div>
      <h2 class="error-title">Something went wrong</h2>
      <p class="error-body">
        An unexpected error occurred. The details have been logged and our team is looking into it.
      </p>
      <div v-if="errorDetail" class="error-details-box">
        <code>{{ errorDetail }}</code>
      </div>
      <button class="btn btn-gold" @click="recoverFromError">
        Go to Dashboard
      </button>
    </div>
  </div>
  <template v-else>
    <router-view v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </template>

  <!-- Global Toast Container -->
  <div class="toast-container">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="{ removing: toast.removing }"
    >
      <span style="font-size:1.1rem;">{{ toast.icon }}</span>
      <span>{{ toast.message }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, provide, onErrorCaptured } from 'vue'
import { supabase } from './lib/supabase'
import { useAuthStore } from './stores/auth'

const toasts = ref([])
let toastId = 0

function showToast(message, icon = '💬') {
  const id = ++toastId
  toasts.value.push({ id, message, icon, removing: false })
  setTimeout(() => {
    const t = toasts.value.find(t => t.id === id)
    if (t) t.removing = true
    setTimeout(() => {
      toasts.value = toasts.value.filter(t => t.id !== id)
    }, 280)
  }, 3200)
}

provide('showToast', showToast)

// Error Boundary State
const hasError = ref(false)
const errorDetail = ref('')

onErrorCaptured((err, instance, info) => {
  console.error('[Global Error Boundary Captured]:', err, info)
  hasError.value = true
  errorDetail.value = err?.message || String(err)

  // Log error to Supabase audit_logs
  try {
    const authStore = useAuthStore()
    const uid = authStore.user?.id
    
    supabase.from('audit_logs').insert({
      advocate_id: uid || null,
      action: 'ui_error_crashed',
      metadata: {
        error: errorDetail.value,
        info: info,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
    }).then(({ error }) => {
      if (error) console.error('[Error Boundary] Failed logging to audit_logs:', error)
    })
  } catch (logErr) {
    console.error('[Error Boundary] Logger exception:', logErr)
  }

  // Return false to stop error propagation
  return false
})

function recoverFromError() {
  hasError.value = false
  errorDetail.value = ''
  // Hard reload to dashboard to clean Vue state
  window.location.href = '/dashboard'
}
</script>

<style scoped>
.global-error-screen {
  position: fixed;
  inset: 0;
  background: var(--bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 99999;
}
.error-card {
  background: var(--bg-surface);
  border: 1px solid rgba(239, 68, 68, 0.25);
  box-shadow: 0 0 40px rgba(239, 68, 68, 0.1), var(--shadow-lg);
  border-radius: var(--radius-xl);
  padding: 40px;
  max-width: 460px;
  width: 100%;
  text-align: center;
}
.error-icon {
  font-size: 3.5rem;
  margin-bottom: 16px;
  animation: pulse-danger 2s infinite;
}
.error-title {
  color: var(--danger);
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 12px;
}
.error-body {
  font-size: 0.9rem;
  color: var(--text-subtle);
  line-height: 1.6;
  margin-bottom: 20px;
}
.error-details-box {
  background: var(--bg-base);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 12px;
  text-align: left;
  max-height: 120px;
  overflow-y: auto;
  margin-bottom: 24px;
}
.error-details-box code {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--text-muted);
  word-break: break-all;
  white-space: pre-wrap;
}
@keyframes pulse-danger {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.08); }
}
</style>
