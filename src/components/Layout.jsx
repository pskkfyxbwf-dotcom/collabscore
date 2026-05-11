import Sidebar from './Sidebar.jsx'

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--color-bg)' }}>
      <Sidebar />
      <main className="flex-1 ml-60 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
