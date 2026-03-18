'use client'
import { useEffect, useRef, useState, useMemo } from 'react'
import Link from 'next/link'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import { MapNode, Archetype } from '@/types'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Html, Stars } from '@react-three/drei'
import * as THREE from 'three'

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

function DreamGalaxy({ nodes, filter, setHoveredNode }: { nodes: MapNode[], filter: string, setHoveredNode: (hit: {node: MapNode, x: number, y: number, z: number} | null) => void }) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  
  const visibleNodes = useMemo(() => {
    return filter === 'all' ? nodes : nodes.filter(n => n.archetype === filter)
  }, [nodes, filter])

  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colorObj = useMemo(() => new THREE.Color(), [])
  
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(visibleNodes.length * 3)
    const cols = new Float32Array(visibleNodes.length * 3)
    
    visibleNodes.forEach((n, i) => {
      const radius = 60
      const x = (n.map_x - 0.5) * radius
      const y = -(n.map_y - 0.5) * radius // invert Y
      
      const numId = parseInt((n.id || "0").replace(/\D/g, '') || '0') % 100
      const z = (Math.sin(numId * 123.456) * radius * 0.5)

      pos[i * 3] = x
      pos[i * 3 + 1] = y
      pos[i * 3 + 2] = z
      
      const c = ARCHETYPE_COLORS[n.archetype] || '#8b6fff'
      colorObj.set(c)
      // bump up luminosity to make them glow like stars
      cols[i * 3] = Math.min(1, colorObj.r * 1.5)
      cols[i * 3 + 1] = Math.min(1, colorObj.g * 1.5)
      cols[i * 3 + 2] = Math.min(1, colorObj.b * 1.5)
    })
    return [pos, cols]
  }, [visibleNodes, colorObj])

  useEffect(() => {
    if (meshRef.current) {
      for (let i = 0; i < visibleNodes.length; i++) {
        dummy.position.set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2])
        dummy.updateMatrix()
        meshRef.current.setMatrixAt(i, dummy.matrix)
        meshRef.current.setColorAt(i, new THREE.Color(colors[i * 3], colors[i * 3 + 1], colors[i * 3 + 2]))
      }
      meshRef.current.instanceMatrix.needsUpdate = true
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
    }
  }, [visibleNodes, positions, colors, dummy])

  return (
    <instancedMesh 
      ref={meshRef} 
      args={[undefined, undefined, visibleNodes.length]} 
      onPointerMove={(e) => {
        if (e.instanceId !== undefined) {
          e.stopPropagation()
          const hit = visibleNodes[e.instanceId]
          setHoveredNode({ node: hit, x: e.point.x, y: e.point.y, z: e.point.z })
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation()
        setHoveredNode(null)
      }}
    >
      <sphereGeometry args={[0.4, 16, 16]} />
      <meshBasicMaterial toneMapped={false} />
    </instancedMesh>
  )
}

export default function MapPage() {
  const [nodes, setNodes] = useState<MapNode[]>(FALLBACK_NODES)
  const [filter, setFilter] = useState<string>('all')
  const [hoveredNode, setHoveredNode] = useState<{node: MapNode, x: number, y: number, z: number} | null>(null)
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
            is_own: d.is_own,
          })))
          setLiveCount(data.length)
        }
      })
      .catch(() => {})
  }, [])

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

        {/* 3D Canvas map */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#080711' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(139,111,255,0.04) 0%, rgba(0,0,0,0) 60%)', zIndex: 0 }} />
          
          <Canvas camera={{ position: [0, 0, 80], fov: 60 }} style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            <color attach="background" args={['#080711']} />
            <fog attach="fog" args={['#080711', 40, 150]} />
            <ambientLight intensity={0.5} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <OrbitControls 
              enablePan={true} 
              enableZoom={true} 
              enableRotate={true}
              minDistance={10}
              maxDistance={120}
              autoRotate={true}
              autoRotateSpeed={0.5}
            />
            <DreamGalaxy nodes={nodes} filter={filter} setHoveredNode={setHoveredNode} />
            
            {/* 3D Tooltip Overlay */}
            {hoveredNode && (
              <Html position={[hoveredNode.x, hoveredNode.y, hoveredNode.z]} style={{ pointerEvents: 'none' }}>
                <div style={{
                  background: 'rgba(15,13,26,0.95)', border: '0.5px solid var(--border)',
                  borderRadius: 10, padding: '10px 14px', maxWidth: 250, width: 'max-content',
                  backdropFilter: 'blur(8px)', zIndex: 10,
                  transform: 'translate3d(15px, -15px, 0)'
                }}>
                  <div style={{ fontSize: 10, letterSpacing: '1px', color: ARCHETYPE_COLORS[hoveredNode.node.archetype] || 'var(--accent)', marginBottom: 4 }}>
                    {hoveredNode.node.archetype.toUpperCase()}
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    "{hoveredNode.node.text}"
                  </div>
                </div>
              </Html>
            )}
          </Canvas>

          {/* Live count — desktop */}
          <div style={{
            position: 'absolute', top: 16, left: 16,
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(8,7,17,0.75)', backdropFilter: 'blur(8px)',
            border: '0.5px solid var(--border)', borderRadius: 20,
            padding: '5px 14px', fontSize: 11, color: 'var(--text-secondary)', zIndex: 10
          }} className="desktop-live">
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade9a', animation: 'blink 2.5s infinite' }} />
            {liveCount.toLocaleString()} dreams mapped
          </div>
          
          {/* Overlay controls helper */}
          <div style={{
            position: 'absolute', bottom: 16, left: 16,
            fontSize: 10, letterSpacing: '2px', color: 'rgba(255,255,255,0.12)', zIndex: 10,
            pointerEvents: 'none'
          }}>
            DRAG TO ROTATE · SCROLL TO ZOOM
          </div>
        </div>

        {/* Side panel — desktop */}
        <div style={{
          width: 300, flexShrink: 0,
          borderLeft: '0.5px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          padding: '24px 20px', gap: 20, overflowY: 'auto',
          zIndex: 10
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
