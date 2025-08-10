import React, { useState, useEffect } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert, TextInput, Share } from 'react-native'
import { format } from 'date-fns'
import { useSessionResponse } from '../hooks/useSessionResponse'
import { golfUtils, type GolfSession } from '../lib/api'

interface SessionCardProps {
  session: GolfSession
  users: Array<{ id: string; name: string; nickname: string }>
  onResponseUpdate: () => void
  submitResponse: (sessionId: string, responseData: { userId: string; status: 'IN' | 'OUT' | 'UNDECIDED'; note?: string; transport?: 'WALKING' | 'RIDING' }) => Promise<{ success: boolean; response?: any; error?: string }>
  deleteResponse: (sessionId: string, userId: string) => Promise<{ success: boolean; deletedResponse?: any; error?: string }>
  currentUserId: string
  isUpcoming?: boolean
  onEditSession?: (session: GolfSession) => void
  onDeleteSession?: (session: GolfSession) => void
}

export default function SessionCard({
  session,
  users,
  onResponseUpdate,
  submitResponse,
  deleteResponse,
  currentUserId,
  isUpcoming = false,
  onEditSession,
  onDeleteSession,
}: SessionCardProps) {
  
  // Use custom hook for session response management (React Native compatible)
  const {
    getUserResponse,
    handleStatusClick,
    handleTransportChange,
    isSubmitting,
  } = useSessionResponse(session, onResponseUpdate, submitResponse, deleteResponse)

  // Comment state management
  const [comment, setComment] = useState('')
  const [isUpdatingComment, setIsUpdatingComment] = useState(false)

  // Initialize comment from user's existing response
  useEffect(() => {
    const currentUserResponse = getUserResponse(currentUserId)
    setComment(currentUserResponse?.note || '')
  }, [getUserResponse, currentUserId, session.responses])

  // Check if session is in the past (React Native compatible)
  const isPastSession = !golfUtils.isSessionUpcoming(session.date)

  // Filter users based on session tags (React Native compatible)
  const filteredUsers = golfUtils.filterUsersBySessionTags(users, session)

  // Check if current user is allowed to participate in this session
  const currentUserCanParticipate = filteredUsers.some(user => user.id === currentUserId)

  // Calculate response stats for filtered users only
  const filteredResponseStats = (() => {
    const filteredUserIds = new Set(filteredUsers.map(u => u.id))
    const filteredResponses = session.responses.filter(r => filteredUserIds.has(r.user.id))
    return golfUtils.getResponseCounts(filteredResponses)
  })()

  // Use filtered stats for grouping text
  const filteredGroupingText = golfUtils.getGroupingText(filteredResponseStats.inCount)

  // Handle sharing session status (React Native compatible)
  const handleShareStatus = async () => {
    try {
      const sessionDate = format(new Date(session.date), 'PPP p')
      let message = `🏌️ ${session.title}\n📅 ${sessionDate}\n\n`

      // Filter users based on session tags
      const filteredUsers = golfUtils.filterUsersBySessionTags(users, session)
      const filteredResponses = session.responses.filter(response =>
        filteredUsers.some(user => user.id === response.user.id)
      )

      filteredUsers.forEach(user => {
        const userResponse = golfUtils.findUserResponse(session.responses, user.id)
        const status = userResponse?.status || 'UNDECIDED'
        const statusEmoji = status === 'IN' ? '✅' : status === 'OUT' ? '❌' : '❓'
        const note = userResponse?.note ? ` - ${userResponse.note}` : ''
        message += `${statusEmoji} ${user.nickname}${note}\n`
      })

      const inCount = filteredResponseStats.inCount
      if (inCount === 8) message += `\n🎯 Perfect! 2 foursomes ready!`
      else if (inCount === 6) message += `\n⛳ 2 threesomes`
      else if (inCount === 4) message += `\n🏌️ 1 foursome`
      else if (inCount > 0) message += `\n📊 ${inCount} players confirmed`

      // Add deep link to open the app
      message += `\n\n📱 Update your status: bellewoodgolf://session/${session.id}`

      await Share.share({
        message: message,
        title: `${session.title} - Golf Status Update`
      })
    } catch (err) {
      Alert.alert('❌ Error', 'Failed to share status')
    }
  }

  // Handle comment save
  const handleSaveComment = async () => {
    if (isPastSession) return

    const currentUserResponse = getUserResponse(currentUserId)
    if (!currentUserResponse?.status) {
      Alert.alert('⚠️ Status Required', 'Please set your IN/OUT status before adding a comment')
      return
    }

    setIsUpdatingComment(true)
    try {
      const result = await submitResponse(session.id, {
        userId: currentUserId,
        status: currentUserResponse.status,
        note: comment.trim() || undefined,
      })

      if (result.success) {
        onResponseUpdate()
        Alert.alert('✅ Saved!', 'Your comment has been updated')
      } else {
        Alert.alert('❌ Error', result.error || 'Failed to save comment')
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to save comment')
    } finally {
      setIsUpdatingComment(false)
    }
  }

  const currentUserResponse = getUserResponse(currentUserId)

  return (
    <View style={[
      styles.card, 
      isPastSession && styles.pastCard,
      isUpcoming && styles.upcomingCard
    ]}>
      {/* Header */}
      <View style={styles.header}>
        {/* Session Title with Edit and Delete Buttons */}
        <View style={styles.titleRow}>
          <Text style={styles.title}>{session.title}</Text>
          <View style={styles.actionButtons}>
            {onEditSession && !isPastSession && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => onEditSession(session)}
              >
                <Text style={styles.actionIcon}>✏️</Text>
              </TouchableOpacity>
            )}
            {onDeleteSession && !isPastSession && (
              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => onDeleteSession(session)}
              >
                <Text style={styles.actionIcon}>🗑️</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Date, Time, and Creator */}
        <View style={styles.dateTimeRow}>
          {isPastSession && (
            <View style={styles.pastBadge}>
              <Text style={styles.pastBadgeText}>Past</Text>
            </View>
          )}
          <Text style={styles.dateTime}>
            {format(new Date(session.date), 'EEEE, MMMM d, yyyy \'at\' h:mm a')} • Created by {session.createdBy.nickname}
          </Text>
        </View>
        
        {/* Description */}
        {session.description && (
          <Text style={styles.description}>{session.description}</Text>
        )}
      </View>

      {/* Current User Status */}
      <View style={styles.userSection}>
        <Text style={styles.sectionTitle}>Your Status:</Text>
        
        {!currentUserCanParticipate ? (
          <View style={styles.notInvitedContainer}>
            <Text style={styles.notInvitedText}>
              You're not invited to this session
            </Text>
            <Text style={styles.notInvitedSubtext}>
              This session is for a specific group
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statusButtons}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  styles.inButton,
                  currentUserResponse?.status === 'IN' && styles.activeInButton
                ]}
                onPress={() => handleStatusClick(currentUserId, 'IN')}
                disabled={isSubmitting(currentUserId) || isPastSession}
              >
                <Text style={[
                  styles.buttonText,
                  currentUserResponse?.status === 'IN' && styles.activeButtonText
                ]}>
                  {isSubmitting(currentUserId) ? '...' : 'IN'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  styles.outButton,
                  currentUserResponse?.status === 'OUT' && styles.activeOutButton
                ]}
                onPress={() => handleStatusClick(currentUserId, 'OUT')}
                disabled={isSubmitting(currentUserId) || isPastSession}
              >
                <Text style={[
                  styles.buttonText,
                  currentUserResponse?.status === 'OUT' && styles.activeButtonText
                ]}>
                  {isSubmitting(currentUserId) ? '...' : 'OUT'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  styles.undecidedButton,
                  currentUserResponse?.status === 'UNDECIDED' && styles.activeUndecidedButton
                ]}
                onPress={() => handleStatusClick(currentUserId, 'UNDECIDED')}
                disabled={isSubmitting(currentUserId) || isPastSession}
              >
                <Text style={[
                  styles.buttonText,
                  currentUserResponse?.status === 'UNDECIDED' && styles.activeButtonText
                ]}>
                  {isSubmitting(currentUserId) ? '...' : 'MAYBE'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Transport Radio Buttons */}
            {!isPastSession && currentUserResponse?.status && (
              <View style={styles.transportSection}>
                <View style={styles.transportButtons}>
                  <TouchableOpacity
                    style={[
                      styles.transportButton,
                      (!currentUserResponse?.transport || currentUserResponse?.transport === 'WALKING') && currentUserResponse?.status === 'IN' && styles.activeTransportButton,
                      currentUserResponse?.status !== 'IN' && styles.disabledButton
                    ]}
                    onPress={() => handleTransportChange(currentUserId, 'WALKING')}
                    disabled={isSubmitting(currentUserId) || currentUserResponse?.status !== 'IN'}
                  >
                    <Text style={styles.transportEmoji}>🚶</Text>
                    <Text style={[
                      styles.transportText,
                      (!currentUserResponse?.transport || currentUserResponse?.transport === 'WALKING') && currentUserResponse?.status === 'IN' && styles.activeTransportText,
                      currentUserResponse?.status !== 'IN' && styles.disabledText
                    ]}>
                      Walking
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.transportButton,
                      currentUserResponse?.transport === 'RIDING' && currentUserResponse?.status === 'IN' && styles.activeTransportButton,
                      currentUserResponse?.status !== 'IN' && styles.disabledButton
                    ]}
                    onPress={() => handleTransportChange(currentUserId, 'RIDING')}
                    disabled={isSubmitting(currentUserId) || currentUserResponse?.status !== 'IN'}
                  >
                    <Text style={styles.transportEmoji}>🛺</Text>
                    <Text style={[
                      styles.transportText,
                      currentUserResponse?.transport === 'RIDING' && currentUserResponse?.status === 'IN' && styles.activeTransportText,
                      currentUserResponse?.status !== 'IN' && styles.disabledText
                    ]}>
                      Riding
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!isPastSession && (
              <View style={styles.commentSection}>
                <View style={styles.commentRow}>
                  <TextInput
                    style={styles.commentInput}
                    value={comment}
                    onChangeText={setComment}
                    placeholder="Add quick note (optional)"
                    maxLength={100}
                    returnKeyType="done"
                    onSubmitEditing={handleSaveComment}
                  />
                  <TouchableOpacity 
                    style={[styles.saveCommentButton, isUpdatingComment && styles.disabledButton]}
                    onPress={handleSaveComment}
                    disabled={isUpdatingComment || !currentUserResponse?.status}
                  >
                    <Text style={styles.saveCommentText}>
                      {isUpdatingComment ? '...' : 'Save'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </>
        )}
      </View>

      {/* Session Tags */}
      {session.sessionTags && session.sessionTags.length > 0 && (
        <View style={styles.tagsSection}>
          <Text style={styles.tagsLabel}>Group:</Text>
          <View style={styles.tagsContainer}>
            {session.sessionTags.map((sessionTag) => (
              <View key={sessionTag.tagId} style={styles.tagBadge}>
                <Text style={styles.tagText}>{sessionTag.tag.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* All Users List */}
      <View style={styles.allUsers}>
        {filteredUsers.map((user) => {
          const userResponse = getUserResponse(user.id)
          const statusEmoji = userResponse?.status === 'IN' ? '✅' : 
                             userResponse?.status === 'OUT' ? '❌' : 
                             userResponse?.status === 'UNDECIDED' ? '❓' : '⚪'
          const transportEmoji = userResponse?.transport === 'RIDING' ? '🛺' : 
                                userResponse?.transport === 'WALKING' ? '🚶' : ''
          
          return (
            <View key={user.id} style={styles.userRow}>
              <View style={styles.userInfo}>
                <Text style={styles.userText}>
                  {statusEmoji} {user.nickname} {userResponse?.status === 'IN' && transportEmoji ? `• ${transportEmoji}` : ''}
                </Text>
                {userResponse?.note && (
                  <Text style={styles.noteText}>• {userResponse.note}</Text>
                )}
              </View>
            </View>
          )
        })}
        
        {/* Foursome Display at Bottom */}
        <View style={styles.foursomeDisplay}>
          <Text style={styles.foursomeText}>{filteredGroupingText}</Text>
          {(() => {
            const inResponses = session.responses.filter(r => 
              filteredUsers.some(u => u.id === r.user.id) && r.status === 'IN'
            )
            const walkingCount = inResponses.filter(r => r.transport === 'WALKING').length
            const ridingCount = inResponses.filter(r => r.transport === 'RIDING').length
            
            if (inResponses.length > 0) {
              return (
                <Text style={styles.transportBreakdown}>
                  🚶 {walkingCount} walking • 🛺 {ridingCount} riding
                </Text>
              )
            }
            return null
          })()}
        </View>
      </View>

      {/* Share Group Status Button - Moved to Bottom */}
      {!isPastSession && currentUserCanParticipate && (
        <TouchableOpacity style={styles.copyButton} onPress={handleShareStatus}>
          <Text style={styles.copyButtonText}>📤 Share Group Status</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pastCard: {
    opacity: 0.6,
  },
  upcomingCard: {
    backgroundColor: '#fafbff',
  },
  header: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    padding: 8,
  },
  actionIcon: {
    fontSize: 18,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateTime: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  pastBadge: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pastBadgeText: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '500',
  },
  stats: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  statsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  userSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  notInvitedContainer: {
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  notInvitedText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#dc2626',
    textAlign: 'center',
    marginBottom: 4,
  },
  notInvitedSubtext: {
    fontSize: 14,
    color: '#b91c1c',
    textAlign: 'center',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  statusButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
  },
  inButton: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  outButton: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
  },
  undecidedButton: {
    backgroundColor: '#fffbeb',
    borderColor: '#fed7aa',
  },
  activeInButton: {
    backgroundColor: '#16a34a',
  },
  activeOutButton: {
    backgroundColor: '#dc2626',
  },
  activeUndecidedButton: {
    backgroundColor: '#d97706',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  activeButtonText: {
    color: 'white',
  },
  commentSection: {
    marginTop: 12,
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: 'white',
    height: 36,
  },
  saveCommentButton: {
    backgroundColor: '#10b981',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 50,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9ca3af',
  },
  saveCommentText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  copyButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  copyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  tagsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tagBadge: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  tagText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '500',
  },
  allUsers: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
  },
  userRow: {
    marginBottom: 6,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  userText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  noteText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
    flex: 1,
  },
  foursomeDisplay: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  foursomeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  transportBreakdown: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  transportSection: {
    marginTop: 16,
    marginBottom: 8,
  },
  transportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  transportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    gap: 6,
  },
  activeTransportButton: {
    borderColor: '#22c55e',
    backgroundColor: '#f0fdf4',
  },
  transportEmoji: {
    fontSize: 16,
  },
  transportText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTransportText: {
    color: '#16a34a',
  },
})