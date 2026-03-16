'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DreamTwinMatch } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

type TwinState = 'idle' | 'loading' | 'found' | 'error' | 'none'

export default function TwinsPage() {
  const [state, setState] = useState<TwinState>('idle')
  const [twin, setTwin] = useState<DreamTwinMatch | null>(null)
  const [reasoning, setReasoning] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [myDreamCount, setMyDreamCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ count }, { data: existing }] = await Promise.all([
        supabase.from('dreams').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase
          .from('dream_twin_matches')
          .select('*, twin_profile:profiles!dream_twin_matches_twin_user_id_fkey(dream_name, avatar_color)')
          .eq('user_id', user.id)
          .order('similarity_score', { ascending: false })
          .limit(1)
          .single(),
      ])
      setMyDreamCount(count || 0)
      if (existing) { setTwin(existing as any); setState('found') }
    }
    init()
  }, [])

  async function findTwin() {
    setState('loading')
    setError('')
    try {
      const res = await fetch('/api/twins', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); setState('error'); return }
      setTwin(data)
      setReasoning(data.reasoning || '')
      setState('found')
    } catch {
      setError('Connection failed')
      setState('error')
    }
  }

  const tooFewDreams = myDreamCount < 3
  const accentColor = (twin as any)?.twin_profile?.avatar_color || '#8b6fff'

  return (
    <div style={{
  minHeight: '100vh', background: '#070710', color: 'white',
  fontFamily: "'Crimson Pro', Georgia, serif",
  padding: '64px 24px',
}}>
      <div style={{ width: '100%', maxWidth: 480, textAlign: 'center', margin: '0 auto' }}>

        <Link href="/map" style={{
          color: 'rgba(139,111,255,0.4)', fontSize: 12, letterSpacing: '0.2em',
          textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block', marginBottom: 24,
        }}>
          ← Atlas
        </Link>

        <div style={{ color: 'rgba(139,111,255,0.4)', fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 24, fontFamily: 'sans-serif' }}>
          Dream Twins
        </div>

        <h1 style={{ fontSize: 36, fontWeight: 300, lineHeight: 1.2, margin: '0 0 16px' }}>
          Your unconscious<br />doppelgänger
        </h1>

        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 18, lineHeight: 1.6, margin: '0 0 48px' }}>
          Somewhere on earth, another mind dreams<br />the same territories you do.
        </p>

        {state === 'idle' && (
          tooFewDreams ? (
            <div style={{ border: '0.5px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, background: 'rgba(255,255,255,0.02)' }}>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15, margin: '0 0 8px' }}>
                Log {3 - myDreamCount} more dream{3 - myDreamCount !== 1 ? 's' : ''} to find your twin.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, margin: 0 }}>
                Your twin is found by comparing archetype fingerprints across all dreamers.
              </p>
            </div>
          ) : (
            <button
              onClick={findTwin}
              style={{
                padding: '14px 40px', border: '0.5px solid rgba(139,111,255,0.4)', borderRadius: 40,
                color: '#8b6fff', background: 'transparent', cursor: 'pointer',
                fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'sans-serif',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(139,111,255,0.1)'; (e.currentTarget as HTMLElement).style.borderColor = '#8b6fff' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(139,111,255,0.4)' }}
            >
              Find my twin
            </button>
          )
        )}

        {state === 'loading' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 16 }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b6fff', animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, letterSpacing: '0.2em' }}>
              scanning the collective unconscious…
            </p>
            <style>{`@keyframes pulse { 0%,80%,100%{opacity:0.2;transform:scale(0.8)} 40%{opacity:1;transform:scale(1)} }`}</style>
          </div>
        )}

        {state === 'error' && (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', marginBottom: 16 }}>{error}</p>
            <button onClick={() => setState('idle')} style={{ color: 'rgba(139,111,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>
              Try again
            </button>
          </div>
        )}

        {state === 'found' && twin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32,
              background: 'rgba(255,255,255,0.02)', position: 'relative', overflow: 'hidden',
            }}>
              {/* Avatar */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, backgroundColor: `${accentColor}20`,
                  border: `1px solid ${accentColor}40`, boxShadow: `0 0 30px ${accentColor}20`,
                }}>
                  🌙
                </div>
              </div>

              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 4px', fontFamily: 'sans-serif' }}>
                Your twin
              </p>
              <h2 style={{ fontSize: 24, fontWeight: 300, margin: '0 0 20px', color: 'white' }}>
                {(twin as any).twin_profile?.dream_name || 'unknown dreamer'}
              </h2>

              {/* Similarity bar */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'sans-serif' }}>Unconscious similarity</span>
                  <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'sans-serif' }}>{Math.round(twin.similarity_score * 100)}%</span>
                </div>
                <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${twin.similarity_score * 100}%`, backgroundColor: accentColor, boxShadow: `0 0 8px ${accentColor}` }} />
                </div>
              </div>

              {/* Shared archetypes */}
              {twin.shared_archetypes?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: 'sans-serif' }}>
                    Shared territories
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {twin.shared_archetypes.map(a => (
                      <span key={a} style={{
                        padding: '4px 12px', borderRadius: 20, fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'sans-serif',
                        color: ARCHETYPE_COLORS[a] || '#8b6fff',
                        border: `0.5px solid ${ARCHETYPE_COLORS[a] || '#8b6fff'}40`,
                        background: `${ARCHETYPE_COLORS[a] || '#8b6fff'}10`,
                      }}>
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reasoning */}
              {reasoning && (
                <p style={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: 14, lineHeight: 1.6, borderTop: '0.5px solid rgba(255,255,255,0.06)', paddingTop: 20, margin: 0 }}>
                  "{reasoning}"
                </p>
              )}
            </div>

            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
              Twins are recalculated as new dreamers join.
            </p>
            <button onClick={findTwin} style={{ color: 'rgba(139,111,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>
              Recalculate
            </button>
          </div>
        )}
      </div>
    </div>
  )
}