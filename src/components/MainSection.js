import React, { useContext } from 'react';
import { MenuContext } from '../Contexts';
import Results from './main/Results';
import JobForm from './main/JobForm';
import Landing from './main/Landing';
import User from './main/User';

function MainSection() {
  const menuContext  = useContext(MenuContext);
  let toRender = null;
  switch (menuContext.menuState) {
    case "results":
      toRender = <Results/>
      break;
    case "jobForm":
      toRender = <JobForm/>
      break;
    case "user":
      toRender = <User/>
      break;
    default:
      toRender = <Landing />
  };

  return (
    <section id="main-section">
      {toRender}
    </section>
  );
}

export default MainSection;
