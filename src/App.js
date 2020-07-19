import React, { useState, useEffect } from 'react';

import './App.css';
import { AuthContext, MenuContext} from './Contexts';
import HeaderComponent from './components/HeaderComponent';
import MainSection from './components/MainSection';

function App(){
  const [ menuState, setMenuState ] =  useState("landing");
  const [ cognitoPayload, setCognitoPayload ] = useState(null);

  return(
    <AuthContext.Provider value={{ cognitoPayload, setCognitoPayload }}>
      <MenuContext.Provider value={{ menuState, setMenuState }}>
        <div id="app-body">
          <HeaderComponent />
          <main>
            <MainSection />
          </main>
        </div>
      </MenuContext.Provider>
    </AuthContext.Provider>
  );
};

export default App;
