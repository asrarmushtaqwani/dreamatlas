/**
 * lib/social.ts
 * Phase 2 AI functions — Dream Twins, Resonance scoring, Wrapped summaries
 * All use the same Gemini fetch pattern as lib/dreams.ts
 */

import {
  Archetype,
  ArchetypeFingerprint,
  TwinComparisonResult,
  ResonanceScoringResult,
  Dream,
} from '@/types'

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`

async function callGemini(prompt: string): Promise<string> {
  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}'
  return raw.replace(/```json|```/g, '').trim()
}

// ── DREAM TWIN MATCHING ───────────────────────────────────

/**
 * Build an archetype fingerprint from a user's dreams.
 * Returns a normalized % distribution across all 9 archetypes.
 */
export function buildArchetypeFingerprint(dreams: Dream[]): ArchetypeFingerprint {
  const ARCHETYPES: Archetype[] = [
    'Transcendence', 'Voyage', 'Fear', 'Nature', 'Transformation',
    'Shadow', 'Anima', 'Trickster', 'Void',
  ]

  const counts = Object.fromEntries(ARCHETYPES.map(a => [a, 0])) as ArchetypeFingerprint
  let total = 0

  for (const dream of dreams) {
    for (const archetype of dream.archetypes) {
      if (archetype in counts) {
        counts[archetype as Archetype]++
        total++
      }
    }
  }

  // Normalize to percentages
  if (total > 0) {
    for (const key of Object.keys(counts) as Archetype[]) {
      counts[key] = Math.round((counts[key] / total) * 100)
    }
  }

  return counts
}

/**
 * AI-score similarity between two archetype fingerprints.
 * Returns a score (0–1) and shared archetypes.
 */
export async function scoreTwinSimilarity(
  userFingerprint: ArchetypeFingerprint,
  candidateFingerprint: ArchetypeFingerprint,
  userTopSymbols: string[],
  candidateTopSymbols: string[]
): Promise<TwinComparisonResult> {
  const prompt = `You are a Jungian analyst comparing two dreamers' unconscious fingerprints.

Dreamer A archetype distribution (%): ${JSON.stringify(userFingerprint)}
Dreamer A recurring symbols: ${userTopSymbols.slice(0, 8).join(', ')}

Dreamer B archetype distribution (%): ${JSON.stringify(candidateFingerprint)}
Dreamer B recurring symbols: ${candidateTopSymbols.slice(0, 8).join(', ')}

Return ONLY valid JSON with no markdown:
{
  "similarity_score": 0.0,
  "shared_archetypes": ["Archetype1"],
  "reasoning": "One poetic sentence about what these two unconscious minds share."
}

Rules:
- similarity_score: float 0.0–1.0. High = very similar unconscious pattern.
- shared_archetypes: archetypes prominent in BOTH profiles (>15% each)
- reasoning: evocative, under 25 words, Jungian in tone`

  const clean = await callGemini(prompt)
  return JSON.parse(clean) as TwinComparisonResult
}

// ── RESONANCE SCORING ─────────────────────────────────────

/**
 * AI-score the symbolic resonance between two dreams (0–100).
 */
export async function scoreDreamResonance(
  dreamA: Dream,
  dreamB: Dream
): Promise<ResonanceScoringResult> {
  const prompt = `You are comparing two dreams for unconscious resonance — shared symbols, archetypes, and psychological terrain.

Dream A:
- Text: "${dreamA.text.slice(0, 300)}"
- Archetypes: ${dreamA.archetypes.join(', ')}
- Symbols: ${dreamA.symbols.join(', ')}
- Essence: "${dreamA.essence}"

Dream B:
- Text: "${dreamB.text.slice(0, 300)}"
- Archetypes: ${dreamB.archetypes.join(', ')}
- Symbols: ${dreamB.symbols.join(', ')}
- Essence: "${dreamB.essence}"

Return ONLY valid JSON with no markdown:
{
  "score": 72,
  "reasoning": "One sentence explaining what these two dreams share at a psychological level."
}

Rules:
- score: integer 0–100. 0 = totally unrelated. 100 = nearly identical unconscious terrain.
- reasoning: poetic, specific, under 20 words`

  const clean = await callGemini(prompt)
  return JSON.parse(clean) as ResonanceScoringResult
}

// ── WRAPPED ESSENCE SUMMARY ───────────────────────────────

/**
 * Generate a poetic monthly summary of a user's dream landscape.
 */
export async function generateWrappedEssence(params: {
  dreamCount: number
  topArchetype: Archetype | null
  topSymbols: string[]
  streakPeak: number
  dreamworldTitles: string[]
  month: string
}): Promise<string> {
  const prompt = `You are writing a user's monthly dream portrait — a single evocative paragraph that reads like a piece of literary nonfiction.

Data for ${params.month}:
- Dreams logged: ${params.dreamCount}
- Dominant archetype: ${params.topArchetype || 'unknown'}
- Recurring symbols: ${params.topSymbols.slice(0, 6).join(', ')}
- Longest streak: ${params.streakPeak} days
- Dreamworlds visited: ${params.dreamworldTitles.join(', ') || 'none'}

Write 2–3 sentences. Poetic but grounded. Reference specific symbols and the archetype naturally.
Do not use the word "journey". Do not use clichés. No quotes around your response.
Return ONLY the plain text summary.`

  const res = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  })

  if (!res.ok) throw new Error(`Gemini error ${res.status}`)
  const data = await res.json()
  return (data.candidates?.[0]?.content?.parts?.[0]?.text || '').trim()
}

// ── DREAMWORLD CLASSIFIER ─────────────────────────────────

/**
 * Given a dream, return which dreamworld IDs it belongs to (0–3).
 */
export async function classifyDreamIntoWorlds(dream: Dream): Promise<Archetype[]> {
  const prompt = `A dream has been logged. Determine which of these Jungian dreamworld archetypes it belongs to.

Dream text: "${dream.text.slice(0, 400)}"
Dream archetypes: ${dream.archetypes.join(', ')}
Dream symbols: ${dream.symbols.join(', ')}

Available dreamworlds (by archetype):
Transcendence, Voyage, Fear, Nature, Transformation, Shadow, Anima, Trickster, Void

Return ONLY valid JSON with no markdown:
{
  "matching_archetypes": ["Archetype1", "Archetype2"]
}

Rules:
- matching_archetypes: 0–3 archetypes from the list above that this dream strongly belongs to
- Only include archetypes with strong thematic alignment, not just because they appear in the dream's archetype list`

  const clean = await callGemini(prompt)
  const result = JSON.parse(clean) as { matching_archetypes: Archetype[] }
  return result.matching_archetypes || []
}