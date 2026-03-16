'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { WrappedSnapshot } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import Link from 'next/link'

type WrappedState = 'loading' | 'found' | 'generating' | 'none' | 'error'

function getMonthName(monthStr: string) {
  const [year, month] = monthStr.split('-')
  return new Date(Number(year), Number(month) - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
}

export default function WrappedPage() {
  const [state, setState] = useState<WrappedState>('loading')
  const [wrapped, setWrapped] = useState<WrappedSnapshot | null>(null)
  const [error, setError] = useState('')
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    generate()
  }, [])

  async function generate() {
    setState('generating')
    try {
      const res = await fetch('/api/wrapped')
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 404) { setState('none'); return }
        setError(data.error || 'Failed to generate Wrapped')
        setState('error')
        return
      }
      setWrapped(data)
      setState('found')
    } catch {
      setError('Connection failed')
      setState('error')
    }
  }

  const accentColor = wrapped?.top_archetype
    ? ARCHETYPE_COLORS[wrapped.top_archetype]
    : '#8b6fff'

  if (state === 'loading' || state === 'generating') {
    return (
      <div className="min-h-screen bg-[#070710] flex flex-col items-center justify-center gap-4">
        <div className="flex gap-2">
          {[0,1,2,3].map(i => (
            <div
              key={i}
              className="w-1 h-8 rounded-full bg-[#8b6fff]"
              style={{ animation: `wave 1.2s ease-in-out ${i * 0.15}s infinite` }}
            />
          ))}
        </div>
        <p className="text-white/30 text-sm tracking-widest font-['Crimson_Pro',Georgia,serif]">
          {state === 'generating' ? 'weaving your month together…' : 'opening your wrapped…'}
        </p>
        <style jsx>{`
          @keyframes wave {
            0%, 100% { transform: scaleY(0.4); opacity: 0.3; }
            50% { transform: scaleY(1); opacity: 1; }
          }
        `}</style>
      </div>
    )
  }

  if (state === 'none') {
    return (
      <div className="min-h-screen bg-[#070710] flex flex-col items-center justify-center text-center px-6">
        <p className="text-white/30 text-xl font-['Crimson_Pro',Georgia,serif] mb-4">
          No dreams logged this month yet.
        </p>
        <Link href="/log" className="text-[#8b6fff]/60 hover:text-[#8b6fff] text-sm transition-colors underline underline-offset-4">
          Log your first dream →
        </Link>
      </div>
    )
  }

  if (state === 'error') {
    return (
      <div className="min-h-screen bg-[#070710] flex flex-col items-center justify-center text-center px-6 gap-4">
        <p className="text-white/40 font-['Crimson_Pro',Georgia,serif]">{error}</p>
        <button onClick={generate} className="text-[#8b6fff]/60 text-sm hover:text-[#8b6fff] transition-colors">
          Try again
        </button>
      </div>
    )
  }

  if (!wrapped) return null

  return (
    <div className="min-h-screen bg-[#070710] text-white font-['Crimson_Pro',_Georgia,_serif] py-16 px-6">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(ellipse 60% 40% at 50% 20%, ${accentColor}08, transparent)` }}
        />
      </div>

      <div className="relative max-w-md mx-auto">
        <Link href="/journal" className="text-white/20 text-sm tracking-wider hover:text-white/40 transition-colors mb-10 inline-block">
          ← Journal
        </Link>

        {/* The Wrapped Card */}
        <div
          ref={cardRef}
          className="rounded-3xl border border-white/10 overflow-hidden relative"
          style={{
            background: `linear-gradient(135deg, #0d0d1a 0%, #0a0a15 50%, ${accentColor}08 100%)`,
          }}
        >
          {/* Card inner glow */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle at 70% 20%, ${accentColor}12, transparent 60%)`,
            }}
          />

          <div className="relative p-10">
            {/* Month label */}
            <div className="text-xs tracking-[0.4em] uppercase mb-8 font-sans" style={{ color: accentColor }}>
              Dream Wrapped · {getMonthName(wrapped.month)}
            </div>

            {/* Big number */}
            <div className="mb-8">
              <div className="text-7xl font-light leading-none mb-1" style={{ color: accentColor }}>
                {wrapped.dream_count}
              </div>
              <div className="text-white/30 text-sm tracking-wider">
                dream{wrapped.dream_count !== 1 ? 's' : ''} this month
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.06] mb-8" />

            {/* Top archetype */}
            {wrapped.top_archetype && (
              <div className="mb-7">
                <p className="text-white/30 text-xs tracking-[0.3em] uppercase mb-2 font-sans">
                  Dominant archetype
                </p>
                <div
                  className="text-2xl font-light"
                  style={{ color: accentColor }}
                >
                  {wrapped.top_archetype}
                </div>
              </div>
            )}

            {/* Top symbols */}
            {wrapped.top_symbols?.length > 0 && (
              <div className="mb-7">
                <p className="text-white/30 text-xs tracking-[0.3em] uppercase mb-3 font-sans">
                  Recurring symbols
                </p>
                <div className="flex flex-wrap gap-2">
                  {wrapped.top_symbols.map((sym, i) => (
                    <span
                      key={sym}
                      className="px-3 py-1 rounded-full text-sm border border-white/10 text-white/60"
                      style={{
                        opacity: 1 - i * 0.1,
                        backgroundColor: 'rgba(255,255,255,0.03)',
                      }}
                    >
                      {sym}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Streak */}
            {wrapped.streak_peak > 0 && (
              <div className="mb-7">
                <p className="text-white/30 text-xs tracking-[0.3em] uppercase mb-2 font-sans">
                  Longest streak
                </p>
                <div className="text-xl font-light text-white/80">
                  {wrapped.streak_peak} consecutive {wrapped.streak_peak === 1 ? 'day' : 'days'}
                </div>
              </div>
            )}

            {/* Dreamworlds */}
            {wrapped.dreamworld_titles?.length > 0 && (
              <div className="mb-7">
                <p className="text-white/30 text-xs tracking-[0.3em] uppercase mb-3 font-sans">
                  Dreamworlds entered
                </p>
                <div className="flex flex-col gap-1">
                  {wrapped.dreamworld_titles.map(title => (
                    <div key={title} className="text-white/60 text-sm flex items-center gap-2">
                      <span style={{ color: accentColor }}>·</span> {title}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="h-px bg-white/[0.06] mb-7" />

            {/* Essence summary */}
            {wrapped.essence_summary && (
              <div className="mb-8">
                <p className="text-white/50 text-sm leading-relaxed italic">
                  "{wrapped.essence_summary}"
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="text-white/15 text-xs tracking-wider font-sans">
                DreamAtlas
              </div>
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-1 rounded-full"
                    style={{ backgroundColor: accentColor, opacity: 0.4 + i * 0.2 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Share prompt */}
        <div className="mt-8 text-center">
          <p className="text-white/20 text-sm mb-4">This month in your unconscious.</p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/journal"
              className="text-white/30 text-sm hover:text-white/60 transition-colors"
            >
              View journal
            </Link>
            <span className="text-white/10">·</span>
            <Link
              href="/dreamworlds"
              className="text-white/30 text-sm hover:text-white/60 transition-colors"
            >
              Explore worlds
            </Link>
            <span className="text-white/10">·</span>
            <Link
              href="/twins"
              className="text-white/30 text-sm hover:text-white/60 transition-colors"
            >
              Find twin
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}