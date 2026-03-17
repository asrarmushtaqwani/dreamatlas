'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Dream, Archetype } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

const ACCENT = '#7dd3fc'
const FONT_DISPLAY = "'Fraunces', Georgia, serif"
const FONT_SERIF = "'Lora', Georgia, serif"

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7)  return `${d}d ago`
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export default function JournalPage() {
  const [dreams, setDreams]     = useState<Dream[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from('dreams').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => { setDreams(data || []); setLoading(false) })
    })
  }, [])

  const archetypes = [...new Set(dreams.flatMap(d => d.archetypes))] as Archetype[]
  const visible    = filter === 'all' ? dreams : dreams.filter(d => d.archetypes.includes(filter as Archetype))

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: '#0f0e0d' }}>

      {/* Header */}
      <div style={{ padding: '26px 24px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', position: 'sticky', top: 0, zIndex: 10, background: 'rgba(15,14,13,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontStyle: 'italic', fontWeight: 700, color: '#f0ece6', letterSpacing: '-0.02em' }}>
            Your journal
          </h1>
          {!loading && dreams.length > 0 && (
            <span style={{ fontSize: 13, color: 'rgba(240,236,230,0.28)' }}>{dreams.length} dream{dreams.length !== 1 ? 's' : ''}</span>
          )}
        </div>
        {archetypes.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 12 }}>
            <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
            {archetypes.map(a => (
              <button key={a} className={`chip ${filter === a ? 'active' : ''}`} onClick={() => setFilter(filter === a ? 'all' : a)}
                style={filter === a ? { borderColor: `${ARCHETYPE_COLORS[a]}45`, color: ARCHETYPE_COLORS[a], background: `${ARCHETYPE_COLORS[a]}10` } : {}}
              >{a}</button>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 56, color: 'rgba(240,236,230,0.25)', fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: ACCENT, animation: `thinkBounce 1.4s ease-in-out ${i * 0.15}s infinite` }} />)}
            </div>
            loading your dreams…
          </div>
        )}

        {!loading && dreams.length === 0 && (
          <div style={{ textAlign: 'center', padding: '72px 24px', animation: 'fadeUp 0.6s both' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', margin: '0 auto 20px', background: `${ACCENT}14`, border: `0.5px solid ${ACCENT}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: ACCENT }}>✦</div>
            <p style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 22, marginBottom: 8, color: 'rgba(240,236,230,0.45)' }}>No dreams yet</p>
            <p style={{ fontSize: 14, color: 'rgba(240,236,230,0.22)', marginBottom: 28 }}>Your journal awaits its first entry</p>
            <Link href="/log" style={{ textDecoration: 'none' }}><button className="btn-primary" style={{ width: 'auto', padding: '13px 28px' }}>Log your first dream</button></Link>
          </div>
        )}

        {visible.map((dream, idx) => {
          const isOpen  = expanded === dream.id
          const color   = ARCHETYPE_COLORS[dream.archetypes[0]] || ACCENT
          return (
            <div key={dream.id} onClick={() => setExpanded(isOpen ? null : dream.id)}
              style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 16, cursor: 'pointer',
                border: `0.5px solid ${isOpen ? color + '22' : 'rgba(255,255,255,0.07)'}`,
                overflow: 'hidden', position: 'relative',
                transition: 'border-color 0.25s, background 0.25s',
                animation: `fadeUp 0.5s cubic-bezier(0.16,1,0.3,1) ${Math.min(idx * 35, 280)}ms both`,
              }}
              onMouseEnter={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { if (!isOpen) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)' }}
            >
              {/* Left accent bar */}
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 2, background: `linear-gradient(180deg, ${color}70, ${color}18)`, borderRadius: '16px 0 0 16px', opacity: isOpen ? 1 : 0, transition: 'opacity 0.25s' }} />

              <div style={{ padding: '16px 18px 16px 22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 10 }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {dream.archetypes.slice(0, 2).map(a => {
                      const c = ARCHETYPE_COLORS[a] || ACCENT
                      return <span key={a} style={{ padding: '3px 11px', borderRadius: 40, fontSize: 11, background: `${c}12`, color: c, border: `0.5px solid ${c}30`, letterSpacing: '0.03em' }}>{a}</span>
                    })}
                    {dream.mood && <span style={{ padding: '3px 11px', borderRadius: 40, fontSize: 11, background: 'rgba(255,255,255,0.05)', color: 'rgba(240,236,230,0.28)', border: '0.5px solid rgba(255,255,255,0.08)' }}>{dream.mood}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: 'rgba(240,236,230,0.25)' }}>{timeAgo(dream.created_at)}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,236,230,0.25)" strokeWidth="1.5" strokeLinecap="round" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s', flexShrink: 0 }}><path d="M6 9l6 6 6-6"/></svg>
                  </div>
                </div>

                <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 15, color: 'rgba(240,236,230,0.5)', lineHeight: 1.65, overflow: isOpen ? 'visible' : 'hidden', display: isOpen ? 'block' : '-webkit-box', WebkitLineClamp: isOpen ? undefined : 2, WebkitBoxOrient: 'vertical' as any }}>
                  "{dream.text}"
                </p>

                {isOpen && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '0.5px solid rgba(255,255,255,0.07)', animation: 'fadeIn 0.3s ease' }}>
                    <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.22)', marginBottom: 7 }}>Essence</div>
                    <p style={{ fontFamily: FONT_DISPLAY, fontStyle: 'italic', fontSize: 16, fontWeight: 700, color: '#f0ece6', lineHeight: 1.6, marginBottom: 14, letterSpacing: '-0.01em' }}>{dream.essence}</p>
                    {dream.symbols?.length > 0 && (
                      <>
                        <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.22)', marginBottom: 8 }}>Symbols</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {dream.symbols.map(s => <span key={s} style={{ padding: '4px 12px', borderRadius: 8, fontSize: 12, background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.08)', color: 'rgba(240,236,230,0.4)' }}>{s}</span>)}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,700&family=Lora:ital@1&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes thinkBounce { 0%,100%{opacity:0.25;transform:translateY(0)} 50%{opacity:1;transform:translateY(-5px)} }
      `}</style>
    </div>
  )
}