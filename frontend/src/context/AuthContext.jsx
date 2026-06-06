import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../utils/supabase'
import api from '../utils/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchProfile()
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchProfile() {
    try {
      const { data } = await api.get('/auth/me')
      setUser(data.user)
    } catch {
      setUser(null)
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('token', data.token)
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    setUser(data.user)
    return data.user
  }

  async function logout() {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, fetchProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
