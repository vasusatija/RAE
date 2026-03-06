const API_BASE_URL = '/api'

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL
    this.token = localStorage.getItem('token')
  }

  setToken(token) {
    this.token = token
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }

  getToken() {
    return this.token || localStorage.getItem('token')
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = { 'Content-Type': 'application/json', ...options.headers }
    const token = this.getToken()
    if (token) headers.Authorization = `Bearer ${token}`

    try {
      const response = await fetch(url, { ...options, headers })
      if (response.status === 401) {
        this.setToken(null)
        window.location.href = '/login'
        throw new Error('Unauthorized')
      }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'API Error')
      return data
    } catch (error) {
      console.error('API Error:', error)
      throw error
    }
  }

  async get(endpoint) { return this.request(endpoint, { method: 'GET' }) }
  async post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }) }
  async put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }) }
  async delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }) }

  async uploadFile(endpoint, file) {
    const token = this.getToken()
    const headers = {}
    if (token) headers.Authorization = `Bearer ${token}`
    const formData = new FormData()
    formData.append('file', file)
    return fetch(`${this.baseURL}${endpoint}`, { method: 'POST', headers, body: formData })
      .then(res => {
        if (res.status === 401) { this.setToken(null); throw new Error('Unauthorized') }
        return res.json()
      })
  }

  // Auth
  login(email, password) { return this.post('/auth/login', { email, password }) }
  requestAccess(data) { return this.post('/auth/request-access', data) }
  getCurrentUser() { return this.get('/auth/me') }

  // Forms
  getForms() { return this.get('/forms') }
  getForm(id) { return this.get(`/forms/${id}`) }
  createForm(data) { return this.post('/forms', data) }
  updateForm(id, data) { return this.put(`/forms/${id}`, data) }
  deleteForm(id) { return this.delete(`/forms/${id}`) }
  pauseForm(id) { return this.put(`/forms/${id}/pause`, {}) }
  resumeForm(id) { return this.put(`/forms/${id}/resume`, {}) }
  generateFormWithAI(description) { return this.post('/forms/generate', { description }) }

  // Requests
  getRequests(filters = {}) {
    const query = new URLSearchParams(filters).toString()
    return this.get(`/requests${query ? '?' + query : ''}`)
  }
  getRequest(id) { return this.get(`/requests/${id}`) }
  submitRequest(data) { return this.post('/requests', data) }
  approveRequest(id, data = {}) { return this.put(`/requests/${id}/approve`, data) }
  rejectRequest(id, data = {}) { return this.put(`/requests/${id}/reject`, data) }
  getPendingRequests() { return this.get('/requests?status=pending') }

  // Users
  getUsers() { return this.get('/users') }
  getUser(id) { return this.get(`/users/${id}`) }
  changeUserRole(id, role) { return this.put(`/users/${id}/role`, { role }) }
  revokeUser(id) { return this.put(`/users/${id}/revoke`, {}) }
  reactivateUser(id) { return this.put(`/users/${id}/reactivate`, {}) }

  // Access requests
  getAccessRequests() { return this.get('/access-requests') }
  approveAccessRequest(id, formPermissions = null) { return this.put(`/access-requests/${id}/approve`, { formPermissions }) }
  rejectAccessRequest(id) { return this.put(`/access-requests/${id}/reject`, {}) }

  // Form approvals
  getFormApprovals() { return this.get('/form-approvals') }
  approveForm(id) { return this.put(`/form-approvals/${id}/approve`, {}) }
  rejectForm(id) { return this.put(`/form-approvals/${id}/reject`, {}) }

  // Analytics
  getAnalytics(formId) { return this.get(`/analytics?formId=${formId}`) }

  // Audit
  getAuditTrail(filters = {}) {
    const query = new URLSearchParams(filters).toString()
    return this.get(`/audit${query ? '?' + query : ''}`)
  }

  // Settings
  getSettings() { return this.get('/settings') }
  updateSettings(data) { return this.put('/settings', data) }
  uploadLogo(file) { return this.uploadFile('/settings/logo', file) }
}

export const api = new ApiClient()
export default api
