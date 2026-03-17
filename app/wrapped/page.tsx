'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WrappedSnapshot } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import Link from 'next/link'

const ACCENT = '#7dd3fc'
const FONT_DISPLAY = "'Fraunces', Georgia, serif"
const FONT_SERIF = "'Lora', Georgia, serif"

type WrappedState = 'loading' | 'generating' | 'found' | 'none' | 'error'

function getMonthName(str: string) {
  const [y, m] = str.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
}

export default function WrappedPage() {
  const [state, setState]     = useState<WrappedState>('loading')
  const [wrapped, setWrapped] = useState<WrappedSnapshot | null>(null)
  const [error, setError]     = useState('')

  useEffect(() => { generate() }, [])

  async function generate() {
    setState('generating')
    try {
      const res = await fetch('/api/wrapped')
      const data = await res.json()
      if (!res.ok) { if (res.status === 404) { setState('none'); return }; setError(data.error || 'Failed'); setState('error'); return }
      setWrapped(data); setState('found')
    } catch { setError('Connection failed'); setState('error') }
  }

  const accent = wrapped?.top_archetype ? ARCHETYPE_COLORS[wrapped.top_archetype] : ACCENT

  if (state === 'loading' || state === 'generating') return (
    <div style={{ minHeight: '100vh', background: '#0f0e0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <div style={{ display: 'flex', gap: 5 }}>
        {[0,1,2,3].map(i => <div key={i} style={{ width: 3, height: 28, borderRadius: 2, background: ACCENT, animation: `wave 1.2s ease-in-out ${i * 0.15}s infinite` }} />)}
      </div>
      <p style={{ color: 'rgba(240,236,230,0.28)', fontSize: 13, letterSpacing: '0.1em' }}>
        {state === 'generating' ? 'weaving your month together…' : 'opening your wrapped…'}
      </p>
      <style>{`@keyframes wave{0%,100%{transform:scaleY(0.4);opacity:0.3}50%{transform:scaleY(1);opacity:1}}`}</style>
    </div>
  )

  if (state === 'none') return (
    <div style={{ minHeight: '100vh', background: '#0f0e0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <p style={{ color: 'rgba(240,236,230,0.45)', fontSize: 20, fontFamily: FONT_DISPLAY, fontStyle: 'italic', marginBottom: 16 }}>No dreams logged this month yet.</p>
      <Link href="/log" style={{ color: ACCENT, fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 3 }}>Log your first dream →</Link>
    </div>
  )

  if (state === 'error') return (
    <div style={{ minHeight: '100vh', background: '#0f0e0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
      <p style={{ color: 'rgba(240,236,230,0.45)', fontFamily: FONT_SERIF, fontStyle: 'italic' }}>{error}</p>
      <button onClick={generate} style={{ color: ACCENT, background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>Try again</button>
    </div>
  )

  if (!wrapped) return null

  const isHex = typeof accent === 'string' && accent.startsWith('#')

  return (
    <div style={{ minHeight: '100vh', background: '#0f0e0d', color: '#f0ece6', padding: '56px 24px 80px' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 40% at 50% 25%, ${isHex ? accent + '08' : ACCENT + '06'}, transparent)` }} />

      <div style={{ position: 'relative', maxWidth: 460, margin: '0 auto', animation: 'fadeUp 0.6s both' }}>
        <Link href="/journal" style={{ color: 'rgba(240,236,230,0.25)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block', marginBottom: 28, transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.5)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.25)'}
        >← Journal</Link>

        {/* Card */}
        <div style={{ borderRadius: 24, border: `0.5px solid ${isHex ? accent + '20' : 'rgba(255,255,255,0.07)'}`, overflow: 'hidden', background: `linear-gradient(160deg, rgba(255,255,255,0.05) 0%, rgba(15,14,13,0) 60%, ${isHex ? accent + '06' : 'transparent'} 100%)`, boxShadow: '0 24px 60px rgba(0,0,0,0.4)', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${isHex ? accent + '45' : ACCENT + '35'}, transparent)` }} />

          <div style={{ padding: '32px 28px' }}>
            {/* Month */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 600, color: isHex ? accent : ACCENT, marginBottom: 24 }}>
              <span>✦</span><span>Dream Wrapped · {getMonthName(wrapped.month)}</span>
            </div>

            {/* Count */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ fontFamily: FONT_DISPLAY, fontSize: 72, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.03em', color: isHex ? accent : ACCENT, marginBottom: 6 }}>{wrapped.dream_count}</div>
              <div style={{ color: 'rgba(240,236,230,0.28)', fontSize: 13, letterSpacing: '0.06em' }}>dream{wrapped.dream_count !== 1 ? 's' : ''} this month</div>
            </div>

            <div style={{ height: 0.5, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', marginBottom: 22 }} />

            {wrapped.top_archetype && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.22)', marginBottom: 7 }}>Dominant archetype</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, fontWeight: 700, fontStyle: 'italic', color: isHex ? accent : ACCENT, letterSpacing: '-0.01em' }}>{wrapped.top_archetype}</div>
              </div>
            )}

            {wrapped.top_symbols?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.22)', marginBottom: 10 }}>Recurring symbols</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {wrapped.top_symbols.map((sym, i) => <span key={sym} style={{ padding: '5px 14px', borderRadius: 40, fontSize: 13, border: '0.5px solid rgba(255,255,255,0.08)', color: `rgba(240,236,230,${0.65 - i * 0.07})`, background: 'rgba(255,255,255,0.05)', fontFamily: FONT_SERIF, fontStyle: 'italic' }}>{sym}</span>)}
                </div>
              </div>
            )}

            {wrapped.streak_peak > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.22)', marginBottom: 7 }}>Longest streak</div>
                <div style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontWeight: 700 }}>{wrapped.streak_peak} consecutive {wrapped.streak_peak === 1 ? 'day' : 'days'}</div>
              </div>
            )}

            {wrapped.dreamworld_titles?.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.22)', marginBottom: 10 }}>Dreamworlds entered</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {wrapped.dreamworld_titles.map(t => <div key={t} style={{ display: 'flex', gap: 10, alignItems: 'center', color: 'rgba(240,236,230,0.45)', fontSize: 14, fontFamily: FONT_SERIF }}><span style={{ color: isHex ? accent : ACCENT, fontSize: 10 }}>✦</span>{t}</div>)}
                </div>
              </div>
            )}

            <div style={{ height: 0.5, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', marginBottom: 22 }} />

            {wrapped.essence_summary && <p style={{ color: 'rgba(240,236,230,0.45)', fontSize: 15, fontStyle: 'italic', lineHeight: 1.8, margin: '0 0 24px', fontFamily: FONT_DISPLAY, fontWeight: 400, letterSpacing: '-0.005em' }}>"{wrapped.essence_summary}"</p>}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(240,236,230,0.18)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase' }}>DreamAtlas</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0.28, 0.48, 0.72].map((op, i) => <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', background: isHex ? accent : ACCENT, opacity: op }} />)}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 22, textAlign: 'center', display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[{ href: '/journal', label: 'Journal' }, { href: '/dreamworlds', label: 'Worlds' }, { href: '/twins', label: 'Twins' }].map(({ href, label }) => (
            <Link key={href} href={href} style={{ color: 'rgba(240,236,230,0.25)', fontSize: 13, textDecoration: 'none', letterSpacing: '0.04em', transition: 'color 0.2s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.5)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.25)'}
            >{label}</Link>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;1,700&family=Lora:ital@1&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}