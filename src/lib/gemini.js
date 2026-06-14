export async function generateLegalDraft(caseData) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey || apiKey === 'REPLACE_WITH_YOUR_KEY') {
    throw new Error('Gemini API key not configured')
  }

  const prompt = `
You are an expert Indian legal assistant with deep knowledge of IPC, CrPC, 
CPC, Indian Evidence Act, and all Special Acts.

Given the following case details, do exactly two things:

CASE DETAILS:
- Case Type: ${caseData.case_type}
- Court Level: ${caseData.court_level}
- Plaintiff: ${caseData.plaintiff_name}
- Defendant: ${caseData.defendant_name}
- Incident Date: ${caseData.incident_date}
- Incident Place: ${caseData.incident_place}
- Facts: ${caseData.facts_text}
- Evidence Available: ${caseData.evidence_available?.join(', ')}
- Relief Sought: ${caseData.relief_sought}
- Applicable Acts Hinted: ${caseData.applicable_acts?.join(', ')}

TASK 1 — Identify all applicable laws:
List every relevant section from IPC, CrPC, CPC, Evidence Act, 
and any Special Acts. For each, give exact section number and 
one-line explanation of why it applies to this case.

TASK 2 — Draft a formal legal petition:
Write a complete formal petition in standard Indian court format.

Respond ONLY in this exact JSON format, no extra text, no markdown:
{
  "identified_laws": [
    {
      "section": "Section 420",
      "act": "Indian Penal Code",
      "explanation": "Cheating and dishonestly inducing delivery of property"
    }
  ],
  "draft_text": "IN THE COURT OF...\n\nfull petition here..."
}

The draft_text must include:
1. Cause Title (IN THE COURT OF [court_level], [incident_place])
2. Case type heading
3. Most Respectfully Showeth:
4. Numbered facts paragraphs
5. Grounds (citing identified sections)
6. Prayer Clause
7. Place and Date line
8. Verification clause
`

  let response
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096
          }
        })
      }
    )
  } catch (netErr) {
    console.error('[Gemini Network Error]:', netErr)
    throw new Error('Network error, check connection')
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    console.error('[Gemini API Error Response]:', errorData)
    throw new Error('AI response error, try again')
  }

  let data
  try {
    data = await response.json()
  } catch (jsonErr) {
    console.error('[Gemini Response JSON Error]:', jsonErr)
    throw new Error('AI response error, try again')
  }

  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!rawText) {
    console.error('[Gemini Empty/Missing Content]:', data)
    throw new Error('AI response error, try again')
  }

  try {
    // Strip markdown code fences if present
    const cleaned = rawText.replace(/```json|```/g, '').trim()
    return JSON.parse(cleaned)
  } catch (parseErr) {
    console.error('[Gemini JSON Parse Error]:', parseErr, '\nRaw response text was:', rawText)
    throw new Error('AI response error, try again')
  }
}
