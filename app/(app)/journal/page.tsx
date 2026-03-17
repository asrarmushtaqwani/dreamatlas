'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Dream, Archetype } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

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
  const [dreams, setDreams]   = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter]   = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase
        .from('dreams').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => { setDreams(data || []); setLoading(false) })
    })
  }, [])

  const archetypes = [...new Set(dreams.flatMap(d => d.archetypes))] as Archetype[]
  const visible    = filter === 'all' ? dreams : dreams.filter(d => d.archetypes.includes(filter as Archetype))

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--bg)' }}>

      {/* ── Header ── */}
      <div style={{
        padding: '28px 28px 0',
        borderBottom: '0.5px solid var(--border)',
        paddingBottom: 20,
        position: 'sticky', top: 0, zIndex: 10,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 30, fontStyle: 'italic', fontWeight: 500,
            color: 'var(--text-primary)', letterSpacing: '-0.01em',
          }}>
            Your journal
          </h1>
          {!loading && dreams.length > 0 && (
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)', fontFamily: 'var(--font-body)' }}>
              {dreams.length} dream{dreams.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {archetypes.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 14 }}>
            <button
              className={`chip ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All
            </button>
            {archetypes.map(a => (
              <button
                key={a}
                className={`chip ${filter === a ? 'active' : ''}`}
                onClick={() => setFilter(filter === a ? 'all' : a)}
                style={filter === a ? {
                  borderColor: `${ARCHETYPE_COLORS[a]}50`,
                  color: ARCHETYPE_COLORS[a],
                  background: `${ARCHETYPE_COLORS[a]}12`,
                } : {}}
              >
                {a}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: 56, color: 'var(--text-tertiary)', fontSize: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--accent)',
                  animation: 'thinkBounce 1.4s ease-in-out infinite',
                  animationDelay: `${i * 0.15}s`,
                }} />
              ))}
            </div>
            loading your dreams…
          </div>
        )}

        {!loading && dreams.length === 0 && (
          <div style={{ textAlign: 'center', padding: '72px 24px' }}
            className="animate-fade-up"
          >
            <div style={{
              width: 56, height: 56, borderRadius: '50%', margin: '0 auto 20px',
              background: 'var(--accent-dim)',
              border: '0.5px solid rgba(124,110,245,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>
              ✦
            </div>
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 22, marginBottom: 8, color: 'var(--text-secondary)',
            }}>
              No dreams yet
            </p>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 28 }}>
              Your journal awaits its first entry
            </p>
            <Link href="/log" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ width: 'auto', padding: '13px 28px' }}>
                Log your first dream
              </button>
            </Link>
          </div>
        )}

        {visible.map((dream, idx) => {
          const isOpen = expanded === dream.id
          const primary = dream.archetypes[0]
          const color = ARCHETYPE_COLORS[primary] || 'var(--accent)'

          return (
            <div
              key={dream.id}
              className="card animate-fade-up"
              style={{
                padding: 0,
                cursor: 'pointer',
                overflow: 'hidden',
                animationDelay: `${Math.min(idx * 40, 300)}ms`,
                borderColor: isOpen ? `${color}20` : 'var(--border)',
                transition: 'border-color 0.25s, background 0.25s',
              }}
              onClick={() => setExpanded(isOpen ? null : dream.id)}
            >
              {/* Left accent bar */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
                background: `linear-gradient(180deg, ${color}80, ${color}20)`,
                borderRadius: '16px 0 0 16px',
                opacity: isOpen ? 1 : 0,
                transition: 'opacity 0.25s',
              }} />

              <div style={{ padding: '18px 20px 18px 24px' }}>
                {/* Top row */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'flex-start', marginBottom: 10, gap: 12,
                }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {dream.archetypes.slice(0, 2).map(a => {
                      const c = ARCHETYPE_COLORS[a] || 'var(--accent)'
                      return (
                        <span key={a} style={{
                          padding: '3px 11px', borderRadius: 40, fontSize: 11,
                          background: `${c}14`, color: c,
                          border: `0.5px solid ${c}35`,
                          fontFamily: 'var(--font-body)', letterSpacing: '0.03em',
                        }}>
                          {a}
                        </span>
                      )
                    })}
                    {dream.mood && (
                      <span style={{
                        padding: '3px 11px', borderRadius: 40, fontSize: 11,
                        background: 'var(--surface2)',
                        color: 'var(--text-tertiary)',
                        border: '0.5px solid var(--border)',
                        fontFamily: 'var(--font-body)',
                      }}>
                        {dream.mood}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <span style={{
                      fontSize: 11, color: 'var(--text-tertiary)',
                      fontFamily: 'var(--font-body)',
                    }}>
                      {timeAgo(dream.created_at)}
                    </span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round"
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                        transition: 'transform 0.25s',
                        flexShrink: 0,
                      }}
                    >
                      <path d="M6 9l6 6 6-6"/>
                    </svg>
                  </div>
                </div>

                {/* Dream text */}
                <p style={{
                  fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                  fontSize: 15, color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                  overflow: isOpen ? 'visible' : 'hidden',
                  display: isOpen ? 'block' : '-webkit-box',
                  WebkitLineClamp: isOpen ? undefined : 2,
                  WebkitBoxOrient: 'vertical' as any,
                }}>
                  "{dream.text}"
                </p>

                {/* Expanded detail */}
                {isOpen && (
                  <div style={{
                    marginTop: 18, paddingTop: 18,
                    borderTop: '0.5px solid var(--border)',
                    animation: 'fadeIn 0.3s ease',
                  }}>
                    {/* Essence */}
                    <div className="label" style={{ marginBottom: 7 }}>Essence</div>
                    <p style={{
                      fontFamily: 'var(--font-display)', fontStyle: 'italic',
                      fontSize: 16, color: 'var(--text-primary)',
                      lineHeight: 1.6, marginBottom: 16,
                    }}>
                      {dream.essence}
                    </p>

                    {/* Symbols */}
                    {dream.symbols?.length > 0 && (
                      <>
                        <div className="label" style={{ marginBottom: 8 }}>Symbols</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 0 }}>
                          {dream.symbols.map(s => (
                            <span key={s} style={{
                              padding: '4px 12px', borderRadius: 8, fontSize: 12,
                              background: 'var(--surface2)',
                              border: '0.5px solid var(--border-mid)',
                              color: 'var(--text-secondary)',
                              fontFamily: 'var(--font-body)',
                            }}>
                              {s}
                            </span>
                          ))}
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
        @keyframes thinkBounce {
          0%,100%{opacity:0.25;transform:translateY(0)}
          50%{opacity:1;transform:translateY(-5px)}
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
      `}</style>
    </div>
  )
}