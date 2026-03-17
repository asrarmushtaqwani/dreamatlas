'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/map',     label: 'Atlas',   icon: MapIcon },
  { href: '/log',     label: 'Log',     icon: PlusIcon,   accent: true },
  { href: '/journal', label: 'Journal', icon: BookIcon },
]

function MapIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20"/>
    </svg>
  )
}
function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M12 5v14M5 12h14"/>
    </svg>
  )
}
function BookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="3" width="14" height="18" rx="2"/>
      <line x1="9" y1="8" x2="15" y2="8"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="13" y2="16"/>
    </svg>
  )
}
function WorldsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s-8-4.5-8-11.8A8 8 0 0112 2a8 8 0 018 8.2c0 7.3-8 11.8-8 11.8z"/>
    </svg>
  )
}
function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )
}
function TwinsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3"/>
      <circle cx="16" cy="8" r="3"/>
      <path d="M2 20c0-3 2.7-5 6-5s6 2 6 5"/>
      <path d="M16 15c2.2.7 4 2.5 4 5"/>
    </svg>
  )
}
function WrappedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <path d="M3 9h18"/>
      <path d="M9 21V9"/>
    </svg>
  )
}

export function Sidebar() {
  const path = usePathname()
  return (
    <nav style={{
      width: 64, flexShrink: 0,
      borderRight: '0.5px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', padding: '20px 0',
      position: 'sticky', top: 0, height: '100vh', gap: 4,
    }}>
      {/* Logo */}
      <Link href="/map" style={{ marginBottom: 16, textDecoration: 'none' }}>
        <div style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="#8b6fff" strokeWidth="1"/>
            <path d="M12 3 Q18 8 18 12 Q18 17 12 21 Q6 17 6 12 Q6 8 12 3Z" fill="rgba(139,111,255,0.15)" stroke="#8b6fff" strokeWidth="0.5"/>
            <circle cx="12" cy="12" r="2" fill="#8b6fff" opacity="0.6"/>
          </svg>
        </div>
      </Link>

      {[
        { href: '/map',          Icon: MapIcon,     label: 'Atlas' },
        { href: '/journal',      Icon: BookIcon,    label: 'Journal' },
        { href: '/dreamworlds',  Icon: WorldsIcon,  label: 'Worlds' },
        { href: '/twins',        Icon: TwinsIcon,   label: 'Twins' },
        { href: '/wrapped',      Icon: WrappedIcon, label: 'Wrapped' },
      ].map(({ href, Icon, label }) => {
        const active = path.startsWith(href)
        return (
          <Link key={href} href={href} title={label} style={{ textDecoration: 'none' }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `0.5px solid ${active ? 'rgba(139,111,255,0.3)' : 'transparent'}`,
              background: active ? 'var(--accent-dim)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--text-tertiary)',
              transition: 'all 0.2s', cursor: 'pointer',
            }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'var(--surface2)'; (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)' }}}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent' }}}
            >
              <Icon />
            </div>
          </Link>
        )
      })}

      <div style={{ flex: 1 }} />

      {/* Log dream button */}
      <Link href="/log" title="Log dream" style={{ textDecoration: 'none', marginBottom: 8 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: 'var(--accent)', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          color: 'white', cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.08)'; (e.currentTarget as HTMLElement).style.background = '#9d82ff' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.background = 'var(--accent)' }}
        >
          <PlusIcon />
        </div>
      </Link>

      <Link href="/profile" title="Profile" style={{ textDecoration: 'none' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--text-tertiary)', transition: 'all 0.2s', cursor: 'pointer',
        }}>
          <UserIcon />
        </div>
      </Link>
    </nav>
  )
}

export function MobileNav() {
  const path = usePathname()
  const items = [
  { href: '/map',         Icon: MapIcon,     label: 'Atlas' },
  { href: '/dreamworlds', Icon: WorldsIcon,  label: 'Worlds' },
  { href: '/log',         Icon: PlusIcon,    label: null, accent: true },
  { href: '/twins',       Icon: TwinsIcon,   label: 'Twins' },
  { href: '/profile',     Icon: UserIcon,    label: 'Profile' },
]
  return (
    <nav style={{
      display: 'flex', position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'rgba(8,7,17,0.92)', backdropFilter: 'blur(16px)',
      borderTop: '0.5px solid var(--border)',
      padding: '8px 0 max(8px, env(safe-area-inset-bottom))',
      justifyContent: 'space-around', alignItems: 'center', zIndex: 100,
    }}>
      {items.map(({ href, Icon, label, accent }) => {
        const active = path.startsWith(href)
        if (accent) return (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              width: 48, height: 48, borderRadius: 14,
              background: 'var(--accent)', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: 'white', marginTop: -10,
              boxShadow: '0 4px 20px rgba(139,111,255,0.35)',
            }}>
              <Icon />
            </div>
          </Link>
        )
        return (
          <Link key={href} href={href} style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '4px 12px', cursor: 'pointer',
              color: active ? 'var(--accent)' : 'var(--text-tertiary)',
            }}>
              <Icon />
              <span style={{ fontSize: 10, letterSpacing: '0.5px' }}>{label}</span>
            </div>
          </Link>
        )
      })}
    </nav>
  )
}