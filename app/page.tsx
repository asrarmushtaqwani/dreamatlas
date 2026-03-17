'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

const NODES = [
  { x: 0.55, y: 0.32, a: 'Transcendence', size: 5 },
  { x: 0.3,  y: 0.58, a: 'Nature',        size: 4 },
  { x: 0.72, y: 0.62, a: 'Voyage',        size: 6 },
  { x: 0.44, y: 0.74, a: 'Fear',          size: 4 },
  { x: 0.22, y: 0.28, a: 'Transformation', size: 5 },
  { x: 0.62, y: 0.18, a: 'Transcendence', size: 3 },
  { x: 0.14, y: 0.48, a: 'Shadow',        size: 4 },
  { x: 0.82, y: 0.38, a: 'Voyage',        size: 5 },
  { x: 0.38, y: 0.44, a: 'Nature',        size: 3 },
  { x: 0.66, y: 0.78, a: 'Fear',          size: 4 },
  { x: 0.87, y: 0.22, a: 'Trickster',     size: 3 },
  { x: 0.5,  y: 0.12, a: 'Transcendence', size: 4 },
  { x: 0.18, y: 0.68, a: 'Shadow',        size: 3 },
  { x: 0.76, y: 0.52, a: 'Voyage',        size: 4 },
  { x: 0.33, y: 0.22, a: 'Nature',        size: 3 },
  { x: 0.52, y: 0.52, a: 'Void',          size: 5 },
  { x: 0.08, y: 0.32, a: 'Transformation', size: 4 },
  { x: 0.92, y: 0.62, a: 'Anima',         size: 4 },
  { x: 0.41, y: 0.18, a: 'Transcendence', size: 3 },
  { x: 0.64, y: 0.42, a: 'Shadow',        size: 4 },
]

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let frame = 0
    let raf: number

    function draw() {
      canvas!.width  = canvas!.offsetWidth
      canvas!.height = canvas!.offsetHeight
      const W = canvas!.width, H = canvas!.height
      const ctx = canvas!.getContext('2d')!
      ctx.clearRect(0, 0, W, H)
      frame++

      // Connections
      NODES.forEach((n, i) => {
        NODES.slice(i + 1).forEach(n2 => {
          if (n.a !== n2.a) return
          const dist = Math.hypot((n2.x - n.x) * W, (n2.y - n.y) * H)
          if (dist > W * 0.35) return
          const alpha = 0.08 * (1 - dist / (W * 0.35))
          ctx.globalAlpha = alpha
          ctx.strokeStyle = ARCHETYPE_COLORS[n.a] || '#7c6ef5'
          ctx.lineWidth = 0.5
          ctx.setLineDash([3, 6])
          ctx.beginPath()
          ctx.moveTo(n.x * W, n.y * H)
          ctx.lineTo(n2.x * W, n2.y * H)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.globalAlpha = 1
        })
      })

      // Orbs
      NODES.forEach((n, i) => {
        const x = n.x * W
        const y = n.y * H
        const pulse = 1 + 0.08 * Math.sin((frame * 0.02) + i * 0.7)
        const r = n.size * pulse
        const col = ARCHETYPE_COLORS[n.a] || '#7c6ef5'

        // Glow
        const gd = ctx.createRadialGradient(x, y, 0, x, y, r * 5)
        gd.addColorStop(0, col + '30')
        gd.addColorStop(1, col + '00')
        ctx.fillStyle = gd
        ctx.beginPath()
        ctx.arc(x, y, r * 5, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = col
        ctx.globalAlpha = 0.9
        ctx.fill()
        ctx.globalAlpha = 1
      })
    }

    function loop() {
      draw()
      raf = requestAnimationFrame(loop)
    }
    loop()

    const ro = new ResizeObserver(() => { draw() })
    ro.observe(canvas)

    return () => { cancelAnimationFrame(raf); ro.disconnect() }
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* ── Navbar ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 64,
        borderBottom: '0.5px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 50,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <div style={{
          fontFamily: 'var(--font-brand)',
          fontSize: 22,
          color: 'var(--text-primary)',
          letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="var(--accent)" strokeWidth="0.8" opacity="0.7"/>
            <path d="M12 3 Q17 7.5 17 12 Q17 16.5 12 21 Q7 16.5 7 12 Q7 7.5 12 3Z" fill="var(--accent)" opacity="0.15"/>
            <circle cx="12" cy="12" r="2" fill="var(--accent)" opacity="0.9"/>
          </svg>
          Dream<span style={{ color: 'var(--accent)' }}>Atlas</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link href="/auth/login" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost" style={{ padding: '9px 20px', fontSize: 13 }}>
              Sign in
            </button>
          </Link>
          <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ width: 'auto', padding: '9px 22px', fontSize: 14 }}>
              Start dreaming
            </button>
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <main style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        minHeight: 'calc(100vh - 64px)',
      }}
        className="landing-grid"
      >
        {/* Left — copy */}
        <div style={{
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '80px 56px',
        }}>
          <div className="stagger">
            {/* Badge */}
            <div className="animate-fade-up" style={{ marginBottom: 28 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 14px', borderRadius: 40,
                border: '0.5px solid rgba(124,110,245,0.3)',
                background: 'var(--accent-dim)',
                color: 'var(--accent-light)',
                fontSize: 11, letterSpacing: '0.12em',
                fontFamily: 'var(--font-body)', fontWeight: 500,
                textTransform: 'uppercase',
              }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent-light)', display: 'inline-block' }} />
                Open source · Free forever
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-up" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(40px, 4.5vw, 66px)',
              fontWeight: 500,
              fontStyle: 'italic',
              lineHeight: 1.12,
              letterSpacing: '-0.02em',
              color: 'var(--text-primary)',
              marginBottom: 24,
            }}>
              The world is dreaming.<br />
              <span style={{ color: 'var(--accent-light)' }}>Now we can see it.</span>
            </h1>

            {/* Body */}
            <p className="animate-fade-up" style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 17, lineHeight: 1.75,
              color: 'var(--text-secondary)',
              maxWidth: 460, marginBottom: 40,
            }}>
              Log your dreams each morning. AI reveals the archetypes and symbols hidden inside.
              Watch your unconscious appear on a living map shared by thousands of dreamers worldwide.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{
                  width: 'auto', padding: '15px 36px', fontSize: 17,
                }}>
                  Begin your atlas
                </button>
              </Link>
              <Link href="/map" style={{ textDecoration: 'none' }}>
                <button className="btn-ghost" style={{ padding: '15px 28px' }}>
                  Explore the map
                </button>
              </Link>
            </div>

            {/* Stats */}
            <div className="animate-fade-up" style={{
              display: 'flex', gap: 36, marginTop: 52,
              paddingTop: 36, borderTop: '0.5px solid var(--border)',
            }}>
              {[['2,847', 'dreams logged'], ['9', 'archetypes'], ['48', 'countries']].map(([val, label]) => (
                <div key={label}>
                  <div style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 28, fontWeight: 500,
                    color: 'var(--text-primary)',
                    lineHeight: 1,
                  }}>
                    {val}
                  </div>
                  <div style={{
                    fontSize: 11, color: 'var(--text-tertiary)',
                    letterSpacing: '0.08em', marginTop: 4,
                    fontFamily: 'var(--font-body)', textTransform: 'uppercase',
                  }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — canvas */}
        <div style={{
          position: 'relative',
          borderLeft: '0.5px solid var(--border)',
          overflow: 'hidden',
        }}>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 60% 60% at 50% 50%, var(--accent-glow), transparent 70%)',
          }} />

          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
          />

          {/* Overlay label */}
          <div style={{
            position: 'absolute', bottom: 28, left: 28, right: 28,
          }}>
            <div className="card-glass" style={{ padding: '16px 20px' }}>
              <div className="label" style={{ marginBottom: 6 }}>Live collective atlas</div>
              <p style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55,
              }}>
                Each point of light is a real dream, logged by a real person, somewhere in the world tonight.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Features strip ── */}
      <section style={{
        borderTop: '0.5px solid var(--border)',
        padding: '60px 56px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 32,
      }}
        className="features-grid"
      >
        {[
          {
            icon: '◎',
            title: 'AI Dream Analysis',
            body: 'Gemini reads your dream and surfaces its hidden archetypes, symbols, and Jungian essence — in seconds.',
          },
          {
            icon: '◈',
            title: 'The Collective Atlas',
            body: 'Every dream becomes a glowing point on a shared global map. Watch humanity\'s unconscious in real time.',
          },
          {
            icon: '◌',
            title: 'Dream Twins',
            body: 'AI compares your archetype fingerprint against every dreamer on earth and finds your unconscious doppelgänger.',
          },
        ].map(({ icon, title, body }) => (
          <div key={title} className="card" style={{ padding: '28px 24px' }}>
            <div style={{
              fontSize: 24, marginBottom: 14,
              color: 'var(--accent-light)',
            }}>
              {icon}
            </div>
            <h3 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20, fontWeight: 500, fontStyle: 'italic',
              color: 'var(--text-primary)', marginBottom: 10,
            }}>
              {title}
            </h3>
            <p style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 14, lineHeight: 1.7,
              color: 'var(--text-secondary)',
            }}>
              {body}
            </p>
          </div>
        ))}
      </section>

      <style>{`
        @media (max-width: 768px) {
          .landing-grid  { grid-template-columns: 1fr !important; }
          .landing-grid > div:last-child { height: 45vh; border-left: none !important; border-top: 0.5px solid var(--border); }
          .landing-grid > div:first-child { padding: 48px 24px !important; }
          .features-grid { grid-template-columns: 1fr !important; padding: 40px 24px !important; }
        }
      `}</style>
    </div>
  )
}