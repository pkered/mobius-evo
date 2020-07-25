import React from 'react';
import { Route, Switch, Redirect } from 'react-router-dom';
import Results from './main/Results';
import JobForm from './main/JobForm';
import Landing from './main/Landing';
import User from './main/User';

function PrivateRoute({ component: Component, ...rest}) {
  return (
    <Route 
      {...rest}
      render={
        props => true ? <Component {...props}/> : <Redirect to={{ pathname:"/", state: { from: props.location } }} />
      }
    />
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
