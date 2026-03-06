import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { THEMES, DARK_THEMES, getTheme } from './theme'
import { Toast } from './components/UI'

import Landing from './pages/Landing'
import Login from './pages/Login'
import ReqAccess from './pages/ReqAccess'
import Dashboard from './pages/Dashboard'
import Analytics from './pages/Analytics'
import AccessRequests from './pages/AccessRequests'
import FormApprovals from './pages/FormApprovals'
import Forms from './pages/Forms'
import Requests from './pages/Requests'
import Pending from './pages/Pending'
import Submit from './pages/Submit'
import Users from './pages/Users'
import Audit from './pages/Audit'
import Settings from './pages/Settings'
import AppShell from './pages/AppShell'

const AppContent = () => {
  const { user, loading, isAuthenticated, toast } = useAuth()
  const [route, setRoute] = useState('landing')
  const [isDark, setIsDark] = useState(false)
  const [theme, setTheme] = useState('blue')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'blue'
    const savedDark = localStorage.getItem('darkMode') === 'true'
    setTheme(savedTheme)
    setIsDark(savedDark && isAuthenticated)
  }, [isAuthenticated])

  const toggleDarkMode = () => {
    setIsDark(!isDark)
    localStorage.setItem('darkMode', !isDark)
  }

  const setAppTheme = (newTheme) => {
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const themeConfig = getTheme(isDark, theme)

  const handleNavigation = (newRoute) => {
    setRoute(newRoute)
  }

  const isAppRoute =
    isAuthenticated &&
    !['landing', 'login', 'request-access'].includes(route)

  let Component = Landing

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: themeConfig.bg }}>
        <p style={{ color: themeConfig.tM }}>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    switch (route) {
      case 'login':
        Component = () => <Login onNavigate={handleNavigation} />
        break
      case 'request-access':
        Component = () => <ReqAccess onNavigate={handleNavigation} />
        break
      default:
        Component = () => <Landing onNavigate={handleNavigation} />
    }
  } else {
    switch (route) {
      case 'dashboard':
        Component = () => <Dashboard theme={themeConfig} isDark={isDark} />
        break
      case 'analytics':
        Component = () => <Analytics theme={themeConfig} isDark={isDark} />
        break
      case 'access-requests':
        Component = () => <AccessRequests theme={themeConfig} isDark={isDark} />
        break
      case 'form-approvals':
        Component = () => <FormApprovals theme={themeConfig} isDark={isDark} />
        break
      case 'forms':
        Component = () => <Forms theme={themeConfig} isDark={isDark} />
        break
      case 'requests':
        Component = () => <Requests theme={themeConfig} isDark={isDark} />
        break
      case 'pending':
        Component = () => <Pending theme={themeConfig} isDark={isDark} />
        break
      case 'submit':
        Component = () => <Submit theme={themeConfig} isDark={isDark} />
        break
      case 'users':
        Component = () => <Users theme={themeConfig} isDark={isDark} />
        break
      case 'audit':
        Component = () => <Audit theme={themeConfig} isDark={isDark} />
        break
      case 'settings':
        Component = () => <Settings theme={themeConfig} isDark={isDark} onThemeChange={setAppTheme} onDarkModeChange={toggleDarkMode} />
        break
      default:
        Component = () => <Dashboard theme={themeConfig} isDark={isDark} />
    }
  }

  const content = <Component />

  if (isAppRoute && user) {
    return (
      <AppShell
        theme={themeConfig}
        isDark={isDark}
        onNavigate={handleNavigation}
        currentRoute={route}
        onToggleDark={toggleDarkMode}
      >
        {content}
      </AppShell>
    )
  }

  return (
    <div style={{ backgroundColor: themeConfig.bg, minHeight: '100vh', color: themeConfig.tD }}>
      {content}
      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
