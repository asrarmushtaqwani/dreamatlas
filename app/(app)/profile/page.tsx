'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Dream, Profile } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

function StatCard({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 300 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2, letterSpacing: '0.5px' }}>{label}</div>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [dreams, setDreams] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setEmail(user.email || '')

      const [{ data: prof }, { data: drms }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('dreams').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])
      setProfile(prof)
      setDreams(drms || [])
      setLoading(false)
    })
  }, [router])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  // Archetype breakdown
  const archetypeCounts: Record<string, number> = {}
  dreams.forEach(d => d.archetypes?.forEach(a => { archetypeCounts[a] = (archetypeCounts[a] || 0) + 1 }))
  const sortedArchetypes = Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1])
  const maxCount = sortedArchetypes[0]?.[1] || 1

  // Mood breakdown
  const moodCounts: Record<string, number> = {}
  dreams.forEach(d => { if (d.mood) moodCounts[d.mood] = (moodCounts[d.mood] || 0) + 1 })
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 14 }}>
      loading your atlas...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 100px' }}>
      {/* Header */}
      <div style={{ padding: '28px 24px 24px', borderBottom: '0.5px solid var(--border)' }}>
        {/* Dream name + avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
            background: profile?.avatar_color ? `${profile.avatar_color}25` : 'var(--accent-dim)',
            border: `0.5px solid ${profile?.avatar_color || 'var(--accent)'}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22,
          }}>
            ✦
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontStyle: 'italic', color: 'var(--text-primary)' }}>
              {profile?.dream_name || 'wandering dreamer'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>{email}</div>
          </div>
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <StatCard value={profile?.dream_count || dreams.length} label="Dreams logged" />
          <StatCard value={profile?.streak || 0} label="Day streak" />
          <StatCard value={profile?.top_archetype || sortedArchetypes[0]?.[0] || '—'} label="Top archetype" />
        </div>
      </div>

      {/* Archetype breakdown */}
      {sortedArchetypes.length > 0 && (
        <div style={{ padding: '24px 24px 0' }}>
          <div style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--text-tertiary)', marginBottom: 14 }}>YOUR ARCHETYPE MAP</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sortedArchetypes.map(([arch, count]) => {
              const col = ARCHETYPE_COLORS[arch] || 'var(--accent)'
              const pct = Math.round(count / maxCount * 100)
              return (
                <div key={arch}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: col }} />
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{arch}</span>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontFamily: 'monospace' }}>
                      {count} dream{count !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div style={{ height: 3, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`, background: col,
                      borderRadius: 2, transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Top mood */}
      {topMood && (
        <div style={{ padding: '24px 24px 0' }}>
          <div style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--text-tertiary)', marginBottom: 10 }}>EMOTIONAL SIGNATURE</div>
          <div className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 16, color: 'var(--text-secondary)' }}>
              Your dreams most often feel <span style={{ color: 'var(--text-primary)' }}>{topMood.toLowerCase()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent symbols */}
      {dreams.length > 0 && (() => {
        const allSymbols = dreams.flatMap(d => d.symbols || [])
        const symCount: Record<string, number> = {}
        allSymbols.forEach(s => { symCount[s] = (symCount[s] || 0) + 1 })
        const topSymbols = Object.entries(symCount).sort((a, b) => b[1] - a[1]).slice(0, 10)
        if (topSymbols.length === 0) return null
        return (
          <div style={{ padding: '24px 24px 0' }}>
            <div style={{ fontSize: 10, letterSpacing: '2px', color: 'var(--text-tertiary)', marginBottom: 10 }}>RECURRING SYMBOLS</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {topSymbols.map(([sym, cnt]) => (
                <div key={sym} style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12,
                  background: 'var(--surface)', border: '0.5px solid var(--border)',
                  color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  {sym}
                  {cnt > 1 && <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>×{cnt}</span>}
                </div>
              ))}
            </div>
          </div>
        )
      })()}

      {/* Sign out */}
      <div style={{ padding: '32px 24px 0' }}>
        <button
          onClick={handleSignOut}
          className="btn-ghost"
          style={{ width: '100%', color: 'var(--text-tertiary)' }}
        >
          sign out
        </button>
      </div>
    </div>
  )
}
