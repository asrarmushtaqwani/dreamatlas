import { createClient } from '@/lib/supabase/server'
import { buildArchetypeFingerprint, scoreTwinSimilarity } from '@/lib/social'
import { NextRequest, NextResponse } from 'next/server'
import { Dream } from '@/types'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch current user's dreams
  const { data: myDreams } = await supabase
    .from('dreams')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  if (!myDreams || myDreams.length < 3) {
    return NextResponse.json({ error: 'Log at least 3 dreams to find your twin' }, { status: 400 })
  }

  const myFingerprint = buildArchetypeFingerprint(myDreams)
  const mySymbols = [...new Set(myDreams.flatMap(d => d.symbols))].slice(0, 10)

  // Get candidate users (exclude self, sample up to 100)
  const { data: candidates } = await supabase
    .from('profiles')
    .select('id')
    .neq('id', user.id)
    .limit(100)

  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ error: 'No candidates yet' }, { status: 404 })
  }

  let bestScore = -1
  let bestTwinId = ''
  let bestResult = null

  const sample = candidates.slice(0, 10)
  for (const candidate of sample) {
    const { data: theirDreams } = await supabase
      .from('dreams')
      .select('*')
      .eq('user_id', candidate.id)
      .eq('is_public', true)
      .limit(50)

    if (!theirDreams || theirDreams.length < 3) continue

    const theirFingerprint = buildArchetypeFingerprint(theirDreams)
    const theirSymbols = [...new Set(theirDreams.flatMap((d: Dream) => d.symbols))].slice(0, 10)

    const result = await scoreTwinSimilarity(myFingerprint, theirFingerprint, mySymbols, theirSymbols)

    if (result.similarity_score > bestScore) {
      bestScore = result.similarity_score
      bestTwinId = candidate.id
      bestResult = result
    }
  }

  if (!bestResult || bestScore < 0.3) {
    return NextResponse.json({ error: 'No strong twin found yet — keep dreaming' }, { status: 404 })
  }

  const { data: match, error } = await supabase
    .from('dream_twin_matches')
    .upsert({
      user_id: user.id,
      twin_user_id: bestTwinId,
      similarity_score: bestScore,
      shared_archetypes: bestResult.shared_archetypes,
    }, { onConflict: 'user_id,twin_user_id' })
    .select(`*, twin_profile:profiles!dream_twin_matches_twin_user_id_fkey(dream_name, avatar_color)`)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ...match, reasoning: bestResult.reasoning })
}