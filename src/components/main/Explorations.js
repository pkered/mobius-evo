import React, { useEffect, useState, useContext, useCallback } from 'react';
import * as QueryString from 'query-string';
import { Space, Row, Table, Button, Descriptions, Col, Badge, Tree, Spin, Drawer, Tag, Popconfirm, Menu } from 'antd';
import { Link } from 'react-router-dom';
import { PlusSquareOutlined, TableOutlined, ClusterOutlined, DownOutlined, SyncOutlined, CheckCircleOutlined, MinusCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { API, graphqlOperation } from 'aws-amplify';
import { listJobs, getJob } from '../../graphql/queries';
import { updateJob } from '../../graphql/mutations';
import { AuthContext } from '../../Contexts';

function JobTable({ isDataLoading, loadChildren, previewJobState, treeData }) {
  const { previewJob, setPreviewJob } = previewJobState;
  const removeLeaves = treeData => {
    const filteredTree = treeData.filter( node => !node.isLeaf );
    if (filteredTree.length === 0) {
      return null;
    } else {
      return filteredTree.map(
        node => {
          if ( node.children ) {
            return { ...node, children: removeLeaves( node.children ) };
          }
          return node;
        }
      )
    }
  };
  const [ tableTreeData, setTableTreeData ] = useState(removeLeaves([ ...treeData ]));

  const sortProps = {
    sorter: true,
    sortDirections: [ "ascend", "descend" ],
  };
  const columns = [
    {
      title: "Description",
      dataIndex: ["data","description"],
      key: "description"
    },
    {
      title: "Created At",
      dataIndex: ["data","createdAt"],
      key: "createdAt",
      ...sortProps,
      defaultSortOrder: "descend",
      render: text => new Date(text).toLocaleString()
    },
    {
      title: "Status",
      dataIndex: ["data","jobStatus"],
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
      dataIndex: ["data","genUrl"],
      key: "genFile",
      ...sortProps,
      render: text => text.split("/").pop()
    },
    {
      title: "Eval File",
      dataIndex: ["data","evalUrl"],
      key: "evalFile",
      ...sortProps,
      render: text => text.split("/").pop()
    },
    {
      title: "Action",
      dataIndex: "",
      key: "selectJob",
      render: (text, record, index) => 
        <Link 
          to={`/new-exploration#${QueryString.stringify({parentID: record.data.id})}`} 
          target="_blank"
          className={record.data.jobStatus !== "completed" ? "disabled-link" : ""}
        >New Search</Link>
    }
  ]

  const [ selectedKeys, setSelectedKeys ] = useState(previewJob ? [previewJob.key] : [])
  useEffect(()=>setSelectedKeys(previewJob ? [previewJob.key] : []), [previewJob]);

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
    const _treeData = [...tableTreeData];
    if (order === "ascend") {
      _treeData.sort((a,b) => compareAscend(a.data[field[1]], b.data[field[1]]));
    } else {
      _treeData.sort((a,b) => compareDescend(a.data[field[1]], b.data[field[1]]));
    };
    setTableTreeData(_treeData);
  };

  return (
    <Table 
      loading={isDataLoading}
      dataSource={tableTreeData}
      columns={columns}
      rowKey="key"
      showSorterTooltip={false}
      onChange={handleTableChange}
      rowSelection={{
        type: "checkbox",
        hideSelectAll: true,
        selectedRowKeys: selectedKeys,
        onSelect: (record, selected) => selected ? setPreviewJob(record) : setPreviewJob(null)
      }}
      expandable={{
        defaultExpandAllRows: true
      }}
      pagination={{
        // total:jobList.length,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: total => `${total} files`
      }}
    />
  );
};

function ExplorationTree({ isDataLoading, loadChildren, previewJobState, treeDataState }) {
  const { treeData } = treeDataState;
  const { previewJob, setPreviewJob } = previewJobState;
  const [ selectedKeys, setSelectedKeys ] = useState(previewJob ? [previewJob.key] : [])
  useEffect(()=>setSelectedKeys(previewJob ? [previewJob.key] : []), [previewJob])
  const handleClick = ( selectedKeys, event) => {
    const node = event.node;
    if (node.selected) {
      setPreviewJob(null);
    } else {
      setPreviewJob(node);
    }
  }
  return (
    <Spin spinning={isDataLoading}>
      <Tree 
        showIcon={true}
        switcherIcon={<DownOutlined />}
        loadData={loadChildren}
        treeData={treeData}
        defaultExpandAll={true}
        onSelect={handleClick}
        selectedKeys={selectedKeys}
      />
    </Spin>
  );
}

