'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function ProSuccessPage() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 100)
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)', color: 'var(--text-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', padding: 24,
    }}>
      {/* Ambient gold glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(212,175,98,0.07), transparent 70%)',
      }} />

      <div style={{
        position: 'relative', textAlign: 'center', maxWidth: 440,
        opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', margin: '0 auto 28px',
          background: 'var(--gold-dim)', border: '0.5px solid var(--border-gold)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, boxShadow: '0 0 40px rgba(212,175,98,0.15)',
        }}
          className="animate-glow"
        >
          ✦
        </div>

        <span className="pro-badge" style={{ marginBottom: 20, display: 'inline-flex' }}>
          ✦ Pro Unlocked
        </span>

        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 300,
          fontStyle: 'italic', lineHeight: 1.1, marginBottom: 16, marginTop: 16,
        }}>
          Welcome to the<br />deeper atlas
        </h1>

        <p style={{ color: 'var(--text-secondary)', fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
          Your unconscious now has a monthly portrait.<br />
          Dream Wrapped is waiting for you.
        </p>

        <hr className="gold-rule" style={{ marginBottom: 32 }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Link href="/wrapped" style={{ textDecoration: 'none' }}>
            <button className="btn-gold" style={{ width: '100%', fontSize: 14 }}>
              Open Dream Wrapped →
            </button>
          </Link>
          <Link href="/map" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ width: '100%' }}>
              Back to the atlas
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}