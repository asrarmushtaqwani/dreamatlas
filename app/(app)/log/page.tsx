'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mood } from '@/types'

const MOODS: { label: Mood; symbol: string; color: string }[] = [
  { label: 'Peaceful',    symbol: '◌', color: '#4ade9a' },
  { label: 'Wondrous',    symbol: '◈', color: '#7c6ef5' },
  { label: 'Anxious',     symbol: '◉', color: '#f59e0b' },
  { label: 'Euphoric',    symbol: '◎', color: '#e2c170' },
  { label: 'Terrifying',  symbol: '●', color: '#ff6b8a' },
  { label: 'Melancholic', symbol: '◑', color: '#6b9fff' },
  { label: 'Confused',    symbol: '◐', color: '#c084fc' },
  { label: 'Nostalgic',   symbol: '◒', color: '#fb923c' },
]

const THINK_STEPS = [
  'reading the symbols…',
  'finding your archetypes…',
  'placing you on the atlas…',
]

export default function LogPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [mood, setMood] = useState<Mood | null>(null)
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
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = (e: any) => setText(t => t + e.results[0][0].transcript + ' ')
    rec.onend = () => setRecording(false)
    recRef.current = rec
    rec.start()
    setRecording(true)
  }

  async function submit() {
    if (text.trim().length < 10) return
    setLoading(true)
    stepRef.current = setInterval(() => setThinkStep(s => (s + 1) % THINK_STEPS.length), 1800)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, mood }),
      })
      const analysis = await res.json()
      sessionStorage.setItem('pendingDream', JSON.stringify({ text, mood, ...analysis }))
      clearInterval(stepRef.current!)
      router.push('/insight')
    } catch {
      clearInterval(stepRef.current!)
      setLoading(false)
    }
  }

  const charPercent = text.length / 1000

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px 20px 80px',
      background: 'var(--bg)',
      position: 'relative',
    }}>
      {/* Ambient */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 50% at 50% 40%, var(--accent-glow), transparent 65%)',
      }} />

      <div style={{ width: '100%', maxWidth: 580, position: 'relative', zIndex: 1 }}
        className="animate-fade-up"
      >
        {/* Back */}
        <Link href="/map" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-tertiary)', fontSize: 12, letterSpacing: '0.08em',
          textDecoration: 'none', marginBottom: 44, transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
        >
          ← atlas
        </Link>

        {/* Heading */}
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(36px, 5vw, 52px)',
          fontWeight: 500, fontStyle: 'italic',
          letterSpacing: '-0.02em',
          lineHeight: 1.1, marginBottom: 8,
          color: 'var(--text-primary)',
        }}>
          What did you dream?
        </h1>
        <p style={{
          fontFamily: 'var(--font-serif)', fontStyle: 'italic',
          fontSize: 15, color: 'var(--text-secondary)', marginBottom: 32,
        }}>
          Fragments are fine. Write as it comes.
        </p>

        {/* Textarea */}
        <div style={{ position: 'relative', marginBottom: 6 }}>
          <textarea
            className="dream-input"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="I was standing in a place that felt like home but looked like somewhere I'd never been…"
            rows={7}
            maxLength={1000}
            disabled={loading}
          />
          {/* Progress bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
            background: 'var(--border)', borderRadius: '0 0 16px 16px', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${charPercent * 100}%`,
              background: charPercent > 0.9 ? 'var(--danger)' : 'var(--accent)',
              transition: 'width 0.1s, background 0.3s',
              borderRadius: '0 0 16px 16px',
            }} />
          </div>
        </div>
        <div style={{
          textAlign: 'right', fontSize: 11,
          color: charPercent > 0.9 ? 'var(--danger)' : 'var(--text-tertiary)',
          marginBottom: 28, fontFamily: 'var(--font-body)',
          transition: 'color 0.3s',
        }}>
          {text.length} / 1000
        </div>

        {/* Mood selector */}
        <div style={{ marginBottom: 32 }}>
          <div className="label" style={{ marginBottom: 12 }}>Emotional tone</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MOODS.map(m => {
              const active = mood === m.label
              return (
                <button
                  key={m.label}
                  onClick={() => setMood(active ? null : m.label)}
                  disabled={loading}
                  style={{
                    padding: '8px 16px', borderRadius: 40, fontSize: 13,
                    cursor: 'pointer', fontFamily: 'var(--font-body)',
                    border: `0.5px solid ${active ? m.color + '60' : 'var(--border)'}`,
                    background: active ? m.color + '15' : 'var(--surface)',
                    color: active ? m.color : 'var(--text-secondary)',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                  onMouseEnter={e => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = m.color + '40'
                      el.style.color = m.color
                    }
                  }}
                  onMouseLeave={e => {
                    if (!active) {
                      const el = e.currentTarget as HTMLElement
                      el.style.borderColor = 'var(--border)'
                      el.style.color = 'var(--text-secondary)'
                    }
                  }}
                >
                  <span style={{ fontSize: 11, color: active ? m.color : 'var(--text-tertiary)' }}>{m.symbol}</span>
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10 }}>
          {/* Voice button */}
          <button
            onClick={toggleVoice}
            disabled={loading}
            title="Voice input"
            style={{
              width: 52, height: 52, borderRadius: 12, flexShrink: 0,
              border: `0.5px solid ${recording ? 'var(--danger)' : 'var(--border)'}`,
              background: recording ? 'rgba(255,107,138,0.1)' : 'var(--surface)',
              color: recording ? 'var(--danger)' : 'var(--text-secondary)',
              cursor: 'pointer', fontSize: 18,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              animation: recording ? 'orbPulse 1.5s ease-in-out infinite' : 'none',
            }}
          >
            🎤
          </button>

          {/* Submit */}
          <button
            className="btn-primary"
            onClick={submit}
            disabled={loading || text.trim().length < 10}
            style={{ flex: 1 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <span style={{ display: 'flex', gap: 4 }}>
                  {[0,1,2].map(i => (
                    <span key={i} style={{
                      width: 5, height: 5, borderRadius: '50%',
                      background: 'rgba(255,255,255,0.7)', display: 'inline-block',
                      animation: 'thinkBounce 1.4s ease-in-out infinite',
                      animationDelay: `${i * 0.15}s`,
                    }} />
                  ))}
                </span>
                {THINK_STEPS[thinkStep]}
              </span>
            ) : (
              'send into the atlas'
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes thinkBounce {
          0%,100%{opacity:0.25;transform:translateY(0)}
          50%{opacity:1;transform:translateY(-5px)}
        }
        @keyframes orbPulse {
          0%,100%{transform:scale(1)}
          50%{transform:scale(1.05)}
        }
      `}</style>
    </div>
  )
}