import React, { useState, useEffect } from 'react';
import { AmplifySignOut } from '@aws-amplify/ui-react';
import { Auth } from 'aws-amplify';


function Landing() {
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cognitoPayload, setCognitoPayload] = useState({});

  useEffect( () => {
    async function authUser()
    { 
      try 
      {
        let currSession = await Auth.currentSession();
        setIsAuthenticated(true);
        setCognitoPayload(currSession.getIdToken().payload);
      } 
      catch (err) 
      {
        if (err !== "No current user") 
        { // no current user on page load
          alert(err);
        }
      }
      setIsAuthenticating(false);
    }
    authUser();
  }, [isAuthenticating, isAuthenticated]);

  return (
    !isAuthenticating &&
    <div>
      <h1>Welcome, {cognitoPayload.nickname}!</h1>
      <AmplifySignOut></AmplifySignOut>
    </div>
  );
}

export default Landing;