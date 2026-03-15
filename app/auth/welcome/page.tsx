'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

const PARTICLES = 80
const ARCHETYPES = ['Transcendence', 'Voyage', 'Shadow', 'Nature', 'Transformation']
const COLORS = ['#8b6fff', '#6b9fff', '#ff6b8a', '#6bffb8', '#ffcc6b', '#c46bff']

export default function WelcomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const router = useRouter()
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 1200),
      setTimeout(() => setStage(2), 2400),
      setTimeout(() => setStage(3), 3400),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let raf: number
    let t = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const particles = Array.from({ length: PARTICLES }, (_, i) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      tx: 0.2 * window.innerWidth + Math.random() * 0.6 * window.innerWidth,
      ty: 0.2 * window.innerHeight + Math.random() * 0.6 * window.innerHeight,
      r: Math.random() * 2 + 1,
      col: COLORS[Math.floor(Math.random() * COLORS.length)],
      speed: Math.random() * 0.02 + 0.01,
      phase: Math.random() * Math.PI * 2,
      arrived: false,
    }))

    const draw = () => {
      t += 0.008
      ctx.fillStyle = 'rgba(8,7,17,0.15)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach(p => {
        if (!p.arrived) {
          p.x += (p.tx - p.x) * p.speed
          p.y += (p.ty - p.y) * p.speed
          if (Math.hypot(p.tx - p.x, p.ty - p.y) < 2) p.arrived = true
        } else {
          p.x = p.tx + Math.sin(t + p.phase) * 12
          p.y = p.ty + Math.cos(t * 0.7 + p.phase) * 8
        }

        const gd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4)
        gd.addColorStop(0, p.col + '60')
        gd.addColorStop(1, p.col + '00')
        ctx.fillStyle = gd
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill()
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.col; ctx.fill()
      })

      particles.forEach((p, i) => {
        particles.slice(i + 1, i + 6).forEach(p2 => {
          const dist = Math.hypot(p2.x - p.x, p2.y - p.y)
          if (dist < 80) {
            ctx.globalAlpha = 0.06 * (1 - dist / 80)
            ctx.strokeStyle = p.col
            ctx.lineWidth = 0.5
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.stroke()
            ctx.globalAlpha = 1
          }
        })
      })

      raf = requestAnimationFrame(draw)
    }

    ctx.fillStyle = '#080711'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    draw()

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%' }} />
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '24px', maxWidth: 520 }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 32px', background: 'rgba(139,111,255,0.15)', border: '0.5px solid rgba(139,111,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, animation: 'orbPulse 3s ease-in-out infinite' }}>✦</div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(36px, 8vw, 56px)', fontWeight: 300, fontStyle: 'italic', color: '#f0ecff', lineHeight: 1.2, marginBottom: 16, opacity: stage >= 1 ? 1 : 0, transform: stage >= 1 ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease' }}>
          You have entered<br /><span style={{ color: '#8b6fff' }}>the atlas</span>
        </div>
        <div style={{ fontSize: 16, color: 'rgba(138,130,168,1)', lineHeight: 1.7, marginBottom: 48, opacity: stage >= 2 ? 1 : 0, transform: stage >= 2 ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.8s ease' }}>
          Your unconscious is ready to be mapped.<br />Log your first dream and watch it appear on the atlas.
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 40, opacity: stage >= 2 ? 1 : 0, transition: 'opacity 1s ease 0.3s' }}>
          {ARCHETYPES.map((a, i) => (
            <div key={a} style={{ padding: '5px 14px', borderRadius: 20, fontSize: 12, background: `${COLORS[i]}18`, border: `0.5px solid ${COLORS[i]}50`, color: COLORS[i] }}>{a}</div>
          ))}
        </div>
        <button onClick={() => router.push('/log')} style={{ padding: '16px 48px', background: '#8b6fff', border: 'none', borderRadius: 14, color: 'white', fontFamily: 'Georgia, serif', fontSize: 20, fontStyle: 'italic', fontWeight: 300, cursor: 'pointer', opacity: stage >= 3 ? 1 : 0, transform: stage >= 3 ? 'translateY(0)' : 'translateY(16px)', transition: 'all 0.8s ease' }}>
          log your first dream
        </button>
        <div style={{ marginTop: 20, fontSize: 13, color: 'rgba(74,68,104,1)', opacity: stage >= 3 ? 1 : 0, transition: 'opacity 0.8s ease 0.3s' }}>
          or <span onClick={() => router.push('/map')} style={{ color: '#8b6fff', cursor: 'pointer' }}>explore the atlas first</span>
        </div>
      </div>
      <style>{`@keyframes orbPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.08)} }`}</style>
    </div>
  )
}