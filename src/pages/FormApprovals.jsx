import { useState, useEffect } from 'react'
import { Ic } from '../components/Icons'
import { Cd, Bt, Bg } from '../components/UI'
import { CATEGORIES } from '../theme'
import api from '../services/api'

export default function FormApprovals({ theme, isDark }) {
  const [approvals, setApprovals] = useState([])
  const [selectedForm, setSelectedForm] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadApprovals()
  }, [])

  const loadApprovals = async () => {
    try {
      const data = await api.getFormApprovals()
      setApprovals(data)
    } catch (error) {
      console.error('Error loading form approvals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (formId) => {
    try {
      await api.approveForm(formId)
      setApprovals(approvals.filter(a => a.form.id !== formId))
      setSelectedForm(null)
    } catch (error) {
      console.error('Error approving form:', error)
    }
  }

  const handleReject = async (formId) => {
    try {
      await api.rejectForm(formId)
      setApprovals(approvals.filter(a => a.form.id !== formId))
      setSelectedForm(null)
    } catch (error) {
      console.error('Error rejecting form:', error)
    }
  }

  if (loading) {
    return <div style={{ color: theme.tM }}>Loading form approvals...</div>
  }

  const pendingApprovals = approvals.filter(a => a.status === 'pending')

  return (
    <div>
      {pendingApprovals.length === 0 ? (
        <Cd style={{ textAlign: 'center', padding: '48px' }}>
          <h3 style={{ color: theme.tM, margin: 0, marginBottom: '8px' }}>All caught up!</h3>
          <p style={{ color: theme.tL, margin: 0 }}>No pending form approvals</p>
        </Cd>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {pendingApprovals.map(approval => {
            const form = approval.form
            const category = CATEGORIES[form.category]

            return (
              <Cd
                key={form.id}
                hoverable
                onClick={() => setSelectedForm(approval)}
                style={{
                  backgroundColor: selectedForm?.form.id === form.id ? theme.pL : theme.card,
                  cursor: 'pointer',
                  borderColor: selectedForm?.form.id === form.id ? theme.p : theme.bdr,
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 1fr 1fr 150px',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: category?.color + '20',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: category?.color,
                  }}
                >
                  <Ic name={category?.icon} size={20} color={category?.color} />
                </div>

                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>
                    {form.name}
                  </p>
                  <p style={{ fontSize: '12px', color: theme.tM, margin: 0 }}>
                    {category?.name}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '12px', color: theme.tM, margin: 0, marginBottom: '4px' }}>Created By</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>
                    {approval.creator?.name}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '12px', color: theme.tM, margin: 0, marginBottom: '4px' }}>Created</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>
                    {new Date(form.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <Bt
                    variant="accent"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation()
                      handleApprove(form.id)
                    }}
                  >
                    Approve
                  </Bt>
                  <Bt
                    variant="danger"
                    size="sm"
                    onClick={e => {
                      e.stopPropagation()
                      handleReject(form.id)
                    }}
                  >
                    Reject
                  </Bt>
                </div>
              </Cd>
            )
          })}
        </div>
      )}
    </div>
  )
}
