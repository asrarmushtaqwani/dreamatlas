import { createClient } from '@/lib/supabase/server'
import { scoreDreamResonance } from '@/lib/social'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { dream_a_id, dream_b_id } = await req.json()
  if (!dream_a_id || !dream_b_id) {
    return NextResponse.json({ error: 'Missing dream IDs' }, { status: 400 })
  }

  // Check cache first
  const { data: cached } = await supabase
    .from('resonance_scores')
    .select('*')
    .or(`and(dream_a_id.eq.${dream_a_id},dream_b_id.eq.${dream_b_id}),and(dream_a_id.eq.${dream_b_id},dream_b_id.eq.${dream_a_id})`)
    .single()

  if (cached) return NextResponse.json(cached)

  // Fetch both dreams
  const [{ data: dreamA }, { data: dreamB }] = await Promise.all([
    supabase.from('dreams').select('*').eq('id', dream_a_id).single(),
    supabase.from('dreams').select('*').eq('id', dream_b_id).single(),
  ])

  if (!dreamA || !dreamB) {
    return NextResponse.json({ error: 'Dream not found' }, { status: 404 })
  }

  const result = await scoreDreamResonance(dreamA, dreamB)

  const { data: score, error } = await supabase
    .from('resonance_scores')
    .insert({ dream_a_id, dream_b_id, score: result.score })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...score, reasoning: result.reasoning })
}