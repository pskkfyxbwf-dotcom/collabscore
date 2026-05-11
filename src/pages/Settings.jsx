import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { login } from '../store/authSlice.js'
import Layout from '../components/Layout.jsx'
import { User, Bell, Shield, Palette, Save } from 'lucide-react'

export default function Settings() {
  const user = useSelector(s => s.auth.user)
  const dispatch = useDispatch()
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', role: user?.role || '' })
  const [saved, setSaved] = useState(false)

  const [weights, setWeights] = useState({
    contribution: 25, quality: 25, communication: 20, teamwork: 20, punctuality: 10,
  })

  function handleSave(e) {
    e.preventDefault()
    dispatch(login({ ...user, ...form }))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)

  return (
    <Layout>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>Configuración</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Gestiona tu perfil y preferencias</p>
        </div>

        {/* Profile */}
        <section className="rounded-xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-5">
            <User size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>Perfil</h2>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {form.name.slice(0, 2).toUpperCase() || 'US'}
              </div>
              <div>
                <p className="font-semibold" style={{ color: 'var(--color-text)' }}>{form.name || 'Tu nombre'}</p>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{form.role || 'Tu rol'}</p>
              </div>
            </div>
            {[
              { key: 'name', label: 'Nombre completo' },
              { key: 'email', label: 'Correo electrónico' },
              { key: 'role', label: 'Rol' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="text-sm font-medium mb-1.5 block" style={{ color: 'var(--color-text-muted)' }}>{label}</label>
                <input value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
                  style={{ background: 'var(--color-surface2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-border)'}
                />
              </div>
            ))}
            <button type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
              style={{ background: saved ? '#10b981' : 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Save size={15} />
              {saved ? '¡Guardado!' : 'Guardar cambios'}
            </button>
          </form>
        </section>

        {/* Metric weights */}
        <section className="rounded-xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Palette size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>Pesos de métricas</h2>
          </div>
          <p className="text-xs mb-5" style={{ color: 'var(--color-text-muted)' }}>
            Ajusta la importancia de cada métrica. Total debe ser 100%.
          </p>
          <div className="space-y-4">
            {Object.entries(weights).map(([key, val]) => {
              const labels = { contribution: 'Aporte', quality: 'Calidad', communication: 'Comunicación', teamwork: 'Trabajo en equipo', punctuality: 'Puntualidad' }
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color: 'var(--color-text)' }}>{labels[key]}</span>
                    <span style={{ color: 'var(--color-primary)' }}>{val}%</span>
                  </div>
                  <input type="range" min="0" max="50" value={val}
                    onChange={e => setWeights(w => ({ ...w, [key]: Number(e.target.value) }))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: '#6366f1' }}
                  />
                </div>
              )
            })}
            <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Total</span>
              <span className="font-bold" style={{ color: totalWeight === 100 ? '#10b981' : '#ef4444' }}>
                {totalWeight}%
              </span>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="rounded-xl p-6" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Bell size={18} style={{ color: 'var(--color-primary)' }} />
            <h2 className="font-semibold" style={{ color: 'var(--color-text)' }}>Notificaciones</h2>
          </div>
          {[
            'Nuevas evaluaciones de score',
            'Cambios en proyectos',
            'Resumen semanal por correo',
            'Alertas de score bajo',
          ].map(item => (
            <div key={item} className="flex items-center justify-between py-3 border-b last:border-0"
              style={{ borderColor: 'var(--color-border)' }}>
              <span className="text-sm" style={{ color: 'var(--color-text)' }}>{item}</span>
              <button className="w-10 h-5 rounded-full relative transition-all"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <div className="w-4 h-4 bg-white rounded-full absolute right-0.5 top-0.5 transition-all" />
              </button>
            </div>
          ))}
        </section>
      </div>
    </Layout>
  )
}
