import { NavLink, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logout } from '../store/authSlice.js'
import {
  LayoutDashboard, FolderKanban, Users, BarChart3,
  Settings, LogOut, Zap,
} from 'lucide-react'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Proyectos' },
  { to: '/members', icon: Users, label: 'Miembros' },
  { to: '/scoring', icon: BarChart3, label: 'Scoring' },
  { to: '/settings', icon: Settings, label: 'Configuración' },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(s => s.auth.user)

  function handleLogout() {
    dispatch(logout())
    navigate('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 flex flex-col z-40"
      style={{ background: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <Zap size={16} className="text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight" style={{ color: 'var(--color-text)' }}>
          Collab<span style={{ color: 'var(--color-primary)' }}>Score</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'text-white'
                  : 'hover:bg-white/5'
              }`
            }
            style={({ isActive }) => isActive
              ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }
              : { color: 'var(--color-text-muted)' }
            }>
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1"
          style={{ background: 'var(--color-surface2)' }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {user?.name?.slice(0, 2).toUpperCase() || 'US'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate" style={{ color: 'var(--color-text)' }}>{user?.name || 'Usuario'}</p>
            <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>{user?.role || 'Miembro'}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full transition-all hover:bg-red-500/10"
          style={{ color: 'var(--color-text-muted)' }}>
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
