'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import { MapNode, Archetype } from '@/types'

const ARCHETYPES = Object.keys(ARCHETYPE_COLORS) as Archetype[]

const FALLBACK_NODES: MapNode[] = [
  { id:'1', text:'Flying over a city made of mirrors...', archetype:'Transcendence', map_x:0.55, map_y:0.35 },
  { id:'2', text:'Forest where trees whispered names...', archetype:'Nature', map_x:0.3, map_y:0.6 },
  { id:'3', text:'Sailing an ink-black ocean...', archetype:'Voyage', map_x:0.7, map_y:0.65 },
  { id:'4', text:'Something chasing me through a crowd...', archetype:'Fear', map_x:0.45, map_y:0.75 },
  { id:'5', text:'Becoming someone else entirely...', archetype:'Transformation', map_x:0.25, map_y:0.3 },
  { id:'6', text:'Dissolving into warm starlight...', archetype:'Transcendence', map_x:0.6, map_y:0.2 },
  { id:'7', text:'A door at the end of every hallway...', archetype:'Shadow', map_x:0.15, map_y:0.5 },
  { id:'8', text:'A ship that sailed itself home...', archetype:'Voyage', map_x:0.8, map_y:0.4 },
  { id:'9', text:'Flowers growing from my hands...', archetype:'Nature', map_x:0.4, map_y:0.45 },
  { id:'10', text:'Running and never moving...', archetype:'Fear', map_x:0.65, map_y:0.8 },
  { id:'11', text:'Time running backwards...', archetype:'Transformation', map_x:0.1, map_y:0.35 },
  { id:'12', text:'The moon was watching me...', archetype:'Anima', map_x:0.9, map_y:0.6 },
  { id:'13', text:'A city that kept rearranging itself...', archetype:'Trickster', map_x:0.85, map_y:0.25 },
  { id:'14', text:'An eye at the centre of everything...', archetype:'Void', map_x:0.5, map_y:0.55 },
  { id:'15', text:'I was made of light and shadow...', archetype:'Shadow', map_x:0.2, map_y:0.7 },
  { id:'16', text:'Swimming upward through clouds...', archetype:'Voyage', map_x:0.75, map_y:0.55 },
  { id:'17', text:'Speaking a language nobody knew...', archetype:'Trickster', map_x:0.35, map_y:0.25 },
  { id:'18', text:'Infinite rooms, each a memory...', archetype:'Shadow', map_x:0.55, map_y:0.7 },
  { id:'19', text:'A garden that kept growing inward...', archetype:'Nature', map_x:0.42, map_y:0.85 },
  { id:'20', text:'Falling toward a second sun...', archetype:'Transcendence', map_x:0.5, map_y:0.15 },
]

interface TooltipState {
  node: MapNode
  x: number
  y: number
}

