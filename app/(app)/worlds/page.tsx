'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import { Archetype } from '@/types'

const WORLDS: { archetype: Archetype; description: string; symbol: string; dreamCount: number }[] = [
  { archetype: 'Transcendence', symbol: '✦', description: 'Rising above, dissolving into light, ego released', dreamCount: 0 },
  { archetype: 'Voyage',        symbol: '⊸', description: 'Journeys into the unknown, ships, open horizons', dreamCount: 0 },
  { archetype: 'Fear',          symbol: '◉', description: 'Chases, falling, darkness at the edge of sleep', dreamCount: 0 },
  { archetype: 'Nature',        symbol: '◈', description: 'Forests, water, animals, the living world', dreamCount: 0 },
  { archetype: 'Transformation',symbol: '◎', description: 'Becoming something else, metamorphosis, rebirth', dreamCount: 0 },
  { archetype: 'Shadow',        symbol: '◑', description: 'The hidden self, doors, infinite corridors', dreamCount: 0 },
  { archetype: 'Anima',         symbol: '◐', description: 'The inner feminine, moonlight, the soul', dreamCount: 0 },
  { archetype: 'Trickster',     symbol: '◒', description: 'Paradox, impossible rooms, time behaving strangely', dreamCount: 0 },
  { archetype: 'Void',          symbol: '○', description: 'Emptiness, dissolution, the infinite unknown', dreamCount: 0 },
]

interface WorldDream {
  id: string
  text: string
  essence: string
  created_at: string
}

export default function WorldsPage() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [selected, setSelected] = useState<Archetype | null>(null)
  const [worldDreams, setWorldDreams] = useState<WorldDream[]>([])
  const [loadingDreams, setLoadingDreams] = useState(false)

  useEffect(() => {
    fetch('/api/dreams')
      .then(r => r.json())
      .then((data: any[]) => {
        const c: Record<string, number> = {}
        data.forEach(d => { const a = d.archetypes?.[0]; if (a) c[a] = (c[a] || 0) + 1 })
        setCounts(c)
      })
      .catch(() => {})
  }, [])

  async function enterWorld(archetype: Archetype) {
    setSelected(archetype)
    setLoadingDreams(true)
    try {
      const res = await fetch(`/api/dreams?archetype=${archetype}`)
      const data = await res.json()
      setWorldDreams(data.slice(0, 20))
    } catch {
      setWorldDreams([])
    }
    setLoadingDreams(false)
  }

  if (selected) {
    const world = WORLDS.find(w => w.archetype === selected)!
    const col = ARCHETYPE_COLORS[selected] || 'var(--accent)'
    return (
      <div style={{ minHeight: '100vh', padding: '0 0 100px' }}>
        <div style={{ padding: '20px 20px 0' }}>
          <button
            onClick={() => setSelected(null)}
            style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}
          >
            ← all worlds
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: `${col}20`, border: `0.5px solid ${col}50`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, color: col,
            }}>
              {world.symbol}
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontStyle: 'italic' }}>
                The {selected} World
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 2 }}>
                {counts[selected] || 0} dreams · {world.description}
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderBottom: '0.5px solid var(--border)', margin: '16px 0' }} />

        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {loadingDreams && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-tertiary)', fontSize: 14 }}>entering the world...</div>
          )}
          {!loadingDreams && worldDreams.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--text-secondary)', marginBottom: 8 }}>
                This world is quiet
              </div>
              <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>Be the first to dream here</div>
              <Link href="/log">
                <button className="btn-primary" style={{ width: 'auto', padding: '12px 28px' }}>Log a dream</button>
              </Link>
            </div>
          )}
          {worldDreams.map((dream, i) => (
            <div key={dream.id} className="card" style={{ padding: '16px 18px', animationDelay: `${i * 0.05}s` }} >
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: dream.essence ? 10 : 0 }}>
                "{dream.text?.slice(0, 140)}{(dream.text?.length || 0) > 140 ? '...' : ''}"
              </div>
              {dream.essence && (
                <div style={{ fontSize: 12, color: col, borderTop: `0.5px solid ${col}25`, paddingTop: 8 }}>
                  {dream.essence}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 100px' }}>
      <div style={{ padding: '28px 24px 20px', borderBottom: '0.5px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontStyle: 'italic', fontWeight: 300, marginBottom: 4 }}>
          Dreamworlds
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
          Archetypal spaces where dreams of the same kind gather
        </div>
      </div>

      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {WORLDS.map(world => {
          const col = ARCHETYPE_COLORS[world.archetype] || 'var(--accent)'
          const count = counts[world.archetype] || 0
          return (
            <button
              key={world.archetype}
              onClick={() => enterWorld(world.archetype)}
              className="card"
              style={{
                padding: '16px 18px', cursor: 'pointer', textAlign: 'left',
                display: 'flex', alignItems: 'center', gap: 14, background: 'none',
                width: '100%', border: '0.5px solid var(--border)', borderRadius: 14,
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = col + '60'; (e.currentTarget as HTMLElement).style.background = col + '08' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                background: `${col}18`, border: `0.5px solid ${col}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18, color: col,
              }}>
                {world.symbol}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3 }}>
                  {world.archetype}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                  {world.description}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-tertiary)', flexShrink: 0 }}>
                {count > 0 ? `${count} dreams` : 'empty'}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
