import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { BarChart3, Lock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres')
    if (password !== confirm) return toast.error('Las contraseñas no coinciden')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, new_password: password })
      toast.success('Contraseña actualizada. Ya puedes iniciar sesión.')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'El enlace es inválido o ha expirado')
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center max-w-sm w-full">
          <p className="text-white font-medium mb-2">Enlace inválido</p>
          <p className="text-slate-400 text-sm mb-4">Este enlace de recuperación no es válido.</p>
          <Link to="/forgot-password" className="text-purple-400 hover:text-purple-300 text-sm font-medium">
            Solicitar nuevo enlace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 bg-purple-600 rounded-2xl items-center justify-center mb-4">
            <BarChart3 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">CollabScore</h1>
          <p className="text-slate-400 text-sm mt-1">Crea una nueva contraseña</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Nueva contraseña</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)} required
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Confirmar contraseña</label>
            <div className="relative">
              <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password" value={confirm} onChange={e => setConfirm(e.target.value)} required
                placeholder="Repite la contraseña"
                className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors">
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-400 mt-4">
          <Link to="/" className="text-purple-400 hover:text-purple-300 font-medium">Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  )
}
