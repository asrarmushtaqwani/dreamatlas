'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/map')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginBottom: 48, color: 'var(--text-tertiary)', fontSize: 13 }}>
          ← back
        </Link>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: 38, fontStyle: 'italic', fontWeight: 300, marginBottom: 8 }}>
          Welcome back
        </div>
        <div style={{ color: 'var(--text-tertiary)', fontSize: 14, marginBottom: 36 }}>
          The atlas has been waiting.
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, letterSpacing: '1px', color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>EMAIL</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)} required
              placeholder="your@email.com"
              style={{
                width: '100%', background: 'var(--surface)', border: '0.5px solid var(--border)',
                borderRadius: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                fontSize: 15, padding: '12px 16px', outline: 'none',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, letterSpacing: '1px', color: 'var(--text-tertiary)', display: 'block', marginBottom: 8 }}>PASSWORD</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)} required
              placeholder="your password"
              style={{
                width: '100%', background: 'var(--surface)', border: '0.5px solid var(--border)',
                borderRadius: 12, color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
                fontSize: 15, padding: '12px 16px', outline: 'none',
              }}
            />
          </div>
          {error && <div style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</div>}
          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 8 }}>
            {loading ? 'entering...' : 'enter the atlas'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-tertiary)' }}>
          New here?{' '}
          <Link href="/auth/signup" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Create account</Link>
        </div>
      </div>
    </div>
  )
}
