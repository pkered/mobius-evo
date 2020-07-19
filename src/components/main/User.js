import React, { useContext } from 'react';
import { AuthContext } from '../../Contexts';
import Jobs from '../aside/Jobs';

function User() {
  const cognitoPayload = useContext(AuthContext).cognitoPayload;
  return (
    <div>
      <h1>Welcome, {cognitoPayload.nickname}!</h1>
      <Jobs/>
    </div>
  )
};

export default User;