// Platform-agnostic API utilities for golf scheduler
// These functions work identically in React Native
// Includes intelligent retry logic for Aurora Serverless cold starts

export interface User {
  id: string
  name: string
  nickname: string
  phone?: string
  isAdmin: boolean
  createdAt: string
  updatedAt: string
}

export interface GolfSession {
  id: string
  title: string
  date: string
  description?: string
  createdBy: {
    id: string
    nickname: string
  }
  responses: Array<{
    id: string
    status: 'IN' | 'OUT' | 'UNDECIDED'
    note?: string
    user: {
      id: string
      nickname: string
    }
  }>
  sessionTags?: Array<{
    id: string
    sessionId: string
    tagId: string
    createdAt: string
    tag: {
      id: string
      name: string
      color?: string
    }
  }>
}

export type ResponseStatus = 'IN' | 'OUT' | 'UNDECIDED'

// API Base URL - can be environment specific
const getApiBaseUrl = () => {
  // Mobile app connects to deployed AWS Amplify backend
  return 'https://main.d2m423juctwnaf.amplifyapp.com'
}

// Retry configuration for Aurora Serverless cold starts
const RETRY_CONFIG = {
  maxRetries: 4,
  baseDelayMs: 1500,
  maxDelayMs: 15000,
  backoffMultiplier: 2,
  // Errors that indicate Aurora is starting up or network issues
  retryableErrors: [
    'Network request failed',
    'fetch failed', 
    'timeout',
    'ECONNRESET',
    'ETIMEDOUT',
    'Failed to fetch',
    'NetworkError',
    'TypeError: fetch failed',
    'TypeError: Network request failed',
    'Load failed',
    'Connection failed',
    'Request timeout',
    'Service Unavailable'
  ]
}

// Sleep utility for delays
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms))

// Check if error is likely due to Aurora cold start
const isRetryableError = (error: any, response?: Response): boolean => {
  const errorMessage = error?.message?.toLowerCase() || ''
  
  // Check for network/fetch errors
  const hasRetryableMessage = RETRY_CONFIG.retryableErrors.some(retryableError => 
    errorMessage.includes(retryableError.toLowerCase())
  )
  
  // Check for HTTP status codes that indicate server issues (not client errors)
  const hasRetryableStatus = response && (
    response.status === 502 || // Bad Gateway
    response.status === 503 || // Service Unavailable  
    response.status === 504 || // Gateway Timeout
    response.status === 0      // Network error
  )
  
  return hasRetryableMessage || hasRetryableStatus || false
}

// Calculate delay with exponential backoff
const calculateDelay = (attempt: number): number => {
  const delay = RETRY_CONFIG.baseDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt)
  return Math.min(delay, RETRY_CONFIG.maxDelayMs)
}

// Generic API request handler with intelligent retry
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${getApiBaseUrl()}${endpoint}`
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  }

  let lastError: any
  let lastResponse: Response | undefined
  
  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        const delay = calculateDelay(attempt - 1)
        console.log(`⏳ Retrying in ${delay}ms (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries + 1})...`)
        await sleep(delay)
      }
      
      console.log(`🌐 Making API request to: ${url} (attempt ${attempt + 1})`)
      console.log('📋 Request options:', defaultOptions)
      
      const response = await fetch(url, defaultOptions)
      lastResponse = response
      console.log('📡 Response status:', response.status)
      console.log('📡 Response headers:', response.headers)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ API Error:', errorData)
        const error = new Error(errorData.error || `HTTP ${response.status}`)
        
        // Check if this HTTP error is retryable (server issues)
        if (!isRetryableError(error, response) || attempt === RETRY_CONFIG.maxRetries) {
          throw error
        }
        
        console.log('🔄 Server error appears retryable, will retry...')
        lastError = error
        continue
      }

      const data = await response.json()
      if (attempt > 0) {
        console.log(`✅ API Success after ${attempt + 1} attempts:`, endpoint)
      } else {
        console.log('✅ API Success:', endpoint)
      }
      return data
      
    } catch (error) {
      lastError = error
      console.error(`🚨 Network Error (attempt ${attempt + 1}):`, error)
      
      // Don't retry if this isn't a retryable error or we're at max retries
      if (!isRetryableError(error, lastResponse) || attempt === RETRY_CONFIG.maxRetries) {
        break
      }
      
      console.log('🔄 Error appears to be Aurora cold start, will retry...')
    }
  }
  
  console.error('💥 All retry attempts failed')
  throw lastError
}

// User API functions
export const userApi = {
  // Get all users
  getAll: (): Promise<User[]> => 
    apiRequest<User[]>('/api/users'),

  // Get single user
  getById: (id: string): Promise<User> => 
    apiRequest<User>(`/api/users/${id}`),

  // Create user
  create: (userData: { name: string; nickname: string; phone?: string }): Promise<User> =>
    apiRequest<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  // Update user
  update: (id: string, userData: { name: string; nickname: string; phone?: string }): Promise<User> =>
    apiRequest<User>(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  // Delete user
  delete: (id: string): Promise<{ message: string }> =>
    apiRequest<{ message: string }>(`/api/users/${id}`, {
      method: 'DELETE',
    }),
}

// Session API functions
export const sessionApi = {
  // Get all sessions
  getAll: (): Promise<GolfSession[]> =>
    apiRequest<GolfSession[]>('/api/sessions'),

  // Get single session
  getById: (id: string): Promise<GolfSession> =>
    apiRequest<GolfSession>(`/api/sessions/${id}`),

  // Create session
  create: (sessionData: {
    title: string
    date: string
    description?: string
    createdById: string
  }): Promise<GolfSession> =>
    apiRequest<GolfSession>('/api/sessions', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),

  // Update session
  update: (id: string, sessionData: {
    title: string
    date: string
    description?: string
    createdById: string
  }): Promise<GolfSession> =>
    apiRequest<GolfSession>(`/api/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(sessionData),
    }),

  // Delete session
  delete: (id: string): Promise<{ message: string; deletedResponses: number }> =>
    apiRequest<{ message: string; deletedResponses: number }>(`/api/sessions/${id}`, {
      method: 'DELETE',
    }),

  // Submit/update response to session
  submitResponse: (sessionId: string, responseData: {
    userId: string
    status: ResponseStatus
    note?: string
  }): Promise<{
    id: string
    status: ResponseStatus
    note?: string
    user: { id: string; nickname: string }
  }> =>
    apiRequest(`/api/sessions/${sessionId}/responses`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    }),

  // Remove user response from session
  deleteResponse: (sessionId: string, userId: string): Promise<{
    message: string
    deletedResponse: {
      id: string
      status: ResponseStatus
      note?: string
      user: { id: string; nickname: string }
    }
  }> =>
    apiRequest(`/api/sessions/${sessionId}/responses`, {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    }),
}

