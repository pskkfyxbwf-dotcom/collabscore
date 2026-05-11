import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Navbar from '../components/Navbar.jsx'
import api from '../api/axios.js'
import { KanbanSquare, Activity, Star, BarChart3, Users, UserPlus, X } from 'lucide-react'
import toast from 'react-hot-toast'

const roleLabels = { student: 'Estudiante', professor: 'Profesor', admin: 'Admin' }

export default function ProjectDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [showInvite, setShowInvite] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/members`),
    ]).then(([pr, mr]) => {
      setProject(pr.data)
      setMembers(mr.data)
    }).catch(() => toast.error('Error cargando proyecto')).finally(() => setLoading(false))
  }, [id])

  async function addMember(e) {
    e.preventDefault()
    try {
      await api.post(`/projects/${id}/members?email=${encodeURIComponent(inviteEmail)}`)
      const { data } = await api.get(`/projects/${id}/members`)
      setMembers(data)
      setInviteEmail('')
      setShowInvite(false)
      toast.success('Miembro agregado')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al agregar')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const tabs = [
    { label: 'Tareas', icon: KanbanSquare, to: `/projects/${id}/tasks` },
    { label: 'Actividades', icon: Activity, to: `/projects/${id}/activities` },
    { label: 'Evaluaciones', icon: Star, to: `/projects/${id}/evaluate` },
    { label: 'Scores', icon: BarChart3, to: `/projects/${id}/scores` },
  ]

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar breadcrumbs={[{ label: 'Proyectos', to: '/dashboard' }, { label: project?.name }]} />
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

        {/* Project header */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <h1 className="text-xl font-bold text-white mb-1">{project?.name}</h1>
          {project?.description && <p className="text-slate-400 text-sm mb-3">{project.description}</p>}
          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
            {project?.deadline && <span>📅 Fecha límite: {project.deadline}</span>}
            <span>👤 Creado por: {project?.owner_name}</span>
          </div>
        </div>

        {/* Navigation tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {tabs.map(({ label, icon: Icon, to }) => (
            <Link key={label} to={to}
              className="bg-slate-800 border border-slate-700 hover:border-purple-500/50 rounded-2xl p-4 flex flex-col items-center gap-2 text-slate-400 hover:text-purple-400 transition-all group">
              <div className="w-10 h-10 bg-slate-700 group-hover:bg-purple-600/20 rounded-xl flex items-center justify-center transition-colors">
                <Icon size={20} />
              </div>
              <span className="text-sm font-medium">{label}</span>
            </Link>
          ))}
        </div>

        {/* Members */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-purple-400" />
              <h2 className="font-semibold text-white">Miembros</h2>
              <span className="text-xs text-slate-500 bg-slate-700 px-2 py-0.5 rounded-full">{members.length}</span>
            </div>
            <button onClick={() => setShowInvite(!showInvite)}
              className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-medium">
              <UserPlus size={14} /> Agregar
            </button>
          </div>

          {showInvite && (
            <form onSubmit={addMember} className="flex gap-2 mb-4">
              <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} type="email" required
                placeholder="correo@del.usuario.com"
                className="flex-1 bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-purple-500 transition-colors" />
              <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-3 py-2 rounded-xl transition-colors">
                Agregar
              </button>
              <button type="button" onClick={() => setShowInvite(false)} className="text-slate-400 hover:text-white p-2">
                <X size={16} />
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {members.map(m => (
              <div key={m.id} className="flex items-center gap-3 bg-slate-700/50 rounded-xl p-3">
                <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {m.full_name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{m.full_name}</p>
                  <p className="text-xs text-slate-400">{roleLabels[m.role] || m.role}</p>
                </div>
                {m.user_id === project?.owner_id && (
                  <span className="ml-auto text-xs text-purple-400 bg-purple-600/10 px-2 py-0.5 rounded-full flex-shrink-0">Líder</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
