import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from '../lib/api'

interface UserContextType {
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  isAdmin: boolean
  loading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Load saved user from localStorage on mount
  useEffect(() => {
    const savedUserId = localStorage.getItem('currentUserId')
    if (savedUserId) {
      // Fetch user details by ID
      fetch(`/api/users/${savedUserId}`)
        .then(res => res.json())
        .then(user => {
          setCurrentUser(user)
        })
        .catch(error => {
          console.error('Failed to load saved user:', error)
          localStorage.removeItem('currentUserId')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // Save user ID to localStorage when user changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUserId', currentUser.id)
    } else {
      localStorage.removeItem('currentUserId')
    }
  }, [currentUser])

  const isAdmin = currentUser?.isAdmin || false

  return (
    <UserContext.Provider value={{
      currentUser,
      setCurrentUser,
      isAdmin,
      loading
    }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}