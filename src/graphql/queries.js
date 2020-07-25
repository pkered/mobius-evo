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
      parentID
      childID
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
        run
        parentID
        childID
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
        run
        parentID
        childID
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
