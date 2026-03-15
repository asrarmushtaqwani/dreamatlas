'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/auth/login'); return }
      setEmail(user.email || '')
      supabase.from('profiles').select('*').eq('id', user.id).single()
        .then(({ data }) => { if (data) setProfile(data); setLoading(false) })
    })
  }, [router])

  async function signOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const topColor = profile?.top_archetype ? ARCHETYPE_COLORS[profile.top_archetype] : 'var(--accent)'

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ padding: '24px 24px 20px', borderBottom: '0.5px solid var(--border)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontStyle: 'italic', fontWeight: 300 }}>Profile</div>
      </div>
      <div style={{ padding: '24px', maxWidth: 520 }}>
        {loading ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: 14 }}>loading...</div>
        ) : (
          <>
            <div className="card" style={{ padding: '24px', marginBottom: 16, textAlign: 'center' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
                background: `${topColor}20`, border: `0.5px solid ${topColor}40`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24, color: topColor,
              }}>✦</div>
              <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22, marginBottom: 4 }}>
                {profile?.dream_name || 'the wandering dreamer'}
              </div>
              <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{email}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[
                { val: String(profile?.dream_count || 0), label: 'Dreams' },
                { val: String(profile?.streak || 0),      label: 'Day streak' },
                { val: profile?.top_archetype || '—',     label: 'Top archetype' },
              ].map(({ val, label }) => (
                <div key={label} className="card" style={{ padding: '16px', textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 300, marginBottom: 4 }}>{val}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {[
                { href: '/journal', label: 'View your journal' },
                { href: '/map',     label: 'Explore the atlas' },
                { href: '/worlds',  label: 'Browse dreamworlds' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{ padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
                    <span style={{ color: 'var(--text-tertiary)' }}>→</span>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ padding: '16px 20px', borderRadius: 12, border: '0.5px dashed var(--border)', marginBottom: 24 }}>
              <div style={{ fontSize: 11, letterSpacing: '2px', color: 'var(--text-tertiary)', marginBottom: 10 }}>COMING IN PHASE 2</div>
              {['Dream Wrapped — your annual psyche map', 'Dream Twin — find your unconscious mirror', 'Privacy controls — full anonymous mode'].map(f => (
                <div key={f} style={{ fontSize: 13, color: 'var(--text-tertiary)', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{ color: 'var(--accent)', fontSize: 10 }}>◌</span> {f}
                </div>
              ))}
            </div>

            <button onClick={signOut} className="btn-ghost" style={{ width: '100%', color: 'var(--text-tertiary)' }}>Sign out</button>
          </>
        )}
      </div>
    </div>
  )
}
