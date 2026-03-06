import React, { useState, useEffect, useRef } from 'react'
import { Ic } from './Icons'

export const Bg = ({ text, bg, color, size = 'sm' }) => {
  const sizes = { sm: { padding: '4px 8px', fontSize: '12px' }, md: { padding: '6px 12px', fontSize: '13px' }, lg: { padding: '8px 16px', fontSize: '14px' } }
  return (
    <span style={{ ...sizes[size], backgroundColor: bg || '#E0E7FF', color: color || '#4F46E5', borderRadius: '9999px', fontWeight: 500, display: 'inline-block', whiteSpace: 'nowrap' }}>
      {text}
    </span>
  )
}

export const SB = ({ status }) => {
  const configs = {
    pending: { bg: '#FEF3C7', color: '#92400E' },
    approved: { bg: '#D1FAE5', color: '#065F46' },
    rejected: { bg: '#FEE2E2', color: '#991B1B' },
    active: { bg: '#D1FAE5', color: '#065F46' },
    paused: { bg: '#F3F4F6', color: '#374151' },
    revoked: { bg: '#FEE2E2', color: '#991B1B' },
  }
  const config = configs[status] || configs.pending
  return <Bg text={status.charAt(0).toUpperCase() + status.slice(1)} bg={config.bg} color={config.color} />
}

export const Bt = ({ children, variant = 'primary', size = 'md', onClick, disabled, style, title }) => {
  const [isHovered, setIsHovered] = useState(false)
  const variants = {
    primary: { bg: 'rgb(59, 130, 246)', color: 'white', border: 'none' },
    secondary: { bg: '#E0E7FF', color: '#4F46E5', border: 'none' },
    outline: { bg: 'transparent', color: '#4F46E5', border: '1px solid #C7D2FE' },
    danger: { bg: '#EF4444', color: 'white', border: 'none' },
    ghost: { bg: 'transparent', color: '#6B7280', border: 'none' },
    accent: { bg: '#10B981', color: 'white', border: 'none' },
    white: { bg: 'white', color: '#1F2937', border: '1px solid #E5E7EB' },
  }
  const sizes_config = { sm: { padding: '6px 12px', fontSize: '12px' }, md: { padding: '8px 16px', fontSize: '14px' }, lg: { padding: '12px 24px', fontSize: '15px' } }
  const v = variants[variant] || variants.primary
  const s = sizes_config[size] || sizes_config.md
  return (
    <button onClick={onClick} disabled={disabled} title={title}
      onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
      style={{ ...s, backgroundColor: v.bg, color: v.color, border: v.border || 'none', borderRadius: '6px', cursor: disabled ? 'not-allowed' : 'pointer', fontWeight: 500, transition: 'all 0.2s', opacity: disabled ? 0.5 : 1, ...style }}
    >
      {children}
    </button>
  )
}

