import React, { useContext }from 'react';
import { AuthContext } from '../Contexts';
import { Route, Switch, Redirect } from 'react-router-dom';
import Results from './main/Results';
import JobForm from './main/JobForm';
import Landing from './main/Landing';
import User from './main/User';

function PrivateRoute({ component: Component, ...rest}) {
  const { cognitoPayload, isLoading } = useContext(AuthContext);
  return (
    !isLoading ?
    <Route 
      {...rest}
      render={
        props => cognitoPayload ? <Component {...props}/> : <Redirect to={{ pathname:"/", state: { from: props.location } }} />
      }
    />
    : null
  )
}

function MainSection() {
  return (
    <section id="main-section">
      <Switch>
        <PrivateRoute path="/user" component={ User }/>
        <PrivateRoute path="/new-search" component={ JobForm }/>
        <PrivateRoute path="/explorations" component={ Results }/>
        <Route path="/" component={ Landing }/>
      </Switch>
    </section>
  );
}

export default MainSection;
