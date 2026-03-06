import { useState, useEffect } from 'react'
import { Ic } from '../components/Icons'
import { Cd, Bt, Ip, Sl, FileUpload } from '../components/UI'
import { CATEGORIES } from '../theme'
import api from '../services/api'

export default function Submit({ theme, isDark }) {
  const [forms, setForms] = useState([])
  const [selectedFormId, setSelectedFormId] = useState('')
  const [selectedForm, setSelectedForm] = useState(null)
  const [formValues, setFormValues] = useState({})
  const [amount, setAmount] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => { loadForms() }, [])
  useEffect(() => { if (selectedFormId) loadFormDetails() }, [selectedFormId])

  const loadForms = async () => {
    try { const data = await api.getForms(); setForms(data.filter(f => f.status === 'active')) }
    catch (error) { console.error('Error loading forms:', error) }
    finally { setLoading(false) }
  }

  const loadFormDetails = async () => {
    try {
      const data = await api.getForm(selectedFormId)
      setSelectedForm(data)
      const initialValues = {}
      data.fields?.forEach(field => { initialValues[field.id] = '' })
      setFormValues(initialValues)
    } catch (error) { console.error('Error loading form details:', error) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selectedFormId) { alert('Please select a form'); return }
    setSubmitting(true)
    try {
      await api.submitRequest({ formId: selectedFormId, data: formValues, amount: amount ? parseInt(amount) : null })
      setSubmitted(true)
    } catch (error) { alert(error.message || 'Failed to submit request') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div style={{ color: theme.tM }}>Loading forms...</div>

  if (submitted) return (
    <Cd style={{ textAlign: 'center', padding: '48px', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ width: '64px', height: '64px', backgroundColor: '#D1FAE5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
        <Ic name="check" size={32} color="#065F46" />
      </div>
      <h2 style={{ fontSize: '24px', fontWeight: 700, color: theme.tD, marginBottom: '12px' }}>Request Submitted!</h2>
      <p style={{ color: theme.tM, marginBottom: '24px' }}>Your request has been submitted successfully. Track its status on the Requests page.</p>
      <Bt onClick={() => setSubmitted(false)}>Submit Another Request</Bt>
    </Cd>
  )

  return (
    <div style={{ maxWidth: '600px' }}>
      <Cd style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.tD, marginTop: 0 }}>Select Form</h3>
        {forms.length === 0 ? <p style={{ color: theme.tM }}>No active forms available</p> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {forms.map(form => {
              const cat = CATEGORIES[form.category]
              const isSelected = selectedFormId === form.id
              return (
                <button key={form.id} onClick={() => setSelectedFormId(form.id)}
                  style={{ padding: '12px', borderRadius: '8px', border: isSelected ? `2px solid ${theme.p}` : `1px solid ${theme.bdr}`, backgroundColor: isSelected ? theme.pL : theme.card, cursor: 'pointer', textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <div style={{ width: '32px', height: '32px', backgroundColor: cat?.color + '20', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Ic name={cat?.icon} size={16} color={cat?.color} />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: theme.tD, margin: 0 }}>{form.name}</p>
                      <p style={{ fontSize: '11px', color: theme.tM, margin: 0 }}>{cat?.name}</p>
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </Cd>

      {selectedForm && (
        <form onSubmit={handleSubmit}>
          <Cd style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.tD, marginTop: 0 }}>Form Details</h3>
            {selectedForm.fields?.map(field => (
              <div key={field.id}>
                {field.type === 'textarea' ? (
                  <label style={{ display: 'block', marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: theme.tM, margin: 0, marginBottom: '6px' }}>{field.name}{field.required && <span style={{ color: '#EF4444' }}>*</span>}</p>
                    <textarea value={formValues[field.id] || ''} onChange={e => setFormValues(prev => ({ ...prev, [field.id]: e.target.value }))} required={field.required}
                      style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${theme.bdr}`, fontSize: '13px', minHeight: '100px', boxSizing: 'border-box', backgroundColor: theme.card, color: theme.tD }} />
                  </label>
                ) : field.type === 'select' ? (
                  <Sl label={field.name} options={field.options || []} value={formValues[field.id] || ''} onChange={e => setFormValues(prev => ({ ...prev, [field.id]: e.target.value }))} required={field.required} />
                ) : (
                  <Ip label={field.name} type={field.type} value={formValues[field.id] || ''} onChange={e => setFormValues(prev => ({ ...prev, [field.id]: e.target.value }))} required={field.required} />
                )}
              </div>
            ))}
          </Cd>

          {selectedForm.amountLogic && selectedForm.amountLogic !== 'none' && (
            <Cd style={{ marginBottom: '24px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.tD, marginTop: 0 }}>Amount</h3>
              {selectedForm.amountLogic === 'simple' && <Ip label="Amount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required />}
            </Cd>
          )}

          <Cd style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.tD, marginTop: 0 }}>Attachments</h3>
            <FileUpload onFile={setUploadedFile} />
            {uploadedFile && (
              <div style={{ marginTop: '12px', padding: '12px', backgroundColor: theme.card, borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ic name="download" size={16} color={theme.p} />
                <span style={{ fontSize: '13px', color: theme.tD }}>{uploadedFile.name}</span>
              </div>
            )}
          </Cd>

          <Bt onClick={handleSubmit} disabled={submitting || !selectedFormId} style={{ width: '100%', marginBottom: '24px' }}>
            {submitting ? 'Submitting...' : 'Submit Request'}
          </Bt>
        </form>
      )}
    </div>
  )
}
