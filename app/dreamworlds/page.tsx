'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dreamworld, Dream } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import Link from 'next/link'

export default function DreamworldsPage() {
  const [worlds, setWorlds]         = useState<Dreamworld[]>([])
  const [selected, setSelected]     = useState<Dreamworld | null>(null)
  const [dreams, setDreams]         = useState<Dream[]>([])
  const [loading, setLoading]       = useState(true)
  const [dreamsLoading, setDreamsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('dreamworlds').select('*')
      .order('dream_count', { ascending: false })
      .then(({ data }) => { setWorlds(data || []); setLoading(false) })
  }, [])

  async function openWorld(world: Dreamworld) {
    setSelected(world); setDreamsLoading(true)
    const { data } = await supabase
      .from('dreamworld_dreams').select('dream_id, dreams(*)')
      .eq('dreamworld_id', world.id)
      .order('added_at', { ascending: false }).limit(20)
    setDreams((data || []).map((r: any) => r.dreams).filter(Boolean))
    setDreamsLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--text-tertiary)', fontSize: 12, letterSpacing: '0.3em', fontFamily: 'var(--font-body)' }}>
        opening the worlds…
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', paddingBottom: 80 }}>

      {/* Header */}
      <div style={{
        padding: '28px 28px 24px',
        borderBottom: '0.5px solid var(--border)',
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <Link href="/map" style={{
          color: 'var(--text-tertiary)', fontSize: 11, letterSpacing: '0.1em',
          textTransform: 'uppercase', textDecoration: 'none',
          display: 'inline-block', marginBottom: 10, transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
        >
          ← Atlas
        </Link>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 500,
          fontStyle: 'italic', letterSpacing: '-0.01em', marginBottom: 4,
        }}>
          Dreamworlds
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 14, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
          Nine territories of the collective unconscious.
        </p>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '28px 24px' }}>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}
          className="stagger"
        >
          {worlds.map((world, i) => {
            const color = ARCHETYPE_COLORS[world.archetype] || 'var(--accent)'
            const isSelected = selected?.id === world.id
            return (
              <button
                key={world.id}
                onClick={() => openWorld(world)}
                className="card animate-fade-up"
                style={{
                  textAlign: 'left', padding: '24px 22px',
                  cursor: 'pointer', border: `0.5px solid ${isSelected ? color + '30' : 'var(--border)'}`,
                  background: isSelected ? `linear-gradient(135deg, var(--surface2), ${color}06)` : 'var(--surface)',
                  width: '100%', position: 'relative', overflow: 'hidden',
                  transition: 'all 0.25s',
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.borderColor = color + '25'
                  el.style.background = `linear-gradient(135deg, var(--surface2), ${color}05)`
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    const el = e.currentTarget as HTMLElement
                    el.style.borderColor = 'var(--border)'
                    el.style.background = 'var(--surface)'
                  }
                }}
              >
                {/* Color accent top */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: 2,
                  background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
                  opacity: isSelected ? 1 : 0, transition: 'opacity 0.25s',
                }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%', marginTop: 4,
                    backgroundColor: color,
                    boxShadow: `0 0 10px ${color}80`,
                  }} />
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 11, letterSpacing: '0.1em', fontFamily: 'var(--font-body)' }}>
                    {world.dream_count.toLocaleString()} dreams
                  </span>
                </div>

                <h2 style={{
                  fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 500,
                  fontStyle: 'italic', margin: '0 0 4px', color: 'var(--text-primary)',
                }}>
                  {world.title}
                </h2>
                <div style={{
                  color, fontSize: 10, letterSpacing: '0.14em',
                  textTransform: 'uppercase', fontFamily: 'var(--font-body)',
                  fontWeight: 500, marginBottom: 10,
                }}>
                  {world.archetype}
                </div>
                <p style={{
                  color: 'var(--text-secondary)', fontSize: 13,
                  lineHeight: 1.6, marginBottom: 12,
                  fontFamily: 'var(--font-serif)',
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as any, overflow: 'hidden',
                }}>
                  {world.description}
                </p>
                <div style={{ color: 'var(--text-tertiary)', fontSize: 11, fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
                  {world.theme}
                </div>
              </button>
            )
          })}
        </div>

        {/* Dream panel */}
        {selected && (
          <div className="card animate-fade-up" style={{
            marginTop: 24, padding: '28px 24px',
            borderColor: `${ARCHETYPE_COLORS[selected.archetype] || 'var(--accent)'}20`,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500,
                  fontStyle: 'italic', marginBottom: 4,
                }}>
                  {selected.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: 13, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                  {selected.description}
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--text-tertiary)', fontSize: 22, lineHeight: 1,
                padding: '0 4px', transition: 'color 0.2s', flexShrink: 0,
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
              >
                ×
              </button>
            </div>

            {dreamsLoading ? (
              <div style={{ color: 'var(--text-tertiary)', fontSize: 12, letterSpacing: '0.2em', textAlign: 'center', padding: '28px 0' }}>
                summoning dreams…
              </div>
            ) : dreams.length === 0 ? (
              <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '28px 0', fontStyle: 'italic', fontFamily: 'var(--font-serif)' }}>
                No dreams have entered this world yet.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {dreams.map(dream => (
                  <div key={dream.id} className="card" style={{ padding: '16px 18px' }}>
                    <p style={{
                      color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.65,
                      marginBottom: 10, fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                      display: '-webkit-box', WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical' as any, overflow: 'hidden',
                    }}>
                      "{dream.text}"
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {dream.archetypes.map(a => (
                          <span key={a} style={{
                            color: ARCHETYPE_COLORS[a] || 'var(--accent)',
                            fontSize: 10, letterSpacing: '0.12em',
                            textTransform: 'uppercase', fontFamily: 'var(--font-body)', fontWeight: 500,
                          }}>
                            {a}
                          </span>
                        ))}
                      </div>
                      <span style={{ color: 'var(--border-mid)' }}>·</span>
                      <p style={{ color: 'var(--text-tertiary)', fontSize: 12, fontStyle: 'italic', margin: 0, flex: 1, fontFamily: 'var(--font-serif)' }}>
                        "{dream.essence}"
                      </p>
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