import { NextRequest, NextResponse } from 'next/server'
import { analyzeDream } from '@/lib/dreams'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { text, mood } = await req.json()
    if (!text || text.length < 10) {
      return NextResponse.json({ error: 'Dream text too short' }, { status: 400 })
    }

    const analysis = await analyzeDream(text, mood || '')

    // Save to Supabase if user is logged in
    try {
      const supabase = await createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('dreams').insert({
          user_id: user.id,
          text,
          mood,
          archetypes: analysis.archetypes,
          symbols: analysis.symbols,
          essence: analysis.essence,
          map_x: analysis.map_x,
          map_y: analysis.map_y,
          is_public: true,
        })
      }
    } catch (_) {
      // Non-fatal: analysis still returns even if save fails
    }

    return NextResponse.json(analysis)
  } catch (err) {
    console.error('Analysis error:', err)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
