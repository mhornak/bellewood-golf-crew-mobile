import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'

interface Tag {
  id: string
  name: string
  description?: string | null
  color?: string | null
  _count: {
    userTags: number
  }
}

interface User {
  id: string
  name: string
  nickname: string
}

interface SessionFormData {
  title: string
  date: string
  description: string
  createdById: string
  tagIds: string[]
}

interface SessionFormFieldsProps {
  formData: SessionFormData
  onFormDataChange: (data: SessionFormData) => void
  users: User[]
  currentUserId: string
}

export default function SessionFormFields({
  formData,
  onFormDataChange,
  users,
  currentUserId,
}: SessionFormFieldsProps) {
  const [availableTags, setAvailableTags] = useState<Tag[]>([])
  const [loadingTags, setLoadingTags] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)

  // Fetch available tags
  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    setLoadingTags(true)
    try {
      const response = await fetch('https://main.d2m423juctwnaf.amplifyapp.com/api/tags')
      if (!response.ok) throw new Error('Failed to fetch tags')
      const tags = await response.json()
      setAvailableTags(Array.isArray(tags) ? tags : [])
    } catch (error) {
      console.error('Error fetching tags:', error)
      Alert.alert('Error', 'Failed to load tags')
    } finally {
      setLoadingTags(false)
    }
  }

  const handleTagToggle = (tagId: string) => {
    const isSelected = formData.tagIds.includes(tagId)
    onFormDataChange({
      ...formData,
      tagIds: isSelected 
        ? formData.tagIds.filter(id => id !== tagId)
        : [...formData.tagIds, tagId]
    })
  }

  const updateField = (field: keyof SessionFormData, value: string | string[]) => {
    onFormDataChange({
      ...formData,
      [field]: value
    })
  }

  // Get tomorrow's date in YYYY-MM-DD format
  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  // Handle date picker change
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios')
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0]
      updateField('date', dateString)
    }
  }

  // Get Date object from string for picker
  const getDateFromString = (dateString: string): Date => {
    if (!dateString) return new Date()
    const date = new Date(dateString + 'T00:00:00.000Z')
    return isNaN(date.getTime()) ? new Date() : date
  }

  // Format date for display
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return 'Select Date'
    const date = new Date(dateString + 'T00:00:00.000Z')
    if (isNaN(date.getTime())) return 'Select Date'
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Initialize form with defaults
  useEffect(() => {
    if (!formData.date) {
      updateField('date', getTomorrowDate())
    }
    if (!formData.createdById) {
      updateField('createdById', currentUserId)
    }
  }, [currentUserId])

  const currentUser = users.find(user => user.id === currentUserId)

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Session Title */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Session Title *</Text>
        <TextInput
          style={styles.textInput}
          placeholder="e.g., Friday Golf at Pine Valley"
          value={formData.title}
          onChangeText={(value) => updateField('title', value)}
          returnKeyType="next"
        />
      </View>

      {/* Golf Date */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Golf Date *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[
            styles.dateButtonText,
            !formData.date && styles.dateButtonPlaceholder
          ]}>
            {formatDateForDisplay(formData.date)}
          </Text>
          <Text style={styles.dateButtonIcon}>📅</Text>
        </TouchableOpacity>
        <Text style={styles.helpText}>Tap to select date (defaults to tomorrow)</Text>
        
        {showDatePicker && (
          <DateTimePicker
            value={getDateFromString(formData.date)}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}
      </View>

      {/* Description */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Description (Optional)</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Any additional details about the golf session..."
          value={formData.description}
          onChangeText={(value) => updateField('description', value)}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Created By */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Created By</Text>
        <View style={styles.creatorDisplay}>
          <Text style={styles.creatorText}>
            {currentUser ? `${currentUser.name} (${currentUser.nickname})` : 'Current User'}
          </Text>
        </View>
      </View>

      {/* Tag Selection */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Target Groups (Optional)</Text>
        <Text style={styles.helpText}>
          Select which groups should see this session. Leave empty for everyone.
        </Text>
        
        {loadingTags ? (
          <Text style={styles.loadingText}>Loading tags...</Text>
        ) : availableTags.length === 0 ? (
          <Text style={styles.emptyText}>
            No tags available. Create tags in Admin first.
          </Text>
        ) : (
          <View style={styles.tagsContainer}>
            {availableTags.map((tag) => (
              <TouchableOpacity
                key={tag.id}
                style={[
                  styles.tagItem,
                  formData.tagIds.includes(tag.id) && styles.tagItemSelected
                ]}
                onPress={() => handleTagToggle(tag.id)}
              >
                <View style={styles.tagContent}>
                  <View style={styles.tagInfo}>
                    {tag.color && (
                      <View 
                        style={[styles.tagColorDot, { backgroundColor: tag.color }]}
                      />
                    )}
                    <Text style={[
                      styles.tagName,
                      formData.tagIds.includes(tag.id) && styles.tagNameSelected
                    ]}>
                      {tag.name}
                    </Text>
                  </View>
                  <Text style={[
                    styles.tagCount,
                    formData.tagIds.includes(tag.id) && styles.tagCountSelected
                  ]}>
                    {tag._count.userTags} users
                  </Text>
                </View>
                <View style={[
                  styles.checkbox,
                  formData.tagIds.includes(tag.id) && styles.checkboxSelected
                ]}>
                  {formData.tagIds.includes(tag.id) && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {formData.tagIds.length > 0 && (
          <Text style={styles.selectedCount}>
            Selected: {formData.tagIds.length} group{formData.tagIds.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  dateButtonText: {
    fontSize: 16,
    color: '#374151',
  },
  dateButtonPlaceholder: {
    color: '#9ca3af',
  },
  dateButtonIcon: {
    fontSize: 18,
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  creatorDisplay: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  creatorText: {
    fontSize: 16,
    color: '#374151',
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    padding: 20,
  },
  tagsContainer: {
    gap: 8,
    marginTop: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
  },
  tagItemSelected: {
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
  },
  tagContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tagColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  tagName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  tagNameSelected: {
    color: '#1e40af',
  },
  tagCount: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  tagCountSelected: {
    color: '#1e40af',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkboxSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedCount: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
})