import React, { useEffect, useState, useContext } from 'react';
import { Space, Row, Table, Button, Descriptions, Col, Badge } from 'antd';
import { API, graphqlOperation } from 'aws-amplify';
import { listJobs } from '../../graphql/queries';
import { AuthContext } from '../../Contexts';

function JobTable({ isTableLoading, jobListState, setSelectedJob }) {
  const { jobList, setJobList } = jobListState
  const sortProps = {
    sorter: true,
    sortDirections: [ "ascend", "descend" ],
  };
  const columns = [
    {
      title: "Description",
      dataIndex: "description",
      key: "description"
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      ...sortProps,
      defaultSortOrder: "descend",
      render: text => new Date(text).toLocaleString()
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: text => {
        switch (text) {
          case "inprogress":
            return <Badge status="processing" text="In Progress" />
          case "completed":
            return <Badge status="success" text="Completed" />
          case "cancelled":
            return <Badge status="error" text="Error" />
          default:
            return <Badge status="default" text="Expired" />
        }
      }
    },
    {
      title: "Gen File",
      dataIndex: "genUrl",
      key: "genFile",
      ...sortProps,
      render: text => text.split("/").pop()
    },
    {
      title: "Eval File",
      dataIndex: "evalUrl",
      key: "evalFile",
      ...sortProps,
      render: text => text.split("/").pop()
    },
    {
      title: "Action",
      dataIndex: "",
      key: "selectJob",
      render: (text, record, index) => <Button onClick={()=>setSelectedJob(record.id)}>View Results</Button>
    }
  ]
  const expandedSettings = [
    "maxDesigns",
    "population_size",
    "survival_size",
    "tournament_size",
    "expiration"
  ]
  const handleTableChange = ( pagination, filters, sorter ) => {
    const compareAscend = (a,b) => {
      if ( a < b ) { return -1; }
      else if ( a > b) { return 1;}
      else { return 0; }
    };
    const compareDescend = (a,b) => {
      if ( a > b ) { return -1; }
      else if ( a < b) { return 1;}
      else { return 0; }
    };
    const [ field, order ] = [ sorter.field, sorter.order ];
    const _jobList = [...jobList];
    if (order === "ascend") {
      _jobList.sort((a,b) => compareAscend(a[field], b[field]));
    } else {
      _jobList.sort((a,b) => compareDescend(a[field], b[field]));
    };
    setJobList(_jobList);
  };
  return (
    <Space
      direction="vertical"
      size = "large"
      style = {{width:"inherit"}}
    >
      <Row><h1>Jobs</h1></Row>
      <Table 
        loading={isTableLoading}
        dataSource={jobList}
        columns={columns}
        rowKey="id"
        expandable={{
          expandedRowRender: record => (
            <Row>
              <Col style={{width: "50px"}}></Col>
              <Col >
                <Descriptions 
                  title={<p>Job: {record.id}</p>}
                  bordered={true}
                  size="small"
                  column={4}
                  style={{
                    color: "rgba(0,0,0,0.5)",
                  }}
                >
                  {expandedSettings.map( dataKey => <Descriptions.Item label={dataKey} key={dataKey}>{record[dataKey]}</Descriptions.Item>)}
                </Descriptions>
              </Col>
            </Row>
          )
        }}
        showSorterTooltip={false}
        onChange={handleTableChange}
        pagination={{
          total:jobList.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: total => `${total} files`
        }}
      />
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
      <Row>
        <h1>
          <span 
            onClick={()=>setSelectedJob(null)}
            style={{
              textDecoration:"underline",
              cursor: "pointer",
              color: "rgba(0,0,0,0.3)"
            }}
          >Jobs</span> / {selectedJob}
        </h1>
      </Row>
    </Space>
  );
};

function Results() {
  const [ jobList, setJobList ] = useState([]);
  const [ selectedJob, setSelectedJob ] = useState(null);
  const { cognitoPayload } = useContext(AuthContext);
  const [ isTableLoading, setIsTableLoading ] = useState(true);

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
        setIsTableLoading(false);
      }
    ).catch(
      error=>{
        console.log(error)
      }
    );
  },[ cognitoPayload ]);

  return (
    <div className="results-container">
      { selectedJob ? 
        <Job selectedJobState={{ selectedJob, setSelectedJob }}/> 
        : 
        <JobTable 
          isTableLoading={isTableLoading} 
          jobListState={{ jobList, setJobList }} 
          setSelectedJob={setSelectedJob}
        />
      }
    </div>
  );
};

export default Results;