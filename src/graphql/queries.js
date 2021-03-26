/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getJob = /* GraphQL */ `
  query GetJob($id: ID!) {
    getJob(id: $id) {
      id
      userID
      evalUrl
      genUrl
      expiration
      description
      maxDesigns
      population_size
      tournament_size
      survival_size
      createdAt
      endedAt
      run
      jobStatus
      owner
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
        maxDesigns
        population_size
        tournament_size
        survival_size
        createdAt
        endedAt
        run
        jobStatus
        owner
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
      JobID
      GenID
      genUrl
      evalUrl
      evalResult
      live
      params
      score
      owner
      expirationTime
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
        JobID
        GenID
        genUrl
        evalUrl
        evalResult
        live
        params
        score
        owner
        expirationTime
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
      s3key
      filename
      createdAt
      updatedAt
      owner
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
        s3key
        filename
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const generationsByJobId = /* GraphQL */ `
  query GenerationsByJobId(
    $JobID: ID
    $owner: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelGenEvalParamFilterInput
    $limit: Int
    $nextToken: String
  ) {
    generationsByJobID(
      JobID: $JobID
      owner: $owner
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        JobID
        GenID
        genUrl
        evalUrl
        evalResult
        live
        params
        score
        owner
        expirationTime
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;
