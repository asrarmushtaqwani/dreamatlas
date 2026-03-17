'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DreamTwinMatch } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

const ACCENT = '#7dd3fc'
const FONT_DISPLAY = "'Fraunces', Georgia, serif"
const FONT_SERIF = "'Lora', Georgia, serif"

type TwinState = 'idle' | 'loading' | 'found' | 'error'

export default function TwinsPage() {
  const [state, setState]     = useState<TwinState>('idle')
  const [twin, setTwin]       = useState<DreamTwinMatch | null>(null)
  const [reasoning, setReasoning] = useState('')
  const [error, setError]     = useState('')
  const [myDreamCount, setMyDreamCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ count }, { data: existing }] = await Promise.all([
        supabase.from('dreams').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('dream_twin_matches').select('*, twin_profile:profiles!dream_twin_matches_twin_user_id_fkey(dream_name, avatar_color)').eq('user_id', user.id).order('similarity_score', { ascending: false }).limit(1).single(),
      ])
      setMyDreamCount(count || 0)
      if (existing) { setTwin(existing as any); setState('found') }
    }
    init()
  }, [])

  async function findTwin() {
    setState('loading'); setError('')
    try {
      const res = await fetch('/api/twins', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); setState('error'); return }
      setTwin(data); setReasoning(data.reasoning || ''); setState('found')
    } catch { setError('Connection failed'); setState('error') }
  }

  const tooFew  = myDreamCount < 3
  const twinCol = (twin as any)?.twin_profile?.avatar_color || ACCENT

  return (
    <div style={{ minHeight: '100vh', background: '#0f0e0d', color: '#f0ece6', paddingBottom: 80, position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 50% 40% at 50% 30%, ${ACCENT}05, transparent 65%)` }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 500, margin: '0 auto', padding: '56px 24px' }}>
        <Link href="/map" style={{ color: 'rgba(240,236,230,0.25)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', display: 'block', marginBottom: 44, transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.5)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.25)'}
        >← Atlas</Link>

        <div style={{ textAlign: 'center', marginBottom: 52, animation: 'fadeUp 0.6s both' }}>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.22)', marginBottom: 16 }}>Dream Twins</div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, fontStyle: 'italic', lineHeight: 1.1, letterSpacing: '-0.025em', marginBottom: 14 }}>
            Your unconscious<br />doppelgänger
          </h1>
          <p style={{ color: 'rgba(240,236,230,0.38)', fontSize: 16, lineHeight: 1.75, fontFamily: FONT_SERIF, fontStyle: 'italic' }}>
            Somewhere on earth, another mind dreams<br />the same territories you do.
          </p>
        </div>

        {state === 'idle' && (
          tooFew ? (
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 18, padding: '24px', textAlign: 'center', animation: 'scaleIn 0.4s both' }}>
              <p style={{ color: 'rgba(240,236,230,0.45)', fontSize: 15, marginBottom: 8, fontFamily: FONT_SERIF, fontStyle: 'italic' }}>Log {3 - myDreamCount} more dream{3 - myDreamCount !== 1 ? 's' : ''} to find your twin.</p>
              <p style={{ color: 'rgba(240,236,230,0.22)', fontSize: 13 }}>Twins are matched by comparing archetype fingerprints.</p>
            </div>
          ) : (
            <div style={{ textAlign: 'center', animation: 'fadeUp 0.5s 0.2s both' }}>
              <button onClick={findTwin} style={{ background: 'transparent', border: `0.5px solid ${ACCENT}40`, color: ACCENT, borderRadius: 12, padding: '13px 36px', fontSize: 14, cursor: 'pointer', letterSpacing: '0.06em', transition: 'all 0.2s', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = `${ACCENT}10`; el.style.borderColor = ACCENT; el.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.borderColor = `${ACCENT}40`; el.style.transform = 'translateY(0)' }}
              >Find my twin</button>
            </div>
          )
        )}

        {state === 'loading' && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s both' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 7, marginBottom: 14 }}>
              {[0,1,2].map(i => <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: ACCENT, animation: `thinkBounce 1.4s ease-in-out ${i * 0.18}s infinite` }} />)}
            </div>
            <p style={{ color: 'rgba(240,236,230,0.28)', fontSize: 13, letterSpacing: '0.1em' }}>scanning the collective unconscious…</p>
          </div>
        )}

        {state === 'error' && (
          <div style={{ textAlign: 'center', animation: 'fadeIn 0.4s both' }}>
            <p style={{ color: 'rgba(240,236,230,0.45)', fontStyle: 'italic', marginBottom: 16, fontFamily: FONT_SERIF }}>{error}</p>
            <button onClick={() => setState('idle')} style={{ color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 3 }}>Try again</button>
          </div>
        )}

        {state === 'found' && twin && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'scaleIn 0.45s both' }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: `0.5px solid ${typeof twinCol === 'string' && twinCol.startsWith('#') ? twinCol + '20' : 'rgba(255,255,255,0.07)'}`, borderRadius: 20, padding: '30px 26px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: `linear-gradient(90deg, transparent, ${typeof twinCol === 'string' && twinCol.startsWith('#') ? twinCol + '40' : ACCENT + '30'}, transparent)` }} />

              <div style={{ width: 58, height: 58, borderRadius: '50%', margin: '0 auto 18px', background: typeof twinCol === 'string' && twinCol.startsWith('#') ? twinCol + '16' : `${ACCENT}16`, border: `0.5px solid ${typeof twinCol === 'string' && twinCol.startsWith('#') ? twinCol + '30' : ACCENT + '25'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, boxShadow: `0 0 24px ${typeof twinCol === 'string' && twinCol.startsWith('#') ? twinCol + '18' : ACCENT + '15'}` }}>🌙</div>

              <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.22)', marginBottom: 6 }}>Your twin</div>
              <h2 style={{ fontFamily: FONT_DISPLAY, fontSize: 24, fontWeight: 700, fontStyle: 'italic', marginBottom: 20, letterSpacing: '-0.01em' }}>{(twin as any).twin_profile?.dream_name || 'unknown dreamer'}</h2>

              <div style={{ marginBottom: 20, textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'rgba(240,236,230,0.25)', letterSpacing: '0.1em' }}>Unconscious similarity</span>
                  <span style={{ fontSize: 12, color: 'rgba(240,236,230,0.45)' }}>{Math.round(twin.similarity_score * 100)}%</span>
                </div>
                <div style={{ height: 2, background: 'rgba(255,255,255,0.07)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 2, width: `${twin.similarity_score * 100}%`, background: typeof twinCol === 'string' && twinCol.startsWith('#') ? twinCol : ACCENT, boxShadow: `0 0 8px ${typeof twinCol === 'string' && twinCol.startsWith('#') ? twinCol : ACCENT}`, transition: 'width 1s cubic-bezier(0.16,1,0.3,1)' }} />
                </div>
              </div>

              {twin.shared_archetypes?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.22)', marginBottom: 10 }}>Shared territories</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                    {twin.shared_archetypes.map(a => { const c = ARCHETYPE_COLORS[a] || ACCENT; return <span key={a} style={{ padding: '5px 14px', borderRadius: 40, fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, color: c, border: `0.5px solid ${c}30`, background: `${c}10` }}>{a}</span> })}
                  </div>
                </div>
              )}

              {reasoning && <p style={{ color: 'rgba(240,236,230,0.38)', fontStyle: 'italic', fontSize: 14, lineHeight: 1.7, borderTop: '0.5px solid rgba(255,255,255,0.07)', paddingTop: 18, margin: 0, fontFamily: FONT_SERIF }}>"{reasoning}"</p>}
            </div>

            <p style={{ textAlign: 'center', color: 'rgba(240,236,230,0.2)', fontSize: 12 }}>Twins are recalculated as new dreamers join.</p>
            <div style={{ textAlign: 'center' }}>
              <button onClick={findTwin} style={{ color: 'rgba(240,236,230,0.28)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, textDecoration: 'underline', textUnderlineOffset: 3, transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.5)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.28)'}
              >Recalculate</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,700&family=Lora:ital@1&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
        @keyframes thinkBounce { 0%,100%{opacity:0.25;transform:translateY(0)} 50%{opacity:1;transform:translateY(-5px)} }
      `}</style>
    </div>
  )
}