'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ARCHETYPE_COLORS } from '@/lib/dreams'

const ACCENT = '#7dd3fc'
const FONT_DISPLAY = "'Fraunces', Georgia, serif"

function EmailField({ email }: { email: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, color: 'rgba(240,236,230,0.38)' }}>{visible ? email : '••••••••••••'}</span>
      <button onClick={() => setVisible(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(240,236,230,0.25)', padding: 0, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.5)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.25)'}
      >
        {visible
          ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        }
      </button>
    </div>
  )
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile]     = useState<any>(null)
  const [email, setEmail]         = useState('')
  const [loading, setLoading]     = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/auth/login'); return }
      setEmail(user.email || '')
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (data) { setProfile(data); setNameInput(data.dream_name || ''); setAvatarUrl(data.avatar_url || null) }
      setLoading(false)
    }
    load()
  }, [])

  async function saveName() {
    if (!nameInput.trim()) return
    setNameSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ dream_name: nameInput.trim() }).eq('id', user.id)
    setProfile((p: any) => ({ ...p, dream_name: nameInput.trim() }))
    setEditingName(false); setNameSaving(false)
  }

  async function uploadAvatar(file: File) {
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB'); return }
    setAvatarUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (error) { setAvatarUploading(false); return }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    await supabase.from('profiles').update({ avatar_url: data.publicUrl }).eq('id', user.id)
    setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`)
    setAvatarUploading(false)
  }

  async function signOut() { await supabase.auth.signOut(); router.push('/') }

  const topColor = profile?.top_archetype ? ARCHETYPE_COLORS[profile.top_archetype] : ACCENT

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80, background: '#0f0e0d' }}>
      <div style={{ padding: '24px 24px 20px', borderBottom: '0.5px solid rgba(255,255,255,0.07)', background: 'rgba(15,14,13,0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)' }}>
        <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, color: '#f0ece6', letterSpacing: '-0.02em' }}>Profile</h1>
      </div>

      <div style={{ padding: '24px', maxWidth: 520 }}>
        {loading ? (
          <div style={{ color: 'rgba(240,236,230,0.25)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>loading…</div>
        ) : (
          <>
            {/* Identity card */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: '28px 24px', marginBottom: 14, textAlign: 'center', position: 'relative', overflow: 'hidden', animation: 'fadeUp 0.5s both' }}>
              <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: `linear-gradient(90deg, transparent, ${topColor}30, transparent)` }} />

              {/* Avatar */}
              <div style={{ position: 'relative', width: 72, height: 72, margin: '0 auto 16px' }}>
                <div onClick={() => fileInputRef.current?.click()} title="Change photo" style={{ width: 72, height: 72, borderRadius: '50%', cursor: 'pointer', background: avatarUrl ? 'transparent' : `${topColor}14`, border: `0.5px solid ${topColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', boxShadow: `0 0 20px ${topColor}15` }}
                  onMouseEnter={e => { const ov = (e.currentTarget as HTMLElement).querySelector('.av-ov') as HTMLElement; if (ov) ov.style.opacity = '1' }}
                  onMouseLeave={e => { const ov = (e.currentTarget as HTMLElement).querySelector('.av-ov') as HTMLElement; if (ov) ov.style.opacity = '0' }}
                >
                  {avatarUploading ? <div style={{ fontSize: 11, color: 'rgba(240,236,230,0.3)' }}>…</div>
                    : avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: 24, color: topColor }}>✦</span>}
                  <div className="av-ov" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]) }} />
              </div>

              {/* Name */}
              {editingName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 8 }}>
                  <input value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }} autoFocus maxLength={40}
                    style={{ background: 'rgba(255,255,255,0.06)', border: `0.5px solid ${ACCENT}40`, borderRadius: 8, color: '#f0ece6', padding: '7px 14px', fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 20, outline: 'none', textAlign: 'center', width: 220 }} />
                  <button onClick={saveName} disabled={nameSaving} style={{ background: ACCENT, border: 'none', borderRadius: 8, color: '#0f0e0d', padding: '7px 14px', cursor: 'pointer', fontSize: 13, fontWeight: 600, opacity: nameSaving ? 0.5 : 1 }}>{nameSaving ? '…' : 'Save'}</button>
                  <button onClick={() => setEditingName(false)} style={{ background: 'none', border: 'none', color: 'rgba(240,236,230,0.3)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
                </div>
              ) : (
                <div onClick={() => setEditingName(true)} title="Click to edit" style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: 22, marginBottom: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, color: '#f0ece6', letterSpacing: '-0.01em', transition: 'opacity 0.2s' }}
                  onMouseEnter={e => { const ic = (e.currentTarget as HTMLElement).querySelector('.edit-ic') as HTMLElement; if (ic) ic.style.opacity = '1' }}
                  onMouseLeave={e => { const ic = (e.currentTarget as HTMLElement).querySelector('.edit-ic') as HTMLElement; if (ic) ic.style.opacity = '0' }}
                >
                  {profile?.dream_name || 'the wandering dreamer'}
                  <svg className="edit-ic" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(240,236,230,0.3)" strokeWidth="1.5" strokeLinecap="round" style={{ opacity: 0, transition: 'opacity 0.2s', flexShrink: 0 }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
              )}
              <EmailField email={email} />
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14, animation: 'fadeUp 0.5s 0.08s both' }}>
              {[
                { val: String(profile?.dream_count || 0), label: 'Dreams', color: undefined },
                { val: String(profile?.streak || 0),      label: 'Day streak', color: undefined },
                { val: profile?.top_archetype || '—',     label: 'Top archetype', color: profile?.top_archetype ? ARCHETYPE_COLORS[profile.top_archetype] : undefined },
              ].map(({ val, label, color: c }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '16px 10px', textAlign: 'center' }}>
                  <div style={{ fontFamily: FONT_DISPLAY, fontSize: 22, fontWeight: 700, marginBottom: 4, color: c || '#f0ece6', letterSpacing: '-0.01em' }}>{val}</div>
                  <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.22)' }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20, animation: 'fadeUp 0.5s 0.16s both' }}>
              {[
                { href: '/journal',     label: 'View your journal' },
                { href: '/map',         label: 'Explore the atlas' },
                { href: '/dreamworlds', label: 'Browse dreamworlds' },
                { href: '/twins',       label: 'Find your dream twin' },
                { href: '/wrapped',     label: 'Your dream wrapped' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                  <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '14px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.07)'; el.style.borderColor = 'rgba(255,255,255,0.11)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'rgba(255,255,255,0.04)'; el.style.borderColor = 'rgba(255,255,255,0.07)' }}
                  >
                    <span style={{ fontSize: 14, color: 'rgba(240,236,230,0.5)' }}>{label}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(240,236,230,0.25)" strokeWidth="1.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </Link>
              ))}
            </div>

            <div style={{ animation: 'fadeUp 0.5s 0.24s both' }}>
              <button onClick={signOut} className="btn-ghost" style={{ width: '100%', color: 'rgba(240,236,230,0.3)' }}>Sign out</button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  )
}