// Platform-agnostic API utilities for golf scheduler
// GraphQL-powered mobile API using AppSync

import { graphqlClient, queries, mutations } from './appsync'

export interface User {
  id: string
  name: string
  nickname: string
  phone?: string
  isAdmin: boolean
  createdAt: string
  updatedAt: string
  userTags?: Array<{ tagId: string }>
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
    transport?: 'WALKING' | 'RIDING'
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
export type TransportType = 'WALKING' | 'RIDING'

// User API functions - GraphQL powered
export const userApi = {
  // Get all users with their tags for filtering
  getAll: async (): Promise<User[]> => {
    const data = await graphqlClient.request(queries.GET_USERS) as { listUsers: any[] }
    
    // For each user, get their tags to enable session filtering
    const usersWithTags = await Promise.all(
      data.listUsers.map(async (user: any) => {
        try {
          const userTagsData = await graphqlClient.request(queries.GET_USER_TAGS, {
            userId: user.id
          }) as { getUserTags: any[] }
          return {
            ...user,
            userTags: userTagsData.getUserTags?.map((ut: any) => ({ tagId: ut.tagId })) || []
          }
        } catch {
          // If getUserTags fails, return user without tags
          return { ...user, userTags: [] }
        }
      })
    )

    return usersWithTags
  },

  // Get single user
  getById: async (id: string): Promise<User> => {
    // For individual user lookup, we'll use the list and filter
    // This maintains compatibility while using available GraphQL operations
    const data = await graphqlClient.request(queries.GET_USERS) as { listUsers: User[] }
    const user = data.listUsers.find(u => u.id === id)
    if (!user) {
      throw new Error(`User with ID ${id} not found`)
    }
    return user
  },

  // Create user
  create: async (userData: { name: string; nickname: string; phone?: string }): Promise<User> => {
    const data = await graphqlClient.request(mutations.CREATE_USER, {
      input: {
        name: userData.name,
        nickname: userData.nickname,
        phone: userData.phone || null,
        isAdmin: false,
      }
    }) as { createUser: User }
    return data.createUser
  },

  // Update user
  update: async (id: string, userData: { name: string; nickname: string; phone?: string }): Promise<User> => {
    const data = await graphqlClient.request(mutations.UPDATE_USER, {
      input: {
        id,
        name: userData.name,
        nickname: userData.nickname,
        phone: userData.phone || null,
      }
    }) as { updateUser: User }
    return data.updateUser
  },

  // Delete user
  delete: async (id: string): Promise<{ message: string }> => {
    await graphqlClient.request(mutations.DELETE_USER, { id })
    return { message: 'User deleted successfully' }
  },
}

// Session API functions - GraphQL powered
export const sessionApi = {
  // Get all sessions (mobile only needs future sessions)
  getAll: async (): Promise<GolfSession[]> => {
    return sessionApi.getAllFuture()
  },

  // Get future sessions only (mobile optimized)
  getAllFuture: async (): Promise<GolfSession[]> => {
    // Get sessions
    const sessionData = await graphqlClient.request(queries.GET_SESSIONS, {
      includeArchived: false
    }) as { listGolfSessions: any[] }
    
    let sessions = sessionData.listGolfSessions || []
    
    // Filter for future sessions (today and forward)
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayUTC = new Date(today.getTime() - (today.getTimezoneOffset() * 60000))
    
    sessions = sessions.filter((session: any) => {
      const sessionDate = new Date(session.date)
      return sessionDate >= todayUTC
    })

    // For each session, fetch related data
    const sessionsWithRelatedData = await Promise.all(
      sessions.map(async (session: any) => {
        try {
          // Get creator info
          const allUsers = await userApi.getAll()
          const creator = allUsers.find(u => u.id === session.createdById)
          
          // Get responses for this session
          const responsesData = await graphqlClient.request(queries.GET_RESPONSES_FOR_SESSION, {
            golfSessionId: session.id
          }) as { getResponsesForSession: any[] }
          
          // Get users for each response
          const responsesWithUsers = await Promise.all(
            (responsesData.getResponsesForSession || []).map(async (response: any) => {
              try {
                const user = allUsers.find(u => u.id === response.userId)
                return {
                  ...response,
                  user: user ? { id: user.id, nickname: user.nickname } : null
                }
              } catch {
                return {
                  ...response,
                  user: null
                }
              }
            })
          )
          
          // Get session tags
          const sessionTagsData = await graphqlClient.request(queries.GET_SESSION_TAGS, {
            sessionId: session.id
          }) as { getSessionTags: any[] }
          
          // Get tag details for each session tag
          const allTags = await graphqlClient.request(queries.GET_TAGS) as { listTags: any[] }
          const sessionTagsWithDetails = (sessionTagsData.getSessionTags || []).map((sessionTag: any) => {
            const tag = allTags.listTags.find((t: any) => t.id === sessionTag.tagId)
            return {
              ...sessionTag,
              tag: tag ? {
                id: tag.id,
                name: tag.name,
                color: tag.color
              } : null
            }
          }).filter((st: any) => st.tag) // Remove any with missing tags
          
          return {
            ...session,
            createdBy: creator ? { id: creator.id, nickname: creator.nickname } : { id: session.createdById, nickname: 'Unknown' },
            responses: responsesWithUsers.filter(r => r.user), // Remove responses with missing users
            sessionTags: sessionTagsWithDetails
          }
        } catch (error) {
          console.error('Error fetching related data for session:', session.id, error)
          return {
            ...session,
            createdBy: { id: session.createdById, nickname: 'Unknown' },
            responses: [],
            sessionTags: []
          }
        }
      })
    )
    
    // Sort sessions by date (upcoming first)
    return sessionsWithRelatedData.sort((a: any, b: any) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return dateA - dateB
    })
  },