export const Ip = ({ label, placeholder, value, onChange, type = 'text', required, error, disabled }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#374151' }}>{label}{required && <span style={{ color: '#EF4444' }}>*</span>}</label>}
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} disabled={disabled}
      style={{ width: '100%', padding: '8px 12px', border: error ? '1px solid #EF4444' : '1px solid #E5E7EB', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#1F2937' }} />
    {error && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
  </div>
)

export const EI = ({ label, value, onChange, required, error }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#374151' }}>{label}{required && <span style={{ color: '#EF4444' }}>*</span>}</label>}
    <div style={{ display: 'flex', alignItems: 'center', border: error ? '1px solid #EF4444' : '1px solid #E5E7EB', borderRadius: '6px', backgroundColor: '#FFFFFF' }}>
      <input type="text" placeholder="Enter username" value={value} onChange={onChange}
        style={{ flex: 1, padding: '8px 12px', border: 'none', fontSize: '14px', backgroundColor: 'transparent', color: '#1F2937' }} />
      <span style={{ padding: '8px 12px', color: '#6B7280', fontWeight: 500 }}>@cars24.com</span>
    </div>
    {error && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
  </div>
)

export const Sl = ({ label, options, value, onChange, required, error, disabled }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#374151' }}>{label}{required && <span style={{ color: '#EF4444' }}>*</span>}</label>}
    <select value={value} onChange={onChange} disabled={disabled}
      style={{ width: '100%', padding: '8px 12px', border: error ? '1px solid #EF4444' : '1px solid #E5E7EB', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#FFFFFF', color: '#1F2937', cursor: disabled ? 'not-allowed' : 'pointer' }}>
      <option value="">Select {label?.toLowerCase()}</option>
      {options.map(opt => <option key={opt.id || opt} value={opt.id || opt}>{opt.name || opt}</option>)}
    </select>
    {error && <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>{error}</p>}
  </div>
)

export const Cd = ({ children, onClick, style, hoverable = false }) => {
  const [isHovered, setIsHovered] = useState(false)
  return (
    <div onClick={onClick} onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', cursor: hoverable && onClick ? 'pointer' : 'default', boxShadow: isHovered && hoverable ? '0 4px 12px rgba(0,0,0,0.1)' : 'none', transition: 'all 0.2s', ...style }}>
      {children}
    </div>
  )
}

export const Md = ({ isOpen, onClose, title, children, size = 'md', actions }) => {
  if (!isOpen) return null
  const sizes = { sm: { maxWidth: '400px' }, md: { maxWidth: '600px' }, lg: { maxWidth: '800px' }, xl: { maxWidth: '1000px' } }
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '24px', ...sizes[size], maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px rgba(0,0,0,0.15)' }}>
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', margin: 0 }}>{title}</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#6B7280' }}>×</button>
          </div>
        )}
        <div style={{ marginBottom: actions ? '16px' : 0 }}>{children}</div>
        {actions && <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '24px' }}>{actions}</div>}
      </div>
    </div>
  )
}

export const SC = ({ label, value, icon, color = '#3B82F6' }) => (
  <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
    {icon && <div style={{ backgroundColor: color + '20', padding: '12px', borderRadius: '8px', color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>}
    <div>
      <p style={{ fontSize: '12px', color: '#6B7280', margin: 0, marginBottom: '4px' }}>{label}</p>
      <p style={{ fontSize: '24px', fontWeight: 700, color: '#1F2937', margin: 0 }}>{value}</p>
    </div>
  </div>
)

export const UserPicker = ({ users, selected, onChange, label, multiple = true }) => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <div style={{ marginBottom: '16px', position: 'relative' }}>
      {label && <label style={{ display: 'block', marginBottom: '6px', fontWeight: 500, fontSize: '13px', color: '#374151' }}>{label}</label>}
      <div onClick={() => setIsOpen(!isOpen)} style={{ border: '1px solid #E5E7EB', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', minHeight: '40px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px', backgroundColor: '#FFFFFF' }}>
        {multiple && Array.isArray(selected) && selected.length > 0 ? (
          selected.map(id => {
            const user = users.find(u => u.id === id)
            return (
              <span key={id} style={{ backgroundColor: '#E0E7FF', color: '#4F46E5', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                {user?.name}
                <button onClick={e => { e.stopPropagation(); onChange(selected.filter(s => s !== id)) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>×</button>
              </span>
            )
          })
        ) : !multiple && users.find(u => u.id === selected) ? (
          <span>{users.find(u => u.id === selected).name}</span>
        ) : (
          <span style={{ color: '#9CA3AF' }}>Select {label?.toLowerCase()}</span>
        )}
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '6px', marginTop: '4px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          {users.map(user => (
            <div key={user.id} onClick={() => { if (multiple) { onChange(selected?.includes(user.id) ? selected.filter(id => id !== user.id) : [...(selected || []), user.id]) } else { onChange(user.id); setIsOpen(false) } }}
              style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: (multiple && selected?.includes(user.id)) || (!multiple && selected === user.id) ? '#E0E7FF' : 'transparent', color: '#1F2937', fontSize: '13px', borderBottom: '1px solid #E5E7EB' }}>
              <input type="checkbox" checked={multiple ? selected?.includes(user.id) : selected === user.id} onChange={() => {}} style={{ marginRight: '8px' }} />
              {user.name} ({user.email})
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export const ReqDetail = ({ request, theme }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
    <div>
      <p style={{ fontSize: '12px', color: theme.tM, fontWeight: 500, margin: 0, marginBottom: '4px' }}>Request ID</p>
      <p style={{ fontSize: '14px', color: theme.tD, fontWeight: 600, margin: 0 }}>{request.id}</p>
    </div>
    <div>
      <p style={{ fontSize: '12px', color: theme.tM, fontWeight: 500, margin: 0, marginBottom: '4px' }}>Form</p>
      <p style={{ fontSize: '14px', color: theme.tD, fontWeight: 600, margin: 0 }}>{request.form?.name}</p>
    </div>
    <div>
      <p style={{ fontSize: '12px', color: theme.tM, fontWeight: 500, margin: 0, marginBottom: '4px' }}>Requestor</p>
      <p style={{ fontSize: '14px', color: theme.tD, fontWeight: 600, margin: 0 }}>{request.requestor?.name}</p>
    </div>
    <div>
      <p style={{ fontSize: '12px', color: theme.tM, fontWeight: 500, margin: 0, marginBottom: '4px' }}>Date</p>
      <p style={{ fontSize: '14px', color: theme.tD, fontWeight: 600, margin: 0 }}>{new Date(request.createdAt).toLocaleDateString()}</p>
    </div>
    {request.data && (
      <div style={{ gridColumn: '1/-1' }}>
        <p style={{ fontSize: '12px', color: theme.tM, fontWeight: 500, margin: 0, marginBottom: '8px' }}>Submitted Data</p>
        <div style={{ backgroundColor: theme.card, padding: '12px', borderRadius: '6px' }}>
          {Object.entries(request.data).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '8px', fontSize: '13px' }}><strong>{key}:</strong> {String(value)}</div>
          ))}
        </div>
      </div>
    )}
  </div>
)

export const LiveClock = ({ theme }) => {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: theme.tM, fontSize: '12px' }}>
      <Ic name="clock" size={16} color={theme.tM} />
      <div>
        <div>{days[time.getDay()]}, {time.toLocaleDateString()}</div>
        <div style={{ fontSize: '11px' }}>{time.toLocaleTimeString()}</div>
      </div>
    </div>
  )
}

