import { useNavigate } from 'react-router-dom'
import { Calendar, Users, ArrowRight } from 'lucide-react'

export default function ProjectCard({ project }) {
  const navigate = useNavigate()
  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="bg-slate-800 border border-slate-700 rounded-2xl p-5 cursor-pointer hover:border-purple-500/50 hover:bg-slate-750 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-white text-base leading-tight group-hover:text-purple-400 transition-colors line-clamp-1">
          {project.name}
        </h3>
        <ArrowRight size={16} className="text-slate-600 group-hover:text-purple-400 transition-colors flex-shrink-0 mt-0.5" />
      </div>
      <p className="text-slate-400 text-sm line-clamp-2 mb-4 leading-relaxed">
        {project.description || 'Sin descripción'}
      </p>
      <div className="flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1">
          <Users size={12} />
          <span>{project.member_count} {project.member_count === 1 ? 'miembro' : 'miembros'}</span>
        </div>
        {project.deadline && (
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <span>{project.deadline}</span>
          </div>
        )}
      </div>
    </div>
  )
}
