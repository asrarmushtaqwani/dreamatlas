'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

const NODES = [
  { x: 0.52, y: 0.30, a: 'Transcendence', s: 5 },
  { x: 0.28, y: 0.55, a: 'Nature',         s: 4 },
  { x: 0.70, y: 0.60, a: 'Voyage',         s: 6 },
  { x: 0.42, y: 0.72, a: 'Fear',           s: 4 },
  { x: 0.20, y: 0.25, a: 'Transformation', s: 5 },
  { x: 0.60, y: 0.18, a: 'Transcendence',  s: 3 },
  { x: 0.12, y: 0.45, a: 'Shadow',         s: 4 },
  { x: 0.80, y: 0.35, a: 'Voyage',         s: 5 },
  { x: 0.36, y: 0.42, a: 'Nature',         s: 3 },
  { x: 0.64, y: 0.76, a: 'Fear',           s: 4 },
  { x: 0.86, y: 0.20, a: 'Trickster',      s: 3 },
  { x: 0.48, y: 0.10, a: 'Transcendence',  s: 4 },
  { x: 0.16, y: 0.65, a: 'Shadow',         s: 3 },
  { x: 0.74, y: 0.50, a: 'Voyage',         s: 4 },
  { x: 0.32, y: 0.20, a: 'Nature',         s: 3 },
  { x: 0.50, y: 0.50, a: 'Void',           s: 5 },
  { x: 0.08, y: 0.30, a: 'Transformation', s: 4 },
  { x: 0.90, y: 0.60, a: 'Anima',          s: 4 },
  { x: 0.40, y: 0.16, a: 'Transcendence',  s: 3 },
  { x: 0.62, y: 0.40, a: 'Shadow',         s: 4 },
  { x: 0.76, y: 0.82, a: 'Voyage',         s: 3 },
  { x: 0.24, y: 0.80, a: 'Nature',         s: 4 },
  { x: 0.55, y: 0.88, a: 'Fear',           s: 3 },
  { x: 0.88, y: 0.78, a: 'Trickster',      s: 4 },
]

// Accent: light sky blue color
const ACCENT     = '#7dd3fc'
const ACCENT_DIM  = 'rgba(125,211,252,0.12)'
const ACCENT_GLOW = 'rgba(125,211,252,0.06)''

