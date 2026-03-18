'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Dream, Archetype } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import { motion, AnimatePresence } from 'framer-motion'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7)  return `${d}d ago`
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
}

export default function JournalPage() {
  const [dreams, setDreams]     = useState<Dream[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<string>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase.from('dreams').select('*').eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => { setDreams(data || []); setLoading(false) })
    })
  }, [])

  const archetypes = [...new Set(dreams.flatMap(d => d.archetypes))] as Archetype[]
  const visible    = filter === 'all' ? dreams : dreams.filter(d => d.archetypes.includes(filter as Archetype))

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100, position: 'relative' }}>

      {/* Glass Header */}
      <div className="glass-nav" style={{ padding: '32px 5vw 20px', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginBottom: 12 }}>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontStyle: 'italic', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Your <span className="text-gradient">journal</span>
            </h1>
            {!loading && dreams.length > 0 && (
              <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>{dreams.length} dream{dreams.length !== 1 ? 's' : ''}</span>
            )}
          </div>
          {archetypes.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Insights</button>
              {archetypes.map(a => (
                <button key={a} className={`chip ${filter === a ? 'active' : ''}`} onClick={() => setFilter(filter === a ? 'all' : a)}
                  style={filter === a ? { borderColor: `${ARCHETYPE_COLORS[a]}60`, color: ARCHETYPE_COLORS[a], background: `${ARCHETYPE_COLORS[a]}15` } : {}}
                >{a}</button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={{ padding: '40px 5vw', maxWidth: 1000, margin: '0 auto' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text-tertiary)', fontSize: 15, fontWeight: 500 }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
              {[0,1,2].map(i => <motion.div key={i} animate={{ y: [0, -6, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />)}
            </div>
            Accessing records…
          </div>
        )}

        {!loading && dreams.length === 0 && (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', padding: '100px 24px' }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 24px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, boxShadow: '0 0 30px rgba(255,255,255,0.05)' }}>✦</div>
            <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 28, marginBottom: 12, color: 'var(--text-secondary)' }}>No dreams mapped yet</p>
            <p style={{ fontSize: 16, color: 'var(--text-tertiary)', marginBottom: 32 }}>Your journal awaits its first unconscious entry.</p>
            <Link href="/log" style={{ textDecoration: 'none' }}><button className="btn-premium">Log your first dream</button></Link>
          </motion.div>
        )}

        <motion.div variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {visible.map((dream) => {
            const isOpen  = expanded === dream.id
            const color   = ARCHETYPE_COLORS[dream.archetypes[0]] || '#ffffff'
            
            return (
              <motion.div 
                key={dream.id} variants={itemVariants}
                onClick={() => setExpanded(isOpen ? null : dream.id)}
                className="glass-card"
                style={{ 
                  cursor: 'pointer', padding: '24px 32px', position: 'relative', overflow: 'hidden',
                  borderColor: isOpen ? `${color}40` : 'rgba(255,255,255,0.08)',
                  background: isOpen ? 'linear-gradient(160deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)' : undefined
                }}
              >
                {/* Accent glow for the archetype */}
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, width: 3, background: `linear-gradient(180deg, ${color}90, transparent)`, opacity: isOpen ? 1 : 0.4, transition: 'opacity 0.4s' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, gap: 16 }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {dream.archetypes.slice(0, 2).map(a => {
                      const c = ARCHETYPE_COLORS[a] || '#ffffff'
                      return <span key={a} style={{ padding: '4px 14px', borderRadius: 40, fontSize: 12, fontWeight: 600, background: `${c}15`, color: c, border: `1px solid ${c}40`, letterSpacing: '0.04em' }}>{a}</span>
                    })}
                    {dream.mood && <span style={{ padding: '4px 14px', borderRadius: 40, fontSize: 12, fontWeight: 500, background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', border: '1px solid rgba(255,255,255,0.1)' }}>{dream.mood}</span>}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>{timeAgo(dream.created_at)}</span>
                    <motion.svg animate={{ rotate: isOpen ? 180 : 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)' }}><polyline points="6 9 12 15 18 9"></polyline></motion.svg>
                  </div>
                </div>

                <motion.div animate={{ height: isOpen ? 'auto' : '65px' }} style={{ overflow: 'hidden' }}>
                  <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    "{dream.text}"
                  </p>
                </motion.div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.08)' }}
                    >
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>AI Essence</div>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 400, color: '#fff', lineHeight: 1.6, marginBottom: 20 }}>{dream.essence}</p>
                      
                      {dream.symbols?.length > 0 && (
                        <>
                          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 12 }}>Extracted Symbols</div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                            {dream.symbols.map(s => <span key={s} style={{ padding: '6px 16px', borderRadius: 8, fontSize: 13, fontWeight: 500, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>{s}</span>)}
                          </div>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </div>
  )
}