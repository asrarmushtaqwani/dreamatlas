'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WrappedSnapshot } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import Link from 'next/link'

type WrappedState = 'loading' | 'found' | 'generating' | 'none' | 'error'

function getMonthName(monthStr: string) {
  const [year, month] = monthStr.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
}

export default function WrappedPage() {
  const [state, setState] = useState<WrappedState>('loading')
  const [wrapped, setWrapped] = useState<WrappedSnapshot | null>(null)
  const [error, setError] = useState('')

  useEffect(() => { generate() }, [])

  async function generate() {
    setState('generating')
    try {
      const res = await fetch('/api/wrapped')
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 404) { setState('none'); return }
        setError(data.error || 'Failed to generate Wrapped')
        setState('error')
        return
      }
      setWrapped(data)
      setState('found')
    } catch {
      setError('Connection failed')
      setState('error')
    }
  }

  const accentColor = wrapped?.top_archetype ? ARCHETYPE_COLORS[wrapped.top_archetype] : '#8b6fff'

  if (state === 'loading' || state === 'generating') {
    return (
      <div style={{ minHeight: '100vh', background: '#070710', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 3, height: 28, borderRadius: 2, background: '#8b6fff', animation: `wave 1.2s ease-in-out ${i * 0.15}s infinite` }} />
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, letterSpacing: '0.2em', fontFamily: "'Crimson Pro', Georgia, serif" }}>
          {state === 'generating' ? 'weaving your month together…' : 'opening your wrapped…'}
        </p>
        <style>{`@keyframes wave { 0%,100%{transform:scaleY(0.4);opacity:0.3} 50%{transform:scaleY(1);opacity:1} }`}</style>
      </div>
    )
  }

  if (state === 'none') {
    return (
      <div style={{ minHeight: '100vh', background: '#070710', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 20, fontFamily: "'Crimson Pro', Georgia, serif", marginBottom: 16 }}>
          No dreams logged this month yet.
        </p>
        <Link href="/log" style={{ color: 'rgba(139,111,255,0.6)', fontSize: 14, textDecoration: 'underline' }}>
          Log your first dream →
        </Link>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div style={{ minHeight: '100vh', background: '#070710', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Crimson Pro', Georgia, serif" }}>{error}</p>
        <button onClick={generate} style={{ color: 'rgba(139,111,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>
          Try again
        </button>
      </div>
    )
  }

  if (!wrapped) return null

  return (
    <div style={{ minHeight: '100vh', background: '#070710', color: 'white', fontFamily: "'Crimson Pro', Georgia, serif", padding: '64px 24px' }}>
      <div style={{ maxWidth: 440, margin: '0 auto' }}>

        <Link href="/journal" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, letterSpacing: '0.15em', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
          ← Journal
        </Link>

        {/* Card */}
        <div style={{
          borderRadius: 24, border: '0.5px solid rgba(255,255,255,0.1)', overflow: 'hidden',
          background: `linear-gradient(135deg, #0d0d1a 0%, #0a0a15 50%, ${accentColor}08 100%)`,
          position: 'relative',
        }}>
          <div style={{ padding: 36 }}>

            {/* Month */}
            <div style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 28, fontFamily: 'sans-serif', color: accentColor }}>
              Dream Wrapped · {getMonthName(wrapped.month)}
            </div>

            {/* Big number */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 64, fontWeight: 300, lineHeight: 1, color: accentColor, marginBottom: 4 }}>
                {wrapped.dream_count}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, letterSpacing: '0.1em' }}>
                dream{wrapped.dream_count !== 1 ? 's' : ''} this month
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }} />

            {/* Top archetype */}
            {wrapped.top_archetype && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: 'sans-serif' }}>
                  Dominant archetype
                </p>
                <div style={{ fontSize: 24, fontWeight: 300, color: accentColor }}>
                  {wrapped.top_archetype}
                </div>
              </div>
            )}

            {/* Top symbols */}
            {wrapped.top_symbols?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: 'sans-serif' }}>
                  Recurring symbols
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {wrapped.top_symbols.map((sym, i) => (
                    <span key={sym} style={{
                      padding: '4px 12px', borderRadius: 20, fontSize: 14,
                      border: '0.5px solid rgba(255,255,255,0.1)',
                      color: `rgba(255,255,255,${0.6 - i * 0.08})`,
                      background: 'rgba(255,255,255,0.03)',
                    }}>
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Streak */}
            {wrapped.streak_peak > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: 'sans-serif' }}>
                  Longest streak
                </p>
                <div style={{ fontSize: 20, fontWeight: 300, color: 'rgba(255,255,255,0.8)' }}>
                  {wrapped.streak_peak} consecutive {wrapped.streak_peak === 1 ? 'day' : 'days'}
                </div>
              </div>
            )}

            {/* Dreamworlds */}
            {wrapped.dreamworld_titles?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: 'sans-serif' }}>
                  Dreamworlds entered
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {wrapped.dreamworld_titles.map(title => (
                    <div key={title} style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ color: accentColor }}>·</span> {title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', marginBottom: 24 }} />

            {/* Essence */}
            {wrapped.essence_summary && (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15, fontStyle: 'italic', lineHeight: 1.7, margin: '0 0 24px' }}>
                "{wrapped.essence_summary}"
              </p>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 11, letterSpacing: '0.2em', fontFamily: 'sans-serif' }}>DreamAtlas</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: accentColor, opacity: 0.3 + i * 0.2 }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Links */}
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14, marginBottom: 14 }}>This month in your unconscious.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { href: '/journal', label: 'View journal' },
              { href: '/dreamworlds', label: 'Explore worlds' },
              { href: '/twins', label: 'Find twin' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.3)'}
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