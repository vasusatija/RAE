import { useState, useEffect } from 'react'
import { Cd, Bt, Md, ConfirmMd, ReqDetail } from '../components/UI'
import api from '../services/api'

export default function Requests({ theme, isDark }) {
  const [requests, setRequests] = useState([])
  const [selectedReq, setSelectedReq] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => { loadRequests() }, [filter])

  const loadRequests = async () => {
    try {
      setLoading(true)
      const data = await api.getRequests({ status: filter === 'all' ? undefined : filter })
      setRequests(data)
    } catch (error) { console.error('Error loading requests:', error) }
    finally { setLoading(false) }
  }

  const handleApprove = async (reqId) => {
    try { await api.approveRequest(reqId); loadRequests(); setSelectedReq(null) }
    catch (error) { console.error('Error approving:', error) }
  }

  const handleReject = async (reqId) => {
    try { await api.rejectRequest(reqId, { reason: rejectionReason }); loadRequests(); setSelectedReq(null); setShowRejectModal(false); setRejectionReason('') }
    catch (error) { console.error('Error rejecting:', error) }
  }

  const filteredRequests = requests.filter(r => filter === 'all' ? true : r.status === filter)
  const counts = { all: requests.length, pending: requests.filter(r => r.status === 'pending').length, approved: requests.filter(r => r.status === 'approved').length, rejected: requests.filter(r => r.status === 'rejected').length }

  if (loading) return <div style={{ color: theme.tM }}>Loading requests...</div>

  return (
    <div>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: `1px solid ${theme.bdr}` }}>
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: '12px 16px', backgroundColor: 'transparent', border: 'none', borderBottom: filter === f ? `2px solid ${theme.p}` : 'none', color: filter === f ? theme.p : theme.tM, cursor: 'pointer', fontWeight: filter === f ? 600 : 500, fontSize: '14px' }}>
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          {filteredRequests.length === 0 ? (
            <Cd style={{ textAlign: 'center', padding: '32px' }}><p style={{ color: theme.tM }}>No requests found</p></Cd>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {filteredRequests.map(req => (
                <Cd key={req.id} hoverable onClick={() => setSelectedReq(req)} style={{ backgroundColor: selectedReq?.id === req.id ? theme.pL : theme.card, cursor: 'pointer', borderColor: selectedReq?.id === req.id ? theme.p : theme.bdr }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0, marginBottom: '4px' }}>{req.id}</p>
                      <p style={{ fontSize: '12px', color: theme.tM, margin: 0, marginBottom: '4px' }}>{req.form?.name}</p>
                      <p style={{ fontSize: '12px', color: theme.tM, margin: 0 }}>{req.requestor?.name}</p>
                    </div>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 500, backgroundColor: req.status === 'pending' ? '#FEF3C7' : req.status === 'approved' ? '#D1FAE5' : '#FEE2E2', color: req.status === 'pending' ? '#92400E' : req.status === 'approved' ? '#065F46' : '#991B1B' }}>
                      {req.status}
                    </span>
                  </div>
                </Cd>
              ))}
            </div>
          )}
        </div>

        {selectedReq ? (
          <Cd>
            <ReqDetail request={selectedReq} theme={theme} />
            <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
              {selectedReq.status === 'pending' && (
                <>
                  <Bt variant="accent" onClick={() => handleApprove(selectedReq.id)} style={{ flex: 1 }}>Approve</Bt>
                  <Bt variant="danger" onClick={() => setShowRejectModal(true)} style={{ flex: 1 }}>Reject</Bt>
                </>
              )}
            </div>
          </Cd>
        ) : (
          <Cd style={{ textAlign: 'center', padding: '32px' }}><p style={{ color: theme.tM }}>Select a request to view details</p></Cd>
        )}
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
