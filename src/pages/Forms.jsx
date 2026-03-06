import { useState, useEffect } from 'react'
import { Ic } from '../components/Icons'
import { Cd, Bt, Ip, Sl, Md, ConfirmMd, UserPicker } from '../components/UI'
import { CATEGORIES } from '../theme'
import api from '../services/api'

export default function Forms({ theme, isDark }) {
  const [forms, setForms] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBuilder, setShowBuilder] = useState(false)
  const [builderStep, setBuilderStep] = useState(1)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [allUsers, setAllUsers] = useState([])

  const [formData, setFormData] = useState({
    category: '',
    name: '',
    business: '',
    description: '',
    fields: [{ id: '1', name: '', type: 'text', required: false, options: [] }],
    amountLogic: 'none',
    amountTable: [],
    requestors: [],
    approvers: [],
    approvalType: 'sequential',
    postApprovalAction: 'none',
    rejectionConfig: 'none',
    limitBasedLevels: [],
    slaEnabled: false,
    slaLevels: [],
  })

  useEffect(() => {
    loadForms()
    loadUsers()
  }, [])

  const loadForms = async () => {
    try {
      const data = await api.getForms()
      setForms(data)
    } catch (error) {
      console.error('Error loading forms:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await api.getUsers()
      setAllUsers(data)
    } catch (error) {
      console.error('Error loading users:', error)
    }
  }

  const handleCreateForm = async () => {
    if (!formData.category || !formData.name) {
      alert('Please fill all required fields')
      return
    }

    try {
      await api.createForm(formData)
      loadForms()
      setShowBuilder(false)
      resetFormData()
      setBuilderStep(1)
    } catch (error) {
      console.error('Error creating form:', error)
      alert(error.message)
    }
  }

  const handlePauseForm = async (formId) => {
    try {
      await api.pauseForm(formId)
      loadForms()
    } catch (error) {
      console.error('Error pausing form:', error)
    }
  }

  const handleResumeForm = async (formId) => {
    try {
      await api.resumeForm(formId)
      loadForms()
    } catch (error) {
      console.error('Error resuming form:', error)
    }
  }

  const handleDeleteForm = async (formId) => {
    try {
      await api.deleteForm(formId)
      loadForms()
      setConfirmDelete(null)
    } catch (error) {
      console.error('Error deleting form:', error)
    }
  }

  const resetFormData = () => {
    setFormData({
      category: '',
      name: '',
      business: '',
      description: '',
      fields: [{ id: '1', name: '', type: 'text', required: false, options: [] }],
      amountLogic: 'none',
      amountTable: [],
      requestors: [],
      approvers: [],
      approvalType: 'sequential',
      postApprovalAction: 'none',
      rejectionConfig: 'none',
      limitBasedLevels: [],
      slaEnabled: false,
      slaLevels: [],
    })
  }

  const addField = () => {
    const newId = Math.max(...formData.fields.map(f => parseInt(f.id)), 0) + 1
    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, { id: String(newId), name: '', type: 'text', required: false, options: [] }],
    }))
  }

  const removeField = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(f => f.id !== fieldId),
    }))
  }

  const updateField = (fieldId, key, value) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(f => (f.id === fieldId ? { ...f, [key]: value } : f)),
    }))
  }

  const addLimitLevel = () => {
    setFormData(prev => ({
      ...prev,
      limitBasedLevels: [
        ...prev.limitBasedLevels,
        { id: Date.now(), minAmount: 0, maxAmount: 100000, approver: '' },
      ],
    }))
  }

  const removeLimitLevel = (levelId) => {
    setFormData(prev => ({
      ...prev,
      limitBasedLevels: prev.limitBasedLevels.filter(l => l.id !== levelId),
    }))
  }

  const updateLimitLevel = (levelId, key, value) => {
    setFormData(prev => ({
      ...prev,
      limitBasedLevels: prev.limitBasedLevels.map(l =>
        l.id === levelId ? { ...l, [key]: value } : l
      ),
    }))
  }

  if (loading) {
    return <div style={{ color: theme.tM }}>Loading forms...</div>
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: theme.tD, margin: 0 }}>
          Forms ({forms.length})
        </h2>
        <Bt onClick={() => setShowBuilder(true)}>
          <Ic name="plus" size={16} color="white" style={{ marginRight: '8px' }} />
          Create Form
        </Bt>
      </div>

      {/* Forms Grid */}
      {forms.length === 0 ? (
        <Cd style={{ textAlign: 'center', padding: '48px' }}>
          <p style={{ color: theme.tM, marginBottom: '16px' }}>No forms created yet</p>
          <Bt onClick={() => setShowBuilder(true)}>Create Your First Form</Bt>
        </Cd>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {forms.map(form => {
            const category = CATEGORIES[form.category]

            return (
              <Cd key={form.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: category?.color + '20',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: category?.color,
                    }}
                  >
                    <Ic name={category?.icon} size={20} color={category?.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: theme.tD, margin: 0 }}>
                      {form.name}
                    </p>
                    <p style={{ fontSize: '11px', color: theme.tM, margin: 0 }}>
                      {category?.name}
                    </p>
                  </div>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4
