'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DreamTwinMatch } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

type TwinState = 'idle' | 'loading' | 'found' | 'error' | 'none'

export default function TwinsPage() {
  const [state, setState] = useState<TwinState>('idle')
  const [twin, setTwin] = useState<DreamTwinMatch | null>(null)
  const [reasoning, setReasoning] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [myDreamCount, setMyDreamCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Check for existing twin match + dream count
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ count }, { data: existing }] = await Promise.all([
        supabase.from('dreams').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase
          .from('dream_twin_matches')
          .select('*, twin_profile:profiles!dream_twin_matches_twin_user_id_fkey(dream_name, avatar_color)')
          .eq('user_id', user.id)
          .order('similarity_score', { ascending: false })
          .limit(1)
          .single(),
      ])

      setMyDreamCount(count || 0)
      if (existing) {
        setTwin(existing as any)
        setState('found')
      }
    }
    init()
  }, [])

  async function findTwin() {
    setState('loading')
    setError('')
    try {
      const res = await fetch('/api/twins', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Something went wrong')
        setState('error')
        return
      }
      setTwin(data)
      setReasoning(data.reasoning || '')
      setState('found')
    } catch {
      setError('Connection failed')
      setState('error')
    }
  }

  const tooFewDreams = myDreamCount < 3

  return (
    <div className="min-h-screen bg-[#070710] text-white font-['Crimson_Pro',_Georgia,_serif] flex flex-col items-center justify-center px-6 py-16">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(139,111,255,0.05),transparent)]" />
      </div>

      <div className="relative w-full max-w-lg text-center">
        <div className="text-[#8b6fff]/40 text-xs tracking-[0.4em] uppercase mb-6 font-sans">
          Dream Twins
        </div>

        <h1 className="text-4xl font-light tracking-tight mb-4">
          Your unconscious<br />doppelgänger
        </h1>

        <p className="text-white/30 mb-12 text-lg leading-relaxed">
          Somewhere on earth, another mind dreams<br />
          the same territories you do.
        </p>

        {/* States */}
        {state === 'idle' && (
          <div>
            {tooFewDreams ? (
              <div className="border border-white/[0.06] rounded-2xl p-8 bg-white/[0.02]">
                <p className="text-white/40 text-sm mb-2">
                  Log {3 - myDreamCount} more dream{3 - myDreamCount !== 1 ? 's' : ''} to find your twin.
                </p>
                <p className="text-white/20 text-xs">
                  Your twin is found by comparing archetype fingerprints across all dreamers.
                </p>
              </div>
            ) : (
              <button
                onClick={findTwin}
                className="px-10 py-4 border border-[#8b6fff]/40 rounded-full text-[#8b6fff] hover:bg-[#8b6fff]/10 hover:border-[#8b6fff] transition-all duration-300 tracking-widest text-sm uppercase font-sans"
              >
                Find my twin
              </button>
            )}
          </div>
        )}

        {state === 'loading' && (
          <div className="space-y-4">
            <div className="flex justify-center gap-1">
              {[0,1,2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#8b6fff]"
                  style={{ animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite` }}
                />
              ))}
            </div>
            <p className="text-white/30 text-sm tracking-widest animate-pulse">
              scanning the collective unconscious…
            </p>
          </div>
        )}

        {state === 'error' && (
          <div className="space-y-4">
            <p className="text-white/40 italic">{error}</p>
            <button
              onClick={() => setState('idle')}
              className="text-[#8b6fff]/60 text-sm hover:text-[#8b6fff] transition-colors underline underline-offset-4"
            >
              Try again
            </button>
          </div>
        )}

        {state === 'found' && twin && (
          <div className="space-y-6">
            {/* Twin card */}
            <div className="border border-white/10 rounded-2xl p-8 bg-white/[0.03] relative overflow-hidden">
              {/* Glow */}
              <div
                className="absolute inset-0"
                style={{
                  background: `radial-gradient(circle at 50% 0%, ${twin.twin_profile?.avatar_color || '#8b6fff'}10, transparent 60%)`,
                }}
              />
              <div className="relative">
                {/* Avatar */}
                <div className="flex justify-center mb-6">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-2xl"
                    style={{
                      backgroundColor: `${twin.twin_profile?.avatar_color || '#8b6fff'}20`,
                      border: `1px solid ${twin.twin_profile?.avatar_color || '#8b6fff'}40`,
                      boxShadow: `0 0 30px ${twin.twin_profile?.avatar_color || '#8b6fff'}20`,
                    }}
                  >
                    🌙
                  </div>
                </div>

                <p className="text-white/40 text-xs tracking-[0.3em] uppercase mb-1 font-sans">
                  Your twin
                </p>
                <h2 className="text-2xl font-light mb-4">
                  {twin.twin_profile?.dream_name || 'unknown dreamer'}
                </h2>

                {/* Similarity */}
                <div className="mb-5">
                  <div className="flex justify-between text-xs text-white/30 mb-2 font-sans">
                    <span>Unconscious similarity</span>
                    <span>{Math.round(twin.similarity_score * 100)}%</span>
                  </div>
                  <div className="h-px w-full bg-white/10 relative">
                    <div
                      className="absolute left-0 top-0 h-full transition-all duration-1000"
                      style={{
                        width: `${twin.similarity_score * 100}%`,
                        backgroundColor: twin.twin_profile?.avatar_color || '#8b6fff',
                        boxShadow: `0 0 8px ${twin.twin_profile?.avatar_color || '#8b6fff'}`,
                      }}
                    />
                  </div>
                </div>

                {/* Shared archetypes */}
                {twin.shared_archetypes?.length > 0 && (
                  <div className="mb-5">
                    <p className="text-white/30 text-xs tracking-wider uppercase mb-2 font-sans">
                      Shared territories
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {twin.shared_archetypes.map(a => (
                        <span
                          key={a}
                          className="px-3 py-1 rounded-full text-xs tracking-wider uppercase font-sans border"
                          style={{
                            color: ARCHETYPE_COLORS[a] || '#8b6fff',
                            borderColor: `${ARCHETYPE_COLORS[a] || '#8b6fff'}40`,
                            backgroundColor: `${ARCHETYPE_COLORS[a] || '#8b6fff'}10`,
                          }}
                        >
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                {reasoning && (
                  <p className="text-white/40 italic text-sm leading-relaxed border-t border-white/[0.06] pt-5 mt-5">
                    "{reasoning}"
                  </p>
                )}
              </div>
            </div>

            <p className="text-white/20 text-xs">
              Twins are recalculated as new dreamers join.
            </p>

            <button
              onClick={findTwin}
              className="text-[#8b6fff]/40 text-sm hover:text-[#8b6fff]/70 transition-colors underline underline-offset-4"
            >
              Recalculate
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}