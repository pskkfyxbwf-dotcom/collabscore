import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import Navbar from '../components/Navbar.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import api from '../api/axios.js'
import { Plus, FolderOpen, Search, X, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', deadline: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data)).catch(() => toast.error('Error cargando proyectos')).finally(() => setLoading(false))
  }, [])

  async function createProject(e) {
    e.preventDefault()
    setCreating(true)
    try {
      const { data } = await api.post('/projects', form)
      setProjects(p => [data, ...p])
      setShowModal(false)
      setForm({ name: '', description: '', deadline: '' })
      toast.success('Proyecto creado')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al crear')
    } finally {
      setCreating(false)
    }
  }

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Hola, {user?.full_name?.split(' ')[0]} 👋</h1>
            <p className="text-slate-400 text-sm mt-1">Gestiona tus proyectos colaborativos</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
            <Plus size={16} /> Nuevo proyecto
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar proyectos..."
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors" />
        </div>

        {/* Projects */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <FolderOpen size={48} className="text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">
              {search ? 'No se encontraron proyectos' : 'Aún no tienes proyectos'}
            </p>
            {!search && (
              <button onClick={() => setShowModal(true)} className="text-purple-400 hover:text-purple-300 text-sm font-medium">
                Crea tu primer proyecto →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(p => <ProjectCard key={p.id} project={p} />)}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Nuevo proyecto</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required
                  placeholder="Nombre del proyecto"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Descripción</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="¿De qué trata el proyecto?" rows={3}
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Fecha límite</label>
                <div className="relative">
                  <Calendar size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors" />
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl py-2.5 text-sm transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={creating}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors">
                  {creating ? 'Creando...' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
