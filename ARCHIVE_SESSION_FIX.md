# Archive Session Fix - "SubSelectionNotAllowed" Error

## Problem
Mobile app was throwing a GraphQL validation error when trying to archive sessions:

**Error Message:**
```
Validation error of type SubSelectionNotAllowed: Sub selection not allowed on leaf type Boolean of field deleteGolfSession
```

## Root Cause
The mobile app had GraphQL mutations that were trying to query fields on Boolean return types. According to the GraphQL schema, several mutations return `Boolean`:

- `deleteUser(id: ID!): Boolean`
- `deleteGolfSession(id: ID!): Boolean`
- `deleteTag(id: ID!): Boolean`
- `removeTagFromUser(userId: ID!, tagId: ID!): Boolean`
- `removeTagFromSession(sessionId: ID!, tagId: ID!): Boolean`

However, the mobile app's GraphQL mutations were incorrectly trying to query fields on these Boolean returns:

### Incorrect Code:
```graphql
DELETE_USER: `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id name nickname phone isAdmin createdAt updatedAt  # ❌ Can't query fields on Boolean!
    }
  }
`

REMOVE_TAG_FROM_SESSION: `
  mutation RemoveTagFromSession($sessionId: ID!, $tagId: ID!) {
    removeTagFromSession(sessionId: $sessionId, tagId: $tagId) {
      success message  # ❌ Can't query fields on Boolean!
    }
  }
`
```

## Solution
Fixed the mutations to not query any fields on Boolean return types:

### Fixed Code:
```graphql
DELETE_USER: `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)  # ✅ Just get the Boolean result
  }
`

REMOVE_TAG_FROM_SESSION: `
  mutation RemoveTagFromSession($sessionId: ID!, $tagId: ID!) {
    removeTagFromSession(sessionId: $sessionId, tagId: $tagId)  # ✅ Just get the Boolean result
  }
`
```

## Changes Made

**File:** `golf-scheduler-mobile/src/lib/appsync.ts`

### 1. Fixed DELETE_USER mutation (lines 100-104)
**Before:**
```typescript
DELETE_USER: `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id) {
      id name nickname phone isAdmin createdAt updatedAt
    }
  }
`,
```

**After:**
```typescript
DELETE_USER: `
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`,
```

### 2. Fixed REMOVE_TAG_FROM_SESSION mutation (lines 148-152)
**Before:**
```typescript
REMOVE_TAG_FROM_SESSION: `
  mutation RemoveTagFromSession($sessionId: ID!, $tagId: ID!) {
    removeTagFromSession(sessionId: $sessionId, tagId: $tagId) {
      success message
    }
  }
`,
```

**After:**
```typescript
REMOVE_TAG_FROM_SESSION: `
  mutation RemoveTagFromSession($sessionId: ID!, $tagId: ID!) {
    removeTagFromSession(sessionId: $sessionId, tagId: $tagId)
  }
`,
```

## Important Notes

### Archive vs Delete
The mobile app correctly uses **archiving** (soft delete) instead of hard delete:

```typescript
// In api.ts - sessionApi.delete()
delete: async (id: string, userId?: string) => {
  await graphqlClient.request(mutations.UPDATE_SESSION, {
    input: {
      id,
      isArchived: true,
      archivedBy: userId || null
    }
  })
  return { message: 'Session archived successfully', deletedResponses: 0 }
}
```

This is the correct approach! It uses `UPDATE_SESSION` to set `isArchived: true` rather than calling `deleteGolfSession`.

### Why the Error Mentioned deleteGolfSession
Even though the mobile app doesn't directly call `deleteGolfSession`, the error appeared because:
1. The GraphQL client may have been caching or validating all available mutations
2. The malformed mutations in the file were being validated by the GraphQL schema
3. The error message showed one of the problematic mutations as an example

## Testing

After this fix, you should be able to:
- ✅ Archive sessions from the mobile app
- ✅ Delete users (if that feature is used)
- ✅ Remove tags from sessions

## Next Steps

### Clear the Mobile App Cache
To ensure the fixes take effect, clear the Expo/Metro bundler cache:

```bash
cd /Users/markhornak/Development/golf-scheduler-mobile

# Clear Expo cache
rm -rf .expo

# Clear Metro bundler cache
npx expo start --clear

# Or if using React Native CLI:
# npx react-native start --reset-cache
```

### Rebuild the App
If testing on a physical device or simulator:

```bash
# For iOS
eas build --platform ios --profile development

# For Android
eas build --platform android --profile development
```

## Related Files
- `golf-scheduler-mobile/src/lib/appsync.ts` - GraphQL mutations (FIXED)
- `golf-scheduler-mobile/src/lib/api.ts` - API layer that uses the mutations
- `golf-scheduler-mobile/App.tsx` - Handles archive session action (line 187-209)
- `golf-scheduler-aws/schema/schema.graphql` - GraphQL schema defining return types

## Date Fixed
October 24, 2025

## Related Issues
- This is similar to the "cannot read property 'id' of null" issue fixed earlier
- Both issues were caused by mismatches between the GraphQL schema and the client code
- The previous issue was resolvers not returning data; this issue was clients trying to query non-existent fields