export const Toast = ({ message, type = 'success' }) => {
  const colors = { success: { bg: '#D1FAE5', color: '#065F46', icon: 'check' }, error: { bg: '#FEE2E2', color: '#991B1B', icon: 'x' }, info: { bg: '#DBEAFE', color: '#0C4A6E', icon: 'info' } }
  const config = colors[type] || colors.success
  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', backgroundColor: config.bg, color: config.color, padding: '12px 16px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px', zIndex: 999, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <Ic name={config.icon} size={16} color={config.color} />{message}
    </div>
  )
}

export const FileUpload = ({ onFile, accept = '*' }) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)
  return (
    <div onDragOver={e => { e.preventDefault(); setIsDragging(true) }} onDragLeave={() => setIsDragging(false)}
      onDrop={e => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files.length) onFile(e.dataTransfer.files[0]) }}
      onClick={() => fileInputRef.current?.click()}
      style={{ border: isDragging ? '2px solid #3B82F6' : '2px dashed #D1D5DB', borderRadius: '8px', padding: '24px', textAlign: 'center', cursor: 'pointer', backgroundColor: isDragging ? '#DBEAFE' : '#FAFAFA', transition: 'all 0.2s' }}>
      <Ic name="download" size={32} color="#6B7280" />
      <p style={{ marginTop: '8px', fontWeight: 500, color: '#374151' }}>Drag or click to upload</p>
      <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Maximum file size: 10MB</p>
      <input ref={fileInputRef} type="file" accept={accept} onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} style={{ display: 'none' }} />
    </div>
  )
}

export const ConfirmMd = ({ isOpen, title, message, onConfirm, onCancel, isDangerous = false }) => (
  <Md isOpen={isOpen} onClose={onCancel} title={title} size="sm"
    actions={[
      <Bt key="cancel" variant="ghost" onClick={onCancel}>Cancel</Bt>,
      <Bt key="confirm" variant={isDangerous ? 'danger' : 'primary'} onClick={onConfirm}>Confirm</Bt>,
    ]}>
    <p style={{ color: '#6B7280', margin: 0 }}>{message}</p>
  </Md>
)
