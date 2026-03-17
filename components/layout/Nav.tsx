'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/* ── Icons ────────────────────────────────────────────── */
function IconAtlas() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/>
    </svg>
  )
}
function IconBook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/>
    </svg>
  )
}
function IconWorlds() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/>
      <circle cx="12" cy="10" r="2"/>
    </svg>
  )
}
function IconTwins() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="7" r="3"/>
      <circle cx="16" cy="7" r="3"/>
      <path d="M2 21v-1a6 6 0 016-6h1"/>
      <path d="M15 14h1a6 6 0 016 6v1"/>
    </svg>
  )
}
function IconWrapped() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="4"/>
      <path d="M3 9h18M9 21V9"/>
    </svg>
  )
}
function IconPlus() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}
function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="7" r="4"/>
      <path d="M4 21v-1a8 8 0 0116 0v1"/>
    </svg>
  )
}

const NAV_ITEMS = [
  { href: '/map',         Icon: IconAtlas,   label: 'Atlas' },
  { href: '/journal',     Icon: IconBook,    label: 'Journal' },
  { href: '/dreamworlds', Icon: IconWorlds,  label: 'Worlds' },
  { href: '/twins',       Icon: IconTwins,   label: 'Twins' },
  { href: '/wrapped',     Icon: IconWrapped, label: 'Wrapped' },
]

/* ── Logo mark ────────────────────────────────────────── */
function LogoMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke="var(--accent)" strokeWidth="0.8" opacity="0.6"/>
      <circle cx="12" cy="12" r="5" stroke="var(--accent)" strokeWidth="0.5" opacity="0.4"/>
      <path d="M12 3 Q17 7.5 17 12 Q17 16.5 12 21 Q7 16.5 7 12 Q7 7.5 12 3Z"
        fill="var(--accent)" opacity="0.12"/>
      <circle cx="12" cy="12" r="1.8" fill="var(--accent)" opacity="0.8"/>
    </svg>
  )
}

/* ── Sidebar (desktop) ────────────────────────────────── */
export function Sidebar() {
  const path = usePathname()

  return (
    <nav style={{
      width: 60,
      flexShrink: 0,
      borderRight: '0.5px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '18px 0',
      position: 'sticky',
      top: 0,
      height: '100vh',
      gap: 2,
      background: 'var(--nav-bg)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      zIndex: 50,
    }}>
      {/* Logo */}
      <Link href="/map" style={{ textDecoration: 'none', marginBottom: 18 }} title="DreamAtlas">
        <div style={{
          width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 10,
          transition: 'background 0.2s',
        }}>
          <LogoMark />
        </div>
      </Link>

      {/* Thin divider */}
      <div style={{ width: 24, height: 0.5, background: 'var(--border)', marginBottom: 8 }} />

      {/* Nav items */}
      {NAV_ITEMS.map(({ href, Icon, label }) => {
        const active = path.startsWith(href)
        return (
          <Link key={href} href={href} title={label} style={{ textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38,
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: active ? 'var(--accent-light)' : 'var(--text-tertiary)',
              background: active ? 'var(--accent-dim)' : 'transparent',
              border: `0.5px solid ${active ? 'rgba(124,110,245,0.25)' : 'transparent'}`,
              transition: 'all 0.2s',
              cursor: 'pointer',
              position: 'relative',
            }}
              onMouseEnter={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'var(--surface2)'
                  el.style.color = 'var(--text-secondary)'
                  el.style.borderColor = 'var(--border)'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  const el = e.currentTarget as HTMLElement
                  el.style.background = 'transparent'
                  el.style.color = 'var(--text-tertiary)'
                  el.style.borderColor = 'transparent'
                }
              }}
            >
              <Icon />
              {/* Active indicator dot */}
              {active && (
                <div style={{
                  position: 'absolute', right: -1, top: '50%',
                  transform: 'translateY(-50%)',
                  width: 3, height: 16, borderRadius: 2,
                  background: 'var(--accent)',
                  boxShadow: '0 0 8px var(--accent)',
                }} />
              )}
            </div>
          </Link>
        )
      })}

      <div style={{ flex: 1 }} />

      {/* Log dream CTA */}
      <Link href="/log" title="Log a dream" style={{ textDecoration: 'none', marginBottom: 6 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'var(--accent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', cursor: 'pointer',
          transition: 'all 0.2s',
          boxShadow: '0 4px 16px rgba(124,110,245,0.35)',
        }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'scale(1.08)'
            el.style.boxShadow = '0 6px 20px rgba(124,110,245,0.5)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.transform = 'scale(1)'
            el.style.boxShadow = '0 4px 16px rgba(124,110,245,0.35)'
          }}
        >
          <IconPlus />
        </div>
      </Link>

      {/* Profile */}
      <Link href="/profile" title="Profile" style={{ textDecoration: 'none' }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-tertiary)', cursor: 'pointer',
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLElement
            el.style.color = 'var(--text-secondary)'
            el.style.background = 'var(--surface2)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLElement
            el.style.color = 'var(--text-tertiary)'
            el.style.background = 'transparent'
          }}
        >
          <IconUser />
        </div>
      </Link>
    </nav>
  )
}

/* ── Mobile nav ───────────────────────────────────────── */
export function MobileNav() {
  const path = usePathname()

  const items = [
    { href: '/map',         Icon: IconAtlas,  label: 'Atlas' },
    { href: '/dreamworlds', Icon: IconWorlds, label: 'Worlds' },
    { href: '/log',         Icon: IconPlus,   label: null,      accent: true },
    { href: '/twins',       Icon: IconTwins,  label: 'Twins' },
    { href: '/profile',     Icon: IconUser,   label: 'Profile' },
  ]

  return (
    <nav style={{
      display: 'flex',
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--mobile-nav-bg)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderTop: '0.5px solid var(--border)',
      padding: '10px 0',
      paddingBottom: 'max(10px, env(safe-area-inset-bottom))',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 100,
    }}>
      {items.map(({ href, Icon, label, accent }) => {
        const active = path.startsWith(href)

        if (accent) return (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              width: 46, height: 46, borderRadius: 14,
              background: 'var(--accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', marginTop: -10,
              boxShadow: '0 4px 20px rgba(124,110,245,0.45)',
              transition: 'transform 0.2s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
            >
              <Icon />
            </div>
          </Link>
        )

        return (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '4px 14px', cursor: 'pointer',
              color: active ? 'var(--accent-light)' : 'var(--text-tertiary)',
              transition: 'color 0.2s',
            }}>
              <Icon />
              {label && (
                <span style={{
                  fontSize: 10, letterSpacing: '0.04em',
                  fontFamily: 'var(--font-body)',
                  fontWeight: active ? 500 : 400,
                }}>
                  {label}
                </span>
              )}
            </div>
          </Link>
        )
      })}
    </nav>
  )
}