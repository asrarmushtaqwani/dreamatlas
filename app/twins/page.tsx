'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DreamTwinMatch } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import { motion, AnimatePresence } from 'framer-motion'

type TwinState = 'idle' | 'loading' | 'found' | 'error'

export default function TwinsPage() {
  const [state, setState]     = useState<TwinState>('idle')
  const [twin, setTwin]       = useState<DreamTwinMatch | null>(null)
  const [reasoning, setReasoning] = useState('')
  const [error, setError]     = useState('')
  const [myDreamCount, setMyDreamCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ count }, { data: existing }] = await Promise.all([
        supabase.from('dreams').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('dream_twin_matches').select('*, twin_profile:profiles!dream_twin_matches_twin_user_id_fkey(dream_name, avatar_color)').eq('user_id', user.id).order('similarity_score', { ascending: false }).limit(1).single(),
      ])
      setMyDreamCount(count || 0)
      if (existing) { setTwin(existing as any); setState('found') }
    }
    init()
  }, [])

  async function findTwin() {
    setState('loading'); setError('')
    try {
      const res = await fetch('/api/twins', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Something went wrong'); setState('error'); return }
      setTwin(data); setReasoning(data.reasoning || ''); setState('found')
    } catch { setError('Connection failed'); setState('error') }
  }

  const tooFew  = myDreamCount < 3
  const twinCol = (twin as any)?.twin_profile?.avatar_color || 'var(--accent)'
  
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: "easeOut" as any } }
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100, position: 'relative' }}>
      {/* Background glow specific to twins */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 60% 50% at 50% 40%, rgba(255,255,255,0.03), transparent 70%)` }} />

      <div className="glass-nav" style={{ padding: '32px 5vw 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <Link href="/map" style={{ color: 'var(--text-tertiary)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', display: 'inline-block', transition: 'color 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >← Return to Atlas</Link>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 600, margin: '0 auto', padding: '40px 5vw' }}>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 16 }}>Dream Twins</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(40px, 6vw, 64px)', fontWeight: 700, fontStyle: 'italic', lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 16, color: '#fff' }}>
            Your unconscious <span className="text-gradient">doppelgänger</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1.6, fontFamily: 'var(--font-body)', fontWeight: 400 }}>
            Somewhere on earth, another mind dreams the exact same territories as you.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {state === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
              {tooFew ? (
                <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
                   <p style={{ color: '#fff', fontSize: 18, marginBottom: 12, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontWeight: 600 }}>Log {3 - myDreamCount} more dream{3 - myDreamCount !== 1 ? 's' : ''} to unlock your twin.</p>
                   <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.6 }}>Twins are matched by comparing dense archetype fingerprints built over time.</p>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <button onClick={findTwin} className="btn-premium" style={{ width: '100%', maxWidth: 300, fontSize: 17, padding: '20px' }}>
                    Find my twin
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {state === 'loading' && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
                {[0,1,2].map(i => <motion.div key={i} animate={{ y: [0, -8, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />)}
              </div>
              <p style={{ color: 'var(--text-tertiary)', fontSize: 13, letterSpacing: '0.15em', fontWeight: 500, textTransform: 'uppercase' }}>Scanning the collective unconscious…</p>
            </motion.div>
          )}

          {state === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
              <p style={{ color: '#ff6b8a', fontSize: 16, marginBottom: 24, padding: '16px', background: 'rgba(255,107,138,0.1)', borderRadius: 12 }}>{error}</p>
              <button onClick={() => setState('idle')} className="btn-glass">Try again</button>
            </motion.div>
          )}

          {state === 'found' && twin && (
            <motion.div key="found" variants={containerVariants} initial="hidden" animate="visible" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="glass-card" style={{ padding: '40px 32px', textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: `linear-gradient(90deg, transparent, ${typeof twinCol === 'string' && twinCol.startsWith('#') ? twinCol + '80' : 'rgba(255,255,255,0.5)'}, transparent)` }} />

                <div style={{ 
                  width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px', 
                  background: typeof twinCol === 'string' && twinCol.startsWith('#') ? twinCol + '15' : 'rgba(255,255,255,0.05)', 
                  border: `1px solid ${typeof twinCol === 'string' && twinCol.startsWith('#') ? twinCol + '40' : 'rgba(255,255,255,0.15)'}`, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, 
                  boxShadow: `0 0 40px ${typeof twinCol === 'string' && twinCol.startsWith('#') ? twinCol + '30' : 'rgba(255,255,255,0.1)'}` 
                }}>🌙</div>

                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>Your Twin</div>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, fontStyle: 'italic', marginBottom: 32, letterSpacing: '-0.01em', color: '#fff' }}>
                  {(twin as any).twin_profile?.dream_name || 'unknown dreamer'}
                </h2>

                <div style={{ marginBottom: 32, textAlign: 'left', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, alignItems: 'baseline' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Unconscious Similarity</span>
                    <span style={{ fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 600, color: '#fff' }}>{Math.round(twin.similarity_score * 100)}%</span>
                  </div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${twin.similarity_score * 100}%` }} transition={{ duration: 1.5, ease: "easeOut" }} 
                      style={{ height: '100%', borderRadius: 4, background: typeof twinCol === 'string' && twinCol.startsWith('#') ? twinCol : '#ffffff', boxShadow: `0 0 12px ${typeof twinCol === 'string' && twinCol.startsWith('#') ? twinCol : '#ffffff'}` }} 
                    />
                  </div>
                </div>

                {twin.shared_archetypes?.length > 0 && (
                  <div style={{ marginBottom: 28 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 14 }}>Shared Territories</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
                      {twin.shared_archetypes.map(a => { 
                        const c = ARCHETYPE_COLORS[a] || '#ffffff'
                        return <span key={a} style={{ padding: '6px 16px', borderRadius: 40, fontSize: 12, letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, color: c, border: `1px solid ${c}40`, background: `${c}10` }}>{a}</span> 
                      })}
                    </div>
                  </div>
                )}

                {reasoning && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 24, marginTop: 12 }}>
                    <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: 16, lineHeight: 1.7, fontFamily: 'var(--font-display)', margin: 0 }}>"{reasoning}"</p>
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <p style={{ color: 'var(--text-tertiary)', fontSize: 13, marginBottom: 12 }}>Twins dynamically evolve as new dreamers map the atlas.</p>
                <button onClick={findTwin} style={{ color: '#fff', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 4, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.color = '#fff'}
                >Recalculate Convergence</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}