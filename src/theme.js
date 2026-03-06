export const THEMES = {
  blue: { name: 'Blue', p: '#3B82F6', pL: '#DBEAFE', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#1F2937', tM: '#6B7280', tL: '#D1D5DB', bg: '#FFFFFF', card: '#F9FAFB', bdr: '#E5E7EB' },
  purple: { name: 'Purple', p: '#8B5CF6', pL: '#EDE9FE', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#1F2937', tM: '#6B7280', tL: '#D1D5DB', bg: '#FFFFFF', card: '#F9FAFB', bdr: '#E5E7EB' },
  green: { name: 'Green', p: '#10B981', pL: '#D1FAE5', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#1F2937', tM: '#6B7280', tL: '#D1D5DB', bg: '#FFFFFF', card: '#F9FAFB', bdr: '#E5E7EB' },
  red: { name: 'Red', p: '#EF4444', pL: '#FEE2E2', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#1F2937', tM: '#6B7280', tL: '#D1D5DB', bg: '#FFFFFF', card: '#F9FAFB', bdr: '#E5E7EB' },
  orange: { name: 'Orange', p: '#F97316', pL: '#FFEDD5', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#1F2937', tM: '#6B7280', tL: '#D1D5DB', bg: '#FFFFFF', card: '#F9FAFB', bdr: '#E5E7EB' },
  teal: { name: 'Teal', p: '#14B8A6', pL: '#CCFBF1', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#1F2937', tM: '#6B7280', tL: '#D1D5DB', bg: '#FFFFFF', card: '#F9FAFB', bdr: '#E5E7EB' },
  indigo: { name: 'Indigo', p: '#6366F1', pL: '#E0E7FF', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#1F2937', tM: '#6B7280', tL: '#D1D5DB', bg: '#FFFFFF', card: '#F9FAFB', bdr: '#E5E7EB' },
  pink: { name: 'Pink', p: '#EC4899', pL: '#FCE7F3', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#1F2937', tM: '#6B7280', tL: '#D1D5DB', bg: '#FFFFFF', card: '#F9FAFB', bdr: '#E5E7EB' },
}

export const DARK_THEMES = {
  blue: { name: 'Blue', p: '#3B82F6', pL: '#1E40AF', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#F3F4F6', tM: '#D1D5DB', tL: '#6B7280', bg: '#111827', card: '#1F2937', bdr: '#374151' },
  purple: { name: 'Purple', p: '#8B5CF6', pL: '#6D28D9', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#F3F4F6', tM: '#D1D5DB', tL: '#6B7280', bg: '#111827', card: '#1F2937', bdr: '#374151' },
  green: { name: 'Green', p: '#10B981', pL: '#047857', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#F3F4F6', tM: '#D1D5DB', tL: '#6B7280', bg: '#111827', card: '#1F2937', bdr: '#374151' },
  red: { name: 'Red', p: '#EF4444', pL: '#DC2626', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#F3F4F6', tM: '#D1D5DB', tL: '#6B7280', bg: '#111827', card: '#1F2937', bdr: '#374151' },
  orange: { name: 'Orange', p: '#F97316', pL: '#EA580C', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#F3F4F6', tM: '#D1D5DB', tL: '#6B7280', bg: '#111827', card: '#1F2937', bdr: '#374151' },
  teal: { name: 'Teal', p: '#14B8A6', pL: '#0D9488', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#F3F4F6', tM: '#D1D5DB', tL: '#6B7280', bg: '#111827', card: '#1F2937', bdr: '#374151' },
  indigo: { name: 'Indigo', p: '#6366F1', pL: '#4F46E5', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#F3F4F6', tM: '#D1D5DB', tL: '#6B7280', bg: '#111827', card: '#1F2937', bdr: '#374151' },
  pink: { name: 'Pink', p: '#EC4899', pL: '#DB2777', acc: '#10B981', warn: '#F59E0B', dng: '#EF4444', tD: '#F3F4F6', tM: '#D1D5DB', tL: '#6B7280', bg: '#111827', card: '#1F2937', bdr: '#374151' },
}

export const ROLE_COLORS = {
  super_admin: '#DC2626',
  admin: '#7C3AED',
  approver: '#2563EB',
  requestor: '#059669',
  auditor: '#D97706',
}

export const CATEGORIES = {
  waiver: { name: 'Fee Waiver', icon: 'dollar', color: '#8B5CF6' },
  salary_advance: { name: 'Salary Advance', icon: 'zap', color: '#F59E0B' },
  exception: { name: 'Policy Exception', icon: 'shield', color: '#EF4444' },
  reimbursement: { name: 'Reimbursement', icon: 'dollar', color: '#10B981' },
  access: { name: 'Access Request', icon: 'lock', color: '#3B82F6' },
  custom: { name: 'Custom', icon: 'layers', color: '#64748B' },
}

export const DEPARTMENTS = ['C2D','HR','Lending','Insurance','Operations','Finance','Compliance','Technology','Marketing','Legal','Other']

export const ROLES = [
  { id: 'super_admin', name: 'Super Admin', color: ROLE_COLORS.super_admin },
  { id: 'admin', name: 'Admin', color: ROLE_COLORS.admin },
  { id: 'approver', name: 'Approver', color: ROLE_COLORS.approver },
  { id: 'requestor', name: 'Requestor', color: ROLE_COLORS.requestor },
  { id: 'auditor', name: 'Auditor', color: ROLE_COLORS.auditor },
]

export const getTheme = (isDark, theme) => {
  return isDark ? DARK_THEMES[theme] || DARK_THEMES.blue : THEMES[theme] || THEMES.blue
}

export const formatAmount = (amount) => {
  if (!amount) return '₹0'
  const num = parseInt(amount)
  if (num >= 10000000) return '₹' + (num / 10000000).toFixed(2) + 'Cr'
  else if (num >= 100000) return '₹' + (num / 100000).toFixed(2) + 'L'
  else if (num >= 1000) return '₹' + (num / 1000).toFixed(2) + 'K'
  return '₹' + num
}

export const parseAmount = (str) => {
  if (!str) return 0
  const match = str.match(/₹([\d.]+)([KLCr]+)/)
  if (!match) return parseInt(str) || 0
  const num = parseFloat(match[1])
  const unit = match[2]
  if (unit === 'Cr') return Math.round(num * 10000000)
  if (unit === 'L') return Math.round(num * 100000)
  if (unit === 'K') return Math.round(num * 1000)
  return num
}
