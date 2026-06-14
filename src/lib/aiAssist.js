import { supabase } from './supabase'

/**
 * Call the ai-assist edge function.
 * 
 * @param {string} fieldName      - 'case_type' | 'facts_text' | 'relief_sought' | 'applicable_acts'
 * @param {string} fieldValue     - current value of the field
 * @param {object} caseContext    - { case_type, court_level, facts_text, plaintiff_name, defendant_name }
 * @returns {object}              - { result, field_name, assists_used, assists_remaining, near_limit }
 * @throws {{ code, message }}    - 'PREMIUM_REQUIRED' | 'LIMIT_REACHED' | 'SERVER_ERROR'
 */
export async function getAIAssist(fieldName, fieldValue, caseContext = {}) {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session?.access_token) {
    throw { code: 'SERVER_ERROR', message: 'No active session. Please login again.' }
  }

  const response = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assist`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ fieldName, fieldValue, caseContext }),
    }
  )

  const data = await response.json()

  if (response.status === 403) {
    throw { code: 'PREMIUM_REQUIRED', message: data.message || 'AI Assist requires Premium plan.' }
  }
  if (response.status === 429) {
    throw { code: 'LIMIT_REACHED', message: data.message || 'Daily assist limit reached.' }
  }
  if (!response.ok) {
    throw { code: 'SERVER_ERROR', message: data.error || 'AI assist failed. Please try again.' }
  }

  return data
}
