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
      status
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
      status
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
      status
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
export const updateGenEvalParam = /* GraphQL */ `
  mutation UpdateGenEvalParam(
    $input: UpdateGenEvalParamInput!
    $condition: ModelGenEvalParamConditionInput
  ) {
    updateGenEvalParam(input: $input, condition: $condition) {
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
export const deleteGenEvalParam = /* GraphQL */ `
  mutation DeleteGenEvalParam(
    $input: DeleteGenEvalParamInput!
    $condition: ModelGenEvalParamConditionInput
  ) {
    deleteGenEvalParam(input: $input, condition: $condition) {
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
