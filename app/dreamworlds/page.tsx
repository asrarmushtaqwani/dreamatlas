'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dreamworld, Dream } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import Link from 'next/link'

export default function DreamworldsPage() {
  const [dreamworlds, setDreamworlds] = useState<Dreamworld[]>([])
  const [selected, setSelected] = useState<Dreamworld | null>(null)
  const [dreams, setDreams] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [dreamsLoading, setDreamsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('dreamworlds')
      .select('*')
      .order('dream_count', { ascending: false })
      .then(({ data }) => {
        setDreamworlds(data || [])
        setLoading(false)
      })
  }, [])

  async function openWorld(world: Dreamworld) {
    setSelected(world)
    setDreamsLoading(true)
    const { data } = await supabase
      .from('dreamworld_dreams')
      .select('dream_id, dreams(*)')
      .eq('dreamworld_id', world.id)
      .order('added_at', { ascending: false })
      .limit(20)
    setDreams((data || []).map((r: any) => r.dreams).filter(Boolean))
    setDreamsLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070710] flex items-center justify-center">
        <div className="text-[#8b6fff] text-sm tracking-[0.3em] uppercase animate-pulse">
          opening the worlds…
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070710] text-white font-['Crimson_Pro',_Georgia,_serif]">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(139,111,255,0.08),transparent)]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <div className="mb-16">
          <Link href="/map" className="text-[#8b6fff]/50 text-sm tracking-[0.2em] uppercase hover:text-[#8b6fff] transition-colors mb-8 inline-block">
            ← Atlas
          </Link>
          <h1 className="text-5xl font-light tracking-tight mb-3">Dreamworlds</h1>
          <p className="text-white/40 text-lg font-light max-w-lg">
            Nine territories of the collective unconscious. Every dream finds its home.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {dreamworlds.map((world) => {
            const color = ARCHETYPE_COLORS[world.archetype] || '#8b6fff'
            const isSelected = selected?.id === world.id
            return (
              <button
                key={world.id}
                onClick={() => openWorld(world)}
                className={`text-left p-8 rounded-2xl border transition-all duration-300 group relative overflow-hidden ${
                  isSelected
                    ? 'border-white/20 bg-white/[0.06]'
                    : 'border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
                }`}
              >
                {/* Glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at 30% 50%, ${color}08, transparent 70%)` }}
                />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                      style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
                    />
                    <span className="text-white/20 text-xs tracking-[0.2em] uppercase">
                      {world.dream_count.toLocaleString()} dreams
                    </span>
                  </div>

                  <h2 className="text-2xl font-light mb-1">{world.title}</h2>
                  <div
                    className="text-xs tracking-[0.2em] uppercase mb-3 font-sans"
                    style={{ color }}
                  >
                    {world.archetype}
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed line-clamp-2">
                    {world.description}
                  </p>

                  <div className="mt-5 text-xs text-white/20 italic">
                    {world.theme}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Dream panel */}
        {selected && (
          <div className="mt-12 border border-white/10 rounded-2xl p-8 bg-white/[0.02]">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-light">{selected.title}</h3>
                <p className="text-white/40 mt-1">{selected.description}</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-white/20 hover:text-white/60 transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>

            {dreamsLoading ? (
              <div className="text-white/30 text-sm tracking-widest animate-pulse py-8 text-center">
                summoning dreams…
              </div>
            ) : dreams.length === 0 ? (
              <div className="text-white/20 text-center py-8 italic">
                No dreams have entered this world yet.
              </div>
            ) : (
              <div className="grid gap-4">
                {dreams.map((dream) => {
                  const color = ARCHETYPE_COLORS[dream.archetypes[0]] || '#8b6fff'
                  return (
                    <div
                      key={dream.id}
                      className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] group hover:border-white/10 transition-colors"
                    >
                      <p className="text-white/70 text-sm leading-relaxed line-clamp-3 mb-3">
                        {dream.text}
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5">
                          {dream.archetypes.map((a) => (
                            <span
                              key={a}
                              className="text-xs tracking-wider uppercase font-sans"
                              style={{ color: ARCHETYPE_COLORS[a] || '#8b6fff' }}
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                        <span className="text-white/10">·</span>
                        <p className="text-white/30 text-xs italic flex-1 truncate">
                          "{dream.essence}"
                        </p>
                        <span className="text-white/20 text-xs font-sans">
                          {dream.resonance_count} resonances
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}