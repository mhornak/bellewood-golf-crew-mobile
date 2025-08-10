import React, { useState, useEffect, useRef } from 'react'
import { View, Text, StyleSheet, Dimensions, FlatList, ViewToken, RefreshControl, ScrollView } from 'react-native'
import SessionCard from './SessionCard'
import { golfUtils, type GolfSession } from '../lib/api'

interface User {
  id: string
  name: string
  nickname: string
}

interface SessionCarouselProps {
  sessions: GolfSession[]
  users: User[]
  onResponseUpdate: () => void
  submitResponse: (sessionId: string, responseData: { userId: string; status: 'IN' | 'OUT' | 'UNDECIDED'; note?: string }) => Promise<{ success: boolean; response?: any; error?: string }>
  deleteResponse: (sessionId: string, userId: string) => Promise<{ success: boolean; deletedResponse?: any; error?: string }>
  currentUserId: string
  onRefresh?: () => void
  refreshing?: boolean
  onEditSession?: (session: GolfSession) => void
  onDeleteSession?: (session: GolfSession) => void
}

const { width: screenWidth } = Dimensions.get('window')

export default function SessionCarousel({
  sessions,
  users,
  onResponseUpdate,
  submitResponse,
  deleteResponse,
  currentUserId,
  onRefresh,
  refreshing = false,
  onEditSession,
  onDeleteSession,
}: SessionCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [hasInitialized, setHasInitialized] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  // API now filters to only today + future sessions, just sort them
  // Sort sessions by date (upcoming first) - using platform-agnostic utility
  const sortedSessions = golfUtils.sortSessionsByDate(sessions)

  // Find the upcoming session index and auto-focus on it
  useEffect(() => {
    if (sortedSessions.length > 0 && !hasInitialized) {
      const upcomingIndex = golfUtils.findUpcomingSessionIndex(sortedSessions)
      setCurrentIndex(upcomingIndex)
      setHasInitialized(true)
      
      // Scroll to upcoming session after a brief delay to ensure the list is rendered
      setTimeout(() => {
        if (flatListRef.current && upcomingIndex < sortedSessions.length) {
          flatListRef.current.scrollToIndex({ 
            index: upcomingIndex, 
            animated: false 
          })
        }
      }, 100)
    }
  }, [sortedSessions, hasInitialized])

  // Handle scroll events to update current index
  const handleViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems.length > 0) {
      const newIndex = viewableItems[0].index || 0
      setCurrentIndex(newIndex)
    }
  }

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50
  }

  // Render individual session item
  const renderSessionItem = ({ item: session, index }: { item: GolfSession; index: number }) => {
    return (
      <ScrollView 
        style={styles.sessionContainer}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <SessionCard
          session={session}
          users={users}
          onResponseUpdate={onResponseUpdate}
          submitResponse={submitResponse}
          deleteResponse={deleteResponse}
          currentUserId={currentUserId}
          isUpcoming={index === 0} // First session is the upcoming one
          onEditSession={onEditSession}
          onDeleteSession={onDeleteSession}
        />
      </ScrollView>
    )
  }

  // Handle empty state
  if (sortedSessions.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No upcoming golf sessions</Text>
        <Text style={styles.emptySubtitle}>
          Check back later or tap the + button to create a session!
        </Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Session Indicator */}
      {sortedSessions.length > 1 && (
        <View style={styles.indicatorContainer}>
          <Text style={styles.indicatorText}>
            {currentIndex + 1} of {sortedSessions.length}
          </Text>
          <View style={styles.dotsContainer}>
            {sortedSessions.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentIndex && styles.activeDot
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* Sessions Carousel */}
      <FlatList
        ref={flatListRef}
        data={sortedSessions}
        renderItem={renderSessionItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: screenWidth,
          offset: screenWidth * index,
          index,
        })}
        initialScrollIndex={0}
        onScrollToIndexFailed={(info) => {
          // Handle scroll failures gracefully
          setTimeout(() => {
            if (flatListRef.current && info.index < sortedSessions.length) {
              flatListRef.current.scrollToIndex({ 
                index: info.index, 
                animated: false 
              })
            }
          }, 50)
        }}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sessionContainer: {
    width: screenWidth,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  indicatorText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d1d5db',
  },
  activeDot: {
    backgroundColor: '#3b82f6',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
  },
})