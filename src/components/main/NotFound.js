import React from 'react';
import { FrownOutlined } from '@ant-design/icons';
function NotFound() {
  return (
    <div
      style={{
        textAlign: "center",
        width: "100%",
        height: "100%",
        paddingTop: "2em"
      }} 
    >
      <FrownOutlined />
      <h1>404</h1>
      <p>The page you requested is not available</p>
    </div>
  )
}

export default NotFound;