'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DreamAnalysis } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

interface PendingDream extends DreamAnalysis { text: string; mood: string }

export default function InsightPage() {
  const router = useRouter()
  const [dream, setDream] = useState<PendingDream | null>(null)
  const [stage, setStage] = useState(0) // 0=hidden 1=orb 2=essence 3=all

  useEffect(() => {
    const raw = sessionStorage.getItem('pendingDream')
    if (!raw) { router.push('/log'); return }
    setDream(JSON.parse(raw))
    // Staggered reveal
    setTimeout(() => setStage(1), 150)
    setTimeout(() => setStage(2), 600)
    setTimeout(() => setStage(3), 1100)
  }, [router])

  if (!dream) return null

  const primary = dream.archetypes?.[0] || 'Voyage'
  const color   = ARCHETYPE_COLORS[primary] || 'var(--accent)'

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 20px 80px',
      background: 'var(--bg)',
      position: 'relative',
    }}>
      {/* Page-specific ambient */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse 60% 50% at 50% 40%, ${color}08, transparent 65%)`,
        transition: 'background 1s ease',
      }} />

      <div style={{
        width: '100%', maxWidth: 540,
        position: 'relative', zIndex: 1,
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>

        {/* ── Orb ── */}
        <div style={{
          textAlign: 'center', marginBottom: 8,
          opacity: stage >= 1 ? 1 : 0,
          transform: stage >= 1 ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div style={{
            width: 68, height: 68, borderRadius: '50%',
            margin: '0 auto 14px',
            background: `radial-gradient(circle at 35% 35%, ${color}40, ${color}15)`,
            border: `0.5px solid ${color}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26,
            boxShadow: `0 0 40px ${color}20, inset 0 1px 0 ${color}30`,
            animation: 'orbPulse 4s ease-in-out infinite',
          }}>
            ✦
          </div>
          <p style={{
            fontSize: 13, color: 'var(--text-tertiary)',
            fontFamily: 'var(--font-body)', letterSpacing: '0.06em',
          }}>
            Your dream has been placed on the{' '}
            <span style={{ color, fontStyle: 'italic' }}>atlas</span>
          </p>
        </div>

        {/* ── Essence ── */}
        <div style={{
          opacity: stage >= 2 ? 1 : 0,
          transform: stage >= 2 ? 'translateY(0)' : 'translateY(14px)',
          transition: 'opacity 0.65s ease, transform 0.65s cubic-bezier(0.16,1,0.3,1)',
        }}>
          <div className="card" style={{
            padding: '28px 26px',
            borderColor: `${color}20`,
            background: `linear-gradient(135deg, var(--surface) 0%, ${color}04 100%)`,
          }}>
            <div className="label" style={{ marginBottom: 12 }}>Essence</div>
            <p style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20, fontStyle: 'italic', fontWeight: 400,
              lineHeight: 1.65, color: 'var(--text-primary)',
            }}>
              {dream.essence}
            </p>
          </div>
        </div>

        {/* ── Archetypes ── */}
        <div style={{
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.6s ease 0.05s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.05s',
        }}>
          <div className="label" style={{ marginBottom: 10 }}>Archetypes detected</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {dream.archetypes?.map((a, i) => {
              const c = ARCHETYPE_COLORS[a] || 'var(--accent)'
              return (
                <div key={a} style={{
                  padding: '9px 20px', borderRadius: 40, fontSize: 14,
                  background: `${c}15`,
                  border: `0.5px solid ${c}45`,
                  color: c,
                  fontFamily: 'var(--font-body)', fontWeight: 400,
                  animation: 'scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) both',
                  animationDelay: `${i * 0.08}s`,
                }}>
                  {a}
                </div>
              )
            })}
          </div>
        </div>

        {/* ── Symbols ── */}
        <div style={{
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.6s ease 0.12s, transform 0.6s cubic-bezier(0.16,1,0.3,1) 0.12s',
        }}>
          <div className="card" style={{ padding: '20px 22px' }}>
            <div className="label" style={{ marginBottom: 10 }}>Symbols</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {dream.symbols?.map(s => (
                <span key={s} style={{
                  padding: '5px 14px', borderRadius: 8, fontSize: 12,
                  background: 'var(--surface2)',
                  border: '0.5px solid var(--border-mid)',
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                  letterSpacing: '0.02em',
                }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{
          display: 'flex', gap: 10, marginTop: 6,
          opacity: stage >= 3 ? 1 : 0,
          transition: 'opacity 0.6s ease 0.2s',
        }}>
          <Link href="/map"     style={{ flex: 1, textDecoration: 'none' }}>
            <button className="btn-ghost"   style={{ width: '100%', fontSize: 13 }}>view on map</button>
          </Link>
          <Link href="/journal" style={{ flex: 1, textDecoration: 'none' }}>
            <button className="btn-ghost"   style={{ width: '100%', fontSize: 13 }}>my journal</button>
          </Link>
          <Link href="/log"     style={{ flex: 1, textDecoration: 'none' }}>
            <button className="btn-primary" style={{ fontSize: 15 }}>done</button>
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes orbPulse  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        @keyframes scaleIn   { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  )
}