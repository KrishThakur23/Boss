import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../config/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        
        if (currentSession) {
          setSession(currentSession)
          setUser(currentSession.user)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Sign up function
  const signUp = async (email, password, userData) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      })
      
      if (error) {
        return { error }
      }

      return { data, error: null }
    } catch (error) {
      return { error }
    }
  }

  // Sign in function
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) {
        return { error }
      }

      return { data, error: null }
    } catch (error) {
      return { error }
    }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      })
      
      if (error) {
        return { error }
      }

      return { data, error: null }
    } catch (error) {
      return { error }
    }
  }

  // Reset password function
  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      
      if (error) {
        return { error }
      }

      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  // Refresh session function to handle JWT expiration
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('Error refreshing session:', error)
        return { error }
      }

      if (data.session) {
        setSession(data.session)
        setUser(data.session.user)
      }

      return { data, error: null }
    } catch (error) {
      console.error('Error refreshing session:', error)
      return { error }
    }
  }

  // Check if session is valid and refresh if needed
  const ensureValidSession = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      
      if (!currentSession) {
        return { error: { message: 'No active session' } }
      }

      // Check if token is expired (with 5 minute buffer)
      const now = Math.floor(Date.now() / 1000)
      const expiresAt = currentSession.expires_at
      
      if (expiresAt && (expiresAt - now) < 300) { // 5 minutes buffer
        console.log('🔄 Token expiring soon, refreshing...')
        return await refreshSession()
      }

      return { data: { session: currentSession }, error: null }
    } catch (error) {
      console.error('Error ensuring valid session:', error)
      return { error }
    }
  }

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signInWithGoogle,
    resetPassword,
    refreshSession,
    ensureValidSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext
