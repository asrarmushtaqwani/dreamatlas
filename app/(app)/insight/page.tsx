'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { DreamAnalysis } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import { motion, AnimatePresence } from 'framer-motion'

interface PendingDream extends DreamAnalysis { text: string; mood: string }

export default function InsightPage() {
  const router = useRouter()
  const [dream, setDream]   = useState<PendingDream | null>(null)
  const [stage, setStage]   = useState(0)

  useEffect(() => {
    const raw = sessionStorage.getItem('pendingDream')
    if (!raw) { router.push('/log'); return }
    setDream(JSON.parse(raw))
    setTimeout(() => setStage(1), 300)
    setTimeout(() => setStage(2), 1000)
    setTimeout(() => setStage(3), 1800)
  }, [router])

  if (!dream) return null

  const primary = dream.archetypes?.[0] || 'Voyage'
  const color   = ARCHETYPE_COLORS[primary] || 'var(--accent)'

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }
  const itemVariants = { hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as any } } }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px 80px', position: 'relative' }}>
      
      {/* Background glow syncing with primary archetype color */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 65% 55% at 50% 40%, ${color}12, transparent 65%)`, transition: 'background 1.5s ease-out' }} />

      <div style={{ width: '100%', maxWidth: 580, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Cinematic Orb */}
        <AnimatePresence>
          {stage >= 1 && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: "easeOut" }} style={{ textAlign: 'center', marginBottom: 16 }}>
              <motion.div animate={{ scale: [1, 1.05, 1], boxShadow: [`0 0 40px ${color}20`, `0 0 60px ${color}40`, `0 0 40px ${color}20`] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 20px',
                background: `radial-gradient(circle at 35% 35%, ${color}40, rgba(255,255,255,0.05))`,
                border: `1px solid ${color}60`, backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32,
              }}>✦</motion.div>
              <h2 style={{ fontSize: 22, color: '#fff', fontFamily: 'var(--font-display)', fontWeight: 600, letterSpacing: '-0.01em', marginBottom: 8 }}>
                The <span style={{ color }}>atlas</span> recognizes your dream.
              </h2>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Essence Card */}
        <AnimatePresence>
          {stage >= 2 && (
            <motion.div initial="hidden" animate="visible" variants={itemVariants} className="glass-card" style={{ padding: '32px 28px', border: `1px solid ${color}30`, background: `linear-gradient(145deg, rgba(255,255,255,0.05), ${color}05)` }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 16 }}>Core Essence</div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, lineHeight: 1.6, color: '#fff', letterSpacing: '-0.01em' }}>
                "{dream.essence}"
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Archetypes & Symbols Breakdown */}
        <AnimatePresence>
          {stage >= 3 && (
            <motion.div initial="hidden" animate="visible" variants={containerVariants}>
              
              <motion.div variants={itemVariants} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 12 }}>Detected Archetypes</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {dream.archetypes?.map((a) => {
                    const c = ARCHETYPE_COLORS[a] || '#ffffff'
                    return (
                      <div key={a} style={{ padding: '8px 20px', borderRadius: 40, fontSize: 13, fontWeight: 600, background: `${c}15`, border: `1px solid ${c}40`, color: c }}>
                        {a}
                      </div>
                    )
                  })}
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="glass-card" style={{ padding: '24px 28px', marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 16 }}>Symbols Extracted</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {dream.symbols?.map(s => (
                    <span key={s} style={{ padding: '6px 16px', borderRadius: 12, fontSize: 13, fontWeight: 500, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                <Link href="/map"     style={{ flex: 1, textDecoration: 'none' }}><button className="btn-glass" style={{ width: '100%', fontSize: 15, padding: '16px' }}>View on map</button></Link>
                <Link href="/journal" style={{ flex: 1, textDecoration: 'none' }}><button className="btn-glass" style={{ width: '100%', fontSize: 15, padding: '16px' }}>My journal</button></Link>
                <Link href="/log"     style={{ flex: 1, textDecoration: 'none' }}><button className="btn-premium" style={{ width: '100%', fontSize: 16, padding: '16px' }}>Done</button></Link>
              </motion.div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}