  // Get single session
  getById: async (id: string): Promise<GolfSession> => {
    const sessions = await sessionApi.getAllFuture()
    const session = sessions.find(s => s.id === id)
    if (!session) {
      throw new Error(`Session with ID ${id} not found`)
    }
    return session
  },

  // Create session
  create: async (sessionData: {
    title: string
    date: string
    description?: string
    createdById: string
    tagIds?: string[]
  }): Promise<GolfSession> => {
    const requestInput = {
      title: sessionData.title,
      date: new Date(sessionData.date).toISOString(),
      description: sessionData.description || null,
      createdById: sessionData.createdById,
    }
    
    console.log('Creating session with input:', JSON.stringify(requestInput, null, 2))
    
    const data = await graphqlClient.request(mutations.CREATE_SESSION, {
      input: requestInput
    }) as { createGolfSession: any }

    const newSession = data.createGolfSession

    // Add tags if provided
    if (sessionData.tagIds && sessionData.tagIds.length > 0) {
      try {
        await Promise.all(
          sessionData.tagIds.map((tagId: string) =>
            graphqlClient.request(mutations.ADD_TAG_TO_SESSION, {
              input: {
                sessionId: newSession.id,
                tagId
              }
            })
          )
        )
      } catch (tagError) {
        console.error('Failed to add tags to session:', tagError)
        // Continue without failing the entire request
      }
    }

    // Return the session with complete data
    return sessionApi.getById(newSession.id)
  },

  // Update session
  update: async (id: string, sessionData: {
    title: string
    date: string
    description?: string
    createdById: string
  }): Promise<GolfSession> => {
    const data = await graphqlClient.request(mutations.UPDATE_SESSION, {
      input: {
        id,
        title: sessionData.title,
        date: new Date(sessionData.date).toISOString(),
        description: sessionData.description || null,
      }
    }) as { updateGolfSession: any }

    // Return the updated session with complete data
    return sessionApi.getById(id)
  },

  // Archive session (soft delete)
  delete: async (id: string, userId?: string): Promise<{ message: string; deletedResponses: number }> => {
    await graphqlClient.request(mutations.UPDATE_SESSION, {
      input: {
        id,
        isArchived: true,
        archivedBy: userId || null
      }
    })
    return { message: 'Session archived successfully', deletedResponses: 0 }
  },

  // Submit/update response to session
  submitResponse: async (sessionId: string, responseData: {
    userId: string
    status: ResponseStatus
    note?: string
    transport?: TransportType
  }): Promise<{
    id: string
    status: ResponseStatus
    note?: string
    transport?: TransportType
    user: { id: string; nickname: string }
  }> => {
    const data = await graphqlClient.request(mutations.SUBMIT_RESPONSE, {
      input: {
        userId: responseData.userId,
        golfSessionId: sessionId,
        status: responseData.status,
        note: responseData.note || null,
        transport: responseData.transport || null
      }
    }) as { submitResponse: any }

    // Get user info to match expected format
    const users = await userApi.getAll()
    const user = users.find(u => u.id === responseData.userId)

    return {
      ...data.submitResponse,
      user: user ? { id: user.id, nickname: user.nickname } : { id: responseData.userId, nickname: 'Unknown' }
    }
  },

  // Remove user response from session
  deleteResponse: async (sessionId: string, userId: string): Promise<{
    message: string
    deletedResponse: {
      id: string
      status: ResponseStatus
      note?: string
      transport?: TransportType
      user: { id: string; nickname: string }
    }
  }> => {
    await graphqlClient.request(mutations.DELETE_RESPONSE, {
      userId,
      golfSessionId: sessionId
    })

    // Get user info for the response format
    const users = await userApi.getAll()
    const user = users.find(u => u.id === userId)

    return {
      message: 'Response removed successfully',
      deletedResponse: {
        id: `${userId}-${sessionId}`,
        status: 'UNDECIDED' as ResponseStatus,
        user: user ? { id: user.id, nickname: user.nickname } : { id: userId, nickname: 'Unknown' }
      }
    }
  },
}

// Tags API
export const tagsApi = {
  // Get all tags (simplified - no user counts)
  getAll: async () => {
    const tagsData = await graphqlClient.request(queries.GET_TAGS) as { listTags: any[] }
    return tagsData.listTags
  }
}

// Business logic utilities (unchanged)
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
    if (sessions.length === 0) return 0
    
    const now = new Date()
    
    // Look for first session that hasn't passed yet (date + time)
    for (let i = 0; i < sessions.length; i++) {
      const sessionDateTime = new Date(sessions[i].date)
      
      if (sessionDateTime > now) {
        return i
      }
    }
    
    // If all sessions have passed, focus on the first one
    return 0
  },

  // Check if session is upcoming
  isSessionUpcoming: (sessionDate: string): boolean => {
    return new Date(sessionDate) >= new Date()
  },

  // Filter users based on session tags
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