import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { BarChart3, User, Mail, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Register() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'student' })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  function set(k) { return e => setForm(f => ({ ...f, [k]: e.target.value })) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (form.password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres')
    setLoading(true)
    try {
      await register(form.full_name, form.email, form.password, form.role)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-purple-600 rounded-2xl items-center justify-center mb-4">
            <BarChart3 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CollabScore</h1>
          <p className="text-slate-400 text-sm mt-1">Crea tu cuenta gratuita</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nombre completo</label>
            <div className="relative">
              <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="text" value={form.full_name} onChange={set('full_name')} required placeholder="Tu nombre"
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Correo</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="email" value={form.email} onChange={set('email')} required placeholder="tu@correo.com"
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input type="password" value={form.password} onChange={set('password')} required placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Rol</label>
            <select value={form.role} onChange={set('role')}
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors">
              <option value="student">Estudiante / Miembro</option>
              <option value="professor">Profesor / Líder</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors mt-2">
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-4">
          ¿Ya tienes cuenta?{' '}
          <Link to="/" className="text-purple-400 hover:text-purple-300 font-medium">Inicia sesión</Link>
        </p>
      </div>
    </div>
  )
}
