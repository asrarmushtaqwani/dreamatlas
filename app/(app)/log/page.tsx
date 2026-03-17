'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mood } from '@/types'

const ACCENT = '#7dd3fc'
const FONT_DISPLAY = "'Fraunces', Georgia, serif"
const FONT_SERIF = "'Lora', Georgia, serif"

const MOODS: { label: Mood; symbol: string; color: string }[] = [
  { label: 'Peaceful',    symbol: '◌', color: '#4ade9a' },
  { label: 'Wondrous',    symbol: '◈', color: ACCENT },
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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px 80px', background: '#0f0e0d', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 55% 45% at 50% 40%, ${ACCENT}06, transparent 65%)` }} />

      <div style={{ width: '100%', maxWidth: 580, position: 'relative', zIndex: 1, animation: 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both' }}>
        <Link href="/map" style={{ display: 'inline-block', color: 'rgba(240,236,230,0.28)', fontSize: 12, letterSpacing: '0.1em', textDecoration: 'none', marginBottom: 44, transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.5)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.28)'}
        >← atlas</Link>

        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 'clamp(38px, 5vw, 54px)', fontWeight: 700, fontStyle: 'italic', letterSpacing: '-0.025em', lineHeight: 1.08, marginBottom: 8, color: '#f0ece6' }}>
          What did you dream?
        </h1>
        <p style={{ fontFamily: FONT_SERIF, fontStyle: 'italic', fontSize: 15, color: 'rgba(240,236,230,0.38)', marginBottom: 30 }}>
          Fragments are fine. Write as it comes.
        </p>

        {/* Textarea */}
        <div style={{ position: 'relative', marginBottom: 6 }}>
          <textarea className="dream-input" value={text} onChange={e => setText(e.target.value)}
            placeholder="I was standing in a place that felt like home but looked like somewhere I'd never been…"
            rows={7} maxLength={1000} disabled={loading} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'var(--border)', borderRadius: '0 0 16px 16px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct * 100}%`, background: pct > 0.9 ? '#ff6b8a' : ACCENT, transition: 'width 0.1s, background 0.3s', borderRadius: '0 0 16px 16px' }} />
          </div>
        </div>
        <div style={{ textAlign: 'right', fontSize: 11, color: pct > 0.9 ? '#ff6b8a' : 'rgba(240,236,230,0.22)', marginBottom: 28, transition: 'color 0.3s' }}>
          {text.length} / 1000
        </div>

        {/* Mood */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.25)', marginBottom: 12 }}>Emotional tone</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MOODS.map(m => {
              const active = mood === m.label
              return (
                <button key={m.label} onClick={() => setMood(active ? null : m.label)} disabled={loading} style={{
                  padding: '8px 16px', borderRadius: 40, fontSize: 13, cursor: 'pointer',
                  fontFamily: "'DM Sans', sans-serif",
                  border: `0.5px solid ${active ? m.color + '55' : 'rgba(255,255,255,0.07)'}`,
                  background: active ? m.color + '14' : 'rgba(255,255,255,0.04)',
                  color: active ? m.color : 'rgba(240,236,230,0.45)',
                  transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
                  onMouseEnter={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.borderColor = m.color + '35'; el.style.color = m.color } }}
                  onMouseLeave={e => { if (!active) { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.07)'; el.style.color = 'rgba(240,236,230,0.45)' } }}
                >
                  <span style={{ fontSize: 11, color: active ? m.color : 'rgba(240,236,230,0.25)' }}>{m.symbol}</span>
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={toggleVoice} disabled={loading} title="Voice input" style={{
            width: 52, height: 52, borderRadius: 12, flexShrink: 0,
            border: `0.5px solid ${recording ? '#ff6b8a' : 'rgba(255,255,255,0.07)'}`,
            background: recording ? 'rgba(255,107,138,0.1)' : 'rgba(255,255,255,0.04)',
            color: recording ? '#ff6b8a' : 'rgba(240,236,230,0.45)',
            cursor: 'pointer', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s',
          }}>🎤</button>

          <button className="btn-primary" onClick={submit} disabled={loading || text.trim().length < 10} style={{ flex: 1 }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(15,14,13,0.6)', display: 'inline-block', animation: `thinkBounce 1.4s ease-in-out ${i * 0.15}s infinite` }} />)}
                </span>
                {THINK_STEPS[thinkStep]}
              </span>
            ) : 'send into the atlas'}
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,700&family=Lora:ital@1&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes thinkBounce { 0%,100%{opacity:0.25;transform:translateY(0)} 50%{opacity:1;transform:translateY(-5px)} }
      `}</style>
    </div>
  )
}