'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mood } from '@/types'
import { motion, AnimatePresence } from 'framer-motion'

const MOODS: { label: Mood; symbol: string; color: string }[] = [
  { label: 'Peaceful',    symbol: '◌', color: '#4ade9a' },
  { label: 'Wondrous',    symbol: '◈', color: '#7dd3fc' },
  { label: 'Anxious',     symbol: '◉', color: '#f59e0b' },
  { label: 'Euphoric',    symbol: '◎', color: '#e2c170' },
  { label: 'Terrifying',  symbol: '●', color: '#ff6b8a' },
  { label: 'Melancholic', symbol: '◑', color: '#818cf8' },
  { label: 'Confused',    symbol: '◐', color: '#c084fc' },
  { label: 'Nostalgic',   symbol: '◒', color: '#fb923c' },
]

const THINK_STEPS = ['reading the symbols…', 'finding your archetypes…', 'placing you on the atlas…']

export default function LogPage() {
  const router = useRouter()
  const [text, setText]   = useState('')
  const [mood, setMood]   = useState<Mood | null>(null)
  const [loading, setLoading] = useState(false)
  const [thinkStep, setThinkStep] = useState(0)
  const [recording, setRecording] = useState(false)
  const stepRef = useRef<NodeJS.Timeout | null>(null)
  const recRef  = useRef<any>(null)

  function toggleVoice() {
    if (recording) { recRef.current?.stop(); setRecording(false); return }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.continuous = false; rec.interimResults = false
    rec.onresult = (e: any) => setText(t => t + e.results[0][0].transcript + ' ')
    rec.onend = () => setRecording(false)
    recRef.current = rec; rec.start(); setRecording(true)
  }

  async function submit() {
    if (text.trim().length < 10) return
    setLoading(true)
    stepRef.current = setInterval(() => setThinkStep(s => (s + 1) % THINK_STEPS.length), 1800)
    try {
      const res = await fetch('/api/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, mood }) })
      const analysis = await res.json()
      sessionStorage.setItem('pendingDream', JSON.stringify({ text, mood, ...analysis }))
      clearInterval(stepRef.current!)
      router.push('/insight')
    } catch { clearInterval(stepRef.current!); setLoading(false) }
  }

  const pct = text.length / 1000

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px 80px', position: 'relative' }}>
      
      {/* Localized aura that shifts based on text length */}
      <div style={{ 
        position: 'fixed', inset: 0, pointerEvents: 'none', 
        background: `radial-gradient(ellipse 65% 55% at 50% 50%, rgba(125,211,252,${0.03 + (pct * 0.04)}), transparent 75%)`,
        transition: 'background 1s ease'
      }} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ width: '100%', maxWidth: 640, position: 'relative', zIndex: 1 }}
      >
        <Link href="/map" style={{ 
          display: 'inline-block', color: 'var(--text-tertiary)', fontSize: 13, 
          letterSpacing: '0.05em', textDecoration: 'none', marginBottom: 44, transition: 'color 0.3s',
          fontWeight: 500
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >← return to atlas</Link>

        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(42px, 6vw, 64px)', fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.02em', lineHeight: 1.05, marginBottom: 12 }}>
          What did you <span className="text-gradient">dream?</span>
        </h1>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 18, color: 'var(--text-secondary)', marginBottom: 40 }}>
          Fragments are fine. Write down the imagery that lingers.
        </p>

        {/* Textarea container */}
        <div className="glass-card" style={{ padding: '0', marginBottom: 32, overflow: 'hidden', position: 'relative' }}>
          <textarea 
            style={{
              width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)', fontSize: 22, fontStyle: 'italic', padding: '36px',
              resize: 'none', outline: 'none', lineHeight: 1.6
            }}
            value={text} onChange={e => setText(e.target.value)}
            placeholder="I was standing in a place that felt like home but looked like somewhere I'd never been…"
            rows={7} maxLength={1000} disabled={loading} 
          />
          {/* Progress bar line */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.05)' }}>
            <div style={{ height: '100%', width: `${pct * 100}%`, background: pct > 0.9 ? '#ff6b8a' : '#ffffff', transition: 'width 0.2s cubic-bezier(0.16,1,0.3,1), background 0.3s' }} />
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: 13, color: pct > 0.9 ? '#ff6b8a' : 'var(--text-tertiary)', marginBottom: 32, fontWeight: 500 }}>
          {text.length} / 1000
        </div>

        {/* Mood Selector */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 16 }}>Emotional tone</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {MOODS.map(m => {
              const active = mood === m.label
              return (
                <button key={m.label} onClick={() => setMood(active ? null : m.label)} disabled={loading} style={{
                  padding: '10px 20px', borderRadius: 40, fontSize: 14, cursor: 'pointer',
                  fontFamily: 'var(--font-body)', fontWeight: 500,
                  border: `1px solid ${active ? m.color + '60' : 'rgba(255,255,255,0.08)'}`,
                  background: active ? m.color + '15' : 'rgba(255,255,255,0.02)',
                  color: active ? m.color : 'var(--text-secondary)',
                  transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
                  onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.borderColor = m.color + '40'; el.style.color = '#fff' } }}
                  onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.color = 'var(--text-secondary)' } }}
                >
                  <span style={{ fontSize: 12, color: active ? m.color : 'var(--text-tertiary)' }}>{m.symbol}</span>
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={toggleVoice} disabled={loading} title="Voice input" style={{
            width: 58, height: 58, borderRadius: 16, flexShrink: 0,
            border: `1px solid ${recording ? '#ff6b8a' : 'rgba(255,255,255,0.1)'}`,
            background: recording ? 'rgba(255,107,138,0.15)' : 'rgba(255,255,255,0.03)',
            color: recording ? '#ff6b8a' : 'var(--text-secondary)',
            cursor: 'pointer', fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
            backdropFilter: 'blur(10px)'
          }}>🎤</button>

          <button className="btn-premium" onClick={submit} disabled={loading || text.trim().length < 10} style={{ flex: 1, fontSize: 18 }}>
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                  <span style={{ display: 'flex', gap: 5 }}>
                    {[0,1,2].map(i => <motion.span key={i} animate={{ y: [0, -4, 0] }} transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }} style={{ width: 6, height: 6, borderRadius: '50%', background: '#000', display: 'inline-block' }} />)}
                  </span>
                  {THINK_STEPS[thinkStep]}
                </motion.div>
              ) : (
                <motion.span key="ready" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Send into the atlas
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

    </div>
  )
}