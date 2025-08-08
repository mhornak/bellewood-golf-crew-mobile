import { useState, useEffect } from 'react'
import { sessionApi, golfUtils, type GolfSession } from '../lib/api'

// Custom hook for golf session data management
// This hook will work identically in React Native
export const useGolfSessions = () => {
  const [sessions, setSessions] = useState<GolfSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all sessions
  const fetchSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await sessionApi.getAll()
      setSessions(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sessions')
      console.error('Error fetching sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create new session
  const createSession = async (sessionData: {
    title: string
    date: string
    description?: string
    createdById: string
  }) => {
    try {
      const newSession = await sessionApi.create(sessionData)
      setSessions(prev => [...prev, newSession])
      return { success: true, session: newSession }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create session'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Update existing session
  const updateSession = async (id: string, sessionData: {
    title: string
    date: string
    description?: string
    createdById: string
  }) => {
    try {
      const updatedSession = await sessionApi.update(id, sessionData)
      setSessions(prev => prev.map(session => 
        session.id === id ? updatedSession : session
      ))
      return { success: true, session: updatedSession }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update session'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Delete session
  const deleteSession = async (id: string) => {
    try {
      const result = await sessionApi.delete(id)
      setSessions(prev => prev.filter(session => session.id !== id))
      return { success: true, deletedResponses: result.deletedResponses }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete session'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Submit response to session
  const submitResponse = async (sessionId: string, responseData: {
    userId: string
    status: 'IN' | 'OUT' | 'UNDECIDED'
    note?: string
    transport?: 'WALKING' | 'RIDING'
  }) => {
    try {
      const response = await sessionApi.submitResponse(sessionId, responseData)
      
      // Update the session in local state
      setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          // Remove existing response from this user if any
          const filteredResponses = session.responses.filter(r => r.user.id !== responseData.userId)
          // Add the new response
          return {
            ...session,
            responses: [...filteredResponses, response]
          }
        }
        return session
      }))
      
      return { success: true, response }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit response'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Remove user response from session
  const deleteResponse = async (sessionId: string, userId: string) => {
    try {
      const result = await sessionApi.deleteResponse(sessionId, userId)
      
      // Update the session in local state - remove the user's response
      setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            responses: session.responses.filter(r => r.user.id !== userId)
          }
        }
        return session
      }))
      
      return { success: true, deletedResponse: result.deletedResponse }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete response'
      setError(message)
      return { success: false, error: message }
    }
  }

  // Get session by ID
  const getSessionById = (id: string): GolfSession | undefined => {
    return sessions.find(session => session.id === id)
  }

  // Get sorted sessions (upcoming first)
  const getSortedSessions = (): GolfSession[] => {
    return golfUtils.sortSessionsByDate(sessions)
  }

  // Get upcoming session index
  const getUpcomingSessionIndex = (): number => {
    const sortedSessions = getSortedSessions()
    return golfUtils.findUpcomingSessionIndex(sortedSessions)
  }

  // Get session statistics
  const getSessionStats = (sessionId: string) => {
    const session = getSessionById(sessionId)
    if (!session) return null
    
    return golfUtils.getResponseCounts(session.responses)
  }

  // Clear error
  const clearError = () => setError(null)

  // Initial fetch
  useEffect(() => {
    fetchSessions()
  }, [])

  return {
    // Data
    sessions,
    loading,
    error,
    
    // Computed data
    sortedSessions: getSortedSessions(),
    upcomingSessionIndex: getUpcomingSessionIndex(),
    
    // Actions
    fetchSessions,
    createSession,
    updateSession,
    deleteSession,
    submitResponse,
    deleteResponse,
    getSessionById,
    getSortedSessions,
    getUpcomingSessionIndex,
    getSessionStats,
    clearError,
  }
}