import { useState, useEffect } from 'react'
import { Ic } from '../components/Icons'
import { Ip, Cd } from '../components/UI'
import api from '../services/api'

export default function Audit({ theme, isDark }) {
  const [auditTrail, setAuditTrail] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAudit()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(() => {
        loadAudit(searchTerm)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      loadAudit()
    }
  }, [searchTerm])

  const loadAudit = async (search = '') => {
    try {
      setLoading(true)
      const filters = {}
      if (search) filters.search = search
      const data = await api.getAuditTrail(filters)
      setAuditTrail(data)
    } catch (error) {
      console.error('Error loading audit trail:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionColor = (action) => {
    const colors = {
      create: '#10B981',
      update: '#3B82F6',
      delete: '#EF4444',
      approve: '#10B981',
      reject: '#EF4444',
      submit: '#3B82F6',
      login: '#6B7280',
      logout: '#6B7280',
      view: '#6B7280',
    }
    return colors[action] || '#6B7280'
  }

  const getActionIcon = (action) => {
    const icons = {
      create: 'plus',
      update: 'edit',
      delete: 'trash',
      approve: 'check',
      reject: 'x',
      submit: 'send',
      login: 'logout',
      logout: 'logout',
      view: 'eye',
    }
    return icons[action] || 'activity'
  }

  if (loading && auditTrail.length === 0) {
    return <div style={{ color: theme.tM }}>Loading audit trail...</div>
  }

  return (
    <div>
      {/* Search */}
      <Cd style={{ marginBottom: '24px' }}>
        <Ip
          label="Search"
          placeholder="Search by user, action, or target..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </Cd>

      {/* Audit trail table */}
      {auditTrail.length === 0 ? (
        <Cd style={{ textAlign: 'center', padding: '32px' }}>
          <p style={{ color: theme.tM }}>No audit records found</p>
        </Cd>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${theme.bdr}` }}>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: theme.tM, fontSize: '12px' }}>
                  Time
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: theme.tM, fontSize: '12px' }}>
                  User
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: theme.tM, fontSize: '12px' }}>
                  Action
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: theme.tM, fontSize: '12px' }}>
                  Target
                </th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: 600, color: theme.tM, fontSize: '12px' }}>
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {auditTrail.map((entry, idx) => (
                <tr
                  key={idx}
                  style={{
                    borderBottom: `1px solid ${theme.bdr}`,
                    backgroundColor: idx % 2 === 0 ? 'transparent' : theme.card,
                  }}
                >
                  <td style={{ padding: '12px', fontSize: '12px', color: theme.tM }}>
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: theme.tD, fontWeight: 500 }}>
                    {entry.user?.name || 'System'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: getActionColor(entry.action) + '20',
                        color: getActionColor(entry.action),
                        fontSize: '12px',
                        fontWeight: 500,
                      }}
                    >
                      <Ic name={getActionIcon(entry.action)} size={14} color={getActionColor(entry.action)} />
                      {entry.action.charAt(0).toUpperCase() + entry.action.slice(1)}
                    </div>
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px', color: theme.tD }}>
                    {entry.target}
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', color: theme.tM }}>
                    {entry.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
