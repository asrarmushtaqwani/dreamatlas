'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/map')
  }

  return (
    <AuthShell
      heading="Begin your atlas"
      subheading="Your dreams are waiting to be mapped."
      footer={<>Already have an account? <Link href="/auth/login" style={{ color: 'var(--accent-light)', textDecoration: 'none' }}>Sign in</Link></>}
    >
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Email">
          <input className="text-input" type="email" placeholder="your@email.com"
            value={email} onChange={e => setEmail(e.target.value)} required autoFocus />
        </Field>
        <Field label="Password">
          <input className="text-input" type="password" placeholder="at least 8 characters"
            value={password} onChange={e => setPassword(e.target.value)} required minLength={8} />
        </Field>
        {error && <p style={{ color: 'var(--danger)', fontSize: 13, textAlign: 'center' }}>{error}</p>}
        <button className="btn-primary" type="submit" disabled={loading} style={{ marginTop: 6 }}>
          {loading ? 'creating…' : 'create account'}
        </button>
      </form>
    </AuthShell>
  )
}

function AuthShell({ heading, subheading, children, footer }: {
  heading: string
  subheading: string
  children: React.ReactNode
  footer: React.ReactNode
}) {
  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', position: 'relative',
    }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse 50% 40% at 50% 45%, var(--accent-glow), transparent 70%)',
      }} />
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}
        className="animate-scale-in"
      >
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--text-tertiary)', fontSize: 12, letterSpacing: '0.08em',
          textDecoration: 'none', marginBottom: 36, transition: 'color 0.2s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--text-tertiary)'}
        >
          ← back
        </Link>
        <div style={{
          background: 'var(--surface)', border: '0.5px solid var(--border)',
          borderRadius: 20, padding: '36px 32px',
          boxShadow: 'var(--shadow-lg)', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '15%', right: '15%', height: 0.5,
            background: 'linear-gradient(90deg, transparent, var(--card-top-edge), transparent)',
          }} />
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, margin: '0 auto 16px',
              background: 'var(--accent-dim)', border: '0.5px solid rgba(124,110,245,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="var(--accent)" strokeWidth="0.8" opacity="0.7"/>
                <path d="M12 3 Q17 7.5 17 12 Q17 16.5 12 21 Q7 16.5 7 12 Q7 7.5 12 3Z" fill="var(--accent)" opacity="0.3"/>
                <circle cx="12" cy="12" r="2" fill="var(--accent)" opacity="0.9"/>
              </svg>
            </div>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 500,
              fontStyle: 'italic', color: 'var(--text-primary)',
              marginBottom: 6, letterSpacing: '-0.01em',
            }}>
              {heading}
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
              {subheading}
            </p>
          </div>
          <hr className="divider-fade" style={{ marginBottom: 24 }} />
          {children}
        </div>
        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-tertiary)' }}>
          {footer}
        </p>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="label" style={{ display: 'block', marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  )
}