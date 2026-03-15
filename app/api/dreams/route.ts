import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('dreams')
      .select('id, text, archetypes, map_x, map_y, created_at')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) throw error
    return NextResponse.json(data || [])
  } catch {
    return NextResponse.json([], { status: 200 })
  }
}
