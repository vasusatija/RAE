import { useState } from 'react'
import { Logo, Ic } from '../components/Icons'
import { Bt, LiveClock, Bg } from '../components/UI'
import { useAuth } from '../hooks/useAuth'

export default function AppShell({ theme, isDark, onNavigate, currentRoute, onToggleDark, children }) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const getNavigation = () => {
    const baseNav = [{ id: 'dashboard', label: 'Dashboard', icon: 'home' }]
    if (user?.role === 'super_admin') return [...baseNav,
      { id: 'forms', label: 'Forms', icon: 'form' },
      { id: 'requests', label: 'Requests', icon: 'inbox' },
      { id: 'analytics', label: 'Analytics', icon: 'bar' },
      { id: 'access-requests', label: 'Access Requests', icon: 'usercheck' },
      { id: 'form-approvals', label: 'Form Approvals', icon: 'check' },
      { id: 'users', label: 'Users', icon: 'users' },
      { id: 'audit', label: 'Audit Trail', icon: 'audit' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ]
    if (user?.role === 'admin') return [...baseNav,
      { id: 'forms', label: 'Forms', icon: 'form' },
      { id: 'requests', label: 'Requests', icon: 'inbox' },
      { id: 'users', label: 'Users', icon: 'users' },
      { id: 'audit', label: 'Audit Trail', icon: 'audit' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ]
    if (user?.role === 'approver') return [...baseNav,
      { id: 'pending', label: 'Pending', icon: 'inbox' },
      { id: 'requests', label: 'Requests', icon: 'form' },
      { id: 'audit', label: 'Audit Trail', icon: 'audit' },
    ]
    if (user?.role === 'requestor') return [...baseNav,
      { id: 'submit', label: 'Submit Request', icon: 'plus' },
      { id: 'requests', label: 'My Requests', icon: 'inbox' },
    ]
    if (user?.role === 'auditor') return [...baseNav,
      { id: 'requests', label: 'Requests', icon: 'inbox' },
      { id: 'audit', label: 'Audit Trail', icon: 'audit' },
    ]
    return baseNav
  }

  const navigation = getNavigation()
  const pageTitle = navigation.find(n => n.id === currentRoute)?.label || 'Dashboard'

  const getRoleColor = () => {
    const colors = { super_admin: '#DC2626', admin: '#7C3AED', approver: '#2563EB', requestor: '#059669', auditor: '#D97706' }
    return colors[user?.role] || '#6B7280'
  }

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: theme.bg }}>
      <aside style={{ width: sidebarOpen ? '250px' : '80px', backgroundColor: theme.card, borderRight: `1px solid ${theme.bdr}`, display: 'flex', flexDirection: 'column', transition: 'width 0.3s', padding: '16px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
          <Logo size={32} color={theme.p} />
          {sidebarOpen && <span style={{ fontWeight: 700, color: theme.tD }}>RAE</span>}
        </div>

        <nav style={{ flex: 1 }}>
          {navigation.map(item => {
            const isActive = currentRoute === item.id
            return (
              <button key={item.id} onClick={() => onNavigate(item.id)}
                style={{ width: '100%', padding: '12px', marginBottom: '8px', backgroundColor: isActive ? theme.p + '20' : 'transparent', border: 'none', borderRadius: '6px', color: isActive ? theme.p : theme.tM, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: isActive ? 600 : 500, transition: 'all 0.2s' }}>
                <Ic name={item.icon} size={20} color={isActive ? theme.p : theme.tM} />
                {sidebarOpen && item.label}
              </button>
            )
          })}
        </nav>

        {sidebarOpen && (
          <div style={{ borderTop: `1px solid ${theme.bdr}`, paddingTop: '16px' }}>
            <div style={{ marginBottom: '12px', padding: '8px', backgroundColor: theme.bg, borderRadius: '6px' }}>
              <p style={{ fontSize: '12px', color: theme.tM, margin: 0, marginBottom: '4px' }}>Logged in as</p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>{user?.name}</p>
              <Bg text={user?.role} bg={getRoleColor() + '20'} color={getRoleColor()} size="sm" />
            </div>
            <button onClick={onToggleDark} style={{ width: '100%', padding: '8px 12px', marginBottom: '8px', backgroundColor: 'transparent', border: `1px solid ${theme.bdr}`, borderRadius: '6px', color: theme.tM, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 500 }}>
              <Ic name={isDark ? 'sun' : 'moon'} size={16} color={theme.tM} />
              {isDark ? 'Light' : 'Dark'}
            </button>
            <Bt variant="ghost" size="sm" onClick={() => { logout(); window.location.href = '/' }} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Ic name="logout" size={16} color={theme.tM} />Logout
            </Bt>
          </div>
        )}

        <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ marginTop: '16px', width: '100%', padding: '8px', backgroundColor: 'transparent', border: `1px solid ${theme.bdr}`, borderRadius: '6px', color: theme.tM, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Ic name="chevronUp" size={16} color={theme.tM} />
        </button>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ backgroundColor: theme.card, borderBottom: `1px solid ${theme.bdr}`, padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, color: theme.tD, margin: 0 }}>{pageTitle}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <LiveClock theme={theme} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bg text={user?.role} bg={getRoleColor() + '20'} color={getRoleColor()} size="sm" />
              <div style={{ width: '40px', height: '40px', backgroundColor: theme.p, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 700 }}>
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', backgroundColor: theme.bg, padding: '24px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
