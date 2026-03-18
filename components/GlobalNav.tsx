'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

export function GlobalNav() {
  const path = usePathname()
  const [mounted, setMounted] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => setMounted(true), [])
  
  if (!mounted) return null
  if (path === '/' || path.startsWith('/auth') || path.startsWith('/insight')) return null

  const items = [
    { href: '/map', label: 'Atlas' }, 
    { href: '/journal', label: 'Journal' }, 
    { href: '/dreamworlds', label: 'Worlds' }, 
    { href: '/twins', label: 'Twins' }, 
    { href: '/wrapped', label: 'Wrapped' }
  ]

  return (
    <>
      <style>{`
        .desktop-nav { display: flex; }
        .mobile-nav-toggle { display: none !important; }
        @media (max-width: 800px) {
          .desktop-nav { display: none !important; }
          .mobile-nav-toggle { display: flex !important; }
        }
      `}</style>
      <motion.nav 
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: "easeOut" as any }}
        className="glass-nav hide-scrollbar"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 5vw', overflowX: 'hidden', gap: 16
        }}
      >
        <Link href="/map" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', }}>
            Dream<span style={{ color: 'var(--accent)' }}>Atlas</span>
          </div>
        </Link>
        
        <div className="desktop-nav" style={{ gap: 'clamp(16px, 3vw, 32px)', alignItems: 'center' }}>
          {items.map(item => {
            const active = path.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none', flexShrink: 0 }}>
                <span style={{ fontSize: 14, fontWeight: active ? 600 : 500, color: active ? '#fff' : 'var(--text-secondary)', transition: 'color 0.3s' }}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
          <Link href="/log" className="btn-premium" style={{ padding: '8px 20px', fontSize: 13, height: 38 }}>
            +<span className="desktop-nav" style={{ marginLeft: 4 }}>Log Dream</span>
          </Link>
          
          <button 
            className="mobile-nav-toggle btn-glass" 
            onClick={() => setMenuOpen(true)}
            style={{ width: 38, height: 38, padding: 0, alignItems: 'center', justifyContent: 'center' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="18" x2="20" y2="18"/></svg>
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }} 
            animate={{ opacity: 1, backdropFilter: 'blur(30px)' }} 
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="glass-nav"
            style={{
              position: 'fixed', inset: 0, zIndex: 2000,
              background: 'rgba(3,3,5,0.85)',
              display: 'flex', flexDirection: 'column', padding: '16px 5vw'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 60, height: 40 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', }}>
                Dream<span style={{ color: 'var(--accent)' }}>Atlas</span>
              </div>
              <button 
                className="btn-glass" 
                onClick={() => setMenuOpen(false)}
                style={{ width: 38, height: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32, alignItems: 'center' }}>
              {items.map(item => {
                const active = path.startsWith(item.href)
                return (
                  <Link 
                    key={item.href} href={item.href} 
                    onClick={() => setMenuOpen(false)}
                    style={{ textDecoration: 'none' }}
                  >
                    <span style={{ 
                      fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700,
                      color: active ? '#fff' : 'var(--text-secondary)'
                    }}>
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
