'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WrappedSnapshot } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import Link from 'next/link'

type WrappedState = 'loading' | 'generating' | 'found' | 'none' | 'error'

function getMonthName(str: string) {
  const [y, m] = str.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
}

export default function WrappedPage() {
  const [state, setState]   = useState<WrappedState>('loading')
  const [wrapped, setWrapped] = useState<WrappedSnapshot | null>(null)
  const [error, setError]   = useState('')
  const supabase = createClient()

  useEffect(() => { generate() }, [])

  async function generate() {
    setState('generating')
    try {
      const res  = await fetch('/api/wrapped')
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 404) { setState('none'); return }
        setError(data.error || 'Failed'); setState('error')
        return
      }
      setWrapped(data); setState('found')
    } catch { setError('Connection failed'); setState('error') }
  }

  const accent = wrapped?.top_archetype ? ARCHETYPE_COLORS[wrapped.top_archetype] : 'var(--accent)'

  if (state === 'loading' || state === 'generating') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 3, height: 28, borderRadius: 2,
            background: 'var(--accent)',
            animation: `wave 1.2s ease-in-out ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
      <p style={{ color: 'var(--text-tertiary)', fontSize: 13, letterSpacing: '0.1em', fontFamily: 'var(--font-body)' }}>
        {state === 'generating' ? 'weaving your month together…' : 'opening your wrapped…'}
      </p>
      <style>{`@keyframes wave{0%,100%{transform:scaleY(0.4);opacity:0.3}50%{transform:scaleY(1);opacity:1}}`}</style>
    </div>
  )

  if (state === 'none') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 20, fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 16 }}>
        No dreams logged this month yet.
      </p>
      <Link href="/log" style={{ color: 'var(--accent-light)', fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 3 }}>
        Log your first dream →
      </Link>
    </div>
  )

  if (state === 'error') return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{error}</p>
      <button onClick={generate} style={{ color: 'var(--accent-light)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>
        Try again
      </button>
    </div>
  )

  if (!wrapped) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', padding: '56px 24px 80px' }}>
      {/* Ambient */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 60% 45% at 50% 25%, ${typeof accent === 'string' && accent.startsWith('#') ? accent + '09' : 'var(--accent-glow)'}, transparent)`,
      }} />

      <div style={{ position: 'relative', maxWidth: 460, margin: '0 auto' }}
        className="animate-fade-up"
      >
        <Link href="/journal" style={{
          color: 'var(--text-tertiary)', fontSize: 11, letterSpacing: '0.1em',
          textTransform: 'uppercase', textDecoration: 'none',
          display: 'inline-block', marginBottom: 32, transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
        >
          ← Journal
        </Link>

        {/* Main card */}
        <div style={{
          borderRadius: 24,
          border: `0.5px solid ${typeof accent === 'string' && accent.startsWith('#') ? accent + '22' : 'var(--border)'}`,
          overflow: 'hidden',
          background: `linear-gradient(160deg, var(--surface) 0%, var(--bg) 60%, ${typeof accent === 'string' && accent.startsWith('#') ? accent + '07' : 'transparent'} 100%)`,
          boxShadow: 'var(--shadow-md)',
          position: 'relative',
        }}>
          {/* Top edge glow */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 1,
            background: `linear-gradient(90deg, transparent 10%, ${typeof accent === 'string' && accent.startsWith('#') ? accent + '50' : 'var(--accent)'} 50%, transparent 90%)`,
          }} />

          <div style={{ padding: '32px 30px' }}>

            {/* Month label */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
              fontFamily: 'var(--font-body)', fontWeight: 500,
              color: typeof accent === 'string' && accent.startsWith('#') ? accent : 'var(--accent)',
              marginBottom: 24,
            }}>
              <span>✦</span>
              <span>Dream Wrapped · {getMonthName(wrapped.month)}</span>
            </div>

            {/* Dream count */}
            <div style={{ marginBottom: 22 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 72, fontWeight: 600,
                lineHeight: 1, letterSpacing: '-0.03em',
                color: typeof accent === 'string' && accent.startsWith('#') ? accent : 'var(--accent)',
                marginBottom: 6,
              }}>
                {wrapped.dream_count}
              </div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: 13, letterSpacing: '0.06em', fontFamily: 'var(--font-body)' }}>
                dream{wrapped.dream_count !== 1 ? 's' : ''} this month
              </div>
            </div>

            <hr className="divider-fade" style={{ marginBottom: 22 }} />

            {/* Top archetype */}
            {wrapped.top_archetype && (
              <div style={{ marginBottom: 22 }}>
                <div className="label" style={{ marginBottom: 7 }}>Dominant archetype</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 500,
                  fontStyle: 'italic',
                  color: typeof accent === 'string' && accent.startsWith('#') ? accent : 'var(--accent)',
                }}>
                  {wrapped.top_archetype}
                </div>
              </div>
            )}

            {/* Symbols */}
            {wrapped.top_symbols?.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div className="label" style={{ marginBottom: 10 }}>Recurring symbols</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {wrapped.top_symbols.map((sym, i) => (
                    <span key={sym} style={{
                      padding: '5px 14px', borderRadius: 40, fontSize: 13,
                      border: '0.5px solid var(--border-mid)',
                      color: `var(--text-${i === 0 ? 'primary' : i < 3 ? 'secondary' : 'tertiary'})`,
                      background: 'var(--surface2)',
                      fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                    }}>
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Streak */}
            {wrapped.streak_peak > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div className="label" style={{ marginBottom: 7 }}>Longest streak</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500 }}>
                  {wrapped.streak_peak} consecutive {wrapped.streak_peak === 1 ? 'day' : 'days'}
                </div>
              </div>
            )}

            {/* Dreamworlds */}
            {wrapped.dreamworld_titles?.length > 0 && (
              <div style={{ marginBottom: 22 }}>
                <div className="label" style={{ marginBottom: 10 }}>Dreamworlds entered</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {wrapped.dreamworld_titles.map(t => (
                    <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'var(--text-secondary)', fontSize: 14, fontFamily: 'var(--font-serif)' }}>
                      <span style={{ color: typeof accent === 'string' && accent.startsWith('#') ? accent : 'var(--accent)', fontSize: 10 }}>✦</span>
                      {t}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="divider-fade" style={{ marginBottom: 22 }} />

            {/* Essence */}
            {wrapped.essence_summary && (
              <p style={{
                color: 'var(--text-secondary)', fontSize: 15, fontStyle: 'italic',
                lineHeight: 1.8, margin: '0 0 24px',
                fontFamily: 'var(--font-display)', fontWeight: 400,
              }}>
                "{wrapped.essence_summary}"
              </p>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 10, letterSpacing: '0.2em', fontFamily: 'var(--font-body)', textTransform: 'uppercase' }}>
                DreamAtlas
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0.3, 0.5, 0.8].map((op, i) => (
                  <div key={i} style={{
                    width: 4, height: 4, borderRadius: '50%',
                    background: typeof accent === 'string' && accent.startsWith('#') ? accent : 'var(--accent)',
                    opacity: op,
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom links */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[{ href: '/journal', label: 'Journal' }, { href: '/dreamworlds', label: 'Worlds' }, { href: '/twins', label: 'Twins' }].map(({ href, label }) => (
              <Link key={href} href={href} style={{
                color: 'var(--text-tertiary)', fontSize: 13, textDecoration: 'none',
                letterSpacing: '0.04em', transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}