function JobDrawer({ previewJobState }) {
  const expandedSettings = [
    "maxDesigns",
    "population_size",
    "survival_size",
    "tournament_size",
    "expiration"
  ]
  const { previewJob, setPreviewJob } = previewJobState;
  const JobStatus = ()=>{
    switch (previewJob.data.jobStatus) {
      case "inprogress":
        return <Badge status="processing" text="In Progress" />
      case "completed":
        return <Badge status="success" text="Completed" />
      case "error":
        return <Badge status="error" text="Error" />
      case "cancelled":
        return <Badge status="default" text="Cancelled" />
      case "expired":
        return <Badge status="default" text="Expired" />
      default:
        return <Badge status="default" text={previewJob.data.jobStatus} />
    }
  }
  const CancelJob = ()=>{
    function cancelJob() {
      API.graphql(
        graphqlOperation(
          updateJob,
          {
            input: {
              id: previewJob.data.id,
              jobStatus: "cancelling",
              run: false
            }
          }
      )).then(()=>{
        setPreviewJob({
          ...previewJob,
          data: {
            ...previewJob.data,
            jobStatus: "cancelling"
          }
        });
      }
      ).catch(err=>console.log({cancelJobError: err}))
    }
    return (
      <Popconfirm 
        placement="topRight"
        title="Cancel Search?"
        onConfirm={cancelJob}
        okText="Yes"
        cancelText="No"
      >
        <Button
          type="text"
        >Cancel</Button>
      </Popconfirm>
    );
  }

  return (
    <Drawer
      title="Search Settings"
      placement="right"
      mask={false}
      visible={previewJob}
      onClose={()=>setPreviewJob(null)}
      width="40em"
    >
      {previewJob ? 
        <Space
          direction="vertical"
          size="large"
        >
          <h1>{previewJob.data.description}</h1>
          <Descriptions 
            title={<p>ID: {previewJob.data.id}</p>}
            bordered={true}
            size="small"
            column={1}
            style={{
              color: "rgba(0,0,0,0.5)",
            }}
          >
            <Descriptions.item label="Gen File" key="genFile">{previewJob.data.genUrl.split("/").pop()}</Descriptions.item>
            <Descriptions.item label="Eval File" key="evalFile">{previewJob.data.evalUrl.split("/").pop()}</Descriptions.item>
            {expandedSettings.map( dataKey => <Descriptions.Item label={dataKey} key={dataKey}>{previewJob.data[dataKey]}</Descriptions.Item>)}
          </Descriptions>
          <Row>
            <Space
              direction="horizontal"
              size="middle"
            >
              <JobStatus />
              {previewJob.data.jobStatus === "inprogress" ? <CancelJob />: null}
            </Space>
          </Row>
          <Button type="primary">
            <Link to={`/explorations/search-results#${QueryString.stringify({id:previewJob.data.id})}`}>
              View Results
            </Link>
          </Button>
        </Space>
        : null
      }
    </Drawer>
  )
}

