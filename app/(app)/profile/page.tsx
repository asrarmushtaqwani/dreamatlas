'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ARCHETYPE_COLORS } from '@/lib/dreams'
import { motion } from 'framer-motion'

function EmailField({ email }: { email: string }) {
  const [visible, setVisible] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{visible ? email : '••••••••••••'}</span>
      <button onClick={() => setVisible(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 0, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
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
      // FIX: use getSession() instead of getUser() during immediate client loads to prevent faulty redirects
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { router.push('/auth/login'); return }
      
      const user = session.user
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
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    await supabase.from('profiles').update({ dream_name: nameInput.trim() }).eq('id', session.user.id)
    setProfile((p: any) => ({ ...p, dream_name: nameInput.trim() }))
    setEditingName(false); setNameSaving(false)
  }

  async function uploadAvatar(file: File) {
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB'); return }
    setAvatarUploading(true)
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    const user = session.user
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

  const topColor = profile?.top_archetype ? ARCHETYPE_COLORS[profile.top_archetype] : 'var(--accent)'
  const isHex = typeof topColor === 'string' && topColor.startsWith('#')

  return (
    <div style={{ position: 'relative', width: '100%', overflowX: 'hidden' }}>

      {/* ── HERO SECTION ──────────────────────────────────────────────────────── */}
      <section style={{ 
        position: 'relative', minHeight: '60vh', width: '100%', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        paddingTop: 80 
      }}>
        <motion.div 
          initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" as any }}
          style={{ position: 'relative', zIndex: 10, textAlign: 'center', maxWidth: 1000, padding: '0 24px' }}
        >
          <div style={{
            display: 'inline-flex', padding: '8px 20px', borderRadius: 999,
            background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)',
            marginBottom: 32, alignItems: 'center', gap: 10
          }}>
            <span style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', boxShadow: '0 0 10px var(--accent)' }} />
            <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.04em' }}>Account Settings</span>
          </div>

          <h1 style={{ 
            fontFamily: 'var(--font-display)', fontWeight: 600,
            fontSize: 'clamp(48px, 8vw, 96px)', lineHeight: 0.95, letterSpacing: '-0.03em',
            marginBottom: 24, color: '#fff'
          }}>
            Identity.
          </h1>

          <p style={{
            fontSize: 'clamp(16px, 2vw, 20px)', color: 'var(--text-secondary)',
            maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.6, fontWeight: 400
          }}>
            Manage your psychological signature, avatar, and core platform data.
          </p>
        </motion.div>
      </section>

      {/* ── CONTENT GRID ─────────────────────────────────────────────────────── */}
      <section style={{ 
        position: 'relative', zIndex: 10, padding: '0 5vw 120px', minHeight: '50vh',
        background: 'linear-gradient(180deg, transparent, rgba(5,5,8,0.8) 20%)',
        display: 'flex', justifyContent: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          {loading ? (
            <div style={{ color: 'var(--text-tertiary)', fontSize: 13, textAlign: 'center', padding: '40px 0', letterSpacing: '0.1em', textTransform: 'uppercase' }}>loading profile…</div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              
              {/* Identity Card */}
              <div className="glass-card" style={{ padding: '40px 32px', marginBottom: 24, textAlign: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 2, background: `linear-gradient(90deg, transparent, ${isHex ? topColor + '60' : 'rgba(0,153,255,0.6)'}, transparent)` }} />

                {/* Avatar */}
                <div style={{ position: 'relative', width: 88, height: 88, margin: '0 auto 24px' }}>
                  <div onClick={() => fileInputRef.current?.click()} title="Change photo" style={{ width: 88, height: 88, borderRadius: '50%', cursor: 'pointer', background: avatarUrl ? 'transparent' : (isHex ? `${topColor}14` : 'rgba(255,255,255,0.05)'), border: `1px solid ${isHex ? topColor + '30' : 'rgba(255,255,255,0.1)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative', boxShadow: `0 0 30px ${isHex ? topColor + '15' : 'rgba(255,255,255,0.05)'}` }}
                    onMouseEnter={e => { const ov = (e.currentTarget as HTMLElement).querySelector('.av-ov') as HTMLElement; if (ov) ov.style.opacity = '1' }}
                    onMouseLeave={e => { const ov = (e.currentTarget as HTMLElement).querySelector('.av-ov') as HTMLElement; if (ov) ov.style.opacity = '0' }}
                  >
                    {avatarUploading ? <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>…</div>
                      : avatarUrl ? <img src={avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 28, color: topColor }}>✦</span>}
                    <div className="av-ov" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    </div>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]) }} />
                </div>

                {/* Name Edit */}
                {editingName ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
                    <input value={nameInput} onChange={e => setNameInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditingName(false) }} autoFocus maxLength={40}
                      style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid var(--border-glow)`, borderRadius: 12, color: '#fff', padding: '10px 16px', fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 18, outline: 'none', textAlign: 'center', width: 220 }} />
                    <button onClick={saveName} disabled={nameSaving} className="btn-premium" style={{ height: 44, padding: '0 20px', borderRadius: 12, fontSize: 13, opacity: nameSaving ? 0.5 : 1 }}>{nameSaving ? '…' : 'Save'}</button>
                    <button onClick={() => setEditingName(false)} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 24, padding: '0 8px' }}>×</button>
                  </div>
                ) : (
                  <div onClick={() => setEditingName(true)} title="Click to edit" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, marginBottom: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10, color: '#fff', letterSpacing: '-0.01em', transition: 'opacity 0.2s' }}
                    onMouseEnter={e => { const ic = (e.currentTarget as HTMLElement).querySelector('.edit-ic') as HTMLElement; if (ic) ic.style.opacity = '1' }}
                    onMouseLeave={e => { const ic = (e.currentTarget as HTMLElement).querySelector('.edit-ic') as HTMLElement; if (ic) ic.style.opacity = '0' }}
                  >
                    {profile?.dream_name || 'Anonymous Dreamer'}
                    <svg className="edit-ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round" style={{ opacity: 0, transition: 'opacity 0.2s', flexShrink: 0 }}><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  </div>
                )}
                
                <EmailField email={email} />
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                {[
                  { val: String(profile?.dream_count || 0), label: 'Dreams', color: undefined },
                  { val: String(profile?.streak || 0),      label: 'Streak', color: undefined },
                  { val: profile?.top_archetype || '—',     label: 'Top Archetype', color: profile?.top_archetype ? ARCHETYPE_COLORS[profile.top_archetype] : undefined },
                ].map(({ val, label, color: c }) => (
                  <div key={label} className="glass-card" style={{ padding: '24px 12px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, marginBottom: 8, color: c || '#fff', letterSpacing: '-0.01em' }}>{val}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Quick Links */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
                {[
                  { href: '/journal',     label: 'View your journal' },
                  { href: '/map',         label: 'Explore the atlas' },
                  { href: '/dreamworlds', label: 'Browse dreamworlds' },
                  { href: '/twins',       label: 'Find your dream twin' },
                  { href: '/wrapped',     label: 'Your dream wrapped' },
                ].map(({ href, label }) => (
                  <Link key={href} href={href} style={{ textDecoration: 'none' }}>
                    <div className="glass-card" style={{ padding: '18px 24px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.2s' }}>
                      <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </div>
                  </Link>
                ))}
              </div>

              <div style={{ textAlign: 'center' }}>
                <button onClick={signOut} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', fontSize: 14, fontWeight: 500, textDecoration: 'underline', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ff6b8a'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                >Sign out of DreamAtlas</button>
              </div>

            </motion.div>
          )}
        </div>
      </section>
    </div>
  )
}