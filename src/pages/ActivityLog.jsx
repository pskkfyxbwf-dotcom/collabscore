import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import api from '../api/axios.js'
import { MessageSquare, Upload, Edit3, CheckSquare, Plus, ExternalLink, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const TYPES = [
  { value: 'comment', label: 'Comentario', icon: MessageSquare, color: 'text-blue-400 bg-blue-500/10' },
  { value: 'file_upload', label: 'Archivo', icon: Upload, color: 'text-purple-400 bg-purple-500/10' },
  { value: 'edit', label: 'Edición', icon: Edit3, color: 'text-green-400 bg-green-500/10' },
  { value: 'check_in', label: 'Check-in', icon: CheckSquare, color: 'text-orange-400 bg-orange-500/10' },
]

function formatDate(dt) {
  return new Date(dt).toLocaleDateString('es', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function ActivityLog() {
  const { id } = useParams()
  const [activities, setActivities] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ activity_type: 'comment', description: '', hours: 1, evidence_url: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    Promise.all([api.get(`/projects/${id}`), api.get(`/projects/${id}/activities`)])
      .then(([pr, ar]) => { setProject(pr.data); setActivities(ar.data) })
      .catch(() => toast.error('Error cargando actividades'))
      .finally(() => setLoading(false))
  }, [id])

  async function submit(e) {
    e.preventDefault()
    if (!form.description.trim()) return toast.error('La descripción es requerida')
    setSubmitting(true)
    try {
      const { data } = await api.post(`/projects/${id}/activities`, form)
      setActivities(a => [data, ...a])
      setForm({ activity_type: 'comment', description: '', hours: 1, evidence_url: '' })
      setShowForm(false)
      toast.success('Actividad registrada')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al registrar')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar breadcrumbs={[{ label: 'Proyectos', to: '/dashboard' }, { label: project?.name, to: `/projects/${id}` }, { label: 'Actividades' }]} />
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Actividades</h1>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <Plus size={15} /> Registrar actividad
          </button>
        </div>

        {showForm && (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-white text-sm">Nueva actividad</h2>
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Tipo</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TYPES.map(t => {
                    const Icon = t.icon
                    const selected = form.activity_type === t.value
                    return (
                      <button key={t.value} type="button" onClick={() => setForm(f => ({ ...f, activity_type: t.value }))}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${selected ? 'border-purple-500 bg-purple-600/20 text-purple-300' : 'border-slate-600 text-slate-400 hover:border-slate-500'}`}>
                        <Icon size={14} />{t.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Descripción *</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="¿Qué hiciste?" rows={3} required
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Horas dedicadas: <span className="text-purple-400 font-semibold">{form.hours}h</span>
                </label>
                <input type="range" min="0.5" max="12" step="0.5" value={form.hours}
                  onChange={e => setForm(f => ({ ...f, hours: parseFloat(e.target.value) }))}
                  className="w-full accent-purple-500" />
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>0.5h</span><span>12h</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">URL de evidencia</label>
                <input type="url" value={form.evidence_url} onChange={e => setForm(f => ({ ...f, evidence_url: e.target.value }))}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-xl py-2.5 text-sm transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors">
                  {submitting ? 'Registrando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activities.length === 0 ? (
          <div className="text-center py-16">
            <MessageSquare size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay actividades registradas aún</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map(act => {
              const typeInfo = TYPES.find(t => t.value === act.activity_type) || TYPES[0]
              const Icon = typeInfo.icon
              return (
                <div key={act.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${typeInfo.color}`}>
                    <Icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-sm font-medium text-white">{act.user_name}</p>
                      <div className="flex items-center gap-1 text-xs text-slate-500 flex-shrink-0">
                        <Clock size={11} />{formatDate(act.created_at)}
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{act.description}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-slate-500">{act.hours}h dedicadas</span>
                      {act.evidence_url && (
                        <a href={act.evidence_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300">
                          <ExternalLink size={11} /> Ver evidencia
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
