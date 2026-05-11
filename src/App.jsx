import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import ProjectDetail from './pages/ProjectDetail.jsx'
import Tasks from './pages/Tasks.jsx'
import ActivityLog from './pages/ActivityLog.jsx'
import PeerEvaluation from './pages/PeerEvaluation.jsx'
import ScoreDashboard from './pages/ScoreDashboard.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
          success: { iconTheme: { primary: '#7c3aed', secondary: 'white' } },
        }} />
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/projects/:id" element={<ProtectedRoute><ProjectDetail /></ProtectedRoute>} />
          <Route path="/projects/:id/tasks" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
          <Route path="/projects/:id/activities" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
          <Route path="/projects/:id/evaluate" element={<ProtectedRoute><PeerEvaluation /></ProtectedRoute>} />
          <Route path="/projects/:id/scores" element={<ProtectedRoute><ScoreDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
