import React, { useContext } from 'react';
import { Auth } from 'aws-amplify';
import { MenuContext, AuthContext } from '../Contexts';
import { LineChartOutlined, FormOutlined  } from '@ant-design/icons';
import { Menu , Button } from 'antd';

function HeaderComponent() {
  const { menuState, setMenuState } = useContext(MenuContext);
  const cognitoPayload = useContext(AuthContext).cognitoPayload;

  function NavButtons() {
    const handleClick = event => setMenuState(event.key);
    const menu = (
      <Menu 
        onClick={handleClick} 
        selectedKeys={[menuState]} 
        mode="horizontal">
        <Menu.Item key="jobForm" icon={<FormOutlined/>}>New Job</Menu.Item>
        <Menu.Item key="results" icon={<LineChartOutlined/>}>View Results</Menu.Item>
      </Menu>
    );

    return (
      <nav>
        <h1 
          id="mobius-evo"
          onClick={()=>setMenuState("landing")}
        >
          Mobius-evo
        </h1>
        {cognitoPayload && menu}
      </nav>
    );
  };

  function AccButton() {
    return (cognitoPayload && 
      <div className="user-menu">
        <Button 
          id="user-btn"
          type="link"
          style={{height:"100%"}}
          onClick={()=>setMenuState("user")}
        >
          Hi, {cognitoPayload.nickname}
        </Button>  
        <Button
          id="signout"
          onClick={() => Auth.signOut().then(()=> window.location.reload(false))}
        >
          Sign Out
        </Button>
      </div>
    );
  };

  return (
    <header>
      <NavButtons/>
      <AccButton/>
    </header>
  )
}

export default HeaderComponent;