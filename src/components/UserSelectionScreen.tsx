import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from 'react-native'

interface User {
  id: string
  name: string
  nickname: string
}

interface UserSelectionScreenProps {
  users: User[]
  onUserSelect: (userId: string) => void
  isLoading?: boolean
}

export default function UserSelectionScreen({
  users,
  onUserSelect,
  isLoading = false,
}: UserSelectionScreenProps) {
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading golf crew...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏌️ Bellewood Golf</Text>
        <Text style={styles.headerSubtitle}>Who are you?</Text>
        <Text style={styles.instruction}>Select your name to continue</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.userButton}
            onPress={() => onUserSelect(user.id)}
          >
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userNickname}>({user.nickname})</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Your selection will be remembered for next time
        </Text>
      </View>
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
    padding: 24,
    alignItems: 'center',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 20,
    color: '#374151',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 16,
    color: '#6b7280',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  userButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userNickname: {
    fontSize: 16,
    color: '#6b7280',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
})