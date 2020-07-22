/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUser = /* GraphQL */ `
  subscription OnCreateUser {
    onCreateUser {
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
export const onUpdateUser = /* GraphQL */ `
  subscription OnUpdateUser {
    onUpdateUser {
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
export const onDeleteUser = /* GraphQL */ `
  subscription OnDeleteUser {
    onDeleteUser {
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
export const onCreateJob = /* GraphQL */ `
  subscription OnCreateJob($owner: String!) {
    onCreateJob(owner: $owner) {
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
export const onUpdateJob = /* GraphQL */ `
  subscription OnUpdateJob($owner: String!) {
    onUpdateJob(owner: $owner) {
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
export const onDeleteJob = /* GraphQL */ `
  subscription OnDeleteJob($owner: String!) {
    onDeleteJob(owner: $owner) {
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
export const onCreateGenEvalParam = /* GraphQL */ `
  subscription OnCreateGenEvalParam($owner: String!) {
    onCreateGenEvalParam(owner: $owner) {
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
export const onUpdateGenEvalParam = /* GraphQL */ `
  subscription OnUpdateGenEvalParam($owner: String!) {
    onUpdateGenEvalParam(owner: $owner) {
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
export const onDeleteGenEvalParam = /* GraphQL */ `
  subscription OnDeleteGenEvalParam($owner: String!) {
    onDeleteGenEvalParam(owner: $owner) {
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
