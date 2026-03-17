'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DreamTwinMatch } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

type TwinState = 'idle' | 'loading' | 'found' | 'error' | 'none'

export default function TwinsPage() {
  const [state, setState]           = useState<TwinState>('idle')
  const [twin, setTwin]             = useState<DreamTwinMatch | null>(null)
  const [reasoning, setReasoning]   = useState('')
  const [error, setError]           = useState('')
  const [myDreamCount, setMyDreamCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ count }, { data: existing }] = await Promise.all([
        supabase.from('dreams').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('dream_twin_matches')
          .select('*, twin_profile:profiles!dream_twin_matches_twin_user_id_fkey(dream_name, avatar_color)')
          .eq('user_id', user.id)
          .order('similarity_score', { ascending: false })
          .limit(1).single(),
      ])
      setMyDreamCount(count || 0)
      if (existing) { setTwin(existing as any); setState('found') }
    }
    init()
  }, [])

  async function findTwin() {
    setState('loading'); setError('')
    try {
      const res  = await fetch('/api/twins', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); setState('error'); return }
      setTwin(data); setReasoning(data.reasoning || ''); setState('found')
    } catch {
      setError('Connection failed'); setState('error')
    }
  }

  const tooFew    = myDreamCount < 3
  const accentCol = (twin as any)?.twin_profile?.avatar_color || 'var(--accent)'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', paddingBottom: 80 }}>

      {/* Ambient */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 55% 45% at 50% 35%, var(--accent-glow), transparent 65%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 500, margin: '0 auto', padding: '56px 24px' }}>

        {/* Back */}
        <Link href="/map" style={{
          color: 'var(--text-tertiary)', fontSize: 11, letterSpacing: '0.1em',
          textTransform: 'uppercase', textDecoration: 'none',
          display: 'block', marginBottom: 40, transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
        >
          ← Atlas
        </Link>

        {/* Header */}
        <div className="stagger" style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="animate-fade-up label" style={{ marginBottom: 16 }}>Dream Twins</div>
          <h1 className="animate-fade-up" style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 44px)',
            fontWeight: 500, fontStyle: 'italic', lineHeight: 1.15,
            letterSpacing: '-0.02em', marginBottom: 14,
          }}>
            Your unconscious<br />doppelgänger
          </h1>
          <p className="animate-fade-up" style={{
            color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7,
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          }}>
            Somewhere on earth, another mind dreams<br />the same territories you do.
          </p>
        </div>

        {/* States */}
        {state === 'idle' && (
          tooFew ? (
            <div className="card animate-scale-in" style={{ padding: '24px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 8, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                Log {3 - myDreamCount} more dream{3 - myDreamCount !== 1 ? 's' : ''} to find your twin.
              </p>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 13 }}>
                Twins are matched by comparing archetype fingerprints.
              </p>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }} className="animate-fade-up">
              <button
                onClick={findTwin}
                className="btn-accent-outline"
                style={{ padding: '13px 36px', fontSize: 14, letterSpacing: '0.06em' }}
              >
                Find my twin
              </button>
            </div>
          )
        )}

        {state === 'loading' && (
          <div style={{ textAlign: 'center' }} className="animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 14 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{
                  width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)',
                  animation: `thinkBounce 1.4s ease-in-out ${i * 0.18}s infinite`,
                }} />
              ))}
            </div>
            <p style={{ color: 'var(--text-tertiary)', fontSize: 13, letterSpacing: '0.1em', fontFamily: 'var(--font-body)' }}>
              scanning the collective unconscious…
            </p>
          </div>
        )}

        {state === 'error' && (
          <div style={{ textAlign: 'center' }} className="animate-fade-in">
            <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 16, fontFamily: 'var(--font-serif)' }}>
              {error}
            </p>
            <button onClick={() => setState('idle')} style={{
              color: 'var(--accent-light)', background: 'none', border: 'none',
              cursor: 'pointer', fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 3,
            }}>
              Try again
            </button>
          </div>
        )}

        {state === 'found' && twin && (
          <div className="animate-scale-in" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Twin card */}
            <div className="card" style={{
              padding: '32px 28px', textAlign: 'center',
              borderColor: typeof accentCol === 'string' && accentCol.startsWith('#') ? accentCol + '25' : 'var(--border)',
              background: `linear-gradient(135deg, var(--surface), ${typeof accentCol === 'string' && accentCol.startsWith('#') ? accentCol + '06' : 'transparent'})`,
            }}>
              {/* Avatar */}
              <div style={{
                width: 60, height: 60, borderRadius: '50%', margin: '0 auto 18px',
                background: typeof accentCol === 'string' && accentCol.startsWith('#') ? accentCol + '18' : 'var(--accent-dim)',
                border: `0.5px solid ${typeof accentCol === 'string' && accentCol.startsWith('#') ? accentCol + '35' : 'rgba(124,110,245,0.25)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22,
                boxShadow: `0 0 28px ${typeof accentCol === 'string' && accentCol.startsWith('#') ? accentCol + '20' : 'rgba(124,110,245,0.12)'}`,
              }}>
                🌙
              </div>

              <div className="label" style={{ marginBottom: 6 }}>Your twin</div>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 24,
                fontWeight: 500, fontStyle: 'italic', marginBottom: 20,
              }}>
                {(twin as any).twin_profile?.dream_name || 'unknown dreamer'}
              </h2>

              {/* Similarity bar */}
              <div style={{ marginBottom: 20, textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.1em', fontFamily: 'var(--font-body)' }}>
                    Unconscious similarity
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
                    {Math.round(twin.similarity_score * 100)}%
                  </span>
                </div>
                <div style={{ height: 2, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    width: `${twin.similarity_score * 100}%`,
                    background: typeof accentCol === 'string' && accentCol.startsWith('#') ? accentCol : 'var(--accent)',
                    boxShadow: `0 0 8px ${typeof accentCol === 'string' && accentCol.startsWith('#') ? accentCol : 'var(--accent)'}`,
                    transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                  }} />
                </div>
              </div>

              {/* Shared archetypes */}
              {twin.shared_archetypes?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div className="label" style={{ marginBottom: 10 }}>Shared territories</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {twin.shared_archetypes.map(a => {
                      const c = ARCHETYPE_COLORS[a] || 'var(--accent)'
                      return (
                        <span key={a} style={{
                          padding: '5px 14px', borderRadius: 40, fontSize: 11,
                          letterSpacing: '0.1em', textTransform: 'uppercase',
                          fontFamily: 'var(--font-body)', fontWeight: 500,
                          color: c, border: `0.5px solid ${c}35`, background: `${c}10`,
                        }}>
                          {a}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Reasoning */}
              {reasoning && (
                <p style={{
                  color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: 14,
                  lineHeight: 1.7, borderTop: '0.5px solid var(--border)',
                  paddingTop: 20, margin: 0, fontFamily: 'var(--font-serif)',
                }}>
                  "{reasoning}"
                </p>
              )}
            </div>

            <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12 }}>
              Twins are recalculated as new dreamers join.
            </p>
            <div style={{ textAlign: 'center' }}>
              <button onClick={findTwin} style={{
                color: 'var(--text-tertiary)', background: 'none', border: 'none',
                cursor: 'pointer', fontSize: 13, textDecoration: 'underline',
                textUnderlineOffset: 3, transition: 'color 0.2s',
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
              >
                Recalculate
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes thinkBounce {
          0%,100%{opacity:0.25;transform:translateY(0)}
          50%{opacity:1;transform:translateY(-5px)}
        }
      `}</style>
    </div>
  )
}