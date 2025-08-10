import React, { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, KeyboardAvoidingView, Platform } from 'react-native'
import SessionFormFields from './SessionFormFields'

interface User {
  id: string
  name: string
  nickname: string
}

interface SessionFormData {
  title: string
  date: string
  time: string
  description: string
  createdById: string
  tagIds: string[]
}

interface CreateSessionScreenProps {
  users: User[]
  currentUserId: string
  onCancel: () => void
  onSessionCreated: (sessionId: string) => void
  editingSession?: any
}

export default function CreateSessionScreen({
  users,
  currentUserId,
  onCancel,
  onSessionCreated,
  editingSession,
}: CreateSessionScreenProps) {
  // Initialize form data from editing session or defaults
  const getInitialFormData = (): SessionFormData => {
    if (editingSession) {
      const sessionDate = new Date(editingSession.date)
      return {
        title: editingSession.title || '',
        date: sessionDate.toISOString().split('T')[0], // YYYY-MM-DD format
        time: sessionDate.toTimeString().slice(0, 5), // HH:MM format
        description: editingSession.description || '',
        createdById: editingSession.createdBy?.id || currentUserId,
        tagIds: editingSession.sessionTags?.map((st: any) => st.tagId) || [],
      }
    }
    return {
      title: '',
      date: '',
      time: '',
      description: '',
      createdById: currentUserId,
      tagIds: [],
    }
  }

  const [formData, setFormData] = useState<SessionFormData>(getInitialFormData())
  const [isCreating, setIsCreating] = useState(false)

  const validateForm = () => {
    if (!formData.title.trim()) {
      Alert.alert('Validation Error', 'Session title is required')
      return false
    }
    if (!formData.date.trim()) {
      Alert.alert('Validation Error', 'Date is required')
      return false
    }
    if (!formData.time.trim()) {
      Alert.alert('Validation Error', 'Time is required')
      return false
    }
    
    // Basic date format validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(formData.date)) {
      Alert.alert('Validation Error', 'Date must be in YYYY-MM-DD format')
      return false
    }

    return true
  }

  const handleSubmitSession = async () => {
    if (!validateForm()) return

    // Determine if we're editing or creating (move outside try block)
    const isEditing = !!editingSession

    setIsCreating(true)
    try {
      // Combine date and time into ISO datetime string
      // More explicit timezone handling
      const [year, month, day] = formData.date.split('-');
      const [hours, minutes] = formData.time.split(':');
      const localDateTime = new Date(
        parseInt(year), 
        parseInt(month) - 1, // Month is 0-indexed
        parseInt(day), 
        parseInt(hours), 
        parseInt(minutes)
      );
      const dateTimeString = localDateTime.toISOString();

      console.log("DEBUG: Local time input:", formData.date, formData.time);
      console.log("DEBUG: Created Date object:", localDateTime);
      console.log("DEBUG: ISO string for API:", dateTimeString);
      const apiUrl = isEditing 
        ? `https://main.d2m423juctwnaf.amplifyapp.com/api/sessions/${editingSession.id}`
        : 'https://main.d2m423juctwnaf.amplifyapp.com/api/sessions'
      
      const response = await fetch(apiUrl, {
        method: isEditing ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          date: dateTimeString,
          description: formData.description.trim() || undefined,
          createdById: formData.createdById,
          tagIds: formData.tagIds,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      const sessionData = await response.json()
      const sessionId = sessionData.id || editingSession?.id // Get the session ID from response or existing session

      const successMessage = isEditing ? 'Golf session updated successfully' : 'Golf session created successfully'
      Alert.alert('Success!', successMessage, [
        { text: 'OK', onPress: () => {
          onSessionCreated(sessionId) // Pass the session ID back
        }}
      ])
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} session:`, error)
      const errorMessage = isEditing ? 'Failed to update session' : 'Failed to create session'
      Alert.alert('Error', error instanceof Error ? error.message : errorMessage)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{editingSession ? 'Edit Golf Session' : 'Create Golf Session'}</Text>
          <TouchableOpacity 
            onPress={handleSubmitSession}
            style={[styles.saveButton, isCreating && styles.saveButtonDisabled]}
            disabled={isCreating}
          >
            <Text style={styles.saveText}>
              {isCreating ? (editingSession ? 'Saving...' : 'Creating...') : (editingSession ? 'Save' : 'Create')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <SessionFormFields
          formData={formData}
          onFormDataChange={setFormData}
          users={users}
          currentUserId={currentUserId}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  saveButton: {
    backgroundColor: '#16a34a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
})