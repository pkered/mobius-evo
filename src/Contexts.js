import { createContext } from 'react';

export const AuthContext = createContext(
  {
    cognitoPayload: null,
    setCognitoPayload: ()=>{},
    isLoading: true
  }
);