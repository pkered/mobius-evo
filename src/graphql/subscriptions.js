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
export const onCreateJob = /* GraphQL */ `
  subscription OnCreateJob {
    onCreateJob {
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
export const onUpdateJob = /* GraphQL */ `
  subscription OnUpdateJob {
    onUpdateJob {
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
export const onDeleteJob = /* GraphQL */ `
  subscription OnDeleteJob {
    onDeleteJob {
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
export const onCreateGenEvalParam = /* GraphQL */ `
  subscription OnCreateGenEvalParam {
    onCreateGenEvalParam {
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
export const onUpdateGenEvalParam = /* GraphQL */ `
  subscription OnUpdateGenEvalParam {
    onUpdateGenEvalParam {
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
export const onDeleteGenEvalParam = /* GraphQL */ `
  subscription OnDeleteGenEvalParam {
    onDeleteGenEvalParam {
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
