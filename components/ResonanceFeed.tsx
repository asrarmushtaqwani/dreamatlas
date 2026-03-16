'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ResonanceScore, Dream } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

export default function ResonanceFeed() {
  const [pairs, setPairs] = useState<Array<ResonanceScore & { dream_a: Dream; dream_b: Dream }>>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('resonance_scores')
      .select(`
        *,
        dream_a:dreams!resonance_scores_dream_a_id_fkey(id, essence, archetypes, symbols),
        dream_b:dreams!resonance_scores_dream_b_id_fkey(id, essence, archetypes, symbols)
      `)
      .order('score', { ascending: false })
      .gte('score', 70)
      .limit(10)
      .then(({ data }) => {
        setPairs((data || []) as any)
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div className="text-white/20 text-sm animate-pulse tracking-widest font-sans">loading resonances…</div>
  )

  if (pairs.length === 0) return (
    <div className="text-white/20 text-sm italic">No resonances scored yet.</div>
  )

  return (
    <div className="space-y-3 font-['Crimson_Pro',_Georgia,_serif]">
      {pairs.map(pair => {
        const colorA = ARCHETYPE_COLORS[pair.dream_a?.archetypes?.[0]] || '#8b6fff'
        const colorB = ARCHETYPE_COLORS[pair.dream_b?.archetypes?.[0]] || '#8b6fff'
        return (
          <div
            key={pair.id}
            className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-white/20 text-xs font-sans tracking-wider">{pair.score}/100</span>
              <div className="h-px flex-1 mx-3 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-xs text-white/10 font-sans">resonance</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex gap-1 mb-1">
                  {pair.dream_a?.archetypes?.slice(0, 1).map(a => (
                    <span key={a} className="text-xs font-sans" style={{ color: colorA }}>{a}</span>
                  ))}
                </div>
                <p className="text-white/40 text-xs italic leading-snug line-clamp-2">
                  "{pair.dream_a?.essence}"
                </p>
              </div>
              <div>
                <div className="flex gap-1 mb-1">
                  {pair.dream_b?.archetypes?.slice(0, 1).map(a => (
                    <span key={a} className="text-xs font-sans" style={{ color: colorB }}>{a}</span>
                  ))}
                </div>
                <p className="text-white/40 text-xs italic leading-snug line-clamp-2">
                  "{pair.dream_b?.essence}"
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}