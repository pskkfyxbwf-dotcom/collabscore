import { useSelector } from 'react-redux'
import Layout from '../components/Layout.jsx'
import { Mail, Briefcase, TrendingUp } from 'lucide-react'

function avgScore(scores) {
  const vals = Object.values(scores)
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length)
}

function scoreColor(s) {
  if (s >= 80) return '#10b981'
  if (s >= 60) return '#f59e0b'
  return '#ef4444'
}

export default function Members() {
  const projects = useSelector(s => s.projects.list)

  // Aggregate all unique members across projects
  const membersMap = {}
  projects.forEach(p => {
    p.members.forEach(m => {
      if (!membersMap[m.id]) {
        membersMap[m.id] = { ...m, projects: [] }
      }
      membersMap[m.id].projects.push(p.name)
    })
  })
  const members = Object.values(membersMap)

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Miembros</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            {members.length} colaboradores registrados
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(m => {
            const score = avgScore(m.scores)
            return (
              <div key={m.id} className="rounded-xl p-5"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>

                {/* Avatar + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: m.color }}>
                    {m.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>{m.name}</h3>
                    <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      <Briefcase size={11} /> {m.role}
                    </div>
                  </div>
                  <div className="ml-auto text-right">
                    <p className="text-xl font-bold" style={{ color: scoreColor(score) }}>{score}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>score</p>
                  </div>
                </div>

                {/* Metrics bars */}
                <div className="space-y-2 mb-4">
                  {Object.entries(m.scores).map(([key, val]) => {
                    const labels = { contribution: 'Aporte', quality: 'Calidad', communication: 'Comunicación', teamwork: 'Trabajo equipo', punctuality: 'Puntualidad' }
                    return (
                      <div key={key}>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span style={{ color: 'var(--color-text-muted)' }}>{labels[key]}</span>
                          <span style={{ color: scoreColor(val) }}>{val}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: 'var(--color-border)' }}>
                          <div className="h-1.5 rounded-full transition-all"
                            style={{ width: `${val}%`, background: scoreColor(val) }} />
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Email + projects */}
                <div className="space-y-1 text-xs" style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
                  <div className="flex items-center gap-1.5">
                    <Mail size={11} /> {m.email}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp size={11} />
                    <span className="truncate">{m.projects.join(', ')}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
