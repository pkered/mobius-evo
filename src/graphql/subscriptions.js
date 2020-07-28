/* eslint-disable */
// this is an auto generated file. This will be overwritten

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
      run
      parentID
      childrenID
      jobStatus
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
      run
      parentID
      childrenID
      jobStatus
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
      run
      parentID
      childrenID
      jobStatus
      updatedAt
      owner
    }
  }
`;
export const onCreateGenEvalParam = /* GraphQL */ `
  subscription OnCreateGenEvalParam($owner: String!) {
    onCreateGenEvalParam(owner: $owner) {
      ParamID
      JobID
      GenID
      evalResult
      live
      model
      params
      score
      expirationTime
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onUpdateGenEvalParam = /* GraphQL */ `
  subscription OnUpdateGenEvalParam($owner: String!) {
    onUpdateGenEvalParam(owner: $owner) {
      ParamID
      JobID
      GenID
      evalResult
      live
      model
      params
      score
      expirationTime
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onDeleteGenEvalParam = /* GraphQL */ `
  subscription OnDeleteGenEvalParam($owner: String!) {
    onDeleteGenEvalParam(owner: $owner) {
      ParamID
      JobID
      GenID
      evalResult
      live
      model
      params
      score
      expirationTime
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onCreateFile = /* GraphQL */ `
  subscription OnCreateFile($owner: String!) {
    onCreateFile(owner: $owner) {
      id
      s3key
      filename
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onUpdateFile = /* GraphQL */ `
  subscription OnUpdateFile($owner: String!) {
    onUpdateFile(owner: $owner) {
      id
      s3key
      filename
      createdAt
      updatedAt
      owner
    }
  }
`;
export const onDeleteFile = /* GraphQL */ `
  subscription OnDeleteFile($owner: String!) {
    onDeleteFile(owner: $owner) {
      id
      s3key
      filename
      createdAt
      updatedAt
      owner
    }
  }
`;