function Explorations() {
  const newExploration = {
    title: <Link to="new-exploration" target="_blank" >Start Exploration</Link>,
    icon: <PlusSquareOutlined />,
    selectable: false,
    key: "0",
    isLeaf: true,
    data: {}
  } // appended to base tree
  const newSearch = {
    title: "Start Search",
    icon: <PlusSquareOutlined />,
    key: "0",
    selectable: false,
    isLeaf: true,
    data: {}
  } // appended to all leaves
  const [ previewJob, setPreviewJob ] = useState(null);
  const { cognitoPayload } = useContext(AuthContext);
  const [ isDataLoading, setIsDataLoading ] = useState(true);
  const [ dataView, setDataView ] = useState("tree");
  const [ treeData, setTreeData ] = useState([ newExploration ]);
  const TreeTitle = ({ text, status }) => {
    const rowStyle = { 
      display: "flex",
      width: "100%",
      justifyContent: "space-between"
    };
    function StatusTag({ status }){
      switch (status) {
        case "inprogress":
          return <Tag icon={<SyncOutlined spin />} color="processing">processing</Tag>
        case "completed":
          return <Tag icon={<CheckCircleOutlined />} color="success">completed</Tag>
        case "cancelled":
          return <Tag icon={<MinusCircleOutlined />} color="default">cancelled</Tag>
        case "error":
          return <Tag icon={<MinusCircleOutlined />} color="error">error</Tag>
        case "expired":
          return <Tag icon={<ClockCircleOutlined />} color="default">expired</Tag>
        default:
          return <Tag icon={<SyncOutlined spin />} color="default">{status}</Tag>
      };
    };
    return (
      <Row style={rowStyle}><Space style={rowStyle}>{ text }<StatusTag status={status}/></Space></Row>
    )
  }
  function updateTreeData( treeData, key, children ) {
    return treeData.map( node => {
      if (node.key === key) {
        return { ...node, children };
      }
      if (node.children) {
        return { ...node, children: updateTreeData(node.children, key, children) }
      }
      return node;
    });
  }
  const loadChildren = ({ key, children, data })=>{
    return new Promise(resolve => {
      if (children) {
        resolve(); // children were retrieved
        return;
      }
      let childrenData = [];
      async function getChildren() {
        if (data.childrenID) {
          await Promise.all(data.childrenID.map(
            childID => API.graphql(
              graphqlOperation(getJob, {id: childID})
            ).then(queriedResults => queriedResults.data.getJob)
          )).then(results => {childrenData = results.map(
          (childData, index) => {
            return {
              key: `${key}-${index}`,
              title: <TreeTitle text={childData.description} status={childData.jobStatus}/>,
              data: childData
            }
          }
        )
          });
        }
        setTreeData(origin=>{
          const NewSearch = ()=> (
            <Link 
              to={`/new-exploration#${QueryString.stringify({parentID: data.id})}`} 
              target="_blank"
              className={data.jobStatus !== "completed" ? "disabled-link" : ""}
            >New Search</Link>
          );
          
          return updateTreeData(
          origin,
          key,
          [...childrenData,
            {...newSearch, 
              key:`${key}-${childrenData.length}`, 
              title: <NewSearch />
            }],
          data
          )
        });
      }
      getChildren().then(()=>resolve())
    })
  }
  useEffect(()=>{
    API.graphql(
      graphqlOperation(
        listJobs,
        {
          filter: {
            userID: {
              eq: cognitoPayload.sub
            },
            parentID: {
              eq: ""
            }
          }
        }
      )
    ).then(
      queriedResults => {
        const jobList = queriedResults.data.listJobs.items;
        setTreeData(
          (treeData) => 
            [...treeData, 
              ...jobList.map((jobData, index) => {
                return {
                  key: index + 1,
                  title: <TreeTitle text={jobData.description} status={jobData.jobStatus} />,
                  data: jobData
                };
              })
            ]
        );
        setIsDataLoading(false);
      }
    ).catch( error=> console.log(error) );
  },[ cognitoPayload ]);

  return (
    <div className="explorations-container">
      <Menu 
        onClick={e=>{setDataView(e.key)}} 
        selectedKeys={[ dataView ]}
        mode="horizontal"
      >
        <Menu.Item 
          key="table"
          icon={<TableOutlined/>}
        >
          Table
        </Menu.Item>
        <Menu.Item 
          key="tree"
          icon={<ClusterOutlined/>}
        >
          Tree
        </Menu.Item>
      </Menu>
      {dataView==="tree" ? 
      <ExplorationTree
        isDataLoading={isDataLoading}
        loadChildren={loadChildren}
        previewJobState={{previewJob, setPreviewJob}} 
        treeDataState={{treeData, setTreeData}}
      />
      :
      <JobTable 
        isDataLoading={isDataLoading} 
        loadChildren={loadChildren}
        previewJobState={{previewJob, setPreviewJob}} 
        treeData={treeData}
      />
      }
      
      <JobDrawer 
        previewJobState={{previewJob, setPreviewJob}} 
      />
    </div>
  );
};

export default Explorations;