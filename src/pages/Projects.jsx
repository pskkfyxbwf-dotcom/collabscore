import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout.jsx'
import { FolderKanban, Users, TrendingUp, ArrowRight, Plus } from 'lucide-react'

function scoreColor(s) {
  if (s >= 80) return '#10b981'
  if (s >= 60) return '#f59e0b'
  return '#ef4444'
}

const statusMap = {
  active: { label: 'Activo', bg: 'rgba(16,185,129,0.1)', color: '#10b981' },
  completed: { label: 'Completado', bg: 'rgba(99,102,241,0.1)', color: '#6366f1' },
  paused: { label: 'Pausado', bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' },
}

export default function Projects() {
  const projects = useSelector(s => s.projects.list)
  const navigate = useNavigate()

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Proyectos</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
              {projects.length} proyectos en total
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <Plus size={16} /> Nuevo proyecto
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {projects.map(p => {
            const badge = statusMap[p.status] || statusMap.active
            return (
              <div key={p.id} onClick={() => navigate(`/projects/${p.id}`)}
                className="rounded-xl p-6 cursor-pointer transition-all"
                style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#6366f1'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-border)'}>

                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <FolderKanban size={20} style={{ color: '#6366f1' }} />
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full"
                    style={{ background: badge.bg, color: badge.color }}>
                    {badge.label}
                  </span>
                </div>

                <h3 className="font-semibold mb-1" style={{ color: 'var(--color-text)' }}>{p.name}</h3>
                <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--color-text-muted)' }}>{p.description}</p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1.5">
                    <span style={{ color: 'var(--color-text-muted)' }}>Progreso</span>
                    <span style={{ color: 'var(--color-text)' }}>{p.progress}%</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--color-border)' }}>
                    <div className="h-2 rounded-full" style={{ width: `${p.progress}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    <Users size={14} />
                    <span>{p.members.length} miembros</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp size={14} style={{ color: scoreColor(p.overallScore) }} />
                    <span className="font-semibold text-sm" style={{ color: scoreColor(p.overallScore) }}>
                      {p.overallScore}/100
                    </span>
                  </div>
                </div>

                <div className="flex -space-x-2 mt-4">
                  {p.members.slice(0, 5).map(m => (
                    <div key={m.id} title={m.name}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white border-2"
                      style={{ background: m.color, borderColor: 'var(--color-surface)' }}>
                      {m.avatar}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
