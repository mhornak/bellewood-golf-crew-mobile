import { GraphQLClient } from 'graphql-request'

const endpoint = 'https://mtob4f4vuvcdxcycm2g54tcyqu.appsync-api.us-east-1.amazonaws.com/graphql'
const apiKey = 'da2-ldaadi24bzca3hyb7n75d4cndq'

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
  },
})

// WebSocket endpoint for real-time subscriptions
export const realtimeEndpoint = endpoint.replace('https://', 'wss://').replace('/graphql', '/graphql/realtime')

// AppSync configuration for subscriptions
export const appSyncConfig = {
  aws_appsync_graphqlEndpoint: endpoint,
  aws_appsync_region: 'us-east-1',
  aws_appsync_authenticationType: 'API_KEY',
  aws_appsync_apiKey: apiKey,
  aws_appsync_realTimeEndpoint: realtimeEndpoint,
}

// GraphQL Queries and Mutations
export const queries = {
  GET_USERS: `
    query GetUsers {
      listUsers {
        id name nickname phone isAdmin createdAt updatedAt
      }
    }
  `,
  
  GET_SESSIONS: `
    query GetSessions($includeArchived: Boolean) {
      listGolfSessions(includeArchived: $includeArchived) {
        id title date description createdById isArchived
        createdAt updatedAt archivedAt archivedBy
      }
    }
  `,
  
  GET_SESSION: `
    query GetSession($id: ID!) {
      getGolfSession(id: $id) {
        id title date description createdById isArchived
        createdAt updatedAt archivedAt archivedBy
      }
    }
  `,
  
  GET_RESPONSES_FOR_SESSION: `
    query GetResponsesForSession($golfSessionId: ID!) {
      getResponsesForSession(golfSessionId: $golfSessionId) {
        id status note transport userId golfSessionId
        createdAt updatedAt
      }
    }
  `,
  
  GET_TAGS: `
    query GetTags {
      listTags {
        id name description color createdAt updatedAt
      }
    }
  `,

  GET_USER_TAGS: `
    query GetUserTags($userId: ID!) {
      getUserTags(userId: $userId) {
        id userId tagId createdAt createdBy
      }
    }
  `,

  GET_SESSION_TAGS: `
    query GetSessionTags($sessionId: ID!) {
      getSessionTags(sessionId: $sessionId) {
        id sessionId tagId createdAt
      }
    }
  `
}

export const mutations = {
  CREATE_USER: `
    mutation CreateUser($input: CreateUserInput!) {
      createUser(input: $input) {
        id name nickname phone isAdmin createdAt updatedAt
      }
    }
  `,
  
  UPDATE_USER: `
    mutation UpdateUser($input: UpdateUserInput!) {
      updateUser(input: $input) {
        id name nickname phone isAdmin updatedAt
      }
    }
  `,

  DELETE_USER: `
    mutation DeleteUser($id: ID!) {
      deleteUser(id: $id)
    }
  `,
  
  CREATE_SESSION: `
    mutation CreateSession($input: CreateGolfSessionInput!) {
      createGolfSession(input: $input) {
        id title date description createdById
        createdAt updatedAt
      }
    }
  `,

  UPDATE_SESSION: `
    mutation UpdateSession($input: UpdateGolfSessionInput!) {
      updateGolfSession(input: $input) {
        id title date description isArchived
        archivedAt archivedBy updatedAt
      }
    }
  `,

  DELETE_SESSION: `
    mutation DeleteSession($id: ID!) {
      deleteGolfSession(id: $id)
    }
  `,
  
  SUBMIT_RESPONSE: `
    mutation SubmitResponse($input: SubmitResponseInput!) {
      submitResponse(input: $input) {
        id status note transport userId golfSessionId
        createdAt updatedAt
      }
    }
  `,

  DELETE_RESPONSE: `
    mutation DeleteResponse($userId: ID!, $golfSessionId: ID!) {
      deleteResponse(userId: $userId, golfSessionId: $golfSessionId)
    }
  `,
  
  CREATE_TAG: `
    mutation CreateTag($input: CreateTagInput!) {
      createTag(input: $input) {
        id name description color createdAt updatedAt
      }
    }
  `,

  UPDATE_TAG: `
    mutation UpdateTag($input: UpdateTagInput!) {
      updateTag(input: $input) {
        id name description color updatedAt
      }
    }
  `,

  DELETE_TAG: `
    mutation DeleteTag($id: ID!) {
      deleteTag(id: $id)
    }
  `,
  
  ADD_TAG_TO_USER: `
    mutation AddTagToUser($input: AddTagToUserInput!) {
      addTagToUser(input: $input) {
        id userId tagId createdAt createdBy
      }
    }
  `,

  REMOVE_TAG_FROM_USER: `
    mutation RemoveTagFromUser($userId: ID!, $tagId: ID!) {
      removeTagFromUser(userId: $userId, tagId: $tagId)
    }
  `,
  
  ADD_TAG_TO_SESSION: `
    mutation AddTagToSession($input: AddTagToSessionInput!) {
      addTagToSession(input: $input) {
        id sessionId tagId createdAt
      }
    }
  `,

  REMOVE_TAG_FROM_SESSION: `
    mutation RemoveTagFromSession($sessionId: ID!, $tagId: ID!) {
      removeTagFromSession(sessionId: $sessionId, tagId: $tagId)
    }
  `
}

// GraphQL Subscriptions for real-time updates
export const subscriptions = {
  ON_RESPONSE_SUBMITTED: `
    subscription OnResponseSubmitted($golfSessionId: ID!) {
      onResponseSubmitted(golfSessionId: $golfSessionId) {
        id status note transport userId golfSessionId
        createdAt updatedAt
      }
    }
  `,
  
  ON_GOLF_SESSION_CREATED: `
    subscription OnGolfSessionCreated {
      onGolfSessionCreated {
        id title date description createdById isArchived
        createdAt updatedAt archivedAt archivedBy
      }
    }
  `,
  
  ON_GOLF_SESSION_UPDATED: `
    subscription OnGolfSessionUpdated($id: ID!) {
      onGolfSessionUpdated(id: $id) {
        id title date description createdById isArchived
        createdAt updatedAt archivedAt archivedBy
      }
    }
  `
}
