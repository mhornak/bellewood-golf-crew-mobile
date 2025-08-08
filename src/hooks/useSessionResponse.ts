import { useState, useCallback } from 'react'
import { sessionApi, golfUtils, type GolfSession, type ResponseStatus, type TransportType } from '../lib/api'

// Custom hook for managing user responses to golf sessions
// This hook will work identically in React Native
export const useSessionResponse = (
  session: GolfSession,
  onSessionUpdate: () => void,
  submitResponse: (sessionId: string, responseData: { userId: string; status: 'IN' | 'OUT' | 'UNDECIDED'; note?: string; transport?: TransportType }) => Promise<{ success: boolean; response?: any; error?: string }>,
  deleteResponse: (sessionId: string, userId: string) => Promise<{ success: boolean; deletedResponse?: any; error?: string }>
) => {
  const [editingNotes, setEditingNotes] = useState<{ [userId: string]: string }>({})
  const [submittingResponse, setSubmittingResponse] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Optimistic updates - local state for immediate UI updates
  const [optimisticResponses, setOptimisticResponses] = useState<{ [userId: string]: { status: ResponseStatus; note: string; transport: TransportType } }>({})

  // Get user's current response or return null
  // Check optimistic updates first, then fall back to session data
  const getUserResponse = useCallback((userId: string) => {
    if (optimisticResponses[userId]) {
      const serverResponse = golfUtils.findUserResponse(session.responses, userId)
      return {
        id: serverResponse?.id || `optimistic-${userId}`,
        status: optimisticResponses[userId].status,
        note: optimisticResponses[userId].note,
        transport: optimisticResponses[userId].transport,
        user: serverResponse?.user || { id: userId, nickname: '' },
      }
    }
    return golfUtils.findUserResponse(session.responses, userId)
  }, [session.responses, optimisticResponses])

  // Handle status click with toggle behavior - optimistic update with background API call
  const handleStatusClick = useCallback(async (
    userId: string, 
    status: ResponseStatus
  ) => {
    try {
      setSubmittingResponse(userId)
      setError(null)
      
      const currentResponse = getUserResponse(userId)
      const note = currentResponse?.note || ''
      const transport = currentResponse?.transport || 'WALKING' // Default to walking
      
      // Toggle behavior: if clicking the same status, remove the response
      const shouldRemoveResponse = currentResponse?.status === status
      
      if (shouldRemoveResponse) {
        // Remove response (toggle off)
        setOptimisticResponses(prev => {
          const newState = { ...prev }
          delete newState[userId]
          return newState
        })
        
        // Background API call to delete response
        const result = await deleteResponse(session.id, userId)
        
        if (result.success) {
          // Response is already removed by useGolfSessions.deleteResponse
          // Keep optimistic update cleared
        } else {
          // Revert optimistic update on error - restore previous response
          if (currentResponse) {
            setOptimisticResponses(prev => ({
              ...prev,
              [userId]: { status: currentResponse.status, note: currentResponse.note || '' }
            }))
          }
        }
        
        return result
      } else {
        // Set/update response (normal behavior)
        setOptimisticResponses(prev => ({
          ...prev,
          [userId]: { status, note, transport }
        }))
        
        // Background API call using the passed submitResponse function
        const result = await submitResponse(session.id, {
          userId,
          status,
          note,
          transport,
        })

        if (result.success) {
          // Session state is already updated by useGolfSessions.submitResponse
          // Clear optimistic update since server data is now correct
          setOptimisticResponses(prev => {
            const newState = { ...prev }
            delete newState[userId]
            return newState
          })
        } else {
          // Revert optimistic update on error
          setOptimisticResponses(prev => {
            const newState = { ...prev }
            delete newState[userId]
            return newState
          })
        }
        
        return result
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update response'
      setError(message)
      
      // Revert optimistic update on error
      setOptimisticResponses(prev => {
        const newState = { ...prev }
        delete newState[userId]
        return newState
      })
      
      return { success: false, error: message }
    } finally {
      setSubmittingResponse(null)
    }
  }, [session.id, getUserResponse, submitResponse, deleteResponse])

  // Handle note change - optimistic update with background save
  const handleNoteChange = useCallback(async (userId: string, note: string) => {
    try {
      setError(null)
      
      const currentResponse = getUserResponse(userId)
      const status = currentResponse?.status || 'UNDECIDED'
      const transport = currentResponse?.transport || 'WALKING'
      const trimmedNote = note.trim()
      
      // Optimistic update - immediate UI change
      setOptimisticResponses(prev => ({
        ...prev,
        [userId]: { status, note: trimmedNote, transport }
      }))
      
      // Background API call using the passed submitResponse function
      const result = await submitResponse(session.id, {
        userId,
        status,
        note: trimmedNote,
        transport,
      })

      if (result.success) {
        // Session state is already updated by useGolfSessions.submitResponse
        // Clear optimistic update since server data is now correct
        setOptimisticResponses(prev => {
          const newState = { ...prev }
          delete newState[userId]
          return newState
        })
      }
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update note'
      setError(message)
      
      // Revert optimistic update on error
      setOptimisticResponses(prev => {
        const newState = { ...prev }
        delete newState[userId]
        return newState
      })
      
      return { success: false, error: message }
    }
  }, [session.id, getUserResponse])

  // Handle transport change - optimistic update with background save
  const handleTransportChange = useCallback(async (userId: string, transport: TransportType) => {
    try {
      setError(null)
      
      const currentResponse = getUserResponse(userId)
      const status = currentResponse?.status || 'UNDECIDED'
      const note = currentResponse?.note || ''
      
      // Optimistic update - immediate UI change
      setOptimisticResponses(prev => ({
        ...prev,
        [userId]: { status, note, transport }
      }))
      
      // Background API call using the passed submitResponse function
      const result = await submitResponse(session.id, {
        userId,
        status,
        note,
        transport,
      })

      if (result.success) {
        // Session state is already updated by useGolfSessions.submitResponse
        // Delay clearing optimistic update to ensure server data has propagated
        setTimeout(() => {
          setOptimisticResponses(prev => {
            const newState = { ...prev }
            delete newState[userId]
            return newState
          })
        }, 100)
      } else {
        // Revert optimistic update on error
        setOptimisticResponses(prev => {
          const newState = { ...prev }
          delete newState[userId]
          return newState
        })
      }
      
      return result
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update transport'
      setError(message)
      
      // Revert optimistic update on error
      setOptimisticResponses(prev => {
        const newState = { ...prev }
        delete newState[userId]
        return newState
      })
      
      return { success: false, error: message }
    }
  }, [session.id, getUserResponse, submitResponse])

  // Handle note key press (Enter to save)
  const handleNoteKeyPress = useCallback((
    e: React.KeyboardEvent, 
    userId: string
  ) => {
    if (e.key === 'Enter') {
      const note = editingNotes[userId] || ''
      handleNoteChange(userId, note)
      setEditingNotes(prev => ({ ...prev, [userId]: note }))
    }
  }, [editingNotes, handleNoteChange])

  // Handle note blur (save when leaving field)
  const handleNoteBlur = useCallback((userId: string) => {
    const note = editingNotes[userId] || ''
    handleNoteChange(userId, note)
  }, [editingNotes, handleNoteChange])

  // Update editing note state
  const updateEditingNote = useCallback((userId: string, note: string) => {
    setEditingNotes(prev => ({ ...prev, [userId]: note }))
  }, [])

  // Get current note value (editing or saved)
  const getCurrentNote = useCallback((userId: string): string => {
    if (editingNotes[userId] !== undefined) {
      return editingNotes[userId]
    }
    const userResponse = getUserResponse(userId)
    return userResponse?.note || ''
  }, [editingNotes, getUserResponse])

  // Get response statistics including optimistic updates
  const getResponseStats = useCallback(() => {
    // Create a modified responses array that includes optimistic updates
    const responsesWithOptimistic = session.responses.map(response => {
      if (optimisticResponses[response.user.id]) {
        return {
          ...response,
          status: optimisticResponses[response.user.id].status,
          note: optimisticResponses[response.user.id].note,
          transport: optimisticResponses[response.user.id].transport,
        }
      }
      return response
    })
    
    // Handle optimistic responses for users who don't have server responses yet
    Object.keys(optimisticResponses).forEach(userId => {
      const hasServerResponse = session.responses.some(r => r.user.id === userId)
      if (!hasServerResponse) {
        // Create a mock response for counting purposes
        responsesWithOptimistic.push({
          id: `optimistic-${userId}`,
          status: optimisticResponses[userId].status,
          note: optimisticResponses[userId].note,
          user: { id: userId, nickname: '' }, // minimal user data for counting
        })
      }
    })
    
    return golfUtils.getResponseCounts(responsesWithOptimistic)
  }, [session.responses, optimisticResponses])

  // Get grouping text
  const getGroupingText = useCallback(() => {
    const { inCount } = getResponseStats()
    return golfUtils.getGroupingText(inCount)
  }, [getResponseStats])

  // Check if user is currently submitting a response
  const isSubmitting = useCallback((userId: string) => {
    return submittingResponse === userId
  }, [submittingResponse])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // Data
    editingNotes,
    submittingResponse,
    error,
    
    // Computed data
    responseStats: getResponseStats(),
    groupingText: getGroupingText(),
    
    // Actions
    getUserResponse,
    handleStatusClick,
    handleNoteChange,
    handleTransportChange,
    handleNoteKeyPress,
    handleNoteBlur,
    updateEditingNote,
    getCurrentNote,
    isSubmitting,
    clearError,
  }
}