import { GraphQLClient } from 'graphql-request'

// Mobile app AppSync configuration
const endpoint = 'https://mtob4f4vuvcdxcycm2g54tcyqu.appsync-api.us-east-1.amazonaws.com/graphql'
const apiKey = 'da2-ldaadi24bzca3hyb7n75d4cndq'

export const graphqlClient = new GraphQLClient(endpoint, {
  headers: {
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
  },
})

// GraphQL Queries and Mutations for Mobile App
export const queries = {
  GET_USERS: `
    query GetUsers {
      listUsers {
        id name nickname phone isAdmin createdAt updatedAt
      }
    }
  `,
  
  GET_USER: `
    query GetUser($id: ID!) {
      getUser(id: $id) {
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
        id status note transport userId golfSessionId createdAt updatedAt
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
  `,
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
        id name nickname phone isAdmin createdAt updatedAt
      }
    }
  `,
  
  DELETE_USER: `
    mutation DeleteUser($id: ID!) {
      deleteUser(id: $id)
    }
  `,
  
  CREATE_SESSION: `
    mutation CreateGolfSession($input: CreateGolfSessionInput!) {
      createGolfSession(input: $input) {
        id title date description createdById isArchived
        createdAt updatedAt archivedAt archivedBy
      }
    }
  `,
  
  UPDATE_SESSION: `
    mutation UpdateGolfSession($input: UpdateGolfSessionInput!) {
      updateGolfSession(input: $input) {
        id title date description createdById isArchived
        createdAt updatedAt archivedAt archivedBy
      }
    }
  `,
  
  SUBMIT_RESPONSE: `
    mutation SubmitResponse($input: SubmitResponseInput!) {
      submitResponse(input: $input) {
        id status note transport userId golfSessionId createdAt updatedAt
      }
    }
  `,
  
  DELETE_RESPONSE: `
    mutation DeleteResponse($userId: ID!, $golfSessionId: ID!) {
      deleteResponse(userId: $userId, golfSessionId: $golfSessionId) {
        id status note transport userId golfSessionId createdAt updatedAt
      }
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
  `,
}
