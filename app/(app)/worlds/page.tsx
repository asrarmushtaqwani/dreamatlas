'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import { Archetype } from '@/types'

const WORLDS: { archetype: Archetype; tagline: string; description: string }[] = [
  { archetype: 'Transcendence', tagline: 'rising above everything',        description: 'Dreams of flight, dissolution, spiritual revelation — the ego loosening its grip.' },
  { archetype: 'Voyage',        tagline: 'journeys without maps',          description: 'Ships, roads, unknown destinations. The pull toward somewhere you have never been.' },
  { archetype: 'Fear',          tagline: 'what chases us in the dark',     description: 'Pursuit, paralysis, the shadow at the end of the hallway. The unconscious confronting itself.' },
  { archetype: 'Nature',        tagline: 'the living world speaks',        description: 'Forests, oceans, animals with human eyes. The world before words existed.' },
  { archetype: 'Transformation',tagline: 'becoming someone else entirely', description: 'Shape-shifting, metamorphosis, waking up as something new.' },
  { archetype: 'Shadow',        tagline: 'the hidden rooms of the self',   description: 'Dark corridors, locked doors, the parts of yourself you have not met yet.' },
  { archetype: 'Anima',         tagline: "the soul's inner voice",         description: 'The deep feminine presence — intuition, wisdom, mystery dreaming through you.' },
  { archetype: 'Trickster',     tagline: 'nothing is what it seems',       description: 'Absurdity, paradox, reality bending its own rules.' },
  { archetype: 'Void',          tagline: 'the infinite and the empty',     description: 'Dissolution into nothingness. The terrifying and peaceful end of the self.' },
]

interface WorldDream {
  id: string
  text: string
  essence: string
  created_at: string
}

export default function WorldsPage() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [entered, setEntered] = useState<Archetype | null>(null)
  const [worldDreams, setWorldDreams] = useState<WorldDream[]>([])
  const [loadingDreams, setLoadingDreams] = useState(false)
  const [totalDreams, setTotalDreams] = useState(0)

  useEffect(() => {
    fetch('/api/dreams')
      .then(r => r.json())
      .then((data: any[]) => {
        setTotalDreams(data.length)
        const c: Record<string, number> = {}
        data.forEach(d => {
          const archetypes = d.archetypes || []
          archetypes.forEach((a: string) => {
            c[a] = (c[a] || 0) + 1
          })
        })
        setCounts(c)
      })
      .catch(() => {})
  }, [])

  async function enterWorld(archetype: Archetype) {
    setEntered(archetype)
    setLoadingDreams(true)
    setWorldDreams([])
    try {
      const res = await fetch(`/api/dreams?archetype=${archetype}`)
      const data = await res.json()
      setWorldDreams(data.slice(0, 30))
    } catch {
      setWorldDreams([])
    }
    setLoadingDreams(false)
  }

  function timeAgo(iso: string) {
    const diff = Date.now() - new Date(iso).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    if (d < 7) return `${d}d ago`
    return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' })
  }

  if (entered) {
    const world = WORLDS.find(w => w.archetype === entered)!
    const col = ARCHETYPE_COLORS[entered] || 'var(--accent)'
    const count = counts[entered] || 0
    return (
      <div style={{ minHeight: '100vh', paddingBottom: 100 }}>
        <div style={{ padding: '20px 24px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setEntered(null)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 13 }}>← worlds</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 9, height: 9, borderRadius: '50%', background: col }} />
            <span style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--text-primary)' }}>{entered}</span>
          </div>
        </div>
        <div style={{ padding: '24px 24px 0' }}>
          <div style={{ background: `${col}10`, border: `0.5px solid ${col}30`, borderRadius: 14, padding: '18px 22px', marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{world.description}</div>
            <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-tertiary)' }}>{count} dream{count !== 1 ? 's' : ''} · {world.tagline}</div>
          </div>
          <div style={{ fontSize: 11, letterSpacing: '2px', color: 'var(--text-tertiary)', marginBottom: 14 }}>DREAMS IN THIS WORLD</div>
          {loadingDreams && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-tertiary)', fontSize: 14 }}>entering the world...</div>
          )}
          {!loadingDreams && worldDreams.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--text-secondary)', marginBottom: 8 }}>This world is quiet</div>
              <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 24 }}>Be the first to dream here</div>
              <Link href="/log"><button style={{ padding: '12px 28px', background: col, border: 'none', borderRadius: 12, color: 'white', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, cursor: 'pointer' }}>Log a dream</button></Link>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {worldDreams.map((dream) => (
              <div key={dream.id} className="card" style={{ padding: '16px 18px' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: dream.essence ? 10 : 0 }}>
                  "{dream.text?.slice(0, 160)}{(dream.text?.length || 0) > 160 ? '...' : ''}"
                </div>
                {dream.essence && (
                  <div style={{ fontSize: 12, color: col, borderTop: `0.5px solid ${col}25`, paddingTop: 8, lineHeight: 1.5 }}>{dream.essence}</div>
                )}
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>anonymous dreamer</span>
                  <span>{timeAgo(dream.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100 }}>
      <div style={{ padding: '28px 24px 20px', borderBottom: '0.5px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontStyle: 'italic', fontWeight: 300, marginBottom: 4 }}>Dreamworlds</div>
        <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{totalDreams} dreams across {Object.keys(counts).length} archetypes</div>
      </div>
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {WORLDS.map(world => {
          const col = ARCHETYPE_COLORS[world.archetype] || '#8b6fff'
          const count = counts[world.archetype] || 0
          return (
            <button key={world.archetype} onClick={() => enterWorld(world.archetype)}
              style={{ padding: '16px 18px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 14, background: 'transparent', width: '100%', border: '0.5px solid var(--border)', borderRadius: 14, transition: 'all 0.2s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = col+'60'; el.style.background = col+'08' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.background = 'transparent' }}
            >
              <div style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0, background: `${col}18`, border: `0.5px solid ${col}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: col }} />
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3 }}>{world.archetype}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>{world.tagline}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 18, fontWeight: 300, color: count > 0 ? col : 'var(--text-tertiary)', fontFamily: 'var(--font-display)' }}>{count}</div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.5px' }}>{count === 1 ? 'dream' : 'dreams'}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}