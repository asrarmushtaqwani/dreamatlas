'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

function EmailField({ email }: { email: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
        {visible ? email : '••••••••••••'}
      </span>
      <button onClick={() => setVisible(v => !v)} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-tertiary)', padding: 0, display: 'flex', alignItems: 'center',
        transition: 'color 0.2s',
      }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
      >
        {visible ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
        )}
      </button>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile]       = useState<any>(null)
  const [email, setEmail]           = useState('')
  const [loading, setLoading]       = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput]   = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [avatarUrl, setAvatarUrl]   = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setEmail(user.email || '')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) {
        setProfile(data)
        setNameInput(data.dream_name || '')
        setAvatarUrl(data.avatar_url || null)
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function saveName() {
    if (!nameInput.trim()) return
    setNameSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ dream_name: nameInput.trim() }).eq('id', user.id)
    setProfile((p: any) => ({ ...p, dream_name: nameInput.trim() }))
    setEditingName(false)
    setNameSaving(false)
  }

  async function uploadAvatar(file: File) {
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB'); return }
    setAvatarUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const ext  = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (uploadError) { setAvatarUploading(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const url = data.publicUrl
    await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
    setAvatarUrl(`${url}?t=${Date.now()}`)
    setAvatarUploading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const topColor = profile?.top_archetype ? ARCHETYPE_COLORS[profile.top_archetype] : 'var(--accent)'

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: 'var(--bg)' }}>

      {/* Header */}
      <div style={{
        padding: '24px 24px 20px',
        borderBottom: '0.5px solid var(--border)',
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 30,
          fontStyle: 'italic', fontWeight: 500,
          color: 'var(--text-primary)', letterSpacing: '-0.01em',
        }}>
          Profile
        </h1>
      </div>

      <div style={{ padding: '24px', maxWidth: 520 }}>
        {loading ? (
          <div style={{ color: 'var(--text-tertiary)', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>
            loading…
          </div>
        ) : (
          <div className="stagger">

            {/* Identity card */}
            <div className="card animate-fade-up" style={{ padding: '28px 24px', marginBottom: 14, textAlign: 'center' }}>

              {/* Avatar */}
              <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 16px' }}>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  title="Change photo"
                  style={{
                    width: 72, height: 72, borderRadius: '50%', cursor: 'pointer',
                    background: avatarUrl ? 'transparent' : `${topColor}18`,
                    border: `0.5px solid ${topColor}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden', transition: 'all 0.2s', position: 'relative',
                    boxShadow: `0 0 20px ${topColor}15`,
                  }}
                  onMouseEnter={e => {
                    const ov = (e.currentTarget as HTMLElement).querySelector('.av-ov') as HTMLElement
                    if (ov) ov.style.opacity = '1'
                  }}
                  onMouseLeave={e => {
                    const ov = (e.currentTarget as HTMLElement).querySelector('.av-ov') as HTMLElement
                    if (ov) ov.style.opacity = '0'
                  }}
                >
                  {avatarUploading ? (
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>…</div>
                  ) : avatarUrl ? (
                    <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: 26, color: topColor }}>✦</span>
                  )}
                  <div className="av-ov" style={{
                    position: 'absolute', inset: 0, borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: 0, transition: 'opacity 0.2s',
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={e => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]) }} />
              </div>

              {/* Editable name */}
              {editingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
                  <input
                    value={nameInput}
                    onChange={e => setNameInput(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }}
                    autoFocus maxLength={40}
                    style={{
                      background: 'var(--surface2)', border: '0.5px solid var(--accent)',
                      borderRadius: 8, color: 'var(--text-primary)', padding: '7px 14px',
                      fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 20,
                      outline: 'none', textAlign: 'center', width: 220,
                    }}
                  />
                  <button onClick={saveName} disabled={nameSaving} style={{
                    background: 'var(--accent)', border: 'none', borderRadius: 8,
                    color: 'white', padding: '7px 14px', cursor: 'pointer', fontSize: 13,
                    opacity: nameSaving ? 0.5 : 1, transition: 'opacity 0.2s',
                  }}>
                    {nameSaving ? '…' : 'Save'}
                  </button>
                  <button onClick={() => setEditingName(false)} style={{
                    background: 'none', border: 'none', color: 'var(--text-tertiary)',
                    cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4,
                  }}>
                    ×
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setEditingName(true)}
                  title="Click to edit"
                  style={{
                    fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 22,
                    marginBottom: 6, cursor: 'pointer',
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    color: 'var(--text-primary)', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => {
                    const ic = (e.currentTarget as HTMLElement).querySelector('.edit-ic') as HTMLElement
                    if (ic) ic.style.opacity = '1'
                  }}
                  onMouseLeave={e => {
                    const ic = (e.currentTarget as HTMLElement).querySelector('.edit-ic') as HTMLElement
                    if (ic) ic.style.opacity = '0'
                  }}
                >
                  {profile?.dream_name || 'the wandering dreamer'}
                  <svg className="edit-ic" width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ opacity: 0, transition: 'opacity 0.2s', flexShrink: 0 }}
                  >
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
              )}

              <EmailField email={email} />
            </div>

            {/* Stats */}
            <div className="animate-fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
              {[
                { val: String(profile?.dream_count || 0), label: 'Dreams' },
                { val: String(profile?.streak || 0),      label: 'Day streak' },
                { val: profile?.top_archetype || '—',     label: 'Top archetype',
                  color: profile?.top_archetype ? ARCHETYPE_COLORS[profile.top_archetype] : undefined },
              ].map(({ val, label, color: c }) => (
                <div key={label} className="card" style={{ padding: '16px 12px', textAlign: 'center' }}>
                  <div style={{
                    fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 500,
                    marginBottom: 4, color: c || 'var(--text-primary)',
                    letterSpacing: '-0.01em',
                  }}>
                    {val}
                  </div>
                  <div className="label">{label}</div>
                </div>
              ))}
            </div>

            {/* Nav links */}
            <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
              {[
                { href: '/journal',     label: 'View your journal' },
                { href: '/map',         label: 'Explore the atlas' },
                { href: '/dreamworlds', label: 'Browse dreamworlds' },
                { href: '/twins',       label: 'Find your dream twin' },
                { href: '/wrapped',     label: 'Your dream wrapped' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div className="card" style={{
                    padding: '14px 18px', cursor: 'pointer',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="var(--text-tertiary)" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </div>
                </Link>
              ))}
            </div>

            <div className="animate-fade-up">
              <button onClick={signOut} className="btn-ghost" style={{ width: '100%', color: 'var(--text-tertiary)' }}>
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}