'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dreamworld, Dream } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import Link from 'next/link'

const ACCENT = '#7dd3fc'
const FONT_DISPLAY = "'Fraunces', Georgia, serif"
const FONT_SERIF = "'Lora', Georgia, serif"

export default function DreamworldsPage() {
  const [worlds, setWorlds]   = useState<Dreamworld[]>([])
  const [selected, setSelected] = useState<Dreamworld | null>(null)
  const [dreams, setDreams]   = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [dreamsLoading, setDreamsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('dreamworlds').select('*').order('dream_count', { ascending: false })
      .then(({ data }) => { setWorlds(data || []); setLoading(false) })
  }, [])

  async function openWorld(world: Dreamworld) {
    setSelected(world); setDreamsLoading(true)
    const { data } = await supabase.from('dreamworld_dreams').select('dream_id, dreams(*)').eq('dreamworld_id', world.id).order('added_at', { ascending: false }).limit(20)
    setDreams((data || []).map((r: any) => r.dreams).filter(Boolean))
    setDreamsLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0e0d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(240,236,230,0.25)', fontSize: 12, letterSpacing: '0.2em' }}>opening the worlds…</div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f0e0d', color: '#f0ece6', paddingBottom: 80 }}>
      {/* Header */}
      <div style={{ padding: '26px 24px 22px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(15,14,13,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <Link href="/map" style={{ color: 'rgba(240,236,230,0.25)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block', marginBottom: 10, transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.5)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.25)'}
        >← Atlas</Link>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 34, fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.02em', marginBottom: 4 }}>Dreamworlds</h1>
        <p style={{ color: 'rgba(240,236,230,0.35)', fontSize: 14, fontFamily: FONT_SERIF, fontStyle: 'italic' }}>Nine territories of the collective unconscious.</p>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {worlds.map((world, i) => {
            const color = ARCHETYPE_COLORS[world.archetype] || ACCENT
            const isSelected = selected?.id === world.id
            return (
              <button key={world.id} onClick={() => openWorld(world)} style={{
                textAlign: 'left', padding: '22px 20px', borderRadius: 18, cursor: 'pointer', width: '100%',
                border: `0.5px solid ${isSelected ? color + '28' : 'rgba(255,255,255,0.07)'}`,
                background: isSelected ? `linear-gradient(135deg, rgba(255,255,255,0.06), ${color}05)` : 'rgba(255,255,255,0.04)',
                transition: 'all 0.25s', position: 'relative', overflow: 'hidden',
                animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${Math.min(i * 40, 320)}ms both`,
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = color + '22'; el.style.background = `linear-gradient(135deg, rgba(255,255,255,0.06), ${color}04)` }}
                onMouseLeave={e => { if (!isSelected) { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.background = 'rgba(255,255,255,0.04)' } }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${color}40, transparent)`, opacity: isSelected ? 1 : 0, transition: 'opacity 0.25s' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 4, backgroundColor: color, boxShadow: `0 0 10px ${color}70` }} />
                  <span style={{ fontSize: 11, color: 'rgba(240,236,230,0.22)', letterSpacing: '0.08em' }}>{world.dream_count.toLocaleString()} dreams</span>
                </div>
                <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700, fontStyle: 'italic', margin: '0 0 4px', color: '#f0ece6', letterSpacing: '-0.01em' }}>{world.title}</h2>
                <div style={{ color, fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 10 }}>{world.archetype}</div>
                <p style={{ color: 'rgba(240,236,230,0.4)', fontSize: 13, lineHeight: 1.65, marginBottom: 10, fontFamily: FONT_SERIF, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>{world.description}</p>
                <div style={{ color: 'rgba(240,236,230,0.2)', fontSize: 11, fontStyle: 'italic', fontFamily: FONT_SERIF }}>{world.theme}</div>
              </button>
            )
          })}
        </div>

        {selected && (
          <div style={{ marginTop: 20, background: 'rgba(255,255,255,0.04)', border: `0.5px solid ${ARCHETYPE_COLORS[selected.archetype] || ACCENT}18`, borderRadius: 20, padding: '26px 22px', animation: 'fadeUp 0.4s both' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
              <div>
                <h3 style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, fontStyle: 'italic', marginBottom: 4, letterSpacing: '-0.01em' }}>{selected.title}</h3>
                <p style={{ color: 'rgba(240,236,230,0.38)', fontSize: 13, fontFamily: FONT_SERIF, fontStyle: 'italic' }}>{selected.description}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,236,230,0.25)', fontSize: 22, lineHeight: 1, padding: '0 4px', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f0ece6'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.25)'}
              >×</button>
            </div>
            {dreamsLoading ? (
              <div style={{ color: 'rgba(240,236,230,0.25)', fontSize: 12, letterSpacing: '0.2em', textAlign: 'center', padding: '24px 0' }}>summoning dreams…</div>
            ) : dreams.length === 0 ? (
              <div style={{ color: 'rgba(240,236,230,0.22)', textAlign: 'center', padding: '24px 0', fontStyle: 'italic', fontFamily: FONT_SERIF }}>No dreams have entered this world yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {dreams.map(dream => (
                  <div key={dream.id} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '14px 16px' }}>
                    <p style={{ color: 'rgba(240,236,230,0.5)', fontSize: 14, lineHeight: 1.65, marginBottom: 10, fontFamily: FONT_SERIF, fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>"{dream.text}"</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      {dream.archetypes.map(a => <span key={a} style={{ color: ARCHETYPE_COLORS[a] || ACCENT, fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600 }}>{a}</span>)}
                      <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
                      <p style={{ color: 'rgba(240,236,230,0.28)', fontSize: 12, fontStyle: 'italic', margin: 0, fontFamily: FONT_SERIF }}>"{dream.essence}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,700&family=Lora:ital@1&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}