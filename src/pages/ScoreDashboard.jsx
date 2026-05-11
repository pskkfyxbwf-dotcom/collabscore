import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import api from '../api/axios.js'
import {
  Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts'
import { Trophy, Target, Activity, Star, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'

const COLORS = ['#7c3aed', '#a78bfa', '#c4b5fd', '#6d28d9', '#ddd6fe']

function getMedal(i) {
  if (i === 0) return '🥇'
  if (i === 1) return '🥈'
  if (i === 2) return '🥉'
  return `${i + 1}`
}

function scoreColor(s) {
  if (s >= 70) return '#10b981'
  if (s >= 40) return '#f59e0b'
  return '#ef4444'
}

function ScoreCard({ icon: Icon, label, value, sub, color = '#7c3aed' }) {
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400">{label}</span>
        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon size={15} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

function DonutChart({ data }) {
  const cx = 130, cy = 110, r = 85, ri = 52
  const total = data.reduce((s, d) => s + d.value, 0)
  let angle = -Math.PI / 2
  const gap = 0.04
  const slices = data.map((d, i) => {
    const sweep = (d.value / total) * (Math.PI * 2) - gap
    const x1 = cx + r * Math.cos(angle + gap / 2)
    const y1 = cy + r * Math.sin(angle + gap / 2)
    const x2 = cx + r * Math.cos(angle + gap / 2 + sweep)
    const y2 = cy + r * Math.sin(angle + gap / 2 + sweep)
    const xi1 = cx + ri * Math.cos(angle + gap / 2 + sweep)
    const yi1 = cy + ri * Math.sin(angle + gap / 2 + sweep)
    const xi2 = cx + ri * Math.cos(angle + gap / 2)
    const yi2 = cy + ri * Math.sin(angle + gap / 2)
    const large = sweep > Math.PI ? 1 : 0
    const mid = angle + gap / 2 + sweep / 2
    const lx = cx + (r + 14) * Math.cos(mid)
    const ly = cy + (r + 14) * Math.sin(mid)
    const pct = Math.round((d.value / total) * 100)
    const path = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${xi1} ${yi1} A ${ri} ${ri} 0 ${large} 0 ${xi2} ${yi2} Z`
    angle += sweep + gap
    return { path, color: COLORS[i % COLORS.length], pct, lx, ly }
  })
  return (
    <svg width={260} height={220} className="mx-auto block">
      {slices.map((s, i) => (
        <g key={i}>
          <path d={s.path} fill={s.color} />
          {s.pct >= 8 && (
            <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="central"
              fontSize={11} fontWeight={600} fill="white">{s.pct}%</text>
          )}
        </g>
      ))}
    </svg>
  )
}

export default function ScoreDashboard() {
  const { id } = useParams()
  const [scores, setScores] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get(`/projects/${id}`), api.get(`/projects/${id}/scores`)])
      .then(([pr, sr]) => { setProject(pr.data); setScores(sr.data) })
      .catch(() => toast.error('Error cargando scores'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const totalScore = scores.reduce((a, s) => a + s.total_score, 0)
  const avgScore = scores.length ? Math.round(totalScore / scores.length) : 0
  const topMember = scores[0]
  const totalHours = scores.reduce((a, s) => a + s.activity_score / 2, 0)

  const pieData = scores.map(s => ({
    name: s.full_name.split(' ')[0],
    value: Math.max(parseFloat(s.total_score.toFixed(1)), 0.1),
  }))

  const barData = scores.map(s => ({
    name: s.full_name.split(' ')[0],
    Tareas: parseFloat(s.task_score.toFixed(1)),
    Actividades: parseFloat(s.activity_score.toFixed(1)),
    'Eval. Pares': parseFloat(s.peer_score.toFixed(1)),
  }))

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar breadcrumbs={[
        { label: 'Proyectos', to: '/dashboard' },
        { label: project?.name, to: `/projects/${id}` },
        { label: 'Scores' },
      ]} />

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Score de colaboración</h1>
          <p className="text-slate-400 text-sm mt-1">Métricas calculadas en tiempo real</p>
        </div>

        {scores.length === 0 ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-16 text-center">
            <TrendingUp size={40} className="text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No hay datos aún. Completa tareas y registra actividades.</p>
          </div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <ScoreCard icon={Trophy} label="Score promedio" value={avgScore} sub="pts de 100" color="#7c3aed" />
              <ScoreCard icon={Target} label="Top colaborador" value={topMember?.full_name.split(' ')[0]} sub={`${topMember?.total_score} pts`} color="#10b981" />
              <ScoreCard icon={Activity} label="Miembros activos" value={scores.length} sub="en este proyecto" color="#a78bfa" />
              <ScoreCard icon={Star} label="Horas registradas" value={`${totalHours.toFixed(0)}h`} sub="en actividades" color="#f59e0b" />
            </div>

            {/* Member score cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {scores.map((s, i) => (
                <div key={s.user_id} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-center gap-3">
                    <span className="text-xl w-7">{getMedal(i)}</span>
                    <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                      {s.full_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{s.full_name}</p>
                      <p className="text-xs text-slate-500">{s.email}</p>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: scoreColor(s.total_score) }}>
                      {s.total_score}
                    </span>
                  </div>

                  {/* Score bar */}
                  <div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-2 rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(s.total_score, 100)}%`, background: `${scoreColor(s.total_score)}` }} />
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Tareas', value: s.task_score, color: '#7c3aed' },
                      { label: 'Actividad', value: s.activity_score, color: '#a78bfa' },
                      { label: 'Pares', value: s.peer_score, color: '#10b981' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-slate-700/60 rounded-xl p-3 text-center">
                        <p className="text-sm font-bold" style={{ color }}>{value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Pie */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <p className="text-sm font-semibold text-white mb-4">Distribución de contribución</p>
                <DonutChart data={pieData} />
                {/* Legend */}
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-slate-400">{d.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bar */}
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5">
                <p className="text-sm font-semibold text-white mb-4">Comparación por dimensión</p>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={barData} barSize={16} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, fontSize: 12 }}
                      cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    />
                    <Bar dataKey="Tareas" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Actividades" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Eval. Pares" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex gap-4 justify-center mt-2">
                  {[['Tareas','#7c3aed'],['Actividades','#a78bfa'],['Eval. Pares','#10b981']].map(([l,c]) => (
                    <div key={l} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: c }} />
                      <span className="text-xs text-slate-400">{l}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Formula note */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl px-5 py-4">
              <p className="text-xs text-slate-500 text-center">
                Score = Tareas completadas (peso por tipo, máx 40) + Horas de actividad ×2 (máx 30) + Promedio evaluación pares ×6 (máx 30) · Total máx: <span className="text-slate-400 font-medium">100 pts</span>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
