'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WrappedSnapshot } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import Link from 'next/link'

type WrappedState = 'loading' | 'found' | 'generating' | 'none' | 'error' | 'gate'

function getMonthName(monthStr: string) {
  const [year, month] = monthStr.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
}

// Beautiful Pro gate overlay
function ProGate() {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '64px 24px', position: 'relative',
    }}>
      {/* Gold ambient */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 50% 40% at 50% 50%, rgba(212,175,98,0.05), transparent 70%)',
      }} />

      <div style={{ position: 'relative', maxWidth: 440, textAlign: 'center' }}>
        {/* Blurred preview card */}
        <div style={{
          background: 'linear-gradient(135deg, var(--surface) 0%, rgba(212,175,98,0.06) 100%)',
          border: '0.5px solid var(--border-gold)', borderRadius: 24, padding: 36,
          filter: 'blur(4px)', opacity: 0.5, marginBottom: -200, pointerEvents: 'none',
          userSelect: 'none',
        }}>
          <div style={{ fontSize: 11, color: 'var(--gold)', letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 20 }}>
            Dream Wrapped · March 2026
          </div>
          <div style={{ fontSize: 64, fontFamily: 'var(--font-display)', fontWeight: 300, color: 'var(--gold)', marginBottom: 8 }}>7</div>
          <div style={{ color: 'var(--text-tertiary)', marginBottom: 20 }}>dreams this month</div>
          <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: 15, lineHeight: 1.6 }}>
            "Your unconscious has been tracing the edges of transformation, circling the same luminous threshold..."
          </div>
        </div>

        {/* Gate overlay */}
        <div style={{
          position: 'relative', zIndex: 10,
          background: 'rgba(6,5,15,0.85)', backdropFilter: 'blur(16px)',
          border: '0.5px solid var(--border-gold)', borderRadius: 20, padding: 36,
          boxShadow: '0 0 60px rgba(212,175,98,0.08)',
        }}>
          <div className="pro-badge" style={{ marginBottom: 20, display: 'inline-flex' }}>✦ Pro Feature</div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 300,
            fontStyle: 'italic', marginBottom: 12, lineHeight: 1.2,
          }}>
            Your monthly<br />dream portrait
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 28 }}>
            Dream Wrapped distills your month into a poetic portrait — dominant archetypes, recurring symbols, your unconscious fingerprint. Unlock it with Pro.
          </p>

          <hr className="gold-rule" style={{ marginBottom: 24 }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/pro" style={{ textDecoration: 'none' }}>
              <button className="btn-gold" style={{ width: '100%', fontSize: 14 }}>
                Unlock Pro — $5 lifetime
              </button>
            </Link>
            <Link href="/map" style={{ textDecoration: 'none' }}>
              <button className="btn-ghost" style={{ width: '100%', fontSize: 13 }}>
                Back to atlas
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WrappedPage() {
  const [state, setState] = useState<WrappedState>('loading')
  const [wrapped, setWrapped] = useState<WrappedSnapshot | null>(null)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      // Check Pro status first
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setState('gate'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_pro')
        .eq('id', user.id)
        .single()

      if (!profile?.is_pro) {
        setState('gate')
        return
      }

      generate()
    }
    init()
  }, [])

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

  const accentColor = wrapped?.top_archetype ? ARCHETYPE_COLORS[wrapped.top_archetype] : 'var(--gold)'

  if (state === 'gate') return <ProGate />

  if (state === 'loading' || state === 'generating') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 3, height: 28, borderRadius: 2, background: 'var(--gold)', animation: `wave 1.2s ease-in-out ${i * 0.15}s infinite` }} />
          ))}
        </div>
        <p style={{ color: 'var(--text-tertiary)', fontSize: 13, letterSpacing: '0.2em', fontFamily: 'var(--font-prose)' }}>
          {state === 'generating' ? 'weaving your month together…' : 'opening your wrapped…'}
        </p>
        <style>{`@keyframes wave { 0%,100%{transform:scaleY(0.4);opacity:0.3} 50%{transform:scaleY(1);opacity:1} }`}</style>
      </div>
    )
  }

  if (state === 'none') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: 20, fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 16 }}>
          No dreams logged this month yet.
        </p>
        <Link href="/log" style={{ color: 'var(--accent)', fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 4 }}>
          Log your first dream →
        </Link>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-prose)', fontStyle: 'italic' }}>{error}</p>
        <button onClick={generate} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, textDecoration: 'underline' }}>
          Try again
        </button>
      </div>
    )
  }

  if (!wrapped) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', padding: '64px 24px' }}>
      {/* Gold ambient */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 60% 40% at 50% 20%, ${accentColor}08, transparent)`,
      }} />

      <div style={{ position: 'relative', maxWidth: 440, margin: '0 auto' }}>
        <Link href="/journal" style={{ color: 'var(--text-tertiary)', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block', marginBottom: 32 }}>
          ← Journal
        </Link>

        {/* Card */}
        <div style={{
          borderRadius: 24, border: '0.5px solid var(--border-gold)', overflow: 'hidden',
          background: `linear-gradient(135deg, var(--surface) 0%, var(--bg) 50%, ${accentColor}06 100%)`,
          boxShadow: '0 0 60px rgba(212,175,98,0.06)',
        }}
          className="animate-glow"
        >
          <div style={{ padding: 36 }}>
            {/* Month */}
            <div style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', marginBottom: 28, fontFamily: 'var(--font-body)', color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✦</span>
              <span>Dream Wrapped · {getMonthName(wrapped.month)}</span>
            </div>

            {/* Big number */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 72, fontWeight: 300, lineHeight: 1, color: 'var(--gold)', marginBottom: 6, fontFamily: 'var(--font-display)' }}>
                {wrapped.dream_count}
              </div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: 13, letterSpacing: '0.1em' }}>
                dream{wrapped.dream_count !== 1 ? 's' : ''} this month
              </div>
            </div>

            <hr className="gold-rule" style={{ marginBottom: 24 }} />

            {/* Top archetype */}
            {wrapped.top_archetype && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: 'var(--font-body)' }}>
                  Dominant archetype
                </p>
                <div style={{ fontSize: 26, fontWeight: 300, color: accentColor, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                  {wrapped.top_archetype}
                </div>
              </div>
            )}

            {/* Top symbols */}
            {wrapped.top_symbols?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 12px', fontFamily: 'var(--font-body)' }}>
                  Recurring symbols
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {wrapped.top_symbols.map((sym, i) => (
                    <span key={sym} style={{
                      padding: '5px 14px', borderRadius: 20, fontSize: 13,
                      border: '0.5px solid rgba(212,175,98,0.2)',
                      color: `rgba(237,232,245,${0.7 - i * 0.08})`,
                      background: 'rgba(212,175,98,0.04)',
                      fontFamily: 'var(--font-prose)',
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
                <p style={{ color: 'var(--text-tertiary)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 6px', fontFamily: 'var(--font-body)' }}>
                  Longest streak
                </p>
                <div style={{ fontSize: 20, fontWeight: 300, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  {wrapped.streak_peak} consecutive {wrapped.streak_peak === 1 ? 'day' : 'days'}
                </div>
              </div>
            )}

            {/* Dreamworlds */}
            {wrapped.dreamworld_titles?.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', margin: '0 0 10px', fontFamily: 'var(--font-body)' }}>
                  Dreamworlds entered
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {wrapped.dreamworld_titles.map(title => (
                    <div key={title} style={{ color: 'var(--text-secondary)', fontSize: 14, display: 'flex', gap: 10, alignItems: 'center', fontFamily: 'var(--font-prose)' }}>
                      <span style={{ color: 'var(--gold)', fontSize: 10 }}>✦</span> {title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="gold-rule" style={{ marginBottom: 24 }} />

            {/* Essence */}
            {wrapped.essence_summary && (
              <p style={{ color: 'var(--text-secondary)', fontSize: 15, fontStyle: 'italic', lineHeight: 1.8, margin: '0 0 28px', fontFamily: 'var(--font-display)' }}>
                "{wrapped.essence_summary}"
              </p>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 10, letterSpacing: '0.3em', fontFamily: 'var(--font-body)', textTransform: 'uppercase' }}>DreamAtlas</span>
              <span className="pro-badge" style={{ fontSize: 9 }}>✦ Pro</span>
            </div>
          </div>
        </div>

        {/* Links */}
        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { href: '/journal', label: 'Journal' },
              { href: '/dreamworlds', label: 'Worlds' },
              { href: '/twins', label: 'Twins' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} style={{ color: 'var(--text-tertiary)', fontSize: 13, textDecoration: 'none', letterSpacing: '0.1em' }}>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}