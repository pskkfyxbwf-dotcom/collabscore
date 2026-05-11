import { useSelector } from 'react-redux'
import Layout from '../components/Layout.jsx'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from 'recharts'
import { Award, TrendingUp, TrendingDown, Minus } from 'lucide-react'

function avgScore(scores) {
  const vals = Object.values(scores)
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

function scoreColor(s) {
  if (s >= 80) return '#10b981'
  if (s >= 60) return '#f59e0b'
  return '#ef4444'
}

const metricLabels = {
  contribution: 'Aporte',
  quality: 'Calidad',
  communication: 'Comunicación',
  teamwork: 'Trabajo en equipo',
  punctuality: 'Puntualidad',
}

export default function Scoring() {
  const projects = useSelector(s => s.projects.list)

  // All members across all projects
  const allMembers = projects.flatMap(p =>
    p.members.map(m => ({ ...m, projectName: p.name }))
  )

  // Top performers
  const ranked = [...allMembers]
    .map(m => ({ ...m, avg: avgScore(m.scores) }))
    .sort((a, b) => b.avg - a.avg)

  // Metric averages across all members
  const metricAvgs = Object.keys(metricLabels).map(metric => ({
    metric: metricLabels[metric],
    promedio: Math.round(allMembers.reduce((acc, m) => acc + m.scores[metric], 0) / allMembers.length),
  }))

  // Score distribution
  const dist = [
    { range: '90-100', count: ranked.filter(m => m.avg >= 90).length },
    { range: '80-89', count: ranked.filter(m => m.avg >= 80 && m.avg < 90).length },
    { range: '70-79', count: ranked.filter(m => m.avg >= 70 && m.avg < 80).length },
    { range: '60-69', count: ranked.filter(m => m.avg >= 60 && m.avg < 70).length },
    { range: '<60', count: ranked.filter(m => m.avg < 60).length },
  ]

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Scoring</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Análisis global de métricas de colaboración
          </p>
        </div>

        {/* Podium - top 3 */}
        <div className="rounded-xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <h3 className="font-semibold mb-5 text-sm" style={{ color: 'var(--color-text)' }}>🏆 Top Colaboradores</h3>
          <div className="flex items-end justify-center gap-4">
            {[ranked[1], ranked[0], ranked[2]].map((m, pos) => {
              if (!m) return null
              const position = pos === 0 ? 2 : pos === 1 ? 1 : 3
              const heights = { 1: 'h-32', 2: 'h-24', 3: 'h-20' }
              const medals = { 1: '🥇', 2: '🥈', 3: '🥉' }
              return (
                <div key={m.id} className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: m.color }}>
                    {m.avatar}
                  </div>
                  <span className="text-xs font-medium text-center" style={{ color: 'var(--color-text)' }}>
                    {m.name.split(' ')[0]}
                  </span>
                  <span className="text-sm font-bold" style={{ color: scoreColor(m.avg) }}>{m.avg}</span>
                  <div className={`w-20 ${heights[position]} rounded-t-lg flex items-center justify-center text-lg`}
                    style={{ background: position === 1 ? 'linear-gradient(180deg, #f59e0b33, #f59e0b22)' : 'var(--color-surface2)', border: '1px solid var(--color-border)' }}>
                    {medals[position]}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--color-text)' }}>Promedio por métrica</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={metricAvgs} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="metric" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} width={110} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface2)', border: '1px solid var(--color-border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--color-text)' }} />
                <Bar dataKey="promedio" radius={[0,6,6,0]} fill="url(#hBarGrad)"
                  label={{ position: 'right', fill: '#94a3b8', fontSize: 11 }} />
                <defs>
                  <linearGradient id="hBarGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="rounded-xl p-5" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
            <h3 className="font-semibold mb-4 text-sm" style={{ color: 'var(--color-text)' }}>Distribución de scores</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={dist} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="range" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: 'var(--color-surface2)', border: '1px solid var(--color-border)', borderRadius: 8 }}
                  labelStyle={{ color: 'var(--color-text)' }} />
                <Bar dataKey="count" name="Miembros" radius={[6,6,0,0]} fill="url(#distGrad)" />
                <defs>
                  <linearGradient id="distGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Full ranking */}
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Ranking completo</h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--color-border)' }}>
            {ranked.map((m, i) => (
              <div key={`${m.id}-${m.projectName}`} className="flex items-center gap-4 px-5 py-3">
                <span className="w-6 text-sm font-bold text-center"
                  style={{ color: i < 3 ? '#f59e0b' : 'var(--color-text-muted)' }}>
                  {i + 1}
                </span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: m.color }}>
                  {m.avatar}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{m.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{m.role} · {m.projectName}</p>
                </div>
                <div className="flex gap-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {Object.entries(m.scores).map(([k, v]) => (
                    <div key={k} className="text-center hidden lg:block">
                      <p style={{ color: scoreColor(v) }}>{v}</p>
                      <p>{metricLabels[k]?.slice(0, 4)}</p>
                    </div>
                  ))}
                </div>
                <span className="text-lg font-bold w-12 text-right" style={{ color: scoreColor(m.avg) }}>
                  {m.avg}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
