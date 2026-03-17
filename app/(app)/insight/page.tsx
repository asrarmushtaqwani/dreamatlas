'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DreamAnalysis } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

const ACCENT = '#7dd3fc'
const FONT_DISPLAY = "'Fraunces', Georgia, serif"
const FONT_SERIF = "'Lora', Georgia, serif"

interface PendingDream extends DreamAnalysis { text: string; mood: string }

export default function InsightPage() {
  const router = useRouter()
  const [dream, setDream]   = useState<PendingDream | null>(null)
  const [stage, setStage]   = useState(0)

  useEffect(() => {
    const raw = sessionStorage.getItem('pendingDream')
    if (!raw) { router.push('/log'); return }
    setDream(JSON.parse(raw))
    setTimeout(() => setStage(1), 150)
    setTimeout(() => setStage(2), 650)
    setTimeout(() => setStage(3), 1150)
  }, [router])

  if (!dream) return null

  const primary = dream.archetypes?.[0] || 'Voyage'
  const color   = ARCHETYPE_COLORS[primary] || ACCENT

  const t = (s: number, delay = 0) => ({
    opacity: stage >= s ? 1 : 0,
    transform: stage >= s ? 'translateY(0)' : 'translateY(14px)',
    transition: `opacity 0.6s ease ${delay}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px 80px', background: '#0f0e0d', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 45% at 50% 40%, ${color}08, transparent 65%)`, transition: 'background 1s' }} />

      <div style={{ width: '100%', maxWidth: 540, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Orb */}
        <div style={{ textAlign: 'center', marginBottom: 4, ...t(1) }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 14px',
            background: `radial-gradient(circle at 35% 35%, ${color}45, ${color}15)`,
            border: `0.5px solid ${color}45`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            boxShadow: `0 0 40px ${color}20, inset 0 1px 0 ${color}25`,
            animation: 'orbPulse 4s ease-in-out infinite',
          }}>✦</div>
          <p style={{ fontSize: 13, color: 'rgba(240,236,230,0.3)', letterSpacing: '0.05em' }}>
            Your dream has been placed on the <span style={{ color, fontStyle: 'italic' }}>atlas</span>
          </p>
        </div>

        {/* Essence */}
        <div style={t(2)}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: `0.5px solid ${color}18`, borderRadius: 18, padding: '26px 24px', background: `linear-gradient(135deg, rgba(255,255,255,0.04), ${color}04)` as any }}>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.25)', marginBottom: 12 }}>Essence</div>
            <p style={{ fontFamily: FONT_DISPLAY, fontSize: 20, fontStyle: 'italic', fontWeight: 700, lineHeight: 1.6, color: '#f0ece6', letterSpacing: '-0.01em' }}>
              {dream.essence}
            </p>
          </div>
        </div>

        {/* Archetypes */}
        <div style={t(3, 0.05)}>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.25)', marginBottom: 10 }}>Archetypes detected</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {dream.archetypes?.map((a, i) => {
              const c = ARCHETYPE_COLORS[a] || ACCENT
              return (
                <div key={a} style={{ padding: '9px 20px', borderRadius: 40, fontSize: 14, background: `${c}14`, border: `0.5px solid ${c}40`, color: c, animation: 'scaleIn 0.4s cubic-bezier(0.16,1,0.3,1) both', animationDelay: `${i * 0.08}s` }}>
                  {a}
                </div>
              )
            })}
          </div>
        </div>

        {/* Symbols */}
        <div style={t(3, 0.12)}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '18px 20px' }}>
            <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.25)', marginBottom: 10 }}>Symbols</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {dream.symbols?.map(s => (
                <span key={s} style={{ padding: '5px 14px', borderRadius: 8, fontSize: 12, background: 'rgba(255,255,255,0.06)', border: '0.5px solid rgba(255,255,255,0.09)', color: 'rgba(240,236,230,0.5)', letterSpacing: '0.02em' }}>
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 4, ...t(3, 0.2) }}>
          <Link href="/map"     style={{ flex: 1, textDecoration: 'none' }}><button className="btn-ghost" style={{ width: '100%', fontSize: 13 }}>view on map</button></Link>
          <Link href="/journal" style={{ flex: 1, textDecoration: 'none' }}><button className="btn-ghost" style={{ width: '100%', fontSize: 13 }}>my journal</button></Link>
          <Link href="/log"     style={{ flex: 1, textDecoration: 'none' }}><button className="btn-primary" style={{ fontSize: 15 }}>done</button></Link>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,700&display=swap');
        @keyframes orbPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.07)} }
        @keyframes scaleIn  { from{opacity:0;transform:scale(0.88)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  )
}