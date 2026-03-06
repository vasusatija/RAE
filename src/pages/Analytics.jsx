import { useState, useEffect } from 'react'
import { Ic } from '../components/Icons'
import { SC, Sl, Cd } from '../components/UI'
import api from '../services/api'

export default function Analytics({ theme, isDark }) {
  const [forms, setForms] = useState([])
  const [selectedFormId, setSelectedFormId] = useState('')
  const [analytics, setAnalytics] = useState(null)
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadForms()
  }, [])

  useEffect(() => {
    if (selectedFormId) {
      loadAnalytics()
    }
  }, [selectedFormId])

  const loadForms = async () => {
    try {
      const data = await api.getForms()
      setForms(data)
      if (data.length > 0) {
        setSelectedFormId(data[0].id)
      }
    } catch (error) {
      console.error('Error loading forms:', error)
    }
  }

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const data = await api.getAnalytics(selectedFormId)
      setAnalytics(data.stats)
      setRequests(data.requests || [])
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!analytics && loading) {
    return <div style={{ color: theme.tM }}>Loading analytics...</div>
  }

  return (
    <div>
      {/* Form selector */}
      <Cd style={{ marginBottom: '24px' }}>
        <Sl
          label="Select Form"
          options={forms}
          value={selectedFormId}
          onChange={e => setSelectedFormId(e.target.value)}
        />
      </Cd>

      {analytics && (
        <>
          {/* Stats cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '16px',
              marginBottom: '32px',
            }}
          >
            <SC
              label="Total Requests"
              value={analytics.total}
              icon={<Ic name="form" size={24} color={theme.p} />}
              color={theme.p}
            />
            <SC
              label="Approved"
              value={analytics.approved}
              icon={<Ic name="check" size={24} color={theme.acc} />}
              color={theme.acc}
            />
            <SC
              label="Pending"
              value={analytics.pending}
              icon={<Ic name="inbox" size={24} color={theme.warn} />}
              color={theme.warn}
            />
            <SC
              label="Rejected"
              value={analytics.rejected}
              icon={<Ic name="x" size={24} color={theme.dng} />}
              color={theme.dng}
            />
          </div>

          {/* Limit-based approval info */}
          {analytics.limitInfo && (
            <Cd style={{ marginBottom: '24px', padding: '16px', backgroundColor: theme.pL }}>
              <h4 style={{ margin: 0, marginBottom: '12px', color: theme.p, fontWeight: 600 }}>
                Approval Limits
              </h4>
              {analytics.limitInfo.map((limit, idx) => (
                <div key={idx} style={{ marginBottom: '8px', fontSize: '13px', color: theme.tD }}>
                  <strong>{limit.level}:</strong> ₹{limit.minAmount} - ₹{limit.maxAmount}
                </div>
              ))}
            </Cd>
          )}

          {/* Requests table */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: theme.tD }}>
              Requests
            </h3>

            {requests.length === 0 ? (
              <Cd style={{ textAlign: 'center', padding: '32px' }}>
                <p style={{ color: theme.tM }}>No requests for this form yet</p>
              </Cd>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {requests.map(request => (
                  <Cd key={request.id}>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr',
                        alignItems: 'center',
                        gap: '16px',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '12px', color: theme.tM, margin: 0 }}>ID</p>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>
                          {request.id}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: theme.tM, margin: 0 }}>Requestor</p>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>
                          {request.requestor?.name}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: theme.tM, margin: 0 }}>Date</p>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p style={{ fontSize: '12px', color: theme.tM, margin: 0 }}>Amount</p>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>
                          ₹{request.amount}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 500,
                            backgroundColor:
                              request.status === 'pending'
                                ? '#FEF3C7'
                                : request.status === 'approved'
                                ? '#D1FAE5'
                                : '#FEE2E2',
                            color:
                              request.status === 'pending'
                                ? '#92400E'
                                : request.status === 'approved'
                                ? '#065F46'
                                : '#991B1B',
                          }}
                        >
                          {request.status}
                        </span>
                      </div>
                    </div>
                  </Cd>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
