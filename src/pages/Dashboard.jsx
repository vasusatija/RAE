import { useState, useEffect } from 'react'
import { Ic } from '../components/Icons'
import { SC, Cd, Bt } from '../components/UI'
import { useAuth } from '../hooks/useAuth'
import { formatAmount } from '../theme'
import api from '../services/api'

export default function Dashboard({ theme, isDark }) {
  const { user } = useAuth()
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 })
  const [amounts, setAmounts] = useState({ total: 0, approved: 0, pending: 0, rejected: 0 })
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadDashboard() }, [])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const data = await api.getRequests()
      const pending = data.filter(r => r.status === 'pending').length
      const approved = data.filter(r => r.status === 'approved').length
      const rejected = data.filter(r => r.status === 'rejected').length
      setStats({ pending, approved, rejected, total: data.length })
      if (['admin', 'super_admin'].includes(user?.role)) {
        setAmounts({
          total: data.reduce((sum, r) => sum + (r.amount || 0), 0),
          approved: data.filter(r => r.status === 'approved').reduce((sum, r) => sum + (r.amount || 0), 0),
          pending: data.filter(r => r.status === 'pending').reduce((sum, r) => sum + (r.amount || 0), 0),
          rejected: data.filter(r => r.status === 'rejected').reduce((sum, r) => sum + (r.amount || 0), 0),
        })
      }
      setRequests(data.slice(0, 5))
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div style={{ color: theme.tM }}>Loading dashboard...</div>

  return (
    <div>
      <div style={{ background: `linear-gradient(135deg, ${theme.p} 0%, ${theme.pL} 100%)`, borderRadius: '12px', padding: '32px', marginBottom: '32px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 700, margin: 0, marginBottom: '8px' }}>Welcome back, {user?.name}!</h2>
          <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>You have {stats.pending} pending approvals. Keep the workflow moving!</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <SC label="Pending" value={stats.pending} icon={<Ic name="inbox" size={24} color={theme.warn} />} color={theme.warn} />
        <SC label="Approved" value={stats.approved} icon={<Ic name="check" size={24} color={theme.acc} />} color={theme.acc} />
        <SC label="Rejected" value={stats.rejected} icon={<Ic name="x" size={24} color={theme.dng} />} color={theme.dng} />
        <SC label="Total" value={stats.total} icon={<Ic name="form" size={24} color={theme.p} />} color={theme.p} />
      </div>

      {['admin', 'super_admin'].includes(user?.role) && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          <SC label="Total Amount" value={formatAmount(amounts.total)} icon={<Ic name="dollar" size={24} color={theme.p} />} color={theme.p} />
          <SC label="Approved Amount" value={formatAmount(amounts.approved)} icon={<Ic name="check" size={24} color={theme.acc} />} color={theme.acc} />
          <SC label="Pending Amount" value={formatAmount(amounts.pending)} icon={<Ic name="inbox" size={24} color={theme.warn} />} color={theme.warn} />
          <SC label="Rejected Amount" value={formatAmount(amounts.rejected)} icon={<Ic name="x" size={24} color={theme.dng} />} color={theme.dng} />
        </div>
      )}

      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: theme.tD }}>Recent Requests</h3>
        {requests.length === 0 ? (
          <Cd style={{ textAlign: 'center', padding: '32px' }}>
            <p style={{ color: theme.tM, marginBottom: '16px' }}>No requests yet</p>
          </Cd>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {requests.map(request => (
              <Cd key={request.id} hoverable>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', alignItems: 'center', gap: '16px' }}>
                  <div><p style={{ fontSize: '12px', color: theme.tM, margin: 0 }}>ID</p><p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>{request.id}</p></div>
                  <div><p style={{ fontSize: '12px', color: theme.tM, margin: 0 }}>Form</p><p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>{request.form?.name}</p></div>
                  <div><p style={{ fontSize: '12px', color: theme.tM, margin: 0 }}>Requestor</p><p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>{request.requestor?.name}</p></div>
                  <div><p style={{ fontSize: '12px', color: theme.tM, margin: 0 }}>Date</p><p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>{new Date(request.createdAt).toLocaleDateString()}</p></div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ display: 'inline-block', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, backgroundColor: request.status === 'pending' ? '#FEF3C7' : request.status === 'approved' ? '#D1FAE5' : '#FEE2E2', color: request.status === 'pending' ? '#92400E' : request.status === 'approved' ? '#065F46' : '#991B1B' }}>
                      {request.status}
                    </span>
                  </div>
                </div>
              </Cd>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
