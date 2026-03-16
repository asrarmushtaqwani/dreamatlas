'use client'

import { useState } from 'react'

interface Props {
  dreamAId: string
  dreamBId: string
  label?: string
}

type ScoreState = 'idle' | 'loading' | 'done' | 'error'

export default function ResonanceScore({ dreamAId, dreamBId, label }: Props) {
  const [state, setState] = useState<ScoreState>('idle')
  const [score, setScore] = useState<number | null>(null)
  const [reasoning, setReasoning] = useState('')

  async function fetchScore() {
    setState('loading')
    try {
      const res = await fetch('/api/resonance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream_a_id: dreamAId, dream_b_id: dreamBId }),
      })
      const data = await res.json()
      if (!res.ok) { setState('error'); return }
      setScore(data.score)
      setReasoning(data.reasoning || '')
      setState('done')
    } catch {
      setState('error')
    }
  }

  const color = score !== null
    ? score >= 70 ? '#8b6fff'
    : score >= 40 ? '#6b9fff'
    : '#9999cc'
    : '#8b6fff'

  return (
    <div className="font-['Crimson_Pro',_Georgia,_serif]">
      {state === 'idle' && (
        <button
          onClick={fetchScore}
          className="text-xs tracking-[0.3em] uppercase text-white/30 hover:text-white/60 transition-colors border-b border-white/10 hover:border-white/30 pb-px font-sans"
        >
          {label || 'Score resonance'}
        </button>
      )}

      {state === 'loading' && (
        <span className="text-xs text-white/20 tracking-widest animate-pulse font-sans">
          scoring…
        </span>
      )}

      {state === 'error' && (
        <button onClick={fetchScore} className="text-xs text-red-400/40 hover:text-red-400/70 transition-colors">
          Failed — retry
        </button>
      )}

      {state === 'done' && score !== null && (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-light" style={{ color }}>{score}</div>
            <div className="text-white/20 text-xs font-sans">/ 100 resonance</div>
          </div>
          <div className="h-px w-full bg-white/[0.06] relative">
            <div
              className="absolute left-0 top-0 h-full"
              style={{ width: `${score}%`, backgroundColor: color, boxShadow: `0 0 6px ${color}` }}
            />
          </div>
          {reasoning && (
            <p className="text-white/30 text-sm italic leading-snug">"{reasoning}"</p>
          )}
        </div>
      )}
    </div>
  )
}