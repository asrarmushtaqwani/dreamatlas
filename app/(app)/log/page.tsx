'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mood } from '@/types'

const MOODS: { label: Mood; icon: string }[] = [
  { label: 'Peaceful',    icon: '◌' },
  { label: 'Wondrous',    icon: '◈' },
  { label: 'Anxious',     icon: '◉' },
  { label: 'Euphoric',    icon: '◎' },
  { label: 'Terrifying',  icon: '●' },
  { label: 'Melancholic', icon: '◑' },
  { label: 'Confused',    icon: '◐' },
  { label: 'Nostalgic',   icon: '◒' },
]

const THINK_STEPS = [
  'reading the symbols in your dream',
  'finding your archetypes',
  'placing you on the atlas',
]

export default function LogPage() {
  const router = useRouter()
  const [text, setText] = useState('')
  const [mood, setMood] = useState<Mood | null>(null)
  const [loading, setLoading] = useState(false)
  const [thinkStep, setThinkStep] = useState(0)
  const [recording, setRecording] = useState(false)
  const stepRef = useRef<NodeJS.Timeout | null>(null)
  const recRef = useRef<any>(null)

  function toggleVoice() {
    if (recording) {
      recRef.current?.stop()
      setRecording(false)
      return
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) return
    const rec = new SR()
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = (e: any) => {
      setText(t => t + e.results[0][0].transcript + ' ')
    }
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
      // Store in session for insight page
      sessionStorage.setItem('pendingDream', JSON.stringify({ text, mood, ...analysis }))
      clearInterval(stepRef.current!)
      router.push('/insight')
    } catch {
      clearInterval(stepRef.current!)
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <Link href="/map" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-tertiary)', fontSize: 13, textDecoration: 'none', marginBottom: 40 }}>
          ← atlas
        </Link>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontStyle: 'italic', fontWeight: 300, marginBottom: 6 }}>
          What did you dream?
        </div>
        <div style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 32 }}>
          Fragments are fine. Write as it comes.
        </div>

        <textarea
          className="dream-input"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="I was standing in a place that felt like home but looked like somewhere I'd never been..."
          rows={6}
          maxLength={1000}
          disabled={loading}
        />
        <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--text-tertiary)', marginTop: 6 }}>
          {text.length} / 1000
        </div>

        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, letterSpacing: '2px', color: 'var(--text-tertiary)', marginBottom: 12 }}>EMOTIONAL TONE</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {MOODS.map(m => (
              <button
                key={m.label}
                onClick={() => setMood(mood === m.label ? null : m.label)}
                disabled={loading}
                style={{
                  padding: '8px 16px', borderRadius: 24, fontSize: 13, cursor: 'pointer',
                  border: `0.5px solid ${mood === m.label ? 'var(--accent)' : 'var(--border)'}`,
                  background: mood === m.label ? 'var(--accent-dim)' : 'var(--surface)',
                  color: mood === m.label ? 'var(--text-primary)' : 'var(--text-secondary)',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span style={{ fontSize: 12 }}>{m.icon}</span>
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
          <button
            onClick={toggleVoice}
            disabled={loading}
            style={{
              width: 52, height: 52, borderRadius: 14, flexShrink: 0,
              border: `0.5px solid ${recording ? '#ff6b8a' : 'var(--border)'}`,
              background: recording ? 'rgba(255,107,138,0.1)' : 'var(--surface)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: recording ? '#ff6b8a' : 'var(--text-secondary)', fontSize: 20,
              transition: 'all 0.2s',
            }}
            title="Voice input"
          >
            🎤
          </button>
          <button
            className="btn-primary"
            onClick={submit}
            disabled={loading || text.trim().length < 10}
          >
            {loading ? THINK_STEPS[thinkStep] + '...' : 'send into the atlas'}
          </button>
        </div>

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)',
                animation: 'thinkBounce 1.4s ease-in-out infinite',
                animationDelay: `${i * 0.15}s`,
              }} />
            ))}
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{THINK_STEPS[thinkStep]}</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes thinkBounce {
          0%,100%{opacity:0.2;transform:translateY(0)}
          50%{opacity:1;transform:translateY(-4px)}
        }
      `}</style>
    </div>
  )
}
