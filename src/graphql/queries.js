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
        maxDesigns
        population_size
        tournament_size
        survival_size
        createdAt
        endedAt
        status
        updatedAt
        owner
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
          maxDesigns
          population_size
          tournament_size
          survival_size
          createdAt
          endedAt
          status
          updatedAt
          owner
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
      maxDesigns
      population_size
      tournament_size
      survival_size
      createdAt
      endedAt
      status
      updatedAt
      owner
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
        status
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const getGenEvalParam = /* GraphQL */ `
  query GetGenEvalParam($id: ID!) {
    getGenEvalParam(id: $id) {
      id
      jobID
      genID
      evalResult
      live
      model
      params
      score
      createdAt
      updatedAt
      owner
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
        jobID
        genID
        evalResult
        live
        model
        params
        score
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const jobsByStatus = /* GraphQL */ `
  query JobsByStatus(
    $status: JobStatus
    $sortDirection: ModelSortDirection
    $filter: ModelJobFilterInput
    $limit: Int
    $nextToken: String
  ) {
    jobsByStatus(
      status: $status
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
        status
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
export const evalByJobId = /* GraphQL */ `
  query EvalByJobId(
    $jobID: ID
    $sortDirection: ModelSortDirection
    $filter: ModelGenEvalParamFilterInput
    $limit: Int
    $nextToken: String
  ) {
    evalByJobID(
      jobID: $jobID
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        jobID
        genID
        evalResult
        live
        model
        params
        score
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;
