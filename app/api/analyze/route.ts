import { NextRequest, NextResponse } from 'next/server'
import { analyzeDream } from '@/lib/dreams'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { text, mood } = await req.json()
    if (!text || text.length < 10) {
      return NextResponse.json({ error: 'Dream text too short' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set')
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 })
    }

    const analysis = await analyzeDream(text, mood || '')

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
    } catch (_) {}

    return NextResponse.json(analysis)
  } catch (err: any) {
    console.error('Analysis error:', err?.message || err)
    return NextResponse.json({ error: err?.message || 'Analysis failed' }, { status: 500 })
  }
}