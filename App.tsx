import React, { useState, useEffect, useRef } from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  SafeAreaView, 
  Alert,
  RefreshControl,
  TouchableOpacity,
  Linking,
} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import SessionCard from './src/components/SessionCard'
import SessionCarousel from './src/components/SessionCarousel'
import UserSelectionScreen from './src/components/UserSelectionScreen'
import CreateSessionScreen from './src/components/CreateSessionScreen'
import { useUsers } from './src/hooks/useUsers'
import { useGolfSessions } from './src/hooks/useGolfSessions'
import { golfUtils, sessionApi } from './src/lib/api'

const STORAGE_KEY = '@golf_scheduler_user_id'

export default function App() {
  // User authentication state
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [showUserSelection, setShowUserSelection] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  
  // Session creation/editing state
  const [showCreateSession, setShowCreateSession] = useState(false)
  const [editingSession, setEditingSession] = useState<any>(null)
  const [targetSessionId, setTargetSessionId] = useState<string | null>(null)
  
  // Track if we've processed the initial deep link to prevent duplicates
  const hasProcessedInitialUrl = useRef(false)

  // Use custom hooks for data management (same as web app)
  const { users, loading: usersLoading } = useUsers()
  const { 
    sessions, 
    loading: sessionsLoading, 
    fetchSessions,
    submitResponse,
    deleteResponse
  } = useGolfSessions()

  // Derived loading state
  const loading = usersLoading || sessionsLoading
  const [refreshing, setRefreshing] = useState(false)

  // Sessions will be filtered and sorted by SessionCarousel

  // Load stored user ID on app start
  useEffect(() => {
    const loadStoredUser = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem(STORAGE_KEY)
        if (storedUserId) {
          setCurrentUserId(storedUserId)
          setShowUserSelection(false)
        } else {
          setShowUserSelection(true)
        }
      } catch (error) {
        console.error('Error loading stored user:', error)
        setShowUserSelection(true)
      } finally {
        setIsLoadingUser(false)
      }
    }

    loadStoredUser()
  }, [])

  // Handle deep links
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      console.log('🔗 Deep link received:', url)
      
      // Parse the deep link: bellewoodgolf://session/SESSION_ID
      const sessionMatch = url.match(/bellewoodgolf:\/\/session\/(.+)/)
      if (sessionMatch) {
        const sessionId = sessionMatch[1]
        console.log('📍 Navigating to session:', sessionId)
        
        // Just set the target - let the carousel handle validation when sessions are ready
        setTargetSessionId(sessionId)
        console.log('🎯 Deep link: Setting target session for focus:', sessionId)
      }
    }

    // Listen for deep links when app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url)
    })

    // Handle deep link if app was opened from a link (only once!)
    if (!hasProcessedInitialUrl.current) {
      Linking.getInitialURL().then((url) => {
        if (url) {
          hasProcessedInitialUrl.current = true
          handleDeepLink(url)
        }
      })
    }

    return () => subscription?.remove()
  }, []) // ✅ No dependencies - only run once

  // Wait for users to load before showing selection
  useEffect(() => {
    if (!usersLoading && users.length > 0 && currentUserId) {
      // Verify the stored user ID still exists in the user list
      const userExists = users.find(user => user.id === currentUserId)
      if (!userExists) {
        setCurrentUserId(null)
        setShowUserSelection(true)
      }
    }
  }, [users, usersLoading, currentUserId])

  // Handle user selection
  const handleUserSelect = async (userId: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, userId)
      setCurrentUserId(userId)
      setShowUserSelection(false)
    } catch (error) {
      console.error('Error saving user selection:', error)
      Alert.alert('Error', 'Failed to save user selection')
    }
  }

  // Handle user switch
  const handleSwitchUser = () => {
    setShowUserSelection(true)
  }

  // Handle create session
  const handleCreateSession = () => {
    setShowCreateSession(true)
  }

  // Handle edit session
  const handleEditSession = (session: any) => {
    setEditingSession(session)
    setShowCreateSession(true) // Reuse the same modal
  }

  // Handle archive session
  const handleDeleteSession = async (session: any) => {
    Alert.alert(
      'Archive Session',
      `Are you sure you want to archive "${session.title}"?\n\nThis will hide the session from the main view but preserve all player responses. You can restore it later if needed.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Archive', 
          style: 'destructive',
          onPress: async () => {
            try {
              await sessionApi.delete(session.id)
              Alert.alert('Success!', 'Session archived successfully')
              fetchSessions() // Refresh the sessions list
            } catch (error) {
              console.error('Error archiving session:', error)
              Alert.alert('Error', error instanceof Error ? error.message : 'Failed to archive session')
            }
          }
        }
      ]
    )
  }

  const handleSessionCreated = (sessionId: string) => {
    console.log('📱 App: Session created/edited, setting target:', sessionId)
    setShowCreateSession(false)
    setEditingSession(null) // Clear editing state
    setTargetSessionId(sessionId) // Remember which session to focus on
    fetchSessions() // Refresh the sessions list
  }

  // Refresh handler
  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await fetchSessions(true) // Pass true to indicate this is a refresh
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh sessions')
    } finally {
      setRefreshing(false)
    }
  }

  // Event handlers
  const handleResponseUpdate = () => {
    // No need to fetch sessions - optimistic updates handle this
    // fetchSessions() was causing unnecessary refreshes when saving notes
  }

  // Show user selection if needed
  if (showUserSelection || !currentUserId) {
    return (
      <UserSelectionScreen
        users={users}
        onUserSelect={handleUserSelect}
        isLoading={usersLoading || isLoadingUser}
      />
    )
  }

  // Show create/edit session screen
  if (showCreateSession) {
    return (
      <CreateSessionScreen
        users={users}
        currentUserId={currentUserId}
        onCancel={() => {
          setShowCreateSession(false)
          setEditingSession(null)
        }}
        onSessionCreated={handleSessionCreated}
        editingSession={editingSession}
      />
    )
  }

  // Show loading for sessions data
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading golf sessions...</Text>
        </View>
      </SafeAreaView>
    )
  }

  // Find current user for display
  const currentUser = users.find(user => user.id === currentUserId)

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>🏌️ Bellewood Golf</Text>
            {currentUser && (
              <Text style={styles.currentUserText}>Playing as: {currentUser.nickname}</Text>
            )}
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateSession}
            >
              <Text style={styles.createButtonText}>+</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.switchUserButton}
              onPress={handleSwitchUser}
            >
              <Text style={styles.switchUserIcon}>👤</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Sessions Carousel */}
      <SessionCarousel
        sessions={sessions}
        users={users}
        onResponseUpdate={handleResponseUpdate}
        submitResponse={submitResponse}
        deleteResponse={deleteResponse}
        currentUserId={currentUserId}
        onRefresh={onRefresh}
        refreshing={refreshing}
        onEditSession={handleEditSession}
        onDeleteSession={handleDeleteSession}
        targetSessionId={targetSessionId}
        onTargetSessionFocused={() => {
          console.log('📱 App: Target session focused, clearing target')
          setTargetSessionId(null)
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  currentUserText: {
    fontSize: 14,
    color: '#3b82f6',
    marginTop: 4,
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#16a34a',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  createButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 24,
  },
  switchUserButton: {
    backgroundColor: '#f3f4f6',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  switchUserIcon: {
    fontSize: 16,
  },
})