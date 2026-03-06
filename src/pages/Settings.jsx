import { useState, useEffect } from 'react'
import { Ic } from '../components/Icons'
import { Cd, Bt, Ip, Sl } from '../components/UI'
import { THEMES, DARK_THEMES } from '../theme'
import api from '../services/api'

export default function Settings({ theme, isDark, onThemeChange, onDarkModeChange }) {
  const [logoUrl, setLogoUrl] = useState(null)
  const [orgName, setOrgName] = useState('')
  const [selectedTheme, setSelectedTheme] = useState('blue')
  const [currency, setCurrency] = useState('INR')
  const [approvalType, setApprovalType] = useState('sequential')
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    slack: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const data = await api.getSettings()
      setOrgName(data.organizationName || '')
      setLogoUrl(data.logo || null)
      setSelectedTheme(data.theme || 'blue')
      setCurrency(data.currency || 'INR')
      setApprovalType(data.defaultApprovalType || 'sequential')
      setNotifications(data.notifications || { email: true, sms: false, slack: false })
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const response = await api.uploadLogo(file)
      setLogoUrl(response.logoUrl)
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Failed to upload logo')
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      await api.updateSettings({
        organizationName: orgName,
        theme: selectedTheme,
        currency,
        defaultApprovalType: approvalType,
        notifications,
      })

      onThemeChange(selectedTheme)
      alert('Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div style={{ color: theme.tM }}>Loading settings...</div>
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Branding Section */}
      <Cd style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.tD, marginTop: 0 }}>
          Branding
        </h3>

        <div style={{ marginBottom: '16px' }}>
          <p style={{ fontSize: '12px', fontWeight: 500, color: theme.tM, margin: 0, marginBottom: '8px' }}>
            Logo
          </p>
          <div
            style={{
              width: '120px',
              height: '120px',
              backgroundColor: theme.card,
              borderRadius: '8px',
              border: `2px dashed ${theme.bdr}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              overflow: 'hidden',
            }}
          >
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            ) : (
              <Ic name="image" size={32} color={theme.tL} />
            )}
          </div>
          <label style={{ display: 'block' }}>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              style={{ display: 'none' }}
            />
            <Bt variant="outline" size="sm" onClick={e => e.currentTarget.parentElement.querySelector('input').click()}>
              Upload Logo
            </Bt>
          </label>
        </div>

        <Ip
          label="Organization Name"
          value={orgName}
          onChange={e => setOrgName(e.target.value)}
        />

        <h4 style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, marginTop: '20px', marginBottom: '12px' }}>
          Color Theme
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {Object.entries(THEMES).map(([key, themeConfig]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedTheme(key)
                onThemeChange(key)
              }}
              style={{
                padding: '12px',
                borderRadius: '8px',
                border: selectedTheme === key ? `2px solid ${themeConfig.p}` : '1px solid transparent',
                backgroundColor: themeConfig.p + '30',
                cursor: 'pointer',
                textAlign: 'center',
              }}
            >
              <p style={{ fontSize: '12px', fontWeight: 600, color: themeConfig.p, margin: 0 }}>
                {themeConfig.name}
              </p>
            </button>
          ))}
        </div>

        {/* Live preview */}
        <div style={{ padding: '16px', backgroundColor: theme.card, borderRadius: '8px' }}>
          <p style={{ fontSize: '11px', color: theme.tM, margin: 0, marginBottom: '8px', fontWeight: 500 }}>
            Preview
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: theme.p, borderRadius: '6px' }} />
            <div style={{ width: '40px', height: '40px', backgroundColor: theme.acc, borderRadius: '6px' }} />
            <div style={{ width: '40px', height: '40px', backgroundColor: theme.warn, borderRadius: '6px' }} />
            <div style={{ width: '40px', height: '40px', backgroundColor: theme.dng, borderRadius: '6px' }} />
          </div>
        </div>
      </Cd>

      {/* Platform Settings */}
      <Cd style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.tD, marginTop: 0 }}>
          Platform Settings
        </h3>

        <Sl
          label="Currency"
          options={[
            { id: 'INR', name: 'Indian Rupee (₹)' },
            { id: 'USD', name: 'US Dollar ($)' },
            { id: 'EUR', name: 'Euro (€)' },
          ]}
          value={currency}
          onChange={e => setCurrency(e.target.value)}
        />

        <Sl
          label="Default Approval Type"
          options={[
            { id: 'sequential', name: 'Sequential' },
            { id: 'parallel', name: 'Parallel' },
          ]}
          value={approvalType}
          onChange={e => setApprovalType(e.target.value)}
        />
      </Cd>

      {/* Notifications */}
      <Cd style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 600, color: theme.tD, marginTop: 0 }}>
          Notifications
        </h3>

        {[['email', 'Email Notifications'], ['sms', 'SMS Notifications'], ['slack', 'Slack Notifications']].map(([key, label]) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={notifications[key]}
              onChange={e => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
            />
            <span style={{ fontSize: '13px', color: theme.tD }}>{label}</span>
          </label>
        ))}
      </Cd>

      {/* Save Button */}
      <Bt onClick={handleSaveSettings} disabled={saving} style={{ width: '100%' }}>
        {saving ? 'Saving...' : 'Save Settings'}
      </Bt>
    </div>
  )
}
