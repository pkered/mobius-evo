/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUser = /* GraphQL */ `
  mutation CreateUser(
    $input: CreateUserInput!
    $condition: ModelUserConditionInput
  ) {
    createUser(input: $input, condition: $condition) {
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
export const updateUser = /* GraphQL */ `
  mutation UpdateUser(
    $input: UpdateUserInput!
    $condition: ModelUserConditionInput
  ) {
    updateUser(input: $input, condition: $condition) {
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
export const deleteUser = /* GraphQL */ `
  mutation DeleteUser(
    $input: DeleteUserInput!
    $condition: ModelUserConditionInput
  ) {
    deleteUser(input: $input, condition: $condition) {
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
      settings
      createdAt
      endedAt
      status
      updatedAt
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
      settings
      createdAt
      endedAt
      status
      updatedAt
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
      settings
      createdAt
      endedAt
      status
      updatedAt
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
export const updateGenEvalParam = /* GraphQL */ `
  mutation UpdateGenEvalParam(
    $input: UpdateGenEvalParamInput!
    $condition: ModelGenEvalParamConditionInput
  ) {
    updateGenEvalParam(input: $input, condition: $condition) {
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
export const deleteGenEvalParam = /* GraphQL */ `
  mutation DeleteGenEvalParam(
    $input: DeleteGenEvalParamInput!
    $condition: ModelGenEvalParamConditionInput
  ) {
    deleteGenEvalParam(input: $input, condition: $condition) {
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
export const createFile = /* GraphQL */ `
  mutation CreateFile(
    $input: CreateFileInput!
    $condition: ModelFileConditionInput
  ) {
    createFile(input: $input, condition: $condition) {
      id
      filename
      s3url
      uploadedAt
      createdAt
      updatedAt
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
      filename
      s3url
      uploadedAt
      createdAt
      updatedAt
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
      filename
      s3url
      uploadedAt
      createdAt
      updatedAt
    }
  }
`;
