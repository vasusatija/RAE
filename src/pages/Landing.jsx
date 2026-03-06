import { Logo, Ic } from '../components/Icons'
import { Bt } from '../components/UI'

export default function Landing({ onNavigate }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Logo size={32} color="#3B82F6" />
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#1F2937' }}>RAE</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Bt variant="outline" onClick={() => onNavigate('login')}>Login</Bt>
          <Bt onClick={() => onNavigate('request-access')}>Request Access</Bt>
        </div>
      </header>

      <section style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%)', color: '#FFFFFF', padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '48px', fontWeight: 700, marginBottom: '16px' }}>Request & Approval Engine</h1>
          <p style={{ fontSize: '18px', marginBottom: '40px', opacity: 0.9 }}>Streamline your approval workflows with dynamic forms, custom approval flows, and full audit trails.</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '40px' }}>
            {[
              { icon: 'form', title: 'Dynamic Forms', desc: 'Create custom forms with flexible fields' },
              { icon: 'workflow', title: 'Custom Flows', desc: 'Define approval workflows by role' },
              { icon: 'audit', title: 'Audit Trail', desc: 'Complete history of all actions' },
            ].map(feature => (
              <div key={feature.title}>
                <div style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px', borderRadius: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'center' }}>
                  <Ic name={feature.icon} size={32} color="#FFFFFF" />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>{feature.title}</h3>
                <p style={{ fontSize: '13px', opacity: 0.8, margin: 0 }}>{feature.desc}</p>
              </div>
            ))}
          </div>
          <Bt size="lg" onClick={() => onNavigate('login')}>Get Started</Bt>
        </div>
      </section>

      <footer style={{ padding: '20px 40px', backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E7EB', textAlign: 'center', color: '#6B7280', fontSize: '13px' }}>
        © 2026 Cars24. Internal Use Only.
      </footer>
    </div>
  )
}
