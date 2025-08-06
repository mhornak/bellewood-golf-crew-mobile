import { useState, useEffect } from 'react'
import { userApi, type User } from '../lib/api'

// Custom hook for user data management
// This hook will work identically in React Native
export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await userApi.getAll()
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create new user
  const createUser = async (userData: { 
    name: string
    nickname: string
    phone?: string 
  }) => {
    try {
      const newUser = await userApi.create(userData)
      setUsers(prev => [...prev, newUser])
      return { success: true, user: newUser }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create user'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Update existing user
  const updateUser = async (id: string, userData: {
    name: string
    nickname: string
    phone?: string
  }) => {
    try {
      const updatedUser = await userApi.update(id, userData)
      setUsers(prev => prev.map(user => 
        user.id === id ? updatedUser : user
      ))
      return { success: true, user: updatedUser }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update user'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Delete user
  const deleteUser = async (id: string) => {
    try {
      await userApi.delete(id)
      setUsers(prev => prev.filter(user => user.id !== id))
      return { success: true }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete user'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Get user by ID
  const getUserById = (id: string): User | undefined => {
    return users.find(user => user.id === id)
  }

  // Clear error
  const clearError = () => setError(null)

  // Initial fetch
  useEffect(() => {
    fetchUsers()
  }, [])

  return {
    // Data
    users,
    loading,
    error,
    
    // Actions
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    getUserById,
    clearError,
  }
}