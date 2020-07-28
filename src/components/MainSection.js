import React, { useContext }from 'react';
import { AuthContext } from '../Contexts';
import { Route, Switch, Redirect } from 'react-router-dom';
import Explorations from './main/Explorations';
import JobForm from './main/JobForm';
import Landing from './main/Landing';
import User from './main/User';
import JobResults from './main/JobResults';
import NotFound from './main/NotFound';

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
        <Route path="/" exact component={ Landing }/>
        <PrivateRoute path="/user" component={ User }/>
        <PrivateRoute path="/new-exploration" component={ JobForm }/>
        <PrivateRoute path="/explorations/search-results" component={ JobResults }/>
        <PrivateRoute path="/explorations" component={ Explorations }/>
        <Route path="/404" component={ NotFound }/>
        <Redirect to="/404"/>
      </Switch>
    </section>
  );
}

export default MainSection;
