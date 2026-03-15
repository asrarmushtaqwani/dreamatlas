import { Sidebar, MobileNav } from '@/components/layout/Nav'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Desktop sidebar */}
      <div style={{ display: 'none' }} className="desktop-sidebar">
        <Sidebar />
      </div>

      {/* Main */}
      <main style={{ flex: 1, overflow: 'hidden' }}>
        {children}
      </main>

      {/* Mobile bottom nav */}
      <div className="mobile-nav-wrapper">
        <MobileNav />
      </div>

      <style>{`
        @media (min-width: 769px) {
          .desktop-sidebar { display: flex !important; }
          .mobile-nav-wrapper { display: none; }
        }
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-nav-wrapper { display: block; }
        }
      `}</style>
    </div>
  )
}
