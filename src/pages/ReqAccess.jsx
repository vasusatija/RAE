import { useState } from 'react'
import { Logo } from '../components/Icons'
import { Bt, Ip, EI, Sl } from '../components/UI'
import { DEPARTMENTS } from '../theme'
import api from '../services/api'

export default function ReqAccess({ onNavigate }) {
  const [step, setStep] = useState('form')
  const [formData, setFormData] = useState({ fullName: '', email: '', employeeId: '', department: '', role: '', password: '', confirmPassword: '', reason: '', customDept: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const validateForm = () => {
    const e = {}
    if (!formData.fullName.trim()) e.fullName = 'Full name is required'
    if (!formData.email.trim()) e.email = 'Username is required'
    if (!formData.employeeId.trim()) e.employeeId = 'Employee ID is required'
    if (!formData.department) e.department = 'Department is required'
    if (formData.department === 'Other' && !formData.customDept.trim()) e.customDept = 'Please specify your department'
    if (!formData.role) e.role = 'Role is required'
    if (!formData.password) e.password = 'Password is required'
    if (formData.password.length < 8) e.password = 'Password must be at least 8 characters'
    if (formData.password !== formData.confirmPassword) e.confirmPassword = 'Passwords do not match'
    if (!formData.reason.trim()) e.reason = 'Reason is required'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setLoading(true)
    try {
      await api.requestAccess({
        fullName: formData.fullName,
        email: `${formData.email}@cars24.com`,
        employeeId: formData.employeeId,
        department: formData.department === 'Other' ? formData.customDept : formData.department,
        role: formData.role,
        password: formData.password,
        reason: formData.reason,
      })
      setStep('success')
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to submit request' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', color: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <Logo size={48} color="#FFFFFF" />
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginTop: '24px', textAlign: 'center' }}>Request & Approval Engine</h1>
        <p style={{ fontSize: '16px', opacity: 0.8, marginTop: '12px', textAlign: 'center', maxWidth: '300px' }}>Join the approval workflow system. Your request will be reviewed by administrators.</p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px', backgroundColor: '#FFFFFF', overflowY: 'auto' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
          {step === 'form' ? (
            <>
              <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: '#1F2937' }}>Request Access</h2>
              <p style={{ color: '#6B7280', marginBottom: '24px' }}>Fill in your details to request access to the system</p>
              {errors.submit && <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', fontSize: '13px' }}>{errors.submit}</div>}
              <form onSubmit={handleSubmit}>
                <Ip label="Full Name" value={formData.fullName} onChange={e => handleChange('fullName', e.target.value)} required error={errors.fullName} />
                <EI label="Email" value={formData.email} onChange={e => handleChange('email', e.target.value)} required error={errors.email} />
                <Ip label="Employee ID" value={formData.employeeId} onChange={e => handleChange('employeeId', e.target.value)} required error={errors.employeeId} />
                <Sl label="Department" options={DEPARTMENTS} value={formData.department} onChange={e => handleChange('department', e.target.value)} required error={errors.department} />
                {formData.department === 'Other' && <Ip label="Specify Department" value={formData.customDept} onChange={e => handleChange('customDept', e.target.value)} required error={errors.customDept} />}
                <Sl label="Role" options={[{ id: 'admin', name: 'Admin' }, { id: 'approver', name: 'Approver' }, { id: 'requestor', name: 'Requestor' }, { id: 'auditor', name: 'Auditor' }]} value={formData.role} onChange={e => handleChange('role', e.target.value)} required error={errors.role} />
                <Ip label="Create Password" type="password" value={formData.password} onChange={e => handleChange('password', e.target.value)} required error={errors.password} />
                <Ip label="Confirm Password" type="password" value={formData.confirmPassword} onChange={e => handleChange('confirmPassword', e.target.value)} required error={errors.confirmPassword} />
                <Ip label="Reason for Access" value={formData.reason} onChange={e => handleChange('reason', e.target.value)} required error={errors.reason} />
                <Bt style={{ width: '100%' }} onClick={handleSubmit} disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</Bt>
              </form>
              <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
                Already have access?{' '}
                <button onClick={() => onNavigate('login')} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontWeight: 500 }}>Sign In</button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '64px', height: '64px', backgroundColor: '#D1FAE5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <span style={{ fontSize: '32px' }}>✓</span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1F2937', marginBottom: '12px' }}>Request Submitted</h2>
              <p style={{ color: '#6B7280', marginBottom: '24px' }}>Your access request has been submitted successfully. An administrator will review your request.</p>
              <Bt onClick={() => onNavigate('login')}>Go to Login</Bt>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
