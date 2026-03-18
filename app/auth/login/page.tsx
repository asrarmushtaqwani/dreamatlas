'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { motion } from 'framer-motion'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const supabase = createClient()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/map')
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', position: 'relative' }}>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}
      >
        <Link href="/" style={{ 
          display: 'inline-block', color: 'var(--text-tertiary)', fontSize: 13, 
          letterSpacing: '0.05em', textDecoration: 'none', marginBottom: 32, transition: 'color 0.3s',
          fontWeight: 500
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
        >← back to atlas</Link>

        <div className="glass-card" style={{ padding: '40px 32px' }}>
          
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ 
              width: 52, height: 52, borderRadius: 16, margin: '0 auto 20px', 
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center' 
            }}>
              <div style={{ 
                width: 26, height: 26, borderRadius: '50%', 
                background: 'linear-gradient(135deg, #ffffff 0%, #888888 100%)', 
                boxShadow: '0 0 20px rgba(255,255,255,0.3)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                fontSize: 12, color: '#000', fontWeight: 700 
              }}>✦</div>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700, fontStyle: 'italic', marginBottom: 8, letterSpacing: '-0.02em' }}>
              Welcome back
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)' }}>The atlas has been waiting.</p>
          </div>

          <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)', marginBottom: 8 }}>Email</label>
              <input className="text-input" type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoFocus 
                     style={{ padding: '14px 16px' }} />
            </div>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                 <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-tertiary)' }}>Password</label>
              </div>
              <input className="text-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required 
                     style={{ padding: '14px 16px' }} />
            </div>
            {error && <p style={{ color: '#ff6b8a', fontSize: 13, textAlign: 'center', background: 'rgba(255,107,138,0.1)', padding: '10px', borderRadius: 8 }}>{error}</p>}
            
            <button className="btn-premium" type="submit" disabled={loading} style={{ marginTop: 12, padding: '18px', width: '100%' }}>
              {loading ? 'Entering...' : 'Enter the atlas'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-tertiary)' }}>
          New here?{' '}
          <Link href="/auth/signup" style={{ color: '#fff', textDecoration: 'none', fontWeight: 500, borderBottom: '1px solid rgba(255,255,255,0.3)' }}>Create account</Link>
        </p>
      </motion.div>
    </div>
  )
}