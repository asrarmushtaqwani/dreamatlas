'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Dreamworld, Dream } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'

export default function DreamworldsPage() {
  const [worlds, setWorlds]   = useState<Dreamworld[]>([])
  const [selected, setSelected] = useState<Dreamworld | null>(null)
  const [dreams, setDreams]   = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [dreamsLoading, setDreamsLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    supabase.from('dreamworlds').select('*').order('dream_count', { ascending: false })
      .then(({ data }) => { setWorlds(data || []); setLoading(false) })
  }, [])

  async function openWorld(world: Dreamworld) {
    if (selected?.id === world.id) {
      setSelected(null)
      return
    }
    setSelected(world); setDreamsLoading(true)
    const { data } = await supabase.from('dreamworld_dreams').select('dream_id, dreams(*)').eq('dreamworld_id', world.id).order('added_at', { ascending: false }).limit(20)
    setDreams((data || []).map((r: any) => r.dreams).filter(Boolean))
    setDreamsLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
       <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.5, repeat: Infinity }} style={{ color: 'var(--text-tertiary)', fontSize: 13, letterSpacing: '0.2em', fontWeight: 500, textTransform: 'uppercase' }}>
         Opening the worlds…
       </motion.div>
    </div>
  )

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } }
  }

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'hidden' }}>
      
      {/* ── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section style={{ 
        position: 'relative', minHeight: '60vh', width: '100%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingTop: 80 
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" as any }}
          style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 1000, padding: '0 24px' }}
        >
          <div style={{
            display: 'inline-flex', padding: '8px 20px', borderRadius: 999,
            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 32, alignItems: 'center', gap: 10
          }}>
            <span style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent)' }} />
            <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.04em' }}>The Collective</span>
          </div>

          <h1 style={{ 
            fontFamily: 'var(--font-display)', fontWeight: 600,
            fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em',
            marginBottom: 24
          }}>
            Dreamworlds.
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-secondary)',
            maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.6, fontWeight: 400
          }}>
            Nine canonical territories of the collective unconscious. Every dream logged contributes to a shared world.
          </p>
        </motion.div>
      </section>

      {/* ── CONTENT GRID ─────────────────────────────────────────────────────── */}
      <section style={{ 
        position: 'relative', zIndex: 10, padding: '80px 5vw', minHeight: '50vh',
        background: 'linear-gradient(180deg, transparent, rgba(5,5,8,0.8) 20%)'
      }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        
        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {worlds.map((world) => {
            const color = ARCHETYPE_COLORS[world.archetype] || 'var(--accent)'
            const isSelected = selected?.id === world.id
            return (
              <motion.div key={world.id} variants={itemVariants} className="glass-card" style={{ padding: 0, overflow: 'hidden', borderColor: isSelected ? `${color}40` : 'rgba(255,255,255,0.08)' }}>
                <button onClick={() => openWorld(world)} style={{
                  textAlign: 'left', padding: '32px 28px', cursor: 'pointer', width: '100%',
                  background: isSelected ? `linear-gradient(145deg, rgba(255,255,255,0.06), ${color}10)` : 'transparent',
                  border: 'none', transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)', position: 'relative'
                }}
                  onMouseEnter={e => { if(!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)' }}
                  onMouseLeave={e => { if(!isSelected) e.currentTarget.style.background = 'transparent' }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${color}60, transparent)`, opacity: isSelected ? 1 : 0, transition: 'opacity 0.4s' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', marginTop: 4, backgroundColor: color, boxShadow: `0 0 16px ${color}80` }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{world.dream_count.toLocaleString()} dreams</span>
                  </div>
                  
                  <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 700, margin: '0 0 8px', color: '#fff', letterSpacing: '-0.01em' }}>{world.title}</h2>
                  <div style={{ color, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 16 }}>{world.archetype}</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7, marginBottom: 12, fontFamily: 'var(--font-body)', display: '-webkit-box', WebkitLineClamp: isSelected ? undefined : 2, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>
                    {world.description}
                  </p>
                  <div style={{ color: 'var(--text-tertiary)', fontSize: 13, fontFamily: 'var(--font-display)', fontWeight: 600 }}>{world.theme}</div>
                </button>

                <AnimatePresence>
                  {isSelected && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.5, ease: [0.16,1,0.3,1] }}>
                      <div style={{ padding: '0 28px 32px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        {dreamsLoading ? (
                          <div style={{ color: 'var(--text-tertiary)', fontSize: 12, letterSpacing: '0.15em', textTransform: 'uppercase', textAlign: 'center', padding: '32px 0', fontWeight: 500 }}>Summoning collective dreams…</div>
                        ) : dreams.length === 0 ? (
                          <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', padding: '32px 0', fontFamily: 'var(--font-display)' }}>No dreams have entered this world yet.</div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
                            {dreams.map(dream => (
                              <div key={dream.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '18px 20px', backdropFilter: 'blur(5px)' }}>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, marginBottom: 14, fontFamily: 'var(--font-display)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' as any, overflow: 'hidden' }}>"{dream.text}"</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                  {dream.archetypes.map(a => <span key={a} style={{ color: ARCHETYPE_COLORS[a] || '#fff', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700 }}>{a}</span>)}
                                  <span style={{ color: 'rgba(255,255,255,0.1)' }}>·</span>
                                  <p style={{ color: 'var(--text-tertiary)', fontSize: 13, margin: 0, fontFamily: 'var(--font-display)', fontWeight: 500 }}>"{dream.essence}"</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>

        </div>
      </section>
    </div>
  )
}