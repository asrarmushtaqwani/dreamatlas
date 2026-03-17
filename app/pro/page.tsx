'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const FEATURES_FREE = [
  'Dream logging — unlimited',
  'AI archetype + symbol analysis',
  'Global atlas map',
  'Dream journal',
  'Dreamworlds — all 9 territories',
  'Dream Twins — find your doppelgänger',
]

const FEATURES_PRO = [
  'Dream Wrapped — monthly portrait',
  'Priority Gemini analysis',
  'Custom avatar colors & themes',
  'Export journal as PDF',
  'Everything in free, forever',
]

export default function ProPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleUpgrade() {
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        setLoading(false)
      }
    } catch {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
    }}>
      {/* Ambient */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(212,175,98,0.06), transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 560, margin: '0 auto', padding: '64px 24px' }}>

        {/* Back */}
        <Link href="/profile" style={{
          color: 'var(--text-tertiary)', fontSize: 12, letterSpacing: '0.2em',
          textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block', marginBottom: 48,
          transition: 'color 0.2s',
        }}>
          ← Profile
        </Link>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ marginBottom: 16 }}>
            <span className="pro-badge" style={{ fontSize: 11 }}>✦ Pro</span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 300,
            fontStyle: 'italic', lineHeight: 1.1, marginBottom: 16,
            letterSpacing: '-0.5px',
          }}>
            Go deeper into<br />the unconscious
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.6 }}>
            One payment. Every feature. Yours forever.
          </p>
        </div>

        {/* Price */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 4 }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 72, fontWeight: 300,
              color: 'var(--gold)', lineHeight: 1,
            }}>$5</span>
            <span style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>one-time</span>
          </div>
          <p style={{ color: 'var(--text-tertiary)', fontSize: 13, marginTop: 6 }}>
            No subscription. No renewal. Pay once.
          </p>
        </div>

        <hr className="gold-rule" style={{ marginBottom: 40 }} />

        {/* Features comparison */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
          {/* Free */}
          <div style={{
            background: 'var(--surface)', border: '0.5px solid var(--border)',
            borderRadius: 16, padding: 24,
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 16, fontFamily: 'var(--font-body)' }}>
              Free
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FEATURES_FREE.map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--text-tertiary)', fontSize: 14, marginTop: 1, flexShrink: 0 }}>◌</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pro */}
          <div style={{
            background: 'linear-gradient(135deg, var(--surface) 0%, rgba(212,175,98,0.05) 100%)',
            border: '0.5px solid var(--border-gold)',
            borderRadius: 16, padding: 24,
            boxShadow: '0 0 40px rgba(212,175,98,0.06)',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: 16, fontFamily: 'var(--font-body)' }}>
              ✦ Pro
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FEATURES_PRO.map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ color: 'var(--gold)', fontSize: 14, marginTop: 1, flexShrink: 0 }}>✦</span>
                  <span style={{ color: 'var(--text-primary)', fontSize: 13, lineHeight: 1.4 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleUpgrade}
          disabled={loading}
          className="btn-gold"
          style={{ width: '100%', fontSize: 15, padding: '16px 28px' }}
        >
          {loading ? 'Opening checkout…' : 'Unlock DreamAtlas Pro — $5'}
        </button>

        <p style={{ textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 12, marginTop: 14, lineHeight: 1.6 }}>
          Secure payment via Stripe. Instant access after purchase.<br />
          Questions? Reach out anytime.
        </p>
      </div>
    </div>
  )
}