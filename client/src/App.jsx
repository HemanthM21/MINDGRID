import React, { useEffect, useState } from 'react'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Tasks from './pages/Tasks'
import Dashboard from './pages/Dashboard'
import Documents from './pages/Documents'
import Journal from './pages/Journal'
import api from './services/api'

export default function App() {
  const [route, setRoute] = useState('landing')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (token && userData) {
      setUser(JSON.parse(userData))
      api.setToken(token)
      setRoute('dashboard')
    }

    setLoading(false)
  }, [])

  function handleNavigate(page) {
    setRoute(page)
  }

  function handleLogin(userData) {
    setUser(userData)
    setRoute('dashboard')
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    api.setToken(null)
    setUser(null)
    setRoute('landing')
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  // Show auth pages if not logged in
  if (!user) {
    if (route === 'landing') return <Landing onNavigate={handleNavigate} />
    if (route === 'login') return <Login onNavigate={handleNavigate} onLogin={handleLogin} />
    if (route === 'signup') return <Signup onNavigate={handleNavigate} onLogin={handleLogin} />
    return <Landing onNavigate={handleNavigate} />
  }

  // Show app if logged in
  return (
    <div>
      <header>
        <div className="header-left">
          <button
            className={route === 'dashboard' ? 'active' : ''}
            onClick={() => handleNavigate('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={route === 'tasks' ? 'active' : ''}
            onClick={() => handleNavigate('tasks')}
          >
            ✓ Tasks
          </button>
          <button
            className={route === 'documents' ? 'active' : ''}
            onClick={() => handleNavigate('documents')}
          >
            📄 Documents
          </button>
          <button
            className={route === 'journal' ? 'active' : ''}
            onClick={() => handleNavigate('journal')}
            style={{
              background: route === 'journal' ? 'linear-gradient(135deg, #764ba2 0%, #4facfe 100%)' : '',
              color: route === 'journal' ? 'white' : ''
            }}
          >
            📝 Journal
          </button>
        </div>

        <div className="header-right">
          <div className="user-info">
            <div className="user-avatar">{user.name?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{user.name || user.email}</div>
              <div style={{ fontSize: 12, color: '#999' }}>{user.email}</div>
            </div>
          </div>
          <button
            className="secondary"
            onClick={handleLogout}
            style={{ width: 'auto', padding: '8px 16px' }}
          >
            Logout
          </button>
        </div>
      </header>

      <main>
        {route === 'dashboard' && <Dashboard />}
        {route === 'tasks' && <Tasks />}
        {route === 'documents' && <Documents />}
        {route === 'journal' && <Journal />}
      </main>
    </div>
  )
}
