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
      <div style={{
        minHeight: '100vh', background: '#070710',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ color: 'rgba(139,111,255,0.5)', fontSize: 12, letterSpacing: '0.3em', textTransform: 'uppercase' }}>
          opening the worlds…
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#070710', color: 'white', fontFamily: "'Crimson Pro', Georgia, serif" }}>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 56 }}>
          <Link href="/map" style={{
            color: 'rgba(139,111,255,0.4)', fontSize: 12, letterSpacing: '0.2em',
            textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block', marginBottom: 24,
          }}>
            ← Atlas
          </Link>
          <h1 style={{ fontSize: 44, fontWeight: 300, letterSpacing: '-0.5px', margin: '0 0 8px' }}>
            Dreamworlds
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 18, fontWeight: 300, margin: 0 }}>
            Nine territories of the collective unconscious. Every dream finds its home.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 12 }}>
          {dreamworlds.map((world) => {
            const color = ARCHETYPE_COLORS[world.archetype] || '#8b6fff'
            const isSelected = selected?.id === world.id
            return (
              <button
                key={world.id}
                onClick={() => openWorld(world)}
                style={{
                  textAlign: 'left', padding: 28, borderRadius: 16,
                  border: `0.5px solid ${isSelected ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.06)'}`,
                  background: isSelected ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer', transition: 'all 0.2s', width: '100%',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'
                    ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)'
                  }
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 6, backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
                  <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
                    {world.dream_count.toLocaleString()} dreams
                  </span>
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 300, margin: '0 0 4px', color: 'white' }}>{world.title}</h2>
                <div style={{ color, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif', marginBottom: 10 }}>
                  {world.archetype}
                </div>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.6, margin: '0 0 14px' }}>
                  {world.description}
                </p>
                <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, fontStyle: 'italic' }}>
                  {world.theme}
                </div>
              </button>
            )
          })}
        </div>

        {/* Dream panel */}
        {selected && (
          <div style={{ marginTop: 40, border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 32, background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
              <div>
                <h3 style={{ fontSize: 24, fontWeight: 300, margin: '0 0 6px', color: 'white' }}>{selected.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.35)', margin: 0, fontSize: 15 }}>{selected.description}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ color: 'rgba(255,255,255,0.2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 24, lineHeight: 1, padding: 4 }}>
                ×
              </button>
            </div>
            {dreamsLoading ? (
              <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, letterSpacing: '0.3em', textAlign: 'center', padding: '32px 0' }}>
                summoning dreams…
              </div>
            ) : dreams.length === 0 ? (
              <div style={{ color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '32px 0', fontStyle: 'italic' }}>
                No dreams have entered this world yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dreams.map((dream) => (
                  <div key={dream.id} style={{ padding: 18, borderRadius: 12, border: '0.5px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)' }}>
                    <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 14, lineHeight: 1.6, margin: '0 0 10px' }}>
                      {dream.text}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {dream.archetypes.map((a) => (
                          <span key={a} style={{ color: ARCHETYPE_COLORS[a] || '#8b6fff', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'sans-serif' }}>
                            {a}
                          </span>
                        ))}
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontStyle: 'italic', margin: 0 }}>
                        "{dream.essence}"
                      </p>
                      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, fontFamily: 'sans-serif' }}>
                        {dream.resonance_count} resonances
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}