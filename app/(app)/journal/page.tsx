'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Dream, Archetype } from '@/types'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en', { month: 'short', day: 'numeric' })
}

export default function JournalPage() {
  const [dreams, setDreams] = useState<Dream[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Dream | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { setLoading(false); return }
      supabase
        .from('dreams')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .then(({ data }) => { setDreams(data || []); setLoading(false) })
    })
  }, [])

  const archetypes = [...new Set(dreams.flatMap(d => d.archetypes))] as Archetype[]
  const visible = filter === 'all' ? dreams : dreams.filter(d => d.archetypes.includes(filter as Archetype))

  return (
    <div style={{ minHeight: '100vh', padding: '0 0 80px' }}>
      {/* Header */}
      <div style={{ padding: '24px 24px 0', borderBottom: '0.5px solid var(--border)', paddingBottom: 20 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontStyle: 'italic', fontWeight: 300, marginBottom: 4 }}>
          Your journal
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
          {dreams.length} dreams logged
        </div>

        {/* Filter chips */}
        {archetypes.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
            <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
            {archetypes.map(a => (
              <button key={a} className={`chip ${filter === a ? 'active' : ''}`} onClick={() => setFilter(filter === a ? 'all' : a)}>{a}</button>
            ))}
          </div>
        )}
      </div>

      {/* Dream list */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-tertiary)', fontSize: 14 }}>
            loading your dreams...
          </div>
        )}

        {!loading && dreams.length === 0 && (
          <div style={{ textAlign: 'center', padding: '64px 24px' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontStyle: 'italic', marginBottom: 8, color: 'var(--text-secondary)' }}>
              No dreams yet
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-tertiary)', marginBottom: 28 }}>
              Your journal awaits its first entry
            </div>
            <Link href="/log">
              <button className="btn-primary" style={{ width: 'auto', padding: '12px 28px' }}>Log your first dream</button>
            </Link>
          </div>
        )}

        {visible.map(dream => (
          <div
            key={dream.id}
            className="card"
            onClick={() => setSelected(selected?.id === dream.id ? null : dream)}
            style={{ padding: '16px 18px', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {dream.archetypes.slice(0, 2).map(a => (
                  <span key={a} style={{
                    padding: '2px 10px', borderRadius: 12, fontSize: 11,
                    background: `${ARCHETYPE_COLORS[a] || 'var(--accent)'}18`,
                    color: ARCHETYPE_COLORS[a] || 'var(--accent)',
                    border: `0.5px solid ${ARCHETYPE_COLORS[a] || 'var(--accent)'}40`,
                  }}>{a}</span>
                ))}
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)', whiteSpace: 'nowrap', marginLeft: 8 }}>
                {timeAgo(dream.created_at)}
              </span>
            </div>

            <div style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic',
              fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.5,
              display: '-webkit-box', WebkitLineClamp: selected?.id === dream.id ? undefined : 2,
              WebkitBoxOrient: 'vertical', overflow: selected?.id === dream.id ? 'visible' : 'hidden',
            }}>
              "{dream.text}"
            </div>

            {selected?.id === dream.id && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: '0.5px solid var(--border)' }}>
                <div style={{ fontSize: 11, letterSpacing: '1.5px', color: 'var(--text-tertiary)', marginBottom: 6 }}>ESSENCE</div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic',
                  fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.6, marginBottom: 12,
                }}>
                  {dream.essence}
                </div>
                {dream.symbols?.length > 0 && (
                  <>
                    <div style={{ fontSize: 11, letterSpacing: '1.5px', color: 'var(--text-tertiary)', marginBottom: 6 }}>SYMBOLS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {dream.symbols.map(s => (
                        <span key={s} style={{
                          padding: '3px 10px', borderRadius: 6, fontSize: 11,
                          background: 'var(--surface2)', border: '0.5px solid var(--border)',
                          color: 'var(--text-secondary)',
                        }}>{s}</span>
                      ))}
                    </div>
                  </>
                )}
                {dream.mood && (
                  <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-tertiary)' }}>
                    mood: <span style={{ color: 'var(--text-secondary)' }}>{dream.mood}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
