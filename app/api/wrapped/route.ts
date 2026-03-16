import { createClient } from '@/lib/supabase/server'
import { generateWrappedEssence } from '@/lib/social'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Check for cached snapshot
  const { data: existing } = await supabase
    .from('wrapped_snapshots')
    .select('*')
    .eq('user_id', user.id)
    .eq('month', month)
    .single()

  if (existing) return NextResponse.json(existing)

  // Gather this month's dreams
  const startOfMonth = `${month}-01`
  const { data: dreams } = await supabase
    .from('dreams')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth)
    .order('created_at', { ascending: false })

  if (!dreams || dreams.length === 0) {
    return NextResponse.json({ error: 'No dreams this month yet' }, { status: 404 })
  }

  // Compute stats
  const archetypeCount: Record<string, number> = {}
  const symbolCount: Record<string, number> = {}

  for (const dream of dreams) {
    for (const a of dream.archetypes) {
      archetypeCount[a] = (archetypeCount[a] || 0) + 1
    }
    for (const s of dream.symbols) {
      symbolCount[s] = (symbolCount[s] || 0) + 1
    }
  }

  const topArchetype = Object.entries(archetypeCount).sort((a, b) => b[1] - a[1])[0]?.[0] || null
  const topSymbols = Object.entries(symbolCount).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([s]) => s)

  const mostResonated = [...dreams].sort((a, b) => b.resonance_count - a.resonance_count)[0]

  const { data: twin } = await supabase
    .from('dream_twin_matches')
    .select('twin_user_id')
    .eq('user_id', user.id)
    .order('similarity_score', { ascending: false })
    .limit(1)
    .single()

  const dreamIds = dreams.map(d => d.id)
  const { data: worldMemberships } = await supabase
    .from('dreamworld_dreams')
    .select('dreamworld_id, dreamworlds(title)')
    .in('dream_id', dreamIds)

  const dreamworldTitles = [...new Set(
    (worldMemberships || []).map((m: any) => m.dreamworlds?.title).filter(Boolean)
  )] as string[]

  const { data: profile } = await supabase
    .from('profiles')
    .select('streak')
    .eq('id', user.id)
    .single()

  const essenceSummary = await generateWrappedEssence({
    dreamCount: dreams.length,
    topArchetype: topArchetype as any,
    topSymbols,
    streakPeak: profile?.streak || 0,
    dreamworldTitles,
    month,
  })

  const { data: snapshot, error } = await supabase
    .from('wrapped_snapshots')
    .insert({
      user_id: user.id,
      month,
      top_archetype: topArchetype,
      top_symbols: topSymbols,
      dream_count: dreams.length,
      streak_peak: profile?.streak || 0,
      most_resonated_dream_id: mostResonated?.id || null,
      twin_user_id: twin?.twin_user_id || null,
      dreamworld_titles: dreamworldTitles,
      essence_summary: essenceSummary,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(snapshot)
}