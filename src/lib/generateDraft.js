import { supabase } from './supabase'

export async function generateDraft(caseData) {
  // Get current active session token
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    throw new Error('Session expired, please login again')
  }

  const token = session.access_token
  const baseUrl = import.meta.env.VITE_SUPABASE_URL
  const url = `${baseUrl}/functions/v1/generate-draft`

  let response
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ caseData })
    })
  } catch (netErr) {
    console.error('[Generate Draft Network Error]:', netErr)
    throw new Error('Network error, check connection')
  }

  if (!response.ok) {
    const status = response.status
    let responseData = {}
    try {
      responseData = await response.json()
    } catch {
      // ignore parsing error if it returns HTML/text
    }

    if (status === 401) {
      throw new Error('Session expired, please login again')
    } else if (status === 429) {
      throw new Error(responseData.message || responseData.error || 'Daily limit reached')
    } else {
      throw new Error('Server error, please try again')
    }
  }

  try {
    const result = await response.json()
    return {
      identified_laws: result.identified_laws,
      draft_text: result.draft_text,
      meta: result.meta
    }
  } catch (jsonErr) {
    console.error('[Generate Draft JSON Parse Error]:', jsonErr)
    throw new Error('Server error, please try again')
  }
}
