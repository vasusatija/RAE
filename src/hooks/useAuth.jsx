import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../services/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.getCurrentUser()
        .then(data => {
          setUser(data.user)
          api.setToken(token)
        })
        .catch(err => {
          localStorage.removeItem('token')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = useCallback(async (email, password) => {
    try {
      const data = await api.login(email, password)
      api.setToken(data.token)
      setUser(data.user)
      showToast('Login successful')
      return data
    } catch (error) {
      showToast(error.message || 'Login failed', 'error')
      throw error
    }
  }, [showToast])

  const logout = useCallback(() => {
    api.setToken(null)
    setUser(null)
    localStorage.removeItem('token')
  }, [])

  const value = {
    user, loading, toast, showToast, login, logout,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