export default function MapPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const nodesRef = useRef<(MapNode & { px: number; py: number })[]>([])
  const animFrameRef = useRef<number>(0)
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; alpha: number; col: string }[]>([])

  const [nodes, setNodes] = useState<MapNode[]>(FALLBACK_NODES)
  const [filter, setFilter] = useState<string>('all')
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [liveCount, setLiveCount] = useState(2847)

  // Fetch real dreams
  useEffect(() => {
    fetch('/api/dreams')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setNodes(data.map((d: any) => ({
            id: d.id,
            text: d.text?.slice(0, 80) + '...',
            archetype: d.archetypes?.[0] || 'Voyage',
            map_x: d.map_x,
            map_y: d.map_y,
          })))
          setLiveCount(data.length)
        }
      })
      .catch(() => {})
  }, [])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight
    const W = canvas.width, H = canvas.height
    const ctx = canvas.getContext('2d')!

    ctx.fillStyle = '#080711'
    ctx.fillRect(0, 0, W, H)

    // Subtle center glow
    const cg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, Math.min(W, H) * 0.6)
    cg.addColorStop(0, 'rgba(139,111,255,0.04)')
    cg.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H)

    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.02)'
    ctx.lineWidth = 0.5
    ctx.setLineDash([2, 8])
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo(W * i / 4, 0); ctx.lineTo(W * i / 4, H); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, H * i / 4); ctx.lineTo(W, H * i / 4); ctx.stroke()
    }
    ctx.setLineDash([])

    const visible = filter === 'all' ? nodes : nodes.filter(n => n.archetype === filter)
    const mapped = visible.map(n => ({ ...n, px: n.map_x * W, py: n.map_y * H }))
    nodesRef.current = mapped

    // Connection lines
    mapped.forEach((n, i) => {
      mapped.slice(i + 1).forEach(n2 => {
        if (n.archetype !== n2.archetype) return
        const dist = Math.hypot(n2.px - n.px, n2.py - n.py)
        if (dist > W * 0.25) return
        ctx.globalAlpha = 0.08 * (1 - dist / (W * 0.25))
        ctx.strokeStyle = ARCHETYPE_COLORS[n.archetype] || '#8b6fff'
        ctx.lineWidth = 0.5
        ctx.beginPath(); ctx.moveTo(n.px, n.py); ctx.lineTo(n2.px, n2.py); ctx.stroke()
        ctx.globalAlpha = 1
      })
    })

    // Nodes
    mapped.forEach(n => {
      const col = ARCHETYPE_COLORS[n.archetype] || '#8b6fff'
      const r = n.is_own ? 7 : 5

      // Glow halo
      const gd = ctx.createRadialGradient(n.px, n.py, 0, n.px, n.py, r * 5)
      gd.addColorStop(0, col + '30')
      gd.addColorStop(1, col + '00')
      ctx.fillStyle = gd
      ctx.beginPath(); ctx.arc(n.px, n.py, r * 5, 0, Math.PI * 2); ctx.fill()

      // Core
      ctx.beginPath(); ctx.arc(n.px, n.py, r, 0, Math.PI * 2)
      ctx.fillStyle = col; ctx.fill()

      if (n.is_own) {
        ctx.strokeStyle = 'rgba(255,255,255,0.4)'
        ctx.lineWidth = 1
        ctx.beginPath(); ctx.arc(n.px, n.py, r + 3, 0, Math.PI * 2); ctx.stroke()
      }
    })

    // Floating particles
    particlesRef.current = particlesRef.current.filter(p => p.alpha > 0)
    particlesRef.current.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.alpha -= 0.008
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.col
      ctx.beginPath(); ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2); ctx.fill()
      ctx.globalAlpha = 1
    })
    if (Math.random() < 0.15 && mapped.length > 0) {
      const n = mapped[Math.floor(Math.random() * mapped.length)]
      const col = ARCHETYPE_COLORS[n.archetype] || '#8b6fff'
      particlesRef.current.push({
        x: n.px, y: n.py,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        alpha: 0.6, col,
      })
    }

    animFrameRef.current = requestAnimationFrame(draw)
  }, [nodes, filter])

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [draw])

  useEffect(() => {
    const ro = new ResizeObserver(() => { cancelAnimationFrame(animFrameRef.current); animFrameRef.current = requestAnimationFrame(draw) })
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [draw])

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current
    if (!canvas) return
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const cx = (e.clientX - rect.left) * scaleX
    const cy = (e.clientY - rect.top) * scaleY
    const hit = nodesRef.current.find(n => Math.hypot(n.px - cx, n.py - cy) < 16)
    if (hit) {
      setTooltip({ node: hit, x: e.clientX - rect.left + 14, y: e.clientY - rect.top - 48 })
    } else {
      setTooltip(null)
    }
  }

  return (
    <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Header bar — mobile only */}
      <div style={{
        display: 'none', padding: '14px 16px',
        borderBottom: '0.5px solid var(--border)',
        alignItems: 'center', justifyContent: 'space-between',
      }} className="mobile-header">
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontStyle: 'italic' }}>
          Dream<span style={{ color: 'var(--accent)' }}>Atlas</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--surface)', border: '0.5px solid var(--border)',
          borderRadius: 20, padding: '4px 12px',
          fontSize: 11, color: 'var(--text-secondary)',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade9a', animation: 'blink 2.5s infinite' }} />
          {liveCount.toLocaleString()} dreams
        </div>
      </div>

      {/* Main: map + side panel */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>

        {/* Canvas map */}
        <div ref={containerRef} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <canvas
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setTooltip(null)}
            style={{ display: 'block', width: '100%', height: '100%', cursor: 'crosshair' }}
          />

          {/* Live count — desktop */}
          <div style={{
            position: 'absolute', top: 16, left: 16,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(8,7,17,0.75)', backdropFilter: 'blur(8px)',
            border: '0.5px solid var(--border)', borderRadius: 20,
            padding: '5px 14px', fontSize: 11, color: 'var(--text-secondary)',
          }} className="desktop-live">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade9a', animation: 'blink 2.5s infinite' }} />
            {liveCount.toLocaleString()} dreams mapped
          </div>

          {/* Axis labels */}
          {['conscious', 'unconscious'].map((label, i) => (
            <div key={label} style={{
              position: 'absolute',
              top: i === 0 ? 16 : undefined,
              bottom: i === 1 ? 16 : undefined,
              left: '50%', transform: 'translateX(-50%)',
              fontSize: 10, letterSpacing: '2px', color: 'rgba(255,255,255,0.12)',
              pointerEvents: 'none',
            }}>{label}</div>
          ))}

          {/* Tooltip */}
          {tooltip && (
            <div style={{
              position: 'absolute', left: tooltip.x, top: tooltip.y,
              background: 'rgba(15,13,26,0.95)', border: '0.5px solid var(--border)',
              borderRadius: 10, padding: '10px 14px', maxWidth: 220,
              pointerEvents: 'none', backdropFilter: 'blur(8px)', zIndex: 10,
            }}>
              <div style={{ fontSize: 10, letterSpacing: '1px', color: ARCHETYPE_COLORS[tooltip.node.archetype] || 'var(--accent)', marginBottom: 4 }}>
                {tooltip.node.archetype.toUpperCase()}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                "{tooltip.node.text}"
              </div>
            </div>
          )}
        </div>

        {/* Side panel — desktop */}
        <div style={{
          width: 300, flexShrink: 0,
          borderLeft: '0.5px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          padding: '24px 20px', gap: 20, overflowY: 'auto',
        }} className="map-panel">

          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontStyle: 'italic', marginBottom: 4 }}>
              collective atlas
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
              every point of light is a real dream
            </div>
          </div>

          {/* Filters */}
          <div>
            <div style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--text-tertiary)', marginBottom: 10 }}>FILTER BY ARCHETYPE</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
              {ARCHETYPES.map(a => (
                <button key={a} className={`chip ${filter === a ? 'active' : ''}`} onClick={() => setFilter(filter === a ? 'all' : a)}>{a}</button>
              ))}
            </div>
          </div>

          {/* Archetype legend */}
          <div>
            <div style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--text-tertiary)', marginBottom: 10 }}>LEGEND</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ARCHETYPES.map(a => {
                const count = nodes.filter(n => n.archetype === a).length
                const pct = nodes.length ? Math.round(count / nodes.length * 100) : 0
                return (
                  <div key={a} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: ARCHETYPE_COLORS[a], flexShrink: 0 }} />
                    <div style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{a}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono, monospace)' }}>{pct}%</div>
                    <div style={{ width: 48, height: 2, background: 'var(--surface2)', borderRadius: 1, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: ARCHETYPE_COLORS[a], borderRadius: 1, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Link href="/log">
            <button className="btn-primary">+ log your dream</button>
          </Link>
        </div>
      </div>

      {/* Mobile filter strip */}
      <div style={{
        display: 'none', overflowX: 'auto', padding: '10px 16px',
        borderTop: '0.5px solid var(--border)', gap: 6,
        scrollbarWidth: 'none', paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
      }} className="mobile-filters">
        <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')} style={{ flexShrink: 0 }}>All</button>
        {ARCHETYPES.map(a => (
          <button key={a} className={`chip ${filter === a ? 'active' : ''}`} onClick={() => setFilter(filter === a ? 'all' : a)} style={{ flexShrink: 0 }}>{a}</button>
        ))}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @media (max-width: 768px) {
          .map-panel { display: none !important; }
          .mobile-header { display: flex !important; }
          .mobile-filters { display: flex !important; }
          .desktop-live { display: none !important; }
        }
      `}</style>
    </div>
  )
}
