'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

const SAMPLE_NODES = [
  { x: 0.55, y: 0.35, a: 'Transcendence' }, { x: 0.3,  y: 0.6,  a: 'Nature' },
  { x: 0.7,  y: 0.65, a: 'Voyage' },        { x: 0.45, y: 0.75, a: 'Fear' },
  { x: 0.25, y: 0.3,  a: 'Transformation' },{ x: 0.6,  y: 0.2,  a: 'Transcendence' },
  { x: 0.15, y: 0.5,  a: 'Shadow' },        { x: 0.8,  y: 0.4,  a: 'Voyage' },
  { x: 0.4,  y: 0.45, a: 'Nature' },        { x: 0.65, y: 0.8,  a: 'Fear' },
  { x: 0.85, y: 0.25, a: 'Trickster' },     { x: 0.5,  y: 0.15, a: 'Transcendence' },
  { x: 0.2,  y: 0.7,  a: 'Shadow' },        { x: 0.75, y: 0.55, a: 'Voyage' },
  { x: 0.35, y: 0.25, a: 'Nature' },        { x: 0.5,  y: 0.55, a: 'Void' },
  { x: 0.1,  y: 0.35, a: 'Transformation' },{ x: 0.9,  y: 0.6,  a: 'Anima' },
  { x: 0.42, y: 0.2,  a: 'Transcendence' }, { x: 0.62, y: 0.45, a: 'Shadow' },
]

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const draw = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      const W = canvas.width, H = canvas.height
      const ctx = canvas.getContext('2d')!
      ctx.clearRect(0, 0, W, H)
      SAMPLE_NODES.forEach((n, i) => {
        SAMPLE_NODES.slice(i + 1).forEach(n2 => {
          if (n.a !== n2.a) return
          const dist = Math.hypot((n2.x - n.x) * W, (n2.y - n.y) * H)
          if (dist > W * 0.3) return
          ctx.globalAlpha = 0.07 * (1 - dist / (W * 0.3))
          ctx.strokeStyle = ARCHETYPE_COLORS[n.a] || '#8b6fff'
          ctx.lineWidth = 0.5
          ctx.beginPath(); ctx.moveTo(n.x * W, n.y * H); ctx.lineTo(n2.x * W, n2.y * H); ctx.stroke()
          ctx.globalAlpha = 1
        })
      })
      SAMPLE_NODES.forEach(n => {
        const x = n.x * W, y = n.y * H
        const col = ARCHETYPE_COLORS[n.a] || '#8b6fff'
        const gd = ctx.createRadialGradient(x, y, 0, x, y, 20)
        gd.addColorStop(0, col + '35'); gd.addColorStop(1, col + '00')
        ctx.fillStyle = gd; ctx.beginPath(); ctx.arc(x, y, 20, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2)
        ctx.fillStyle = col; ctx.fill()
      })
    }
    draw()
    window.addEventListener('resize', draw)
    return () => window.removeEventListener('resize', draw)
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 32px', borderBottom: '0.5px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,7,17,0.85)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontStyle: 'italic', color: 'var(--text-primary)' }}>
          Dream<span style={{ color: 'var(--accent)' }}>Atlas</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link href="/auth/login"><button className="btn-ghost" style={{ padding: '8px 20px', fontSize: 13 }}>Sign in</button></Link>
          <Link href="/auth/signup"><button className="btn-primary" style={{ width: 'auto', padding: '8px 20px', fontSize: 14 }}>Start dreaming</button></Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 'calc(100vh - 65px)' }} className="hero-grid">
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '64px 48px' }}>
          <div className="animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
            <div style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: 20,
              border: '0.5px solid rgba(139,111,255,0.3)', background: 'var(--accent-dim)',
              color: 'var(--accent)', fontSize: 11, letterSpacing: '2px', marginBottom: 24,
            }}>OPEN SOURCE · FREE FOREVER</div>
          </div>
          <h1 className="animate-fade-up" style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 5vw, 68px)',
            fontWeight: 300, fontStyle: 'italic', lineHeight: 1.15,
            color: 'var(--text-primary)', marginBottom: 24, animationDelay: '0.2s', opacity: 0,
          }}>
            The world is dreaming.<br /><span style={{ color: 'var(--accent)' }}>Now we can see it.</span>
          </h1>
          <p className="animate-fade-up" style={{
            fontSize: 17, color: 'var(--text-secondary)', lineHeight: 1.7,
            maxWidth: 480, marginBottom: 40, animationDelay: '0.3s', opacity: 0,
          }}>
            Log your dreams each morning. AI finds the archetypes and symbols hidden inside.
            Watch your unconscious appear on a living map shared by thousands of dreamers worldwide.
          </p>
          <div className="animate-fade-up" style={{ display: 'flex', gap: 12, animationDelay: '0.4s', opacity: 0 }}>
            <Link href="/auth/signup"><button className="btn-primary" style={{ width: 'auto', padding: '16px 36px', fontSize: 17 }}>Begin your atlas</button></Link>
            <Link href="/map"><button className="btn-ghost" style={{ padding: '16px 28px' }}>Explore the map</button></Link>
          </div>
          <div className="animate-fade-up" style={{ display: 'flex', gap: 32, marginTop: 48, animationDelay: '0.5s', opacity: 0 }}>
            {[['2,847', 'dreams logged'], ['9', 'archetypes'], ['48', 'countries']].map(([val, label]) => (
              <div key={label}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300 }}>{val}</div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', letterSpacing: '1px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: 'relative', borderLeft: '0.5px solid var(--border)' }}>
          <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
          <div style={{
            position: 'absolute', bottom: 24, left: 24, right: 24,
            background: 'rgba(8,7,17,0.8)', border: '0.5px solid var(--border)',
            borderRadius: 12, padding: '14px 18px', backdropFilter: 'blur(8px)',
          }}>
            <div style={{ fontSize: 11, letterSpacing: '2px', color: 'var(--text-tertiary)', marginBottom: 6 }}>LIVE COLLECTIVE ATLAS</div>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Each point of light is a real dream, logged by a real person, somewhere in the world tonight.
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-grid > div:last-child { height: 40vh; border-left: none !important; border-top: 0.5px solid var(--border); }
          .hero-grid > div:first-child { padding: 40px 24px !important; }
        }
      `}</style>
    </div>
  )
}
