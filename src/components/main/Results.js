import React, { useEffect, useState, useContext } from 'react';
import { Space, Row, Col, Card } from 'antd';
import { API, graphqlOperation } from 'aws-amplify';
import { listJobs } from '../../graphql/queries';
import { AuthContext } from '../../Contexts';

function JobGallery({ jobList, setSelectedJob }) {
  const jobCards = jobList.map(job => {
    const {
      createdAt,
      description,
      expiration,
      id,
      maxDesigns,
      population_size,
      status,
      survival_size,
      tournament_size
    } = job;

    return (
      <Col
        key={id}
        span={6}
      >
        <Card
          title={description}
          bordered={false}
        >
          <p>{createdAt}</p>
          <p>{status}</p>
          <p>Number of Designs: {maxDesigns}</p>
        </Card>
      </Col>
    )
  });
  return (
    <Space
      direction="vertical"
      size = "large"
      style = {{width:"inherit"}}
    >
      <Row><h1>Jobs</h1></Row>
      <Row
        gutter={24}
        justify="start"
      >
        {jobCards}
      </Row>
    </Space>
  );
};

function Job({ selectedJobState }) {
  const { selectedJob, setSelectedJob } = selectedJobState
  return (
    <Space
      direction="vertical"
      size = "large"
      style = {{width:"inherit"}}
    >
      <Row><h1>Jobs</h1></Row>
    </Space>
  );
};

function Results() {
  const [ jobList, setJobList ] = useState([]);
  const [ selectedJob, setSelectedJob ] = useState(null);
  const { cognitoPayload } = useContext(AuthContext);

  useEffect(()=>{
    API.graphql(
      graphqlOperation(
        listJobs,
        {
          filter: {
            userID: {
              eq: cognitoPayload.sub
            }
          }
        }
      )
    ).then(
      queriedResults => {
        setJobList(queriedResults.data.listJobs.items);
      }
    ).catch(
      error=>{
        console.log(error)
      }
    );
  },[ cognitoPayload ]);

  return (
    <div className="results-container">
      { selectedJob ? <Job selectedJobState={{ selectedJob, setSelectedJob }}/> : <JobGallery jobList={jobList} setSelectedJob={setSelectedJob}/>}
    </div>
  );
};

export default Results;