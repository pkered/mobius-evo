const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
      id
      email
      s3ID
      jobs {
        id
        userID
        evalUrl
        genUrl
        expiration
        description
        settings
        createdAt
        endedAt
        status
        updatedAt
      }
      status
      createdAt
      updatedAt
    }
  }
`;

export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
      id
      email
      s3ID
      jobs {
        id
        userID
        evalUrl
        genUrl
        expiration
        description
        settings
        createdAt
        endedAt
        status
        updatedAt
      }
      status
      createdAt
      updatedAt
    }
  }
`;

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      email
      s3ID
      jobs {
        id
        userID
        evalUrl
        genUrl
        expiration
        description
        settings
        createdAt
        endedAt
        status
        updatedAt
      }
      status
      createdAt
      updatedAt
    }
  }
`;

const mutations = { createUser, updateUser }
const queries = { getUser }

exports.actions = { mutations, queries }