import { useState, useEffect } from 'react'
import { Cd, Bt, Bg } from '../components/UI'
import { ROLES } from '../theme'
import api from '../services/api'

export default function AccessRequests({ theme, isDark }) {
  const [requests, setRequests] = useState([])
  const [selectedReq, setSelectedReq] = useState(null)
  const [formPermissions, setFormPermissions] = useState([])
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRequests()
    loadForms()
  }, [])

  const loadRequests = async () => {
    try {
      const data = await api.getAccessRequests()
      setRequests(data)
    } catch (error) {
      console.error('Error loading access requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadForms = async () => {
    try {
      const data = await api.getForms()
      setForms(data)
    } catch (error) {
      console.error('Error loading forms:', error)
    }
  }

  const handleApprove = async (reqId) => {
    try {
      const perms = selectedReq?.role === 'auditor' ? formPermissions : null
      await api.approveAccessRequest(reqId, perms)
      setRequests(requests.filter(r => r.id !== reqId))
      setSelectedReq(null)
    } catch (error) {
      console.error('Error approving request:', error)
    }
  }

  const handleReject = async (reqId) => {
    try {
      await api.rejectAccessRequest(reqId)
      setRequests(requests.filter(r => r.id !== reqId))
      setSelectedReq(null)
    } catch (error) {
      console.error('Error rejecting request:', error)
    }
  }

  if (loading) {
    return <div style={{ color: theme.tM }}>Loading access requests...</div>
  }

  const pendingRequests = requests.filter(r => r.status === 'pending')

  return (
    <div>
      {pendingRequests.length === 0 ? (
        <Cd style={{ textAlign: 'center', padding: '48px' }}>
          <h3 style={{ color: theme.tM, margin: 0, marginBottom: '8px' }}>All caught up!</h3>
          <p style={{ color: theme.tL, margin: 0 }}>No pending access requests</p>
        </Cd>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Requests list */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: theme.tD }}>
              Pending Requests ({pendingRequests.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pendingRequests.map(req => (
                <Cd
                  key={req.id}
                  hoverable
                  onClick={() => {
                    setSelectedReq(req)
                    setFormPermissions([])
                  }}
                  style={{
                    backgroundColor: selectedReq?.id === req.id ? theme.pL : theme.card,
                    cursor: 'pointer',
                    borderColor: selectedReq?.id === req.id ? theme.p : theme.bdr,
                  }}
                >
                  <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0, marginBottom: '4px' }}>
                    {req.fullName}
                  </p>
                  <p style={{ fontSize: '12px', color: theme.tM, margin: 0, marginBottom: '8px' }}>
                    {req.email}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Bg text={req.role} bg={theme.p + '20'} color={theme.p} size="sm" />
                    <span style={{ fontSize: '12px', color: theme.tL }}>{req.department}</span>
                  </div>
                </Cd>
              ))}
            </div>
          </div>

          {/* Details panel */}
          <div>
            {selectedReq ? (
              <Cd>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: theme.tD, marginTop: 0 }}>
                  Request Details
                </h3>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: theme.tM, margin: 0, marginBottom: '4px' }}>Full Name</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>
                    {selectedReq.fullName}
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: theme.tM, margin: 0, marginBottom: '4px' }}>Email</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>
                    {selectedReq.email}
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: theme.tM, margin: 0, marginBottom: '4px' }}>Employee ID</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>
                    {selectedReq.employeeId}
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: theme.tM, margin: 0, marginBottom: '4px' }}>Department</p>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>
                    {selectedReq.department}
                  </p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: theme.tM, margin: 0, marginBottom: '4px' }}>Requested Role</p>
                  <Bg text={selectedReq.role} bg={theme.p + '20'} color={theme.p} size="sm" />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: theme.tM, margin: 0, marginBottom: '4px' }}>Reason</p>
                  <p style={{ fontSize: '13px', color: theme.tD, margin: 0 }}>{selectedReq.reason}</p>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: theme.tM, margin: 0, marginBottom: '4px' }}>Requested Date</p>
                  <p style={{ fontSize: '13px', color: theme.tD, margin: 0 }}>
                    {new Date(selectedReq.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Form permissions for auditor */}
                {selectedReq.role === 'auditor' && (
                  <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: theme.pL, borderRadius: '6px' }}>
                    <p style={{ fontSize: '12px', color: theme.tM, margin: 0, marginBottom: '8px', fontWeight: 500 }}>
                      Form Permissions
                    </p>
                    {forms.map(form => (
                      <label
                        key={form.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formPermissions.includes(form.id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setFormPermissions([...formPermissions, form.id])
                            } else {
                              setFormPermissions(formPermissions.filter(id => id !== form.id))
                            }
                          }}
                        />
                        {form.name}
                      </label>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                  <Bt variant="accent" onClick={() => handleApprove(selectedReq.id)} style={{ flex: 1 }}>
                    Approve
                  </Bt>
                  <Bt variant="danger" onClick={() => handleReject(selectedReq.id)} style={{ flex: 1 }}>
                    Reject
                  </Bt>
                </div>
              </Cd>
            ) : (
              <Cd style={{ textAlign: 'center', padding: '32px' }}>
                <p style={{ color: theme.tM }}>Select a request to view details</p>
              </Cd>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
