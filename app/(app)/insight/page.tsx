'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DreamAnalysis } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

interface PendingDream extends DreamAnalysis {
  text: string
  mood: string
}

export default function InsightPage() {
  const router = useRouter()
  const [dream, setDream] = useState<PendingDream | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('pendingDream')
    if (!raw) { router.push('/log'); return }
    setDream(JSON.parse(raw))
    setTimeout(() => setVisible(true), 100)
  }, [router])

  if (!dream) return null

  const primaryArchetype = dream.archetypes?.[0] || 'Voyage'
  const accentColor = ARCHETYPE_COLORS[primaryArchetype] || 'var(--accent)'

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 560, opacity: visible ? 1 : 0, transition: 'opacity 0.6s ease' }}>

        {/* Orb */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 16px',
            background: `${accentColor}20`,
            border: `0.5px solid ${accentColor}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, animation: 'orbPulse 3s ease-in-out infinite',
          }}>
            ✦
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            Your dream has been placed on the{' '}
            <span style={{ color: accentColor }}>atlas</span>
          </div>
        </div>

        {/* Essence */}
        <div className="card" style={{ padding: '24px', marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--text-tertiary)', marginBottom: 12 }}>ESSENCE</div>
          <div style={{
            fontFamily: 'var(--font-display)', fontStyle: 'italic',
            fontSize: 20, fontWeight: 300, lineHeight: 1.6, color: 'var(--text-primary)',
          }}>
            {dream.essence}
          </div>
        </div>

        {/* Archetypes */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--text-tertiary)', marginBottom: 10 }}>ARCHETYPES DETECTED</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {dream.archetypes?.map((a, i) => (
              <div key={a} style={{
                padding: '8px 18px', borderRadius: 24, fontSize: 13,
                background: `${ARCHETYPE_COLORS[a] || 'var(--accent)'}18`,
                border: `0.5px solid ${ARCHETYPE_COLORS[a] || 'var(--accent)'}50`,
                color: ARCHETYPE_COLORS[a] || 'var(--accent)',
                animation: 'fadeIn 0.4s ease forwards',
                animationDelay: `${i * 0.1}s`,
                opacity: 0,
              }}>
                {a}
              </div>
            ))}
          </div>
        </div>

        {/* Symbols */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: 28 }}>
          <div style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--text-tertiary)', marginBottom: 10 }}>SYMBOLS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {dream.symbols?.map(s => (
              <div key={s} style={{
                padding: '4px 12px', borderRadius: 8, fontSize: 12,
                background: 'var(--surface2)', border: '0.5px solid var(--border)',
                color: 'var(--text-secondary)',
              }}>
                {s}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/map" style={{ flex: 1 }}>
            <button className="btn-ghost" style={{ width: '100%' }}>view on map</button>
          </Link>
          <Link href="/journal" style={{ flex: 1 }}>
            <button className="btn-ghost" style={{ width: '100%' }}>my journal</button>
          </Link>
          <Link href="/log" style={{ flex: 1 }}>
            <button className="btn-primary" style={{ fontSize: 15 }}>done</button>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes orbPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.06)} }
        @keyframes fadeIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  )
}
