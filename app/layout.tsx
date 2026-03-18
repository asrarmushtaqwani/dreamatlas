import type { Metadata } from 'next'
import '../styles/globals.css'
import { Analytics } from '@vercel/analytics/next'

export const metadata: Metadata = {
  title: 'DreamAtlas — a collective cartography of the unconscious',
  description: 'Log your dreams. Discover the patterns humanity shares while it sleeps.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="ambient-deep" />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {children}
        </div>
      </body>
    </html>
  )
}
