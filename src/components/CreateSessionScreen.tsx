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
  onSessionCreated: () => void
}

export default function CreateSessionScreen({
  users,
  currentUserId,
  onCancel,
  onSessionCreated,
}: CreateSessionScreenProps) {
  const [formData, setFormData] = useState<SessionFormData>({
    title: '',
    date: '',
    time: '',
    description: '',
    createdById: currentUserId,
    tagIds: [],
  })
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

  const handleCreateSession = async () => {
    if (!validateForm()) return

    setIsCreating(true)
    try {
      // Combine date and time into ISO datetime string
      const dateTimeString = `${formData.date}T${formData.time}:00.000Z`
      
      const response = await fetch('https://main.d2m423juctwnaf.amplifyapp.com/api/sessions', {
        method: 'POST',
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

      Alert.alert('Success!', 'Golf session created successfully', [
        { text: 'OK', onPress: () => {
          onSessionCreated()
        }}
      ])
    } catch (error) {
      console.error('Error creating session:', error)
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create session')
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
          <Text style={styles.headerTitle}>Create Golf Session</Text>
          <TouchableOpacity 
            onPress={handleCreateSession}
            style={[styles.saveButton, isCreating && styles.saveButtonDisabled]}
            disabled={isCreating}
          >
            <Text style={styles.saveText}>
              {isCreating ? 'Creating...' : 'Create'}
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