// Business logic utilities
export const golfUtils = {
  // Calculate group organization
  getGroupingText: (inCount: number): string => {
    if (inCount === 8) return '2 foursomes - Perfect!'
    if (inCount === 6) return '2 threesomes'
    if (inCount === 4) return '1 foursome'
    if (inCount === 0) return 'No players yet'
    return `${inCount} players - need to organize groups`
  },

  // Get response counts
  getResponseCounts: (responses: GolfSession['responses']) => {
    const inCount = responses.filter(r => r.status === 'IN').length
    const outCount = responses.filter(r => r.status === 'OUT').length
    const undecidedCount = responses.filter(r => r.status === 'UNDECIDED').length
    
    return { inCount, outCount, undecidedCount, total: responses.length }
  },

  // Find user's response in session
  findUserResponse: (responses: GolfSession['responses'], userId: string) => {
    return responses.find(r => r.user.id === userId) || null
  },

  // Sort sessions by date (upcoming first)
  sortSessionsByDate: (sessions: GolfSession[]): GolfSession[] => {
    return [...sessions].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateA - dateB
    })
  },

  // Find upcoming session index
  findUpcomingSessionIndex: (sessions: GolfSession[]): number => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].date)
      const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate())
      
      if (sessionDay >= today) {
        return i
      }
    }
    
    return sessions.length > 0 ? sessions.length - 1 : 0
  },

  // Check if session is upcoming
  isSessionUpcoming: (sessionDate: string): boolean => {
    return new Date(sessionDate) >= new Date()
  },

  // Filter users based on session tags
  // If session has no tags, return all users (backwards compatibility)
  // If session has tags, only return users who belong to at least one of those tags
  filterUsersBySessionTags: (
    allUsers: Array<{ id: string; name: string; nickname: string; userTags?: Array<{ tagId: string }> }>,
    session: { sessionTags?: Array<{ tag: { id: string } }> }
  ): Array<{ id: string; name: string; nickname: string }> => {
    // If session has no tags, show all users (backwards compatibility)
    if (!session.sessionTags || session.sessionTags.length === 0) {
      return allUsers.map(user => ({ id: user.id, name: user.name, nickname: user.nickname }))
    }

    // Get tag IDs from session
    const sessionTagIds = session.sessionTags.map(st => st.tag.id)

    // Filter users who belong to at least one of the session's tags
    const filteredUsers = allUsers.filter(user => {
      if (!user.userTags || user.userTags.length === 0) {
        return false // User has no tags, so they don't match
      }
      
      // Check if user belongs to any of the session's tags
      return user.userTags.some(userTag => sessionTagIds.includes(userTag.tagId))
    })

    return filteredUsers.map(user => ({ id: user.id, name: user.name, nickname: user.nickname }))
  },
}