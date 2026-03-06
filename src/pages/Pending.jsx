import { useState, useEffect } from 'react'
import { Ic } from '../components/Icons'
import { Cd, Bt, Md } from '../components/UI'
import api from '../services/api'

export default function Pending({ theme, isDark }) {
  const [requests, setRequests] = useState([])
  const [selectedReq, setSelectedReq] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadPending() }, [])

  const loadPending = async () => {
    try {
      setLoading(true)
      const data = await api.getPendingRequests()
      setRequests(data)
    } catch (error) { console.error('Error loading pending requests:', error) }
    finally { setLoading(false) }
  }

  const calculateSLAStatus = (createdAt, slaHours) => {
    if (!slaHours) return 'on-track'
    const elapsed = (new Date() - new Date(createdAt)) / (1000 * 60 * 60)
    const remaining = slaHours - elapsed
    if (remaining < 0) return 'breached'
    if (remaining < slaHours * 0.2) return 'critical'
    return 'on-track'
  }

  const handleApprove = async (reqId) => {
    try { await api.approveRequest(reqId); loadPending(); setSelectedReq(null) }
    catch (error) { console.error('Error approving:', error) }
  }

  const handleReject = async (reqId) => {
    try { await api.rejectRequest(reqId, { reason: rejectionReason }); loadPending(); setSelectedReq(null); setShowRejectModal(false); setRejectionReason('') }
    catch (error) { console.error('Error rejecting:', error) }
  }

  if (loading) return <div style={{ color: theme.tM }}>Loading pending requests...</div>
  if (requests.length === 0) return (
    <Cd style={{ textAlign: 'center', padding: '48px' }}>
      <h3 style={{ color: theme.tM, margin: 0, marginBottom: '8px' }}>All caught up!</h3>
      <p style={{ color: theme.tL, margin: 0 }}>No pending approvals</p>
    </Cd>
  )

  const slaColors = { 'on-track': { bg: '#D1FAE5', text: '#065F46' }, critical: { bg: '#FEF3C7', text: '#92400E' }, breached: { bg: '#FEE2E2', text: '#991B1B' } }

  return (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: 600, color: theme.tD, marginBottom: '24px' }}>Pending Approvals ({requests.length})</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {requests.map(req => {
          const slaStatus = calculateSLAStatus(req.createdAt, req.form?.slaHours)
          const sc = slaColors[slaStatus]
          return (
            <Cd key={req.id} hoverable onClick={() => setSelectedReq(req)} style={{ backgroundColor: selectedReq?.id === req.id ? theme.pL : theme.card, cursor: 'pointer', borderColor: selectedReq?.id === req.id ? theme.p : theme.bdr }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0, marginBottom: '4px' }}>{req.form?.name}</p>
                  <p style={{ fontSize: '12px', color: theme.tM, margin: 0 }}>{req.requestor?.name}</p>
                </div>
                <span style={{ padding: '4px 8px', backgroundColor: sc.bg, color: sc.text, borderRadius: '4px', fontSize: '11px', fontWeight: 500 }}>
                  {slaStatus.charAt(0).toUpperCase() + slaStatus.slice(1)}
                </span>
              </div>
              <p style={{ fontSize: '12px', color: theme.tM, margin: 0, marginBottom: '12px' }}>ID: {req.id}</p>
              {selectedReq?.id === req.id && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Bt variant="accent" onClick={e => { e.stopPropagation(); handleApprove(req.id) }} style={{ flex: 1 }}>Approve</Bt>
                  <Bt variant="danger" onClick={e => { e.stopPropagation(); setShowRejectModal(true) }} style={{ flex: 1 }}>Reject</Bt>
                </div>
              )}
            </Cd>
          )
        })}
      </div>

      <Md isOpen={showRejectModal} onClose={() => { setShowRejectModal(false); setRejectionReason('') }} title="Reject Request" size="sm"
        actions={[
          <Bt key="cancel" variant="ghost" onClick={() => { setShowRejectModal(false); setRejectionReason('') }}>Cancel</Bt>,
          <Bt key="reject" variant="danger" onClick={() => handleReject(selectedReq.id)}>Reject</Bt>,
        ]}>
        <textarea placeholder="Enter rejection reason (optional)" value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.bdr}`, fontSize: '13px', minHeight: '100px', boxSizing: 'border-box', backgroundColor: theme.card, color: theme.tD }} />
      </Md>
    </div>
  )
}
