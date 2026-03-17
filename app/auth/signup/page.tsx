'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const ACCENT = '#7dd3fc'
const FONT_DISPLAY = "'Fraunces', Georgia, serif"
const FONT_SERIF = "'Lora', Georgia, serif"

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const supabase = createClient()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/map')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0f0e0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', background: `radial-gradient(ellipse 60% 40% at 50% 60%, ${ACCENT}07, transparent 65%)` }} />

      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 400, animation: 'scaleIn 0.45s cubic-bezier(0.16,1,0.3,1) both' }}>
        <Link href="/" style={{ display: 'inline-block', color: 'rgba(240,236,230,0.28)', fontSize: 12, letterSpacing: '0.1em', textDecoration: 'none', marginBottom: 32, transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.55)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'rgba(240,236,230,0.28)'}
        >← back</Link>

        <div style={{ background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: 22, padding: '36px 30px', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1, background: `linear-gradient(90deg, transparent, ${ACCENT}30, transparent)` }} />

          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, margin: '0 auto 16px', background: `${ACCENT}18`, border: `0.5px solid ${ACCENT}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 22, height: 22, borderRadius: '50%', background: `radial-gradient(circle at 35% 35%, ${ACCENT}, rgba(80,180,240,0.6))`, boxShadow: `0 0 14px ${ACCENT}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#0f0e0d', fontWeight: 700 }}>✦</div>
            </div>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: 30, fontWeight: 700, fontStyle: 'italic', color: '#f0ece6', marginBottom: 6, letterSpacing: '-0.02em' }}>Begin your atlas</h1>
            <p style={{ fontSize: 14, color: 'rgba(240,236,230,0.4)', fontFamily: FONT_SERIF, fontStyle: 'italic' }}>Your dreams are waiting to be mapped.</p>
          </div>

          <div style={{ height: 0.5, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)', marginBottom: 24 }} />

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.25)', marginBottom: 7 }}>Email</label>
              <input className="text-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,236,230,0.25)', marginBottom: 7 }}>Password</label>
              <input className="text-input" type="password" placeholder="at least 8 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
            </div>
            {error && <p style={{ color: '#ff6b8a', fontSize: 13, textAlign: 'center' }}>{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 6 }}>
              {loading ? 'creating…' : 'create account'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 18, fontSize: 13, color: 'rgba(240,236,230,0.28)' }}>
          Already have an account?{' '}
          <Link href="/auth/login" style={{ color: ACCENT, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@1,700&family=Lora:ital@1&display=swap');
        @keyframes scaleIn { from{opacity:0;transform:scale(0.93)} to{opacity:1;transform:scale(1)} }
      `}</style>
    </div>
  )
}