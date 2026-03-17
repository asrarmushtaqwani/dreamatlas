'use client'
import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
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

      // Connections
      NODES.forEach((n, i) => {
        NODES.slice(i + 1).forEach(n2 => {
          if (n.a !== n2.a) return
          const dist = Math.hypot((n2.x - n.x) * W, (n2.y - n.y) * H)
          if (dist > W * 0.3) return
          const alpha = 0.06 * (1 - dist / (W * 0.3))
          ctx.globalAlpha = alpha
          ctx.strokeStyle = ARCHETYPE_COLORS[n.a] || '#7c6ef5'
          ctx.lineWidth   = 0.8
          ctx.setLineDash([2, 8])
          ctx.beginPath()
          ctx.moveTo(n.x * W, n.y * H)
          ctx.lineTo(n2.x * W, n2.y * H)
          ctx.stroke()
          ctx.setLineDash([])
          ctx.globalAlpha = 1
        })
      })

      // Orbs
      NODES.forEach((n, idx) => {
        const pulse   = 1 + 0.1 * Math.sin(f * 0.018 + idx * 0.8)
        const mdx     = (mx - n.x) * 0.015
        const mdy     = (my - n.y) * 0.015
        const x       = (n.x + mdx) * W
        const y       = (n.y + mdy) * H
        const r       = n.s * pulse
        const col     = ARCHETYPE_COLORS[n.a] || '#7c6ef5'

        // Outer glow
        const gd = ctx.createRadialGradient(x, y, 0, x, y, r * 6)
        gd.addColorStop(0,   col + '28')
        gd.addColorStop(0.4, col + '10')
        gd.addColorStop(1,   col + '00')
        ctx.fillStyle = gd
        ctx.beginPath()
        ctx.arc(x, y, r * 6, 0, Math.PI * 2)
        ctx.fill()

        // Core
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = col
        ctx.globalAlpha = 0.85
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
      background: '#05040c',
      color: '#ede8f5',
      fontFamily: "'DM Sans', sans-serif",
      minHeight: '100vh',
      overflow: 'hidden',
    }}>

      {/* ── BACKGROUND BLOBS ───────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {/* Large indigo blob — top left */}
        <div style={{
          position: 'absolute',
          top: '-20%', left: '-15%',
          width: '70vw', height: '70vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(100,80,255,0.18) 0%, rgba(80,60,220,0.08) 40%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'blobFloat1 12s ease-in-out infinite',
        }} />
        {/* Violet blob — bottom right */}
        <div style={{
          position: 'absolute',
          bottom: '-25%', right: '-20%',
          width: '65vw', height: '65vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(160,80,255,0.14) 0%, rgba(120,60,200,0.06) 40%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'blobFloat2 15s ease-in-out infinite',
        }} />
        {/* Teal accent blob — center */}
        <div style={{
          position: 'absolute',
          top: '30%', left: '40%',
          width: '40vw', height: '40vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(80,180,200,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'blobFloat3 18s ease-in-out infinite',
        }} />
        {/* Grain overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }} />
      </div>

      {/* ── NAVBAR ─────────────────────────────────────── */}
      <header style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 48px', height: 68,
        background: 'rgba(5,4,12,0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '0.5px solid rgba(255,255,255,0.06)',
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: 20, color: '#ede8f5',
        }}>
          <div style={{
            width: 30, height: 30,
            background: 'radial-gradient(circle at 40% 35%, rgba(130,110,255,0.9), rgba(90,70,220,0.7))',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, boxShadow: '0 0 20px rgba(120,100,255,0.5)',
          }}>
            ✦
          </div>
          DreamAtlas
        </div>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }}
          className="nav-links"
        >
          {['Atlas', 'How it works', 'Worlds'].map(label => (
            <a key={label} href="#" style={{
              color: 'rgba(237,232,245,0.45)', fontSize: 14,
              textDecoration: 'none', transition: 'color 0.2s',
              fontWeight: 400,
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ede8f5'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(237,232,245,0.45)'}
            >
              {label}
            </a>
          ))}
        </nav>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <Link href="/auth/login" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'transparent',
              border: '0.5px solid rgba(255,255,255,0.12)',
              color: 'rgba(237,232,245,0.7)',
              borderRadius: 10, padding: '9px 20px',
              fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s', fontFamily: 'inherit',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(255,255,255,0.22)'
                el.style.color = '#ede8f5'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.borderColor = 'rgba(255,255,255,0.12)'
                el.style.color = 'rgba(237,232,245,0.7)'
              }}
            >
              Sign in
            </button>
          </Link>
          <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, #7c6ef5, #6255d4)',
              border: 'none', color: '#fff',
              borderRadius: 10, padding: '9px 22px',
              fontSize: 13, cursor: 'pointer',
              transition: 'all 0.2s', fontFamily: 'inherit', fontWeight: 500,
              boxShadow: '0 4px 20px rgba(124,110,245,0.4)',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-1px)'
                el.style.boxShadow = '0 6px 28px rgba(124,110,245,0.55)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 4px 20px rgba(124,110,245,0.4)'
              }}
            >
              Start dreaming
            </button>
          </Link>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1,
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: '120px 24px 80px',
      }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '6px 16px', borderRadius: 40,
          border: '0.5px solid rgba(124,110,245,0.3)',
          background: 'rgba(124,110,245,0.1)',
          color: 'rgba(180,168,255,0.9)',
          fontSize: 12, fontWeight: 500, letterSpacing: '0.08em',
          marginBottom: 36,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#7c6ef5',
            boxShadow: '0 0 8px rgba(124,110,245,0.8)',
            display: 'inline-block',
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          Open source · Free forever
        </div>

        {/* Main headline */}
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(52px, 8vw, 110px)',
          fontWeight: 700,
          fontStyle: 'italic',
          lineHeight: 1.02,
          letterSpacing: '-0.03em',
          color: '#ede8f5',
          maxWidth: 900,
          marginBottom: 0,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both',
        }}>
          The world is dreaming.
        </h1>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(52px, 8vw, 110px)',
          fontWeight: 700,
          fontStyle: 'italic',
          lineHeight: 1.02,
          letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #9d91f7 0%, #c084fc 50%, #818cf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          maxWidth: 900,
          marginBottom: 32,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both',
        }}>
          Now we can see it.
        </h1>

        {/* Subheading */}
        <p style={{
          fontSize: 'clamp(16px, 2vw, 20px)',
          lineHeight: 1.7,
          color: 'rgba(237,232,245,0.5)',
          maxWidth: 520,
          marginBottom: 48,
          fontFamily: "'Lora', Georgia, serif",
          fontStyle: 'italic',
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both',
        }}>
          Log your dreams each morning. AI reveals the archetypes and symbols
          hidden inside. Watch your unconscious appear on a living map shared
          by thousands of dreamers worldwide.
        </p>

        {/* CTA buttons */}
        <div style={{
          display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center',
          marginBottom: 80,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.5s both',
        }}>
          <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, #7c6ef5 0%, #6255d4 100%)',
              color: '#fff', border: 'none',
              borderRadius: 14, padding: '16px 40px',
              fontSize: 16, cursor: 'pointer',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic', fontWeight: 600,
              transition: 'all 0.25s cubic-bezier(0.16,1,0.3,1)',
              boxShadow: '0 8px 32px rgba(124,110,245,0.45)',
              letterSpacing: '0.01em',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-3px) scale(1.02)'
                el.style.boxShadow = '0 14px 40px rgba(124,110,245,0.6)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0) scale(1)'
                el.style.boxShadow = '0 8px 32px rgba(124,110,245,0.45)'
              }}
            >
              Begin your atlas
            </button>
          </Link>
          <Link href="/map" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(237,232,245,0.75)',
              border: '0.5px solid rgba(255,255,255,0.12)',
              borderRadius: 14, padding: '16px 36px',
              fontSize: 15, cursor: 'pointer',
              fontFamily: "'DM Sans', sans-serif",
              transition: 'all 0.2s',
              backdropFilter: 'blur(10px)',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'rgba(255,255,255,0.08)'
                el.style.borderColor = 'rgba(255,255,255,0.2)'
                el.style.color = '#ede8f5'
                el.style.transform = 'translateY(-2px)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.background = 'rgba(255,255,255,0.05)'
                el.style.borderColor = 'rgba(255,255,255,0.12)'
                el.style.color = 'rgba(237,232,245,0.75)'
                el.style.transform = 'translateY(0)'
              }}
            >
              Explore the map →
            </button>
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: 56,
          animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.6s both',
        }}
          className="stats-row"
        >
          {[
            { val: '2,847', label: 'dreams mapped' },
            { val: '9',     label: 'archetypes' },
            { val: '48',    label: 'countries' },
          ].map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 36, fontWeight: 700,
                color: '#ede8f5', lineHeight: 1,
                marginBottom: 4,
              }}>
                {val}
              </div>
              <div style={{
                fontSize: 12, color: 'rgba(237,232,245,0.35)',
                letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Scroll hint */}
        <div style={{
          position: 'absolute', bottom: 32, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          animation: 'fadeIn 1s ease 1.2s both',
        }}>
          <span style={{ fontSize: 11, color: 'rgba(237,232,245,0.25)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            scroll
          </span>
          <div style={{
            width: 1, height: 40,
            background: 'linear-gradient(180deg, rgba(124,110,245,0.5), transparent)',
            animation: 'scrollLine 2s ease-in-out infinite',
          }} />
        </div>
      </section>

      {/* ── CANVAS SECTION ─────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '0 48px 120px',
      }}>
        <div style={{
          position: 'relative',
          borderRadius: 28,
          overflow: 'hidden',
          border: '0.5px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)',
          backdropFilter: 'blur(4px)',
          height: '60vh',
          minHeight: 400,
        }}>
          <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />

          {/* Overlay label */}
          <div style={{
            position: 'absolute', top: 24, left: 24,
            background: 'rgba(5,4,12,0.7)',
            backdropFilter: 'blur(12px)',
            border: '0.5px solid rgba(255,255,255,0.08)',
            borderRadius: 12, padding: '10px 16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#4ade9a',
                boxShadow: '0 0 8px rgba(74,222,154,0.8)',
                animation: 'pulse 2s ease-in-out infinite',
              }} />
              <span style={{ fontSize: 12, color: 'rgba(237,232,245,0.5)', letterSpacing: '0.06em' }}>
                live collective atlas
              </span>
            </div>
          </div>

          {/* Bottom caption */}
          <div style={{
            position: 'absolute', bottom: 24, left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}>
            <p style={{
              fontFamily: "'Lora', Georgia, serif",
              fontStyle: 'italic', fontSize: 14,
              color: 'rgba(237,232,245,0.3)',
              whiteSpace: 'nowrap',
            }}>
              Each point of light is a real dream, logged by a real person, somewhere in the world tonight.
            </p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '0 48px 140px',
      }}>
        {/* Section heading */}
        <div style={{ textAlign: 'center', marginBottom: 72 }}>
          <div style={{
            fontSize: 12, letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(124,110,245,0.7)', marginBottom: 16, fontWeight: 500,
          }}>
            What DreamAtlas does
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(36px, 5vw, 60px)',
            fontWeight: 600, fontStyle: 'italic',
            lineHeight: 1.1, letterSpacing: '-0.02em',
            color: '#ede8f5',
          }}>
            Your unconscious,<br />finally visible.
          </h2>
        </div>

        {/* Feature cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
        }}
          className="features-grid"
        >
          {[
            {
              icon: '◎',
              color: '#7c6ef5',
              title: 'AI Dream Analysis',
              body: 'Gemini reads your dream and surfaces archetypes, symbols, and a Jungian essence — in seconds. Not generic summaries. Depth.',
            },
            {
              icon: '◈',
              color: '#6b9fff',
              title: 'The Collective Atlas',
              body: "Every dream becomes a glowing point on a shared global map. Watch humanity's unconscious in real time as dreams pour in from every timezone.",
            },
            {
              icon: '◌',
              color: '#c084fc',
              title: 'Dream Twins',
              body: 'AI compares your archetype fingerprint against every dreamer on earth. Finds your unconscious doppelgänger — the person whose inner world mirrors yours.',
            },
            {
              icon: '✦',
              color: '#c9a84c',
              title: 'Dream Wrapped',
              body: 'Every month, Gemini writes your dream portrait — dominant archetypes, recurring symbols, your unconscious fingerprint. A letter from your sleeping self.',
            },
            {
              icon: '◉',
              color: '#4ade9a',
              title: 'Dreamworlds',
              body: 'Nine Jungian territories — Fear, Transcendence, Shadow, Void, and more. Your dreams are automatically placed into the worlds they inhabit.',
            },
            {
              icon: '◑',
              color: '#ff6b8a',
              title: 'Resonance',
              body: 'AI scores the symbolic overlap between your dreams and others. Discover which strangers you share unconscious territory with.',
            },
          ].map(({ icon, color, title, body }, i) => (
            <div
              key={title}
              style={{
                padding: '28px 26px',
                borderRadius: 20,
                border: '0.5px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.025)',
                backdropFilter: 'blur(8px)',
                transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                cursor: 'default',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-4px)'
                el.style.borderColor = `${color}30`
                el.style.background = `rgba(255,255,255,0.04)`
                el.style.boxShadow = `0 20px 60px rgba(0,0,0,0.3), 0 0 0 0.5px ${color}20`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.borderColor = 'rgba(255,255,255,0.07)'
                el.style.background = 'rgba(255,255,255,0.025)'
                el.style.boxShadow = 'none'
              }}
            >
              {/* Color top edge */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                background: `linear-gradient(90deg, transparent, ${color}50, transparent)`,
              }} />

              <div style={{
                fontSize: 28, marginBottom: 16, color,
                textShadow: `0 0 20px ${color}60`,
              }}>
                {icon}
              </div>
              <h3 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: 20, fontWeight: 600, fontStyle: 'italic',
                color: '#ede8f5', marginBottom: 10,
              }}>
                {title}
              </h3>
              <p style={{
                fontFamily: "'Lora', Georgia, serif",
                fontSize: 14, lineHeight: 1.75,
                color: 'rgba(237,232,245,0.45)',
              }}>
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOTTOM CTA ─────────────────────────────────── */}
      <section style={{
        position: 'relative', zIndex: 1,
        padding: '0 48px 160px',
        textAlign: 'center',
      }}>
        <div style={{
          maxWidth: 700, margin: '0 auto',
          padding: '80px 48px',
          borderRadius: 32,
          border: '0.5px solid rgba(124,110,245,0.2)',
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(124,110,245,0.08), rgba(5,4,12,0.0))',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%', height: 1,
            background: 'linear-gradient(90deg, transparent, rgba(124,110,245,0.5), transparent)',
          }} />
          <h2 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 'clamp(32px, 5vw, 56px)',
            fontWeight: 700, fontStyle: 'italic',
            lineHeight: 1.1, letterSpacing: '-0.02em',
            color: '#ede8f5', marginBottom: 20,
          }}>
            Be there,<br />even when you're asleep.
          </h2>
          <p style={{
            fontFamily: "'Lora', Georgia, serif",
            fontStyle: 'italic', fontSize: 17,
            color: 'rgba(237,232,245,0.45)',
            marginBottom: 40, lineHeight: 1.7,
          }}>
            Join thousands of dreamers mapping the collective unconscious.
          </p>
          <Link href="/auth/signup" style={{ textDecoration: 'none' }}>
            <button style={{
              background: 'linear-gradient(135deg, #7c6ef5 0%, #6255d4 100%)',
              color: '#fff', border: 'none',
              borderRadius: 14, padding: '16px 48px',
              fontSize: 16, cursor: 'pointer',
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic', fontWeight: 600,
              boxShadow: '0 8px 32px rgba(124,110,245,0.45)',
              transition: 'all 0.25s',
            }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(-3px)'
                el.style.boxShadow = '0 14px 40px rgba(124,110,245,0.6)'
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement
                el.style.transform = 'translateY(0)'
                el.style.boxShadow = '0 8px 32px rgba(124,110,245,0.45)'
              }}
            >
              Start dreaming — it's free
            </button>
          </Link>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        padding: '32px 48px',
        borderTop: '0.5px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: 16, color: 'rgba(237,232,245,0.4)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: 'rgba(124,110,245,0.6)', fontSize: 12 }}>✦</span>
          DreamAtlas
        </div>
        <div style={{ display: 'flex', gap: 28 }}>
          {['Open source', 'AGPL-3.0', 'GitHub'].map(label => (
            <a key={label} href="#" style={{
              fontSize: 13, color: 'rgba(237,232,245,0.25)',
              textDecoration: 'none', transition: 'color 0.2s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(237,232,245,0.55)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(237,232,245,0.25)'}
            >
              {label}
            </a>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'rgba(237,232,245,0.2)' }}>
          © 2026 DreamAtlas
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600;1,700&family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500&family=Lora:ital@1&display=swap');

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes pulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50%      { opacity: 0.6; transform: scale(0.85); }
        }
        @keyframes blobFloat1 {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(3%,4%) scale(1.03); }
          66%      { transform: translate(-2%,2%) scale(0.98); }
        }
        @keyframes blobFloat2 {
          0%,100% { transform: translate(0,0) scale(1); }
          40%      { transform: translate(-4%,-3%) scale(1.05); }
          70%      { transform: translate(2%,-1%) scale(0.97); }
        }
        @keyframes blobFloat3 {
          0%,100% { transform: translate(0,0) scale(1); }
          50%      { transform: translate(-3%,5%) scale(1.08); }
        }
        @keyframes scrollLine {
          0%   { opacity: 0; transform: scaleY(0); transform-origin: top; }
          50%  { opacity: 1; transform: scaleY(1); transform-origin: top; }
          100% { opacity: 0; transform: scaleY(1); transform-origin: bottom; }
        }

        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .features-grid { grid-template-columns: 1fr !important; }
          .stats-row { gap: 32px !important; }
        }
        @media (max-width: 900px) {
          .features-grid { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>
    </div>
  )
}