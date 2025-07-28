// Custom hooks for user management and permissions
'use client'

import { useEffect, useState, useCallback } from 'react'

export type UserRole = 'FREE' | 'PREMIUM' | 'ADMIN'

export interface User {
  id: string
  email: string
  name?: string
  image?: string
  role: UserRole
}

export interface UsageStats {
  generationsCount: number
  tokensUsed: number
  cost: number
  remainingGenerations?: number
}

export interface Subscription {
  id: string
  status: 'active' | 'inactive' | 'cancelled'
  plan: string
  expiresAt?: string
}

// Main user hook - simplified for current architecture
export const useUser = () => {
  const [user, setUser] = useState<User | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // For now, simulate a logged-in user or get from localStorage
    const storedUser = localStorage.getItem('kalam-ai-user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Failed to parse stored user:', error)
      }
    } else {
      // Default guest user
      setUser({
        id: 'guest',
        email: 'guest@example.com',
        name: 'Guest User',
        role: 'FREE'
      })
    }
    setIsLoading(false)
  }, [])
  
  return {
    user,
    isAuthenticated: user?.id !== 'guest',
    isLoading,
    role: user?.role
  }
}

// Permission checking hook
export const usePermissions = () => {
  const { role } = useUser()
  
  return {
    canAccessPremium: role === 'PREMIUM' || role === 'ADMIN',
    canAccessAdmin: role === 'ADMIN',
    isAdmin: role === 'ADMIN',
    isPremium: role === 'PREMIUM',
    isFree: role === 'FREE' || !role
  }
}

// Usage tracking hook
export const useUsageStats = () => {
  const { user } = useUser()
  const [stats, setStats] = useState<UsageStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/user/usage-stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch usage stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  const refetchStats = async () => {
    if (!user) return
    
    try {
      const response = await fetch('/api/user/usage-stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Failed to fetch usage stats:', error)
    }
  }

  return { stats, loading, refetch: refetchStats }
}

// Rate limiting hook
export const useRateLimit = () => {
  const { user, role } = useUser()
  const [canGenerate, setCanGenerate] = useState(true)
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null)

  const checkRateLimit = useCallback(async () => {
    if (!user) return false

    try {
      const response = await fetch('/api/user/rate-limit-check')
      const data = await response.json()
      
      setCanGenerate(data.allowed)
      setRemainingRequests(data.remaining)
      
      return data.allowed
    } catch (error) {
      console.error('Rate limit check failed:', error)
      return false
    }
  }, [user])

  useEffect(() => {
    if (user) {
      checkRateLimit()
    }
  }, [user, checkRateLimit])

  const limits: Record<UserRole, number> = {
    FREE: 10,
    PREMIUM: 100,
    ADMIN: 1000
  }

  return {
    canGenerate,
    remainingRequests,
    checkRateLimit,
    limits: limits[role || 'FREE']
  }
}

// Subscription management hook
export const useSubscription = () => {
  const { user } = useUser()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }

    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/user/subscription')
        if (response.ok) {
          const data = await response.json()
          setSubscription(data)
        }
      } catch (error) {
        console.error('Failed to fetch subscription:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  const upgradeToPremium = async () => {
    try {
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID })
      })
      
      const { url } = await response.json()
      window.location.href = url
    } catch (error) {
      console.error('Failed to create checkout session:', error)
    }
  }

  return {
    subscription,
    loading,
    upgradeToPremium,
    isPremium: subscription?.status === 'active'
  }
}

// Feature flags hook
export const useFeatureFlags = () => {
  const { role } = useUser()
  
  // Define feature availability based on user role
  const features = {
    // Free tier features
    basicGeneration: true,
    basicTemplates: true,
    
    // Premium features
    advancedTemplates: role === 'PREMIUM' || role === 'ADMIN',
    unlimitedGenerations: role === 'PREMIUM' || role === 'ADMIN',
    prioritySupport: role === 'PREMIUM' || role === 'ADMIN',
    collaboration: role === 'PREMIUM' || role === 'ADMIN',
    apiAccess: role === 'PREMIUM' || role === 'ADMIN',
    customModels: role === 'PREMIUM' || role === 'ADMIN',
    
    // Admin features
    userManagement: role === 'ADMIN',
    analytics: role === 'ADMIN',
    systemSettings: role === 'ADMIN',
    auditLogs: role === 'ADMIN'
  }

  return features
}

// Error handling hook for API calls
export const useApiError = () => {
  const [error, setError] = useState<string | null>(null)

  const handleApiCall = async <T>(
    apiCall: () => Promise<T>,
    errorMessage = 'An error occurred'
  ): Promise<T | null> => {
    try {
      setError(null)
      return await apiCall()
    } catch (err: unknown) {
      const error = err as { message?: string; response?: { data?: { error?: string } } }
      const message = error.response?.data?.error || error.message || errorMessage
      setError(message)
      return null
    }
  }

  const clearError = () => setError(null)

  return { error, handleApiCall, clearError }
}
