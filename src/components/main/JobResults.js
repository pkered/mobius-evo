import React, { useEffect, useState } from 'react';
import * as QueryString from 'query-string';
import { Link } from 'react-router-dom';
import { Row, Space } from 'antd';

function JobResults() {
  const [ jobID, setSearchID ] = useState(null);

  useEffect(()=>{
    const jobID = QueryString.parse(window.location.hash).id;
    setSearchID(jobID);
  }, []);

  return (
    <Space
      direction="vertical"
      size = "large"
      style = {{width:"inherit"}}
    >
      <Row>
        <h3>
          <Link to="/explorations">Explorations</Link> / {jobID}
        </h3>
      </Row>
    </Space>
  );
};

export default JobResults;