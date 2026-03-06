import { useState } from 'react'
import { Logo } from '../components/Icons'
import { Bt, EI, Ip } from '../components/UI'
import { useAuth } from '../hooks/useAuth'

export default function Login({ onNavigate }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const email = `${username}@cars24.com`
      await login(email, password)
      onNavigate('dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={{ flex: 1, background: 'linear-gradient(135deg, #1F2937 0%, #111827 100%)', color: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px' }}>
        <Logo size={48} color="#FFFFFF" />
        <h1 style={{ fontSize: '32px', fontWeight: 700, marginTop: '24px', textAlign: 'center' }}>Request & Approval Engine</h1>
        <p style={{ fontSize: '16px', opacity: 0.8, marginTop: '12px', textAlign: 'center', maxWidth: '300px' }}>Streamline your approval workflows with intelligent routing and audit trails.</p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px', backgroundColor: '#FFFFFF' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', color: '#1F2937' }}>Welcome Back</h2>
          <p style={{ color: '#6B7280', marginBottom: '32px' }}>Sign in to your account to continue</p>

          {error && <div style={{ backgroundColor: '#FEE2E2', color: '#991B1B', padding: '12px 16px', borderRadius: '6px', marginBottom: '16px', fontSize: '14px' }}>{error}</div>}

          <form onSubmit={handleSubmit}>
            <EI label="Email" value={username} onChange={e => setUsername(e.target.value)} required error={error ? ' ' : ''} />
            <Ip label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required error={error ? ' ' : ''} />
            <Bt style={{ width: '100%' }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Bt>
          </form>

          <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: '#6B7280' }}>
            Don't have an account?{' '}
            <button onClick={() => onNavigate('request-access')} style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontWeight: 500 }}>Request Access</button>
          </div>
        </div>
      </div>
    </div>
  )
}
