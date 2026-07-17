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

      <div class="login-header">
        <h2 class="login-title">{{ isResetPassword ? 'Reset Password' : (isSignup ? 'Create Account' : 'Welcome Back') }}</h2>
        <p class="login-subtitle">
          {{ isResetPassword ? 'Enter the OTP sent to your email to reset your password' : (isSignup ? 'Register as an advocate to get started' : 'Sign in to your account to continue drafting') }}
        </p>
      </div>

      <!-- Error message -->
      <div v-if="errorMessage" class="error-banner">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        {{ errorMessage }}
      </div>

      <!-- Form -->
      <form @submit.prevent="isResetPassword ? handleResetSubmit() : handleSubmit()" style="display:flex;flex-direction:column;gap:18px;">

        <!-- Signup-only fields -->
        <template v-if="isSignup && !isResetPassword">
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
              :disabled="isResetPassword"
            />
          </div>
        </div>

        <div class="form-group" v-if="!isResetPassword">
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

        <template v-if="isResetPassword">
          <div class="form-group">
            <label class="form-label" for="otp">One-Time Password (OTP)</label>
            <input
              id="otp"
              v-model="otp"
              type="text"
              class="form-input"
              required
            />
          </div>
          <div class="form-group">
            <label class="form-label" for="newPassword">New Password</label>
            <input
              id="newPassword"
              v-model="newPassword"
              type="password"
              class="form-input"
              placeholder="Enter new password"
              required
            />
          </div>
        </template>

        <div v-if="!isSignup && !isResetPassword" style="display:flex;justify-content:flex-end;">
          <button
            type="button"
            class="forgot-link"
            @click="handleForgotPassword"
            :disabled="forgotSending"
          >{{ forgotSending ? 'Sending OTP...' : 'Forgot password?' }}</button>
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
          {{ loading ? (isResetPassword ? 'Resetting...' : (isSignup ? 'Creating account...' : 'Signing in...')) : (isResetPassword ? 'Set New Password' : (isSignup ? 'Create Account' : 'Login')) }}
        </button>
      </form>

      <p v-if="!isResetPassword" style="text-align:center;margin-top:24px;color:var(--text-muted);font-size:0.875rem;">
        {{ isSignup ? 'Already have an account?' : "Don't have an account?" }}
        <a href="#" style="margin-left:4px;" @click.prevent="toggleMode">{{ isSignup ? 'Sign in' : 'Sign up' }}</a>
      </p>

      <p v-if="isResetPassword" style="text-align:center;margin-top:24px;color:var(--text-muted);font-size:0.875rem;">
        Remembered your password?
        <a href="#" style="margin-left:4px;" @click.prevent="isResetPassword = false; errorMessage = ''">Back to Login</a>
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
const forgotSending = ref(false)
const isResetPassword = ref(false)
const otp = ref('')
const newPassword = ref('')

function toggleMode() {
  isSignup.value = !isSignup.value
  errorMessage.value = ''
}

async function handleForgotPassword() {
  const trimmedEmail = email.value.trim()
  if (!trimmedEmail) {
    errorMessage.value = 'Please enter your email address first, then click Forgot password.'
    return
  }
  forgotSending.value = true
  errorMessage.value = ''
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail)
    if (error) throw error
    errorMessage.value = ''
    isResetPassword.value = true
    // Show success in the error area reusing the same UI slot with a success style
    alert(`OTP sent to ${trimmedEmail}. Please check your inbox and enter it below.`)
  } catch (err) {
    errorMessage.value = err.message || 'Failed to send reset email. Please try again.'
  } finally {
    forgotSending.value = false
  }
}

async function handleResetSubmit() {
  errorMessage.value = ''
  loading.value = true
  try {
    // 1. Verify OTP
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.value.trim(),
      token: otp.value.trim(),
      type: 'recovery'
    })
    if (verifyError) throw verifyError

    // 2. Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword.value
    })
    if (updateError) throw updateError

    alert('Password updated successfully! Redirecting to dashboard...')
    router.push('/dashboard')
  } catch (err) {
    errorMessage.value = err.message || 'Failed to reset password. Please check your OTP and try again.'
  } finally {
    loading.value = false
  }
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
    // Pass name, bar_council_no, city as metadata so the DB trigger can use them
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          name: fullName.value,
          bar_council_no: barCouncilNo.value,
          city: city.value,
        }
      }
    })
    if (signUpError) return { error: signUpError.message }

    const userId = data.user?.id
    if (!userId) return { error: 'Signup failed — no user ID returned.' }

    if (!data.session) {
      return { error: 'Signup failed. Please try again or contact support.' }
    }

    // The DB trigger (handle_new_user) automatically creates the advocates row.
    // Wait briefly for the trigger to complete before fetching the advocate profile.
    await new Promise(r => setTimeout(r, 500))

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
.forgot-link {
  background: none;
  border: none;
  color: var(--accent-gold);
  font-size: 0.8125rem;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
  text-underline-offset: 2px;
  opacity: 0.8;
  transition: opacity var(--transition);
}
.forgot-link:hover { opacity: 1; }
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
