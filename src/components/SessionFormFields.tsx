import React, { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from 'react-native'
import { Calendar } from 'react-native-calendars'
import DateTimePicker from '@react-native-community/datetimepicker'
import { tagsApi } from '../lib/api'

interface Tag {
  id: string
  name: string
  description?: string | null
  color?: string | null
}

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
  const [showCalendar, setShowCalendar] = useState(false)
  const [showTimePicker, setShowTimePicker] = useState(false)

  // Fetch available tags
  useEffect(() => {
    fetchTags()
  }, [])

  const fetchTags = async () => {
    setLoadingTags(true)
    try {
      const tags = await tagsApi.getAll()
      // Tags now include real user counts from GraphQL
      setAvailableTags(tags)
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

  // Handle calendar date selection
  const handleCalendarDayPress = (day: any) => {
    updateField('date', day.dateString)
    setShowCalendar(false) // Hide calendar after selection
  }

  // Get marked dates for calendar
  const getMarkedDates = () => {
    if (!formData.date) return {}
    
    return {
      [formData.date]: {
        selected: true,
        selectedColor: '#22c55e', // Green to match your app
        selectedTextColor: 'white'
      }
    }
  }

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0]
  }

  // Handle time picker change
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios')
    if (selectedTime) {
      // Round to nearest 15 minutes
      const roundedTime = roundToNearest15Minutes(selectedTime)
      const timeString = roundedTime.toTimeString().slice(0, 5) // HH:MM format
      updateField('time', timeString)
    }
  }

  // Round time to nearest 15-minute increment
  const roundToNearest15Minutes = (date: Date) => {
    const minutes = date.getMinutes()
    const roundedMinutes = Math.round(minutes / 15) * 15
    const newDate = new Date(date)
    newDate.setMinutes(roundedMinutes)
    newDate.setSeconds(0)
    newDate.setMilliseconds(0)
    return newDate
  }

  // Get Date object from time string for picker
  const getTimeFromString = (timeString: string): Date => {
    if (!timeString) {
      const defaultTime = new Date()
      defaultTime.setHours(10, 0, 0, 0) // 10:00 AM
      return defaultTime
    }
    const [hours, minutes] = timeString.split(':')
    const time = new Date()
    time.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    return time
  }

  // Format time for 12-hour display
  const formatTimeFor12Hour = (time24: string) => {
    if (!time24) return 'Select Time'
    const [hours, minutes] = time24.split(':')
    const hour12 = parseInt(hours)
    const ampm = hour12 >= 12 ? 'PM' : 'AM'
    const displayHour = hour12 === 0 ? 12 : hour12 > 12 ? hour12 - 12 : hour12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // Get default time (10:00 AM)
  const getDefaultTime = () => {
    return '10:00'
  }

  // Format date for display
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return 'Select Date'
    // Parse the date as local time, not UTC
    const [year, month, day] = dateString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
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
    if (!formData.time) {
      updateField('time', getDefaultTime())
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

      {/* Date */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Date *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowCalendar(!showCalendar)}
        >
          <Text style={[
            styles.dateButtonText,
            !formData.date && styles.dateButtonPlaceholder
          ]}>
            {formatDateForDisplay(formData.date)}
          </Text>
          <Text style={styles.dateButtonIcon}>📅</Text>
        </TouchableOpacity>
        <Text style={styles.helpText}>
          {showCalendar ? 'Tap a date to select' : 'Tap to view calendar'}
        </Text>
        
        {showCalendar && (
          <View style={styles.calendarContainer}>
            <Calendar
              minDate={getMinDate()}
              onDayPress={handleCalendarDayPress}
              markedDates={getMarkedDates()}
              theme={{
                backgroundColor: '#ffffff',
                calendarBackground: '#ffffff',
                textSectionTitleColor: '#b6c1cd',
                selectedDayBackgroundColor: '#22c55e',
                selectedDayTextColor: '#ffffff',
                todayTextColor: '#22c55e',
                dayTextColor: '#2d4150',
                textDisabledColor: '#d9e1e8',
                arrowColor: '#22c55e',
                disabledArrowColor: '#d9e1e8',
                monthTextColor: '#2d4150',
                indicatorColor: '#22c55e',
                textDayFontWeight: '500',
                textMonthFontWeight: '600',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14
              }}
              style={styles.calendar}
            />
          </View>
        )}
      </View>

      {/* Time */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>Time *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowTimePicker(!showTimePicker)}
        >
          <Text style={[
            styles.dateButtonText,
            !formData.time && styles.dateButtonPlaceholder
          ]}>
            {formData.time ? formatTimeFor12Hour(formData.time) : 'Select Time'}
          </Text>
          <Text style={styles.dateButtonIcon}>🕐</Text>
        </TouchableOpacity>
        <Text style={styles.helpText}>
          {showTimePicker ? 'Select time and it will round to 15-minute increments' : 'Tap to select time'}
        </Text>
        
        {showTimePicker && (
          <DateTimePicker
            value={getTimeFromString(formData.time)}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            minuteInterval={15}
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
                  {/* User count removed for simplicity */}
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
  calendarContainer: {
    marginTop: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calendar: {
    borderRadius: 12,
  },
})