export default function LandingPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef  = useRef({ x: 0.5, y: 0.5 })
  const frameRef  = useRef(0)
  const rafRef    = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function resize() {
      canvas!.width  = canvas!.offsetWidth  * window.devicePixelRatio
      canvas!.height = canvas!.offsetHeight * window.devicePixelRatio
    }
    resize()

    function draw() {
      frameRef.current++
      const f   = frameRef.current
      const ctx = canvas!.getContext('2d')!
      const W   = canvas!.width
      const H   = canvas!.height
      const mx  = mouseRef.current.x
      const my  = mouseRef.current.y
      ctx.clearRect(0, 0, W, H)

      NODES.forEach((n, i) => {
        NODES.slice(i + 1).forEach(n2 => {
          if (n.a !== n2.a) return
          const dist = Math.hypot((n2.x - n.x) * W, (n2.y - n.y) * H)
          if (dist > W * 0.3) return
          const alpha = 0.07 * (1 - dist / (W * 0.3))
          ctx.globalAlpha = alpha
          ctx.strokeStyle = ARCHETYPE_COLORS[n.a] || ACCENT
          ctx.lineWidth   = 0.6
          ctx.setLineDash([2, 8])
          ctx.beginPath()
          ctx.moveTo(n.x * W, n.y * H)
          ctx.lineTo(n2.x * W, n2.y * H)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.globalAlpha = 1
        })
      })

      NODES.forEach((n, idx) => {
        const pulse = 1 + 0.1 * Math.sin(f * 0.018 + idx * 0.8)
        const mdx   = (mx - n.x) * 0.018
        const mdy   = (my - n.y) * 0.018
        const x     = (n.x + mdx) * W
        const y     = (n.y + mdy) * H
        const r     = n.s * pulse
        const col   = ARCHETYPE_COLORS[n.a] || ACCENT

        const gd = ctx.createRadialGradient(x, y, 0, x, y, r * 6)
        gd.addColorStop(0,   col + '30')
        gd.addColorStop(0.4, col + '10')
        gd.addColorStop(1,   col + '00')
        ctx.fillStyle = gd
        ctx.beginPath()
        ctx.arc(x, y, r * 6, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = col
        ctx.globalAlpha = 0.9
        ctx.fill()
        ctx.globalAlpha = 1
      })

      rafRef.current = requestAnimationFrame(draw)
    }

    draw()

    function onMouse(e: MouseEvent) {
      const rect = canvas!.getBoundingClientRect()
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width,
        y: (e.clientY - rect.top)  / rect.height,
      }
    }
    window.addEventListener('mousemove', onMouse)
    window.addEventListener('resize',    resize)
    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('mousemove', onMouse)
      window.removeEventListener('resize',    resize)
    }
  }, [])

  return (
    <div style={{
      background: '#0f0e0d',
      color: '#f0ece6',
      fontFamily: "'Cabinet Grotesk', 'DM Sans', sans-serif",
      minHeight: '100vh',
      overflowX: 'hidden',
    }}>

      {/* ── BACKGROUND ──────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {/* Warm rose glow — bottom center, like Cobot */}
        <div style={{
          position: 'absolute',
          bottom: '-30%', left: '15%', right: '15%',
          height: '70vh',
          background: 'radial-gradient(ellipse at 50% 100%, rgba(220,80,120,0.18) 0%, rgba(180,60,100,0.08) 35%, transparent 70%)',
          filter: 'blur(40px)',
          animation: 'blobFloat1 14s ease-in-out infinite',
        }} />
        {/* Warm amber ember — top right */}
        <div style={{
          position: 'absolute',
          top: '-10%', right: '-5%',
          width: '40vw', height: '40vw',
          background: 'radial-gradient(circle, rgba(200,120,60,0.10) 0%, rgba(180,80,40,0.04) 50%, transparent 75%)',
          filter: 'blur(60px)',
          animation: 'blobFloat2 18s ease-in-out infinite',
        }} />
        {/* Cool dark teal — left */}
        <div style={{
          position: 'absolute',
          top: '20%', left: '-10%',
          width: '35vw', height: '50vw',
          background: 'radial-gradient(circle, rgba(40,120,140,0.07) 0%, transparent 70%)',
          filter: 'blur(70px)',
          animation: 'blobFloat3 20s ease-in-out infinite',
        }} />
        {/* Grain texture */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '150px 150px',
        }} />
      </div>

      {/* ── NAVBAR ──────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 64,
        background: 'rgba(15,14,13,0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '0.5px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{
          fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
          fontSize: 20, fontStyle: 'italic', fontWeight: 700,
          color: '#f0ece6', letterSpacing: '-0.01em',
          display: 'flex', alignItems: 'center', gap: 9,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 35%, ${ACCENT}, rgba(180,60,100,0.7))`,
            boxShadow: `0 0 18px ${ACCENT}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, color: '#fff',
          }}>
            ✦
          </div>
          DreamAtlas
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="da-nav-links">
          {['Atlas', 'How it works', 'Worlds'].map(label => (
            <a key={label} href="#" style={{
              color: 'rgba(240,236,230,0.4)', fontSize: 14,
              textDecoration: 'none', transition: 'color 0.2s', fontWeight: 400,
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#f0ece6'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.4)'}
            >
              {label}
            </a>
          ))}
        </nav>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/auth/login" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'transparent',
              border: '0.5px solid rgba(255,255,255,0.12)',
              color: 'rgba(240,236,230,0.6)',
              borderRadius: 10, padding: '9px 20px',
              fontSize: 13, cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(255,255,255,0.22)'
                el.style.color = '#f0ece6'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(255,255,255,0.12)'
                el.style.color = 'rgba(240,236,230,0.6)'
              }}
            >
              Sign in
            </button>
          </Link>
          <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
            <button style={{
              background: ACCENT,
              border: 'none', color: '#fff',
              borderRadius: 10, padding: '9px 22px',
              fontSize: 13, cursor: 'pointer',
              fontFamily: 'inherit', fontWeight: 600,
              boxShadow: `0 4px 20px ${ACCENT}50`,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-1px)'
                el.style.boxShadow = `0 8px 28px ${ACCENT}65`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = `0 4px 20px ${ACCENT}50`
              }}
            >
              Start dreaming
            </button>
          </Link>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 100px',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '6px 16px', borderRadius: 40,
          border: `0.5px solid ${ACCENT}35`,
          background: ACCENT_DIM,
          color: ACCENT,
          fontSize: 12, fontWeight: 500, letterSpacing: '0.06em',
          marginBottom: 44,
          animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: ACCENT, display: 'inline-block',
            boxShadow: `0 0 8px ${ACCENT}`,
            animation: 'pulseDot 2s ease-in-out infinite',
          }} />
          Open source · Free forever
        </div>

        {/* Headline — line 1 */}
        <div style={{
          fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
          fontSize: 'clamp(56px, 9vw, 120px)',
          fontWeight: 700,
          lineHeight: 0.95,
          letterSpacing: '-0.03em',
          marginBottom: 8,
          animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both',
        }}>
          <span style={{ color: '#f0ece6' }}>The world is </span>
          <span style={{ color: ACCENT }}>dreaming.</span>
        </div>

        {/* Headline — line 2 */}
        <div style={{
          fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
          fontSize: 'clamp(56px, 9vw, 120px)',
          fontWeight: 700,
          lineHeight: 0.95,
          letterSpacing: '-0.03em',
          marginBottom: 8,
          animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.28s both',
        }}>
          <span style={{ color: '#f0ece6' }}>Now </span>
          <span style={{ color: ACCENT }}>you </span>
          <span style={{ color: '#f0ece6' }}>can see it.</span>
        </div>

        {/* Headline — line 3 */}
        <div style={{
          fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
          fontSize: 'clamp(56px, 9vw, 120px)',
          fontWeight: 700,
          lineHeight: 0.95,
          letterSpacing: '-0.03em',
          marginBottom: 52,
          animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.36s both',
        }}>
          <span style={{ color: '#f0ece6' }}>Join </span>
          <span style={{ color: ACCENT }}>DreamAtlas.</span>
        </div>

        {/* Subtext */}
        <p style={{
          fontSize: 'clamp(15px, 1.8vw, 18px)',
          lineHeight: 1.75,
          color: 'rgba(240,236,230,0.42)',
          maxWidth: 480,
          marginBottom: 52,
          fontFamily: "'Lora', Georgia, serif",
          fontStyle: 'italic',
          animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.44s both',
        }}>
          Log your dreams each morning. AI reveals the archetypes
          and symbols hidden inside. Watch your unconscious appear
          on a living map shared by thousands of dreamers worldwide.
        </p>

        {/* CTAs */}
        <div style={{
          display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
          marginBottom: 88,
          animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.52s both',
        }}>
          <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
            <button style={{
              background: ACCENT,
              color: '#fff', border: 'none',
              borderRadius: 14, padding: '17px 44px',
              fontSize: 16, cursor: 'pointer',
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: 'italic', fontWeight: 700,
              boxShadow: `0 8px 32px ${ACCENT}50`,
              transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              letterSpacing: '-0.01em',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-3px) scale(1.02)'
                el.style.boxShadow = `0 16px 44px ${ACCENT}65`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0) scale(1)'
                el.style.boxShadow = `0 8px 32px ${ACCENT}50`
              }}
            >
              Begin your atlas
            </button>
          </Link>
          <Link href="/map" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(240,236,230,0.65)',
              border: '0.5px solid rgba(255,255,255,0.1)',
              borderRadius: 14, padding: '17px 36px',
              fontSize: 15, cursor: 'pointer',
              fontFamily: "'Cabinet Grotesk', 'DM Sans', sans-serif",
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'rgba(255,255,255,0.09)'
                el.style.borderColor = 'rgba(255,255,255,0.18)'
                el.style.color = '#f0ece6'
                el.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'rgba(255,255,255,0.05)'
                el.style.borderColor = 'rgba(255,255,255,0.1)'
                el.style.color = 'rgba(240,236,230,0.65)'
                el.style.transform = 'translateY(0)'
              }}
            >
              Explore the map →
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 64,
          animation: 'fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.6s both',
        }}
          className="da-stats"
        >
          {[
            { val: '2,847', label: 'dreams mapped' },
            { val: '9',     label: 'archetypes' },
            { val: '48',    label: 'countries' },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 38, fontWeight: 700,
                color: '#f0ece6', lineHeight: 1, marginBottom: 5,
                letterSpacing: '-0.02em',
              }}>
                {val}
              </div>
              <div style={{
                fontSize: 11, color: 'rgba(240,236,230,0.3)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                fontFamily: "'Cabinet Grotesk', 'DM Sans', sans-serif",
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          animation: 'fadeIn 1s ease 1.4s both',
        }}>
          <span style={{ fontSize: 10, color: 'rgba(240,236,230,0.2)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
            scroll
          </span>
          <div style={{
            width: 1, height: 36,
            background: `linear-gradient(180deg, ${ACCENT}60, transparent)`,
            animation: 'scrollPulse 2s ease-in-out infinite',
          }} />
        </div>
      </section>

      {/* ── CANVAS ──────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 120px' }}>
        <div style={{
          borderRadius: 28, overflow: 'hidden',
          border: '0.5px solid rgba(255,255,255,0.06)',
          background: 'rgba(255,255,255,0.015)',
          height: '60vh', minHeight: 380, position: 'relative',
        }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

          <div style={{
            position: 'absolute', top: 22, left: 22,
            background: 'rgba(15,14,13,0.75)',
            backdropFilter: 'blur(12px)',
            border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: 10, padding: '9px 14px',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: '#4ade9a', boxShadow: '0 0 8px rgba(74,222,154,0.8)',
              animation: 'pulseDot 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: 12, color: 'rgba(240,236,230,0.45)', letterSpacing: '0.05em' }}>
              live collective atlas
            </span>
          </div>

          <div style={{
            position: 'absolute', bottom: 22, left: '50%',
            transform: 'translateX(-50%)',
            pointerEvents: 'none', whiteSpace: 'nowrap',
          }}>
            <p style={{
              fontFamily: "'Lora', Georgia, serif",
              fontStyle: 'italic', fontSize: 13,
              color: 'rgba(240,236,230,0.25)',
            }}>
              Each point of light is a real dream, logged by a real person, somewhere in the world tonight.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 140px' }}>
        <div style={{ textAlign: 'center', marginBottom: 68 }}>
          <div style={{
            fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase',
            color: `${ACCENT}80`, marginBottom: 16, fontWeight: 600,
          }}>
            What DreamAtlas does
          </div>
          <h2 style={{
            fontFamily: "'Fraunces', 'Playfair Display', Georgia, serif",
            fontSize: 'clamp(34px, 5vw, 58px)',
            fontWeight: 700, fontStyle: 'italic',
            lineHeight: 1.08, letterSpacing: '-0.025em',
            color: '#f0ece6',
          }}>
            Your unconscious,<br />finally visible.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }} className="da-features">
          {[
            { icon: '◎', color: ACCENT,    title: 'AI Dream Analysis',   body: 'Gemini reads your dream and surfaces archetypes, symbols, and a Jungian essence — in seconds.' },
            { icon: '◈', color: '#6b9fff', title: 'The Collective Atlas', body: "Every dream becomes a glowing point on a shared global map. Watch humanity's unconscious in real time." },
            { icon: '◌', color: '#c084fc', title: 'Dream Twins',         body: 'AI compares your archetype fingerprint against every dreamer on earth. Finds your unconscious doppelgänger.' },
            { icon: '✦', color: '#e2a84c', title: 'Dream Wrapped',       body: 'Every month, Gemini writes your dream portrait — archetypes, symbols, your unconscious fingerprint.' },
            { icon: '◉', color: '#4ade9a', title: 'Dreamworlds',         body: 'Nine Jungian territories. Your dreams are automatically placed into the worlds they inhabit.' },
            { icon: '◑', color: '#ff8fa3', title: 'Resonance',           body: 'AI scores the symbolic overlap between your dreams and others. Discover shared unconscious territory.' },
          ].map(({ icon, color, title, body }) => (
            <div key={title} style={{
              padding: '26px 24px', borderRadius: 20,
              border: '0.5px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.025)',
              backdropFilter: 'blur(8px)',
              transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
              position: 'relative', overflow: 'hidden',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-4px)'
                el.style.borderColor = `${color}28`
                el.style.background = 'rgba(255,255,255,0.04)'
                el.style.boxShadow = `0 20px 50px rgba(0,0,0,0.35), 0 0 0 0.5px ${color}18`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.borderColor = 'rgba(255,255,255,0.06)'
                el.style.background = 'rgba(255,255,255,0.025)'
                el.style.boxShadow = 'none'
              }}
            >
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                background: `linear-gradient(90deg, transparent, ${color}45, transparent)`,
              }} />
              <div style={{ fontSize: 26, marginBottom: 14, color, textShadow: `0 0 20px ${color}50` }}>
                {icon}
              </div>
              <h3 style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 19, fontWeight: 700, fontStyle: 'italic',
                color: '#f0ece6', marginBottom: 9, letterSpacing: '-0.01em',
              }}>
                {title}
              </h3>
              <p style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: 14, lineHeight: 1.75,
                color: 'rgba(240,236,230,0.42)',
              }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ──────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '0 48px 160px', textAlign: 'center' }}>
        <div style={{
          maxWidth: 680, margin: '0 auto',
          padding: '80px 48px',
          borderRadius: 32,
          border: `0.5px solid ${ACCENT}20`,
          background: `radial-gradient(ellipse 80% 60% at 50% 100%, ${ACCENT}09, transparent 65%)`,
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
            background: `linear-gradient(90deg, transparent, ${ACCENT}45, transparent)`,
          }} />
          <h2 style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 'clamp(30px, 5vw, 54px)',
            fontWeight: 700, fontStyle: 'italic',
            lineHeight: 1.05, letterSpacing: '-0.025em',
            color: '#f0ece6', marginBottom: 18,
          }}>
            Be there,<br />even when you're asleep.
          </h2>
          <p style={{
            fontFamily: "'Lora', Georgia, serif",
            fontStyle: 'italic', fontSize: 16,
            color: 'rgba(240,236,230,0.4)',
            marginBottom: 40, lineHeight: 1.7,
          }}>
            Join thousands of dreamers mapping the collective unconscious.
          </p>
          <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
            <button style={{
              background: ACCENT, color: '#fff', border: 'none',
              borderRadius: 14, padding: '16px 48px',
              fontSize: 16, cursor: 'pointer',
              fontFamily: "'Fraunces', Georgia, serif",
              fontStyle: 'italic', fontWeight: 700,
              boxShadow: `0 8px 32px ${ACCENT}45`,
              transition: 'all 0.25s',
              letterSpacing: '-0.01em',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = `0 16px 44px ${ACCENT}60`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = `0 8px 32px ${ACCENT}45`
              }}
            >
              Start dreaming — it's free
            </button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        padding: '28px 48px',
        borderTop: '0.5px solid rgba(255,255,255,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 16, fontStyle: 'italic', fontWeight: 700,
          color: 'rgba(240,236,230,0.35)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: `${ACCENT}70`, fontSize: 11 }}>✦</span>
          DreamAtlas
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {['Open source', 'AGPL-3.0', 'GitHub'].map(label => (
            <a key={label} href="#" style={{
              fontSize: 13, color: 'rgba(240,236,230,0.22)',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.5)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.22)'}
            >
              {label}
            </a>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(240,236,230,0.18)' }}>
          © 2026 DreamAtlas
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,700;0,900;1,700;1,900&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=Lora:ital@1&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulseDot {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes blobFloat1 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(2%,-3%) scale(1.04); }
          70%      { transform: translate(-1%,2%) scale(0.97); }
        }
        @keyframes blobFloat2 {
          0%,100% { transform: translate(0,0); }
          50%      { transform: translate(-3%,4%); }
        }
        @keyframes blobFloat3 {
          0%,100% { transform: translate(0,0); }
          60%      { transform: translate(4%,-2%); }
        }
        @keyframes scrollPulse {
          0%   { opacity: 0; transform: scaleY(0); transform-origin: top; }
          50%  { opacity: 1; transform: scaleY(1); transform-origin: top; }
          100% { opacity: 0; transform: scaleY(1); transform-origin: bottom; }
        }

        @media (max-width: 768px) {
          .da-nav-links { display: none !important; }
          .da-features  { grid-template-columns: 1fr !important; }
          .da-stats      { gap: 36px !important; }
        }
        @media (max-width: 960px) {
          .da-features { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}