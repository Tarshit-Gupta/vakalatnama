<template>
  <div class="login-page">
    <!-- Background decorative elements -->
    <div class="login-bg-orb login-bg-orb-1"></div>
    <div class="login-bg-orb login-bg-orb-2"></div>

    <div class="login-card">
      <!-- Logo -->
      <div class="login-logo">
        <svg width="56" height="56" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="rgba(201,168,76,0.1)" stroke="#C9A84C" stroke-width="2.5"/>
          <line x1="50" y1="16" x2="50" y2="84" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"/>
          <line x1="22" y1="38" x2="78" y2="38" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="22" cy="50" r="11" fill="none" stroke="#E8C97A" stroke-width="2"/>
          <circle cx="78" cy="50" r="11" fill="none" stroke="#E8C97A" stroke-width="2"/>
          <line x1="17" y1="61" x2="27" y2="61" stroke="#C9A84C" stroke-width="2"/>
          <line x1="73" y1="61" x2="83" y2="61" stroke="#C9A84C" stroke-width="2"/>
          <line x1="36" y1="84" x2="64" y2="84" stroke="#C9A84C" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
        <div class="login-logo-text">
          <h2 style="color: var(--accent-gold); margin: 0; font-size: 1.5rem;">VakalatNama</h2>
          <p class="login-tagline">AI-Powered Legal Drafting for Indian Advocates</p>
        </div>
      </div>

      <div class="divider"></div>

      <h1 style="font-size: 1.375rem; margin-bottom: 8px;">{{ isSignup ? 'Create Account' : 'Welcome back' }}</h1>
      <p style="color: var(--text-muted); font-size: 0.875rem; margin-bottom: 28px;">
        {{ isSignup ? 'Register as an advocate to get started' : 'Sign in to your account to continue drafting' }}
      </p>

      <!-- Error message -->
      <div v-if="errorMessage" class="error-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ errorMessage }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" style="display:flex;flex-direction:column;gap:18px;">

        <!-- Signup-only fields -->
        <template v-if="isSignup">
          <div class="form-group">
            <label class="form-label" for="full-name">Full Name</label>
            <input
              id="full-name"
              v-model="fullName"
              type="text"
              class="form-input"
              placeholder="Adv. Rajesh Sharma"
              required
            />
          </div>
          <div class="form-row-half">
            <div class="form-group">
              <label class="form-label" for="bar-council">Bar Council No.</label>
              <input
                id="bar-council"
                v-model="barCouncilNo"
                type="text"
                class="form-input"
                placeholder="DL/2018/3421"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label" for="city">City</label>
              <input
                id="city"
                v-model="city"
                type="text"
                class="form-input"
                placeholder="New Delhi"
                required
              />
            </div>
          </div>
        </template>

        <div class="form-group">
          <label class="form-label" for="email">Email Address</label>
          <div style="position:relative;">
            <div class="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              style="padding-left: 40px;"
              placeholder="advocate@example.com"
              required
              autocomplete="email"
            />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="password">Password</label>
          <div style="position:relative;">
            <div class="input-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              style="padding-left: 40px; padding-right: 44px;"
              placeholder="••••••••••"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>

        <div v-if="!isSignup" style="display:flex;justify-content:flex-end;">
          <a href="#" style="font-size:0.8125rem;">Forgot password?</a>
        </div>

        <button
          id="login-btn"
          type="submit"
          class="btn btn-gold btn-lg"
          style="width:100%;justify-content:center;margin-top:4px;"
          :disabled="loading"
        >
          <div v-if="loading" class="spinner" style="width:16px;height:16px;border-width:2px;"></div>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          {{ loading ? (isSignup ? 'Creating account...' : 'Signing in...') : (isSignup ? 'Create Account' : 'Login') }}
        </button>
      </form>

      <p style="text-align:center;margin-top:24px;color:var(--text-muted);font-size:0.875rem;">
        {{ isSignup ? 'Already have an account?' : "Don't have an account?" }}
        <a href="#" style="margin-left:4px;" @click.prevent="toggleMode">{{ isSignup ? 'Sign in' : 'Sign up' }}</a>
      </p>

      <!-- Trust badges -->
      <div class="login-trust">
        <span>🔒 256-bit SSL Encrypted</span>
        <span>⚖️ Bar Council Compliant</span>
        <span>🇮🇳 Made for India</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// Form state
const email = ref('')
const password = ref('')
const fullName = ref('')
const barCouncilNo = ref('')
const city = ref('')
const loading = ref(false)
const showPassword = ref(false)
const isSignup = ref(false)
const errorMessage = ref('')

function toggleMode() {
  isSignup.value = !isSignup.value
  errorMessage.value = ''
}

async function handleSubmit() {
  errorMessage.value = ''
  loading.value = true

  // Run auth + keep the 1.2s loading animation alive simultaneously
  const [result] = await Promise.all([
    isSignup.value ? handleSignup() : handleLogin(),
    new Promise(r => setTimeout(r, 1200)),
  ])

  loading.value = false

  if (result?.error) {
    errorMessage.value = result.error
    return
  }

  router.push('/dashboard')
}

async function handleLogin() {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) return { error: error.message }
    await authStore.setAdvocate(data.user.id)
    return {}
  } catch (err) {
    return { error: err.message }
  }
}

async function handleSignup() {
  try {
    // Step 1: Create auth user
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    if (signUpError) return { error: signUpError.message }

    const userId = data.user?.id
    if (!userId) return { error: 'Signup failed — no user ID returned.' }

    // Step 2: Insert advocate profile row
    const { error: insertError } = await supabase.from('advocates').insert({
      id: userId,
      name: fullName.value,
      email: email.value,
      bar_council_no: barCouncilNo.value,
      city: city.value,
    })
    if (insertError) return { error: insertError.message }

    await authStore.setAdvocate(userId)
    return {}
  } catch (err) {
    return { error: err.message }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--bg-base);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  position: relative;
  overflow: hidden;
}
.login-bg-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.login-bg-orb-1 {
  width: 500px; height: 500px;
  background: radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%);
  top: -200px; left: -150px;
}
.login-bg-orb-2 {
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%);
  bottom: -150px; right: -100px;
}
.login-card {
  width: 100%;
  max-width: 440px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  padding: 40px;
  box-shadow: var(--shadow-lg), 0 0 0 1px rgba(201,168,76,0.08);
  position: relative;
  z-index: 1;
}
.login-logo {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}
.login-logo-text { display: flex; flex-direction: column; gap: 2px; }
.login-tagline {
  font-size: 0.75rem;
  color: var(--text-muted);
  line-height: 1.4;
  max-width: 200px;
}
.input-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  pointer-events: none;
}
.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  transition: color var(--transition);
}
.password-toggle:hover { color: var(--accent-gold); }
.login-trust {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--border);
  font-size: 0.6875rem;
  color: var(--text-muted);
}
.error-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(239,68,68,0.08);
  border: 1px solid rgba(239,68,68,0.25);
  border-radius: var(--radius-md);
  color: var(--danger);
  font-size: 0.8125rem;
  margin-bottom: 4px;
}
.form-row-half {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
</style>
