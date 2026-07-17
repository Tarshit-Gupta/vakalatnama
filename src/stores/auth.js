import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import router from '../router'

// Module-level variable to hold the auth subscription so it can be cleaned up
let authSubscription = null

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const advocate = ref(null)

  /**
   * Fetch the advocate profile row for the given user ID.
   * Called after login / signup and on auth state change.
   */
  async function setAdvocate(userId) {
    try {
      const { data, error } = await supabase
        .from('advocates')
        .select('id, name, email, bar_council_no, city, plan')
        .eq('id', userId)
        .maybeSingle()

      if (error) throw error
      advocate.value = data
    } catch (err) {
      console.error('[AuthStore] setAdvocate error:', err.message)
    }
  }

  /**
   * Bootstrap auth state on app load.
   * Reads the existing session and subscribes to future changes.
   * Unsubscribes any prior subscription to prevent duplicate listeners (e.g. HMR).
   */
  async function initAuth() {
    try {
      // Clean up any previous subscription before creating a new one
      if (authSubscription) {
        authSubscription.unsubscribe()
        authSubscription = null
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        user.value = session.user
        await setAdvocate(session.user.id)
      }

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        user.value = session?.user ?? null
        if (session?.user) {
          await setAdvocate(session.user.id)
        } else {
          advocate.value = null
        }
      })
      authSubscription = subscription
    } catch (err) {
      console.error('[AuthStore] initAuth error:', err.message)
    }
  }

  /**
   * Sign the user out, clear local state, and redirect to /login.
   * Callers do NOT need to manually redirect — this is handled here.
   */
  async function logout() {
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('[AuthStore] logout error:', err.message)
    } finally {
      user.value = null
      advocate.value = null
      router.push('/login')
    }
  }

  return { user, advocate, initAuth, setAdvocate, logout }
})

