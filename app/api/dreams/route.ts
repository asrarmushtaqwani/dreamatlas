import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const archetype = searchParams.get('archetype')

    const supabase = await createClient()
    let query = supabase
      .from('dreams')
      .select('id, text, essence, archetypes, map_x, map_y, created_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(500)

    if (archetype) {
      query = query.contains('archetypes', [archetype])
    }

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
