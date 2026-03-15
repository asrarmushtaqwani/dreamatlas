import { DreamAnalysis } from '@/types'

export async function analyzeDream(
  text: string,
  mood: string
): Promise<DreamAnalysis> {
  const prompt = `Analyze this dream. Return ONLY valid JSON with no markdown or extra text:
{
  "archetypes": ["Archetype1", "Archetype2"],
  "symbols": ["symbol1", "symbol2", "symbol3", "symbol4"],
  "essence": "One evocative sentence capturing the dream's deepest psychological meaning",
  "map_x": 0.5,
  "map_y": 0.5
}

Rules:
- archetypes: 1-3 values from [Transcendence, Voyage, Fear, Nature, Transformation, Shadow, Anima, Trickster, Void]
- symbols: 3-6 key dream symbols or motifs as short phrases
- essence: poetic, Jungian, under 20 words
- map_x, map_y: floats 0.05–0.95. x = conscious(0) to unconscious(1). y = light(0) to shadow(1)

Dream: "${text.slice(0, 600)}"
Mood: ${mood || 'unspecified'}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) throw new Error('Analysis failed')

  const data = await res.json()
  const raw = data.content?.[0]?.text || '{}'
  const clean = raw.replace(/```json|```/g, '').trim()
  return JSON.parse(clean) as DreamAnalysis
}

export const ARCHETYPE_COLORS: Record<string, string> = {
  Transcendence: '#8b6fff',
  Voyage: '#6b9fff',
  Fear: '#ff6b8a',
  Nature: '#6bffb8',
  Transformation: '#ffcc6b',
  Shadow: '#c46bff',
  Anima: '#ff6bcc',
  Trickster: '#6bffe0',
  Void: '#9999cc',
}

export function generateDreamName(): string {
  const adjectives = [
    'wandering', 'silver', 'twilight', 'hollow', 'drifting',
    'forgotten', 'luminous', 'silent', 'velvet', 'ancient',
  ]
  const nouns = [
    'corridor', 'tide', 'mirror', 'compass', 'threshold',
    'lantern', 'current', 'horizon', 'echo', 'vessel',
  ]
  const a = adjectives[Math.floor(Math.random() * adjectives.length)]
  const n = nouns[Math.floor(Math.random() * nouns.length)]
  return `the ${a} ${n}`
}
