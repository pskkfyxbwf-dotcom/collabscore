import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Navbar from '../components/Navbar.jsx'
import api from '../api/axios.js'
import { Star, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const DIMENSIONS = [
  { key: 'quality', label: 'Calidad del trabajo', desc: '¿Qué tan buena es la calidad de su trabajo?' },
  { key: 'commitment', label: 'Compromiso', desc: '¿Qué tan comprometido está con el proyecto?' },
  { key: 'collaboration', label: 'Colaboración', desc: '¿Qué tan bien colabora con el equipo?' },
]

function StarRating({ value, onChange }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button key={n} type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110">
          <Star size={22}
            className={`${(hover || value) >= n ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'} transition-colors`} />
        </button>
      ))}
      <span className="ml-2 text-sm text-slate-400 self-center">{value > 0 ? `${value}/5` : ''}</span>
    </div>
  )
}

export default function PeerEvaluation() {
  const { id } = useParams()
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [project, setProject] = useState(null)
  const [existingEvals, setExistingEvals] = useState([])
  const [loading, setLoading] = useState(true)
  const [evals, setEvals] = useState({})
  const [submitting, setSubmitting] = useState(null)
  const [submitted, setSubmitted] = useState({})

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/members`),
      api.get(`/projects/${id}/evaluations`),
    ]).then(([pr, mr, er]) => {
      setProject(pr.data)
      const others = mr.data.filter(m => m.user_id !== user.id)
      setMembers(others)
      setExistingEvals(er.data)
      const done = {}
      er.data.forEach(e => { if (e.evaluator_id === user.id) done[e.evaluatee_id] = true })
      setSubmitted(done)
      const initial = {}
      others.forEach(m => {
        const existing = er.data.find(e => e.evaluator_id === user.id && e.evaluatee_id === m.user_id)
        initial[m.user_id] = {
          quality: existing?.quality || 0,
          commitment: existing?.commitment || 0,
          collaboration: existing?.collaboration || 0,
          comment: existing?.comment || '',
        }
      })
      setEvals(initial)
    }).catch(() => toast.error('Error cargando evaluaciones')).finally(() => setLoading(false))
  }, [id, user.id])

  async function submitEval(memberId) {
    const ev = evals[memberId]
    if (!ev.quality || !ev.commitment || !ev.collaboration) return toast.error('Completa las 3 dimensiones')
    setSubmitting(memberId)
    try {
      await api.post(`/projects/${id}/evaluations`, { evaluatee_id: memberId, ...ev })
      setSubmitted(s => ({ ...s, [memberId]: true }))
      toast.success('Evaluación enviada')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al enviar')
    } finally {
      setSubmitting(null)
    }
  }

  function setScore(memberId, dim, val) {
    setEvals(e => ({ ...e, [memberId]: { ...e[memberId], [dim]: val } }))
    setSubmitted(s => ({ ...s, [memberId]: false }))
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar breadcrumbs={[{ label: 'Proyectos', to: '/dashboard' }, { label: project?.name, to: `/projects/${id}` }, { label: 'Evaluaciones' }]} />
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Evaluación entre pares</h1>
          <p className="text-slate-400 text-sm mt-1">Evalúa a tus compañeros en 3 dimensiones (1-5 estrellas)</p>
        </div>

        {members.length === 0 ? (
          <div className="text-center py-16 bg-slate-800 border border-slate-700 rounded-2xl">
            <Star size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay otros miembros en este proyecto para evaluar</p>
          </div>
        ) : (
          <div className="space-y-4">
            {members.map(member => {
              const ev = evals[member.user_id] || {}
              const isDone = submitted[member.user_id]
              return (
                <div key={member.user_id}
                  className={`bg-slate-800 border rounded-2xl p-5 transition-all ${isDone ? 'border-green-500/30' : 'border-slate-700'}`}>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-sm font-bold text-white">
                      {member.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{member.full_name}</p>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                    {isDone && (
                      <div className="ml-auto flex items-center gap-1.5 text-green-400 text-xs font-medium">
                        <CheckCircle size={14} /> Enviado
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {DIMENSIONS.map(dim => (
                      <div key={dim.key}>
                        <div className="flex items-center justify-between mb-1.5">
                          <p className="text-sm font-medium text-slate-300">{dim.label}</p>
                          <p className="text-xs text-slate-500">{dim.desc}</p>
                        </div>
                        <StarRating value={ev[dim.key] || 0} onChange={v => setScore(member.user_id, dim.key, v)} />
                      </div>
                    ))}
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1.5">Comentario (opcional)</label>
                      <textarea value={ev.comment || ''} onChange={e => setScore(member.user_id, 'comment', e.target.value)}
                        placeholder="¿Algo más que quieras agregar?" rows={2}
                        className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors resize-none" />
                    </div>
                  </div>

                  <button onClick={() => submitEval(member.user_id)}
                    disabled={submitting === member.user_id}
                    className={`mt-4 w-full font-semibold rounded-xl py-2.5 text-sm transition-colors ${isDone ? 'bg-slate-700 hover:bg-slate-600 text-slate-300' : 'bg-purple-600 hover:bg-purple-700 text-white'} disabled:opacity-50`}>
                    {submitting === member.user_id ? 'Enviando...' : isDone ? 'Actualizar evaluación' : 'Enviar evaluación'}
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
