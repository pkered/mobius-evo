import React, { useContext } from 'react';
import { AuthContext } from '../../Contexts';

function User() {
  const cognitoPayload = useContext(AuthContext).cognitoPayload;
  return (
    <div>
      <h1>Welcome, {cognitoPayload.nickname}!</h1>
    </div>
  )
};

export default User;