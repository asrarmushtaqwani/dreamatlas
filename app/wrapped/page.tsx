'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WrappedSnapshot } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import Link from 'next/link'
import { motion } from 'framer-motion'

type WrappedState = 'loading' | 'generating' | 'found' | 'none' | 'error'

function getMonthName(str: string) {
  const [y, m] = str.split('-')
  return new Date(Number(y), Number(m) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
}

export default function WrappedPage() {
  const [state, setState]     = useState<WrappedState>('loading')
  const [wrapped, setWrapped] = useState<WrappedSnapshot | null>(null)
  const [error, setError]     = useState('')

  useEffect(() => { generate() }, [])

  async function generate() {
    setState('generating')
    try {
      const res = await fetch('/api/wrapped')
      const data = await res.json()
      if (!res.ok) { if (res.status === 404) { setState('none'); return }; setError(data.error || 'Failed'); setState('error'); return }
      setWrapped(data); setState('found')
    } catch { setError('Connection failed'); setState('error') }
  }

  const accent = wrapped?.top_archetype ? ARCHETYPE_COLORS[wrapped.top_archetype] : 'var(--accent)'
  const isHex = typeof accent === 'string' && accent.startsWith('#')

  if (state === 'loading' || state === 'generating') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24, padding: 20 }}>
      <div style={{ display: 'flex', gap: 6 }}>
        {[0,1,2,3].map(i => <motion.div key={i} animate={{ height: [12, 36, 12] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }} style={{ width: 4, borderRadius: 2, background: isHex ? accent : '#fff' }} />)}
      </div>
      <p style={{ color: 'var(--text-tertiary)', fontSize: 13, letterSpacing: '0.15em', textTransform: 'uppercase', fontWeight: 600 }}>
        {state === 'generating' ? 'Weaving your month together…' : 'Opening your wrapped…'}
      </p>
    </div>
  )

  if (state === 'none') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 24 }}>
      <p style={{ color: 'var(--text-secondary)', fontSize: 28, fontFamily: 'var(--font-display)', fontStyle: 'italic', marginBottom: 24 }}>No dreams logged this month.</p>
      <Link href="/log" style={{ color: '#fff', fontSize: 15, textDecoration: 'underline', textUnderlineOffset: 4, fontWeight: 500 }}>Log your first dream</Link>
    </div>
  )

  if (state === 'error') return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
      <p style={{ color: '#ff6b8a', fontFamily: 'var(--font-body)', fontSize: 16 }}>{error}</p>
      <button onClick={generate} className="btn-glass">Try again</button>
    </div>
  )

  if (!wrapped) return null

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 100px', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 65% 55% at 50% 30%, ${isHex ? accent + '12' : 'var(--accent)'}, transparent)` }} />

      <div className="glass-nav" style={{ padding: '32px 5vw 20px', position: 'sticky', top: 0, zIndex: 100, marginBottom: 40 }}>
        <div style={{ maxWidth: 500, margin: '0 auto' }}>
          <Link href="/journal" style={{ color: 'var(--text-tertiary)', fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', textDecoration: 'none', transition: 'color 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#fff'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >← Return to Journal</Link>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" as any }} style={{ position: 'relative', maxWidth: 480, margin: '0 auto', padding: '0 24px' }}>
        
        {/* Card */}
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.6)', border: `1px solid ${isHex ? accent + '40' : 'rgba(255,255,255,0.1)'}` }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${isHex ? accent : '#fff'}, transparent)`, opacity: 0.6 }} />

          <div style={{ padding: '40px 32px' }}>
            {/* Month */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, color: isHex ? accent : '#fff', marginBottom: 32 }}>
              <span style={{ fontSize: 14 }}>✦</span>
              <span>Dream Wrapped · {getMonthName(wrapped.month)}</span>
            </div>

            {/* Count */}
            <div style={{ marginBottom: 32 }}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(72px, 12vw, 96px)', fontWeight: 700, lineHeight: 0.9, letterSpacing: '-0.03em', color: isHex ? accent : '#fff', marginBottom: 8 }}>
                {wrapped.dream_count}
              </motion.div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: 14, letterSpacing: '0.08em', fontWeight: 600, textTransform: 'uppercase' }}>dream{wrapped.dream_count !== 1 ? 's' : ''} this month</div>
            </div>

            <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)', marginBottom: 32 }} />

            {wrapped.top_archetype && (
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>Dominant archetype</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, fontStyle: 'italic', color: isHex ? accent : '#fff', letterSpacing: '-0.01em' }}>{wrapped.top_archetype}</div>
              </motion.div>
            )}

            {wrapped.top_symbols?.length > 0 && (
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 12 }}>Recurring symbols</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {wrapped.top_symbols.map((sym, i) => <span key={sym} style={{ padding: '6px 16px', borderRadius: 12, fontSize: 14, border: '1px solid rgba(255,255,255,0.1)', color: i === 0 ? '#fff' : 'var(--text-secondary)', background: 'rgba(255,255,255,0.03)', fontWeight: 500 }}>{sym}</span>)}
                </div>
              </motion.div>
            )}

            {wrapped.streak_peak > 0 && (
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.6 }} style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>Longest streak</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color: 'var(--text-secondary)' }}>{wrapped.streak_peak} consecutive {wrapped.streak_peak === 1 ? 'day' : 'days'}</div>
              </motion.div>
            )}

            {wrapped.dreamworld_titles?.length > 0 && (
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.7 }} style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 12 }}>Dreamworlds explored</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {wrapped.dreamworld_titles.map(t => <div key={t} style={{ display: 'flex', gap: 12, alignItems: 'center', color: '#fff', fontSize: 15, fontWeight: 500 }}><span style={{ color: isHex ? accent : '#fff', fontSize: 14 }}>✦</span>{t}</div>)}
                </div>
              </motion.div>
            )}

            <div style={{ height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)', marginBottom: 32 }} />

            {wrapped.essence_summary && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.9 }} style={{ color: 'var(--text-secondary)', fontSize: 18, fontStyle: 'italic', lineHeight: 1.7, margin: '0 0 32px', fontFamily: 'var(--font-display)', fontWeight: 400 }}>"{wrapped.essence_summary}"</motion.p>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-tertiary)', fontSize: 11, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' }}>DreamAtlas Wrapped</span>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 32, display: 'flex', gap: 16, justifyContent: 'center' }}>
          <Link href="/journal"><button className="btn-glass" style={{ padding: '12px 24px', fontSize: 14 }}>Journal</button></Link>
          <Link href="/twins"><button className="btn-glass" style={{ padding: '12px 24px', fontSize: 14 }}>Twins</button></Link>
        </div>
      </motion.div>
    </div>
  )
}