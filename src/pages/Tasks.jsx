import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Navbar from '../components/Navbar.jsx'
import api from '../api/axios.js'
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragOverlay,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Plus, X, Calendar, GripVertical } from 'lucide-react'
import toast from 'react-hot-toast'

const COLUMNS = [
  { id: 'pending', label: 'Pendiente', color: 'text-slate-400', dot: 'bg-slate-500' },
  { id: 'in_progress', label: 'En progreso', color: 'text-blue-400', dot: 'bg-blue-500' },
  { id: 'completed', label: 'Completado', color: 'text-green-400', dot: 'bg-green-500' },
  { id: 'overdue', label: 'Vencido', color: 'text-red-400', dot: 'bg-red-500' },
]

const TASK_TYPES = [
  { value: 'research', label: 'Research', multiplier: '×1.5' },
  { value: 'design', label: 'Diseño', multiplier: '×1.3' },
  { value: 'revision', label: 'Revisión', multiplier: '×1.0' },
  { value: 'logistics', label: 'Logística', multiplier: '×0.8' },
]

const TYPE_COLORS = { research: 'text-purple-400 bg-purple-500/10', design: 'text-blue-400 bg-blue-500/10', revision: 'text-green-400 bg-green-500/10', logistics: 'text-orange-400 bg-orange-500/10' }

function TaskCard({ task, isDragging }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isSortDragging } = useSortable({ id: task.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isSortDragging ? 0.4 : 1 }
  const tc = TYPE_COLORS[task.task_type] || TYPE_COLORS.revision
  const typeLabel = TASK_TYPES.find(t => t.value === task.task_type)

  return (
    <div ref={setNodeRef} style={style}
      className="bg-slate-700 border border-slate-600 rounded-xl p-3.5 cursor-grab active:cursor-grabbing select-none">
      <div className="flex items-start gap-2">
        <div {...attributes} {...listeners} className="mt-0.5 text-slate-600 hover:text-slate-400">
          <GripVertical size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-snug">{task.title}</p>
          {task.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tc}`}>
              {typeLabel?.label} {typeLabel?.multiplier}
            </span>
            {task.assignee_name && (
              <span className="text-xs text-slate-400">{task.assignee_name}</span>
            )}
            {task.deadline && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar size={10} />{task.deadline}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Tasks() {
  const { id } = useParams()
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [members, setMembers] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(null)
  const [form, setForm] = useState({ title: '', description: '', task_type: 'revision', deadline: '', assignee_id: '' })
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  useEffect(() => {
    Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/projects/${id}/tasks`),
      api.get(`/projects/${id}/members`),
    ]).then(([pr, tr, mr]) => {
      setProject(pr.data)
      setTasks(tr.data)
      setMembers(mr.data)
    }).catch(() => toast.error('Error cargando tareas')).finally(() => setLoading(false))
  }, [id])

  async function createTask(status) {
    if (!form.title.trim()) return toast.error('El título es requerido')
    try {
      const payload = { ...form, status, assignee_id: form.assignee_id ? Number(form.assignee_id) : null }
      const { data } = await api.post(`/projects/${id}/tasks`, payload)
      setTasks(t => [...t, data])
      setForm({ title: '', description: '', task_type: 'revision', deadline: '', assignee_id: '' })
      setShowForm(null)
      toast.success('Tarea creada')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al crear')
    }
  }

  async function handleDragEnd(event) {
    const { active, over } = event
    setActiveTask(null)
    if (!over) return
    const draggedTask = tasks.find(t => t.id === active.id)
    if (!draggedTask) return
    const targetColumn = COLUMNS.find(c => c.id === over.id)
    const targetTask = tasks.find(t => t.id === over.id)
    const newStatus = targetColumn?.id || targetTask?.status
    if (!newStatus || newStatus === draggedTask.status) return
    setTasks(prev => prev.map(t => t.id === draggedTask.id ? { ...t, status: newStatus } : t))
    try {
      await api.put(`/projects/${id}/tasks/${draggedTask.id}`, { status: newStatus })
    } catch {
      toast.error('Error actualizando estado')
      setTasks(prev => prev.map(t => t.id === draggedTask.id ? draggedTask : t))
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-900">
      <Navbar breadcrumbs={[{ label: 'Proyectos', to: '/dashboard' }, { label: project?.name, to: `/projects/${id}` }, { label: 'Tareas' }]} />
      <div className="px-6 py-6 overflow-x-auto">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={e => setActiveTask(tasks.find(t => t.id === e.active.id))} onDragEnd={handleDragEnd}>
          <div className="flex gap-4 min-w-max">
            {COLUMNS.map(col => {
              const colTasks = tasks.filter(t => t.status === col.id)
              return (
                <div key={col.id} className="w-72 flex-shrink-0">
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                    <span className={`text-sm font-semibold ${col.color}`}>{col.label}</span>
                    <span className="text-xs text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded-full">{colTasks.length}</span>
                  </div>
                  <SortableContext items={colTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    <div id={col.id} className="bg-slate-800/50 border border-slate-700 rounded-2xl p-3 min-h-48 space-y-2">
                      {colTasks.map(task => <TaskCard key={task.id} task={task} />)}
                      {showForm === col.id ? (
                        <div className="bg-slate-700 border border-purple-500/50 rounded-xl p-3 space-y-2.5">
                          <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            placeholder="Título de la tarea" autoFocus
                            className="w-full bg-slate-600 border border-slate-500 text-white placeholder-slate-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                            placeholder="Descripción (opcional)" rows={2}
                            className="w-full bg-slate-600 border border-slate-500 text-white placeholder-slate-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500 resize-none" />
                          <select value={form.task_type} onChange={e => setForm(f => ({ ...f, task_type: e.target.value }))}
                            className="w-full bg-slate-600 border border-slate-500 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
                            {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label} {t.multiplier}</option>)}
                          </select>
                          <select value={form.assignee_id} onChange={e => setForm(f => ({ ...f, assignee_id: e.target.value }))}
                            className="w-full bg-slate-600 border border-slate-500 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500">
                            <option value="">Sin asignar</option>
                            {members.map(m => <option key={m.user_id} value={m.user_id}>{m.full_name}</option>)}
                          </select>
                          <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                            className="w-full bg-slate-600 border border-slate-500 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500" />
                          <div className="flex gap-2">
                            <button onClick={() => createTask(col.id)}
                              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg py-1.5 transition-colors">
                              Crear
                            </button>
                            <button onClick={() => setShowForm(null)} className="p-1.5 text-slate-400 hover:text-white">
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => setShowForm(col.id)}
                          className="w-full flex items-center gap-2 text-slate-600 hover:text-slate-400 text-sm py-2 rounded-lg hover:bg-slate-700/50 transition-all px-2">
                          <Plus size={14} /> Agregar tarea
                        </button>
                      )}
                    </div>
                  </SortableContext>
                </div>
              )
            })}
          </div>
          <DragOverlay>
            {activeTask && (
              <div className="bg-slate-700 border border-purple-500 rounded-xl p-3.5 shadow-2xl rotate-1 w-72">
                <p className="text-sm font-medium text-white">{activeTask.title}</p>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}
