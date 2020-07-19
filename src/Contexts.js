import { createContext } from 'react';

export const MenuContext = createContext(
  {
    menuState: "landing",
    setMenuState: ()=>{}
  }
);
export const AuthContext = createContext(
  {
    cognitoPayload: null,
    setCognitoPayload: ()=>{}
  }
);