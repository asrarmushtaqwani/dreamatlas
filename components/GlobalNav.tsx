'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export function GlobalNav() {
  const path = usePathname()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  
  if (!mounted) return null
  if (path === '/' || path.startsWith('/auth') || path.startsWith('/insight')) return null

  return (
    <motion.nav 
      initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.8, ease: "easeOut" as any }}
      className="glass-nav hide-scrollbar"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 5vw', overflowX: 'auto', gap: 16
      }}
    >
      <Link href="/map" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', fontStyle: 'italic' }}>
          Dream<span style={{ color: 'var(--accent)' }}>Atlas</span>
        </div>
      </Link>
      
      <div style={{ display: 'flex', gap: 'clamp(16px, 3vw, 32px)', alignItems: 'center' }}>
        {[
          { href: '/map', label: 'Atlas' }, 
          { href: '/journal', label: 'Journal' }, 
          { href: '/dreamworlds', label: 'Worlds' }, 
          { href: '/twins', label: 'Twins' }, 
          { href: '/wrapped', label: 'Wrapped' }
        ].map(item => {
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

      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexShrink: 0 }}>
        <Link href="/log" className="btn-premium" style={{ padding: '8px 20px', fontSize: 13, height: 38 }}>
          + Log Dream
        </Link>
      </div>
    </motion.nav>
  )
}
