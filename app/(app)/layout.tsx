export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ flex: 1 }}>
      {children}
    </div>
  )
}
