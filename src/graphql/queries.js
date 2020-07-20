/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getUser = /* GraphQL */ `
  query GetUser($id: ID!) {
    getUser(id: $id) {
      id
      email
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
export const listUsers = /* GraphQL */ `
  query ListUsers(
    $filter: ModelUserFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listUsers(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        email
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
      nextToken
    }
  }
`;
export const getJob = /* GraphQL */ `
  query GetJob($id: ID!) {
    getJob(id: $id) {
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
  }
`;
export const listJobs = /* GraphQL */ `
  query ListJobs(
    $filter: ModelJobFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listJobs(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
export const getGenEvalParam = /* GraphQL */ `
  query GetGenEvalParam($id: ID!) {
    getGenEvalParam(id: $id) {
      id
      jobID {
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
      genID
      evalResult
      live
      model
      params
      score
      createdAt
      updatedAt
    }
  }
`;
export const listGenEvalParams = /* GraphQL */ `
  query ListGenEvalParams(
    $filter: ModelGenEvalParamFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listGenEvalParams(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        jobID {
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
        genID
        evalResult
        live
        model
        params
        score
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
export const getFile = /* GraphQL */ `
  query GetFile($id: ID!) {
    getFile(id: $id) {
      id
      filename
      s3url
      uploadedAt
      createdAt
      updatedAt
    }
  }
`;
export const listFiles = /* GraphQL */ `
  query ListFiles(
    $filter: ModelFileFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listFiles(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        filename
        s3url
        uploadedAt
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
