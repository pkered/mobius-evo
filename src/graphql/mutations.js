/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createJob = /* GraphQL */ `
  mutation CreateJob(
    $input: CreateJobInput!
    $condition: ModelJobConditionInput
  ) {
    createJob(input: $input, condition: $condition) {
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
export const updateJob = /* GraphQL */ `
  mutation UpdateJob(
    $input: UpdateJobInput!
    $condition: ModelJobConditionInput
  ) {
    updateJob(input: $input, condition: $condition) {
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
export const deleteJob = /* GraphQL */ `
  mutation DeleteJob(
    $input: DeleteJobInput!
    $condition: ModelJobConditionInput
  ) {
    deleteJob(input: $input, condition: $condition) {
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
export const createGenEvalParam = /* GraphQL */ `
  mutation CreateGenEvalParam(
    $input: CreateGenEvalParamInput!
    $condition: ModelGenEvalParamConditionInput
  ) {
    createGenEvalParam(input: $input, condition: $condition) {
      id
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
export const updateGenEvalParam = /* GraphQL */ `
  mutation UpdateGenEvalParam(
    $input: UpdateGenEvalParamInput!
    $condition: ModelGenEvalParamConditionInput
  ) {
    updateGenEvalParam(input: $input, condition: $condition) {
      id
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
export const deleteGenEvalParam = /* GraphQL */ `
  mutation DeleteGenEvalParam(
    $input: DeleteGenEvalParamInput!
    $condition: ModelGenEvalParamConditionInput
  ) {
    deleteGenEvalParam(input: $input, condition: $condition) {
      id
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
export const createFile = /* GraphQL */ `
  mutation CreateFile(
    $input: CreateFileInput!
    $condition: ModelFileConditionInput
  ) {
    createFile(input: $input, condition: $condition) {
      id
      s3key
      filename
      createdAt
      updatedAt
      owner
    }
  }
`;
export const updateFile = /* GraphQL */ `
  mutation UpdateFile(
    $input: UpdateFileInput!
    $condition: ModelFileConditionInput
  ) {
    updateFile(input: $input, condition: $condition) {
      id
      s3key
      filename
      createdAt
      updatedAt
      owner
    }
  }
`;
export const deleteFile = /* GraphQL */ `
  mutation DeleteFile(
    $input: DeleteFileInput!
    $condition: ModelFileConditionInput
  ) {
    deleteFile(input: $input, condition: $condition) {
      id
      s3key
      filename
      createdAt
      updatedAt
      owner
    }
  }
`;
