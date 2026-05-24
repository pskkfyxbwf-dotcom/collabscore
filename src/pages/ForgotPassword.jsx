import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BarChart3, Mail } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/axios'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Error al enviar el correo')
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
          <p className="text-slate-400 text-sm mt-1">Recupera tu contraseña</p>
        </div>

        {sent ? (
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center space-y-4">
            <div className="inline-flex w-12 h-12 bg-green-600/20 rounded-full items-center justify-center">
              <Mail size={24} className="text-green-400" />
            </div>
            <p className="text-white font-medium">¡Correo enviado!</p>
            <p className="text-slate-400 text-sm">
              Si el correo <span className="text-purple-400">{email}</span> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
            </p>
            <Link to="/" className="block text-purple-400 hover:text-purple-300 text-sm font-medium mt-2">
              Volver al inicio de sesión
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 space-y-4">
            <p className="text-slate-400 text-sm">
              Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Correo</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="tu@correo.com"
                  className="w-full bg-slate-700 border border-slate-600 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold rounded-xl py-2.5 text-sm transition-colors">
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-400 mt-4">
          <Link to="/" className="text-purple-400 hover:text-purple-300 font-medium">Volver al inicio de sesión</Link>
        </p>
      </div>
    </div>
  )
}
