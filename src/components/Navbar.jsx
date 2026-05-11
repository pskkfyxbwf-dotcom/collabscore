import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { BarChart3, LogOut, ChevronRight } from 'lucide-react'

const roleLabels = { student: 'Estudiante', professor: 'Profesor', admin: 'Admin' }

export default function Navbar({ breadcrumbs = [] }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <BarChart3 size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-sm hidden sm:block">CollabScore</span>
        </Link>
        {breadcrumbs.map((b, i) => (
          <div key={i} className="flex items-center gap-2">
            <ChevronRight size={14} className="text-slate-500" />
            {b.to ? (
              <Link to={b.to} className="text-sm text-slate-400 hover:text-white transition-colors">{b.label}</Link>
            ) : (
              <span className="text-sm text-white font-medium">{b.label}</span>
            )}
          </div>
        ))}
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white leading-none">{user.full_name}</p>
            <p className="text-xs text-slate-400 mt-0.5">{roleLabels[user.role] || user.role}</p>
          </div>
          <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {user.full_name.slice(0, 2).toUpperCase()}
          </div>
          <button onClick={handleLogout} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <LogOut size={16} />
          </button>
        </div>
      )}
    </nav>
  )
}
