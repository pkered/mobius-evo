import React from 'react';
import './App.css';
import { AmplifyAuthenticator, AmplifySignUp, AmplifySignIn } from '@aws-amplify/ui-react';
import Landing from './components/Landing'

const App = () => (
  <AmplifyAuthenticator usernameAlias="email">
    <AmplifySignUp
      slot="sign-up"
      usernameAlias="email"
      headerText="Create a Mobius-exo Account"
      formFields={[
        {
          type: "email",
          label: "E-mail",
          placeholder: "email@email.mail",
          required: true
        },
        {
          type: "password",
          label: "Password",
          placeholder: "********",
          required: true
        },
        {
          type: "nickname",
          label: "How should we address you?",
          placeholder: "nickname",
          required: true
        }
      ]}
    />
    <AmplifySignIn
      slot="sign-in"
      usernameAlias="email"
      headerText="Sign-in to Mobius-evo"
    />
    <Landing />
  </AmplifyAuthenticator>
);

export default App;
