import React, { useEffect, useState, useContext } from "react";
import * as QueryString from "query-string";
import { Space, Row, Button, Descriptions, Badge, Tree, Spin, Drawer, Tag, Popconfirm, Menu, Table } from "antd";
import { Link } from "react-router-dom";
import { PlusSquareOutlined, SyncOutlined, CheckCircleOutlined, MinusCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { API, graphqlOperation } from "aws-amplify";
import { listJobs, generationsByJobId } from "../../graphql/queries";
import { updateJob, deleteGenEvalParam, deleteJob } from "../../graphql/mutations";
import { deleteS3 } from "../../amplify-apis/userFiles";
import { AuthContext } from "../../Contexts";
import "./Explorations.css";

function JobTable({ isDataLoadingState, jobDataState }) {
    const expandedSettings = ["maxDesigns", "population_size", "survival_size", "tournament_size"];
    const { isDataLoading, setIsDataLoading } = isDataLoadingState;
    const { jobData, setjobData } = jobDataState;
    const sortProps = {
        sorter: true,
        sortDirections: ["ascend", "descend"],
    };
    const columns = [
        {
            title: "Description",
            dataIndex: "description",
            key: "description",
            render: (text, record) => 
            <button className='text-btn' onClick={() => handleRowClick(record)}>{text}</button>
        },
        // {
        //     title: "Created At",
        //     dataIndex: "createdAt",
        //     key: "createdAt",
        //     ...sortProps,
        //     defaultSortOrder: "descend",
        //     render: (text) => new Date(text).toLocaleString(),
        // },
        {
            title: "Status",
            dataIndex: "jobStatus",
            key: "status",
            render: (text) => {
                switch (text) {
                    case "inprogress":
                        return <Badge status="processing" text="In Progress" />;
                    case "completed":
                        return <Badge status="success" text="Completed" />;
                    case "cancelled":
                        return <Badge status="error" text="Error" />;
                    default:
                        return <Badge status="default" text="Expired" />;
                }
            },
        },
        {
            title: "Gen File(s)",
            dataIndex: "genUrl",
            key: "genFile",
            ...sortProps,
            render: (urls) => {console.log(urls); return urls.map(text => text.split("/").pop()).join(', ')},
        },
        {
            title: "Eval File",
            dataIndex: "evalUrl",
            key: "evalFile",
            ...sortProps,
            render: (text) => text.split("/").pop(),
        },
        ...expandedSettings.map((dataKey) => ({
            title: dataKey,
            dataIndex: dataKey,
            key: dataKey,
            ...sortProps,
        })),
        {
            title: "Action",
            dataIndex: "action",
            key: "action",
            ...sortProps,
            render: (text, record) => 
            <button className='text-btn' onClick={() => deleteJobAndParams(record.id, record.owner)}>delete</button>
            ,
        },
    ];

    async function getGenEvalParamByJobID(jobID, userID, resultList, nextToken = null) {
        await API.graphql(
            graphqlOperation(generationsByJobId, {
                limit: 1000,
                owner: { eq: userID },
                JobID: jobID,
                filter: null,
                items: {},
                nextToken,
            })
        )
            .then((queryResult) => {
                let queriedJobResults = queryResult.data.generationsByJobID.items;
                if (queryResult.data.generationsByJobID.nextToken) {
                    getGenEvalParamByJobID(jobID, userID, resultList, (nextToken = queryResult.data.generationsByJobID.nextToken)).catch((err) => {
                        throw err;
                    });
                }
                queriedJobResults.forEach((result) => resultList.push(result.id));
            })
            .catch((err) => {
                console.log(err);
                throw err;
            });
    }

    async function deleteJobAndParams(jobID, userID) {
        const genParamIDList = [];
        const promiseList = [];
        setIsDataLoading(true);
        await getGenEvalParamByJobID(jobID, userID, genParamIDList);
        genParamIDList.forEach((paramID) =>
            promiseList.push(
                API.graphql(
                    graphqlOperation(deleteGenEvalParam, {
                        input: { id: paramID },
                    })
                ).catch((err) => {
                    throw err;
                })
            )
        );
        promiseList.push(
            API.graphql(
                graphqlOperation(deleteJob, {
                    input: { id: jobID },
                })
            ).catch((err) => {
                throw err;
            })
        );
        promiseList.push(deleteS3(`${userID}/${jobID}`, () => {}))
        await Promise.all(promiseList);
        setjobData((jobData) => {
            const newjobData = [];
            jobData.forEach(rowObj => {
                if (rowObj.id === jobID) {
                    return;
                }
                newjobData.push(rowObj);
            });
            return newjobData;
        })
        setIsDataLoading(false);
    }

    function handleRowClick(rowData) {
        window.location.href = `/jobs/search-results#${QueryString.stringify({ id: rowData.id })}`;
    }
    return ( <>
        <Button type="primary">
            <Link to={`/new-job`}>Create New Job</Link>
        </Button>
        <Table
            loading={isDataLoading}
            dataSource={jobData}
            columns={columns}
            rowKey="key"
            showSorterTooltip={false}
            // onChange={handleTableChange}
            expandable={{
                defaultExpandAllRows: true,
            }}
            pagination={{
                // total:jobList.length,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `${total} files`,
            }}
            // onRow={(record) => {
            //     return {
            //       onClick: () => handleRowClick(record), // click row
            //     };
            //   }}
        />
    </>);
}

// function JobDrawer({ previewJobState, userID, setIsDataLoading, setjobData }) {
//     const expandedSettings = ["maxDesigns", "population_size", "survival_size", "tournament_size", "expiration"];
//     const { previewJob, setPreviewJob } = previewJobState;
//     const JobStatus = () => {
//         switch (previewJob.data.jobStatus) {
//             case "inprogress":
//                 return <Badge status="processing" text="In Progress" />;
//             case "completed":
//                 return <Badge status="success" text="Completed" />;
//             case "error":
//                 return <Badge status="error" text="Error" />;
//             case "cancelled":
//                 return <Badge status="default" text="Cancelled" />;
//             case "expired":
//                 return <Badge status="default" text="Expired" />;
//             default:
//                 return <Badge status="default" text={previewJob.data.jobStatus} />;
//         }
//     };
//     const CancelJob = () => {
//         function cancelJob() {
//             API.graphql(
//                 graphqlOperation(updateJob, {
//                     input: {
//                         id: previewJob.data.id,
//                         jobStatus: "cancelling",
//                         run: false,
//                     },
//                 })
//             )
//                 .then(() => {
//                     setPreviewJob({
//                         ...previewJob,
//                         data: {
//                             ...previewJob.data,
//                             jobStatus: "cancelling",
//                         },
//                     });
//                 })
//                 .catch((err) => console.log({ cancelJobError: err }));
//         }
//         return (
//             <Popconfirm placement="topRight" title="Cancel Search?" onConfirm={cancelJob} okText="Yes" cancelText="No">
//                 <Button type="default">Cancel</Button>
//             </Popconfirm>
//         );
//     };
//     function getDisplayUrlString(data, isGen = false) {
//         if (!data) {
//             return "";
//         }
//         let urlString = "";
//         if (isGen) {
//             urlString = data.map((url) => url.split("/").pop()).join(", ");
//             console.log(urlString);
//             return urlString;
//         }
//         urlString = data.split("/").pop();
//         return urlString;
//     }
//     async function getGenEvalParamByJobID(jobID, userID, resultList, nextToken = null) {
//         await API.graphql(
//             graphqlOperation(generationsByJobId, {
//                 limit: 1000,
//                 owner: { eq: userID },
//                 JobID: jobID,
//                 filter: null,
//                 items: {},
//                 nextToken,
//             })
//         )
//             .then((queryResult) => {
//                 let queriedJobResults = queryResult.data.generationsByJobID.items;
//                 if (queryResult.data.generationsByJobID.nextToken) {
//                     getGenEvalParamByJobID(jobID, userID, resultList, (nextToken = queryResult.data.generationsByJobID.nextToken)).catch((err) => {
//                         throw err;
//                     });
//                 }
//                 queriedJobResults.forEach((result) => resultList.push(result.id));
//             })
//             .catch((err) => {
//                 console.log(err);
//                 throw err;
//             });
//     }
//     async function deleteJobAndParams(jobID, userID) {
//         const genParamIDList = [];
//         const promiseList = [];
//         setPreviewJob(null);
//         setIsDataLoading(true);
//         await getGenEvalParamByJobID(jobID, userID, genParamIDList);
//         genParamIDList.forEach((paramID) =>
//             promiseList.push(
//                 API.graphql(
//                     graphqlOperation(deleteGenEvalParam, {
//                         input: { id: paramID },
//                     })
//                 ).catch((err) => {
//                     throw err;
//                 })
//             )
//         );

//         promiseList.push(
//             API.graphql(
//                 graphqlOperation(deleteJob, {
//                     input: { id: jobID },
//                 })
//             ).catch((err) => {
//                 throw err;
//             })
//         );

//         promiseList.push(deleteS3(`${userID}/${jobID}`, () => {}))

//         await Promise.all(promiseList);
//         setjobData((jobData) => {
//             const newjobData = [];
//             jobData.forEach(treeObj => {
//                 if (treeObj.data && treeObj.data.id === jobID) {
//                     return;
//                 }
//                 newjobData.push(treeObj);
//             });
//             return newjobData;
//         })
//         setIsDataLoading(false);
//     }
//     return (
//         <Drawer title="Search Settings" placement="right" mask={false} visible={previewJob} onClose={() => setPreviewJob(null)} width="40em">
//             {previewJob ? (
//                 <Space direction="vertical" size="large">
//                     <h1>{previewJob.data.description}</h1>
//                     <Descriptions
//                         title={<p>ID: {previewJob.data.id}</p>}
//                         bordered={true}
//                         size="small"
//                         column={1}
//                         style={{
//                             color: "rgba(0,0,0,0.5)",
//                         }}
//                     >
//                         <Descriptions.Item label="genFile" key="genFile">
//                             {getDisplayUrlString(previewJob.data.genUrl, true)}
//                         </Descriptions.Item>
//                         <Descriptions.Item label="evalFile" key="evalFile">
//                             {getDisplayUrlString(previewJob.data.evalUrl)}
//                         </Descriptions.Item>
//                         {expandedSettings.map((dataKey) => (
//                             <Descriptions.Item label={dataKey} key={dataKey}>
//                                 {previewJob.data[dataKey]}
//                             </Descriptions.Item>
//                         ))}
//                     </Descriptions>
//                     <Row>
//                         <Space direction="horizontal" size="middle">
//                             <JobStatus />
//                             {previewJob.data.jobStatus === "inprogress" ? <CancelJob /> : null}
//                         </Space>
//                     </Row>
//                     <Row>
//                         <Space direction="horizontal" size="large">
//                             <Button type="primary">
//                                 <Link to={`/jobs/search-results#${QueryString.stringify({ id: previewJob.data.id })}`}>View Results</Link>
//                             </Button>
//                             <Button type="default" onClick={() => deleteJobAndParams(previewJob.data.id, userID)}>
//                                 Delete Job
//                             </Button>
//                         </Space>
//                     </Row>
//                 </Space>
//             ) : null}
//         </Drawer>
//     );
// }

function Explorations() {
    const { cognitoPayload } = useContext(AuthContext);
    const [isDataLoading, setIsDataLoading] = useState(true);
    const [dataView, setDataView] = useState("tree");
    const [jobData, setjobData] = useState([]);
    const refreshList = (cognitoPayloadSub, setjobData, setIsDataLoading) => {
        API.graphql(
            graphqlOperation(listJobs, {
                filter: {
                    userID: {
                        eq: cognitoPayloadSub,
                    },
                },
            })
        )
            .then((queriedResults) => {
                const jobList = queriedResults.data.listJobs.items;
                console.log(jobList)
                setjobData(jobList.map((data, index) => {
                        return {
                            key: index + 1,
                            title: data.description,
                            ...data,
                            action: ''
                        };
                }));
                setIsDataLoading(false);
            })
            .catch((error) => console.log(error));
    }
    useEffect(() => {
        refreshList(cognitoPayload.sub, setjobData, setIsDataLoading)
    }, [cognitoPayload]);
    return (
        <div className="explorations-container">
            <Menu
                onClick={(e) => {
                    setDataView(e.key);
                }}
                selectedKeys={[dataView]}
                mode="horizontal"
            ></Menu>
            <JobTable
                isDataLoadingState={{ isDataLoading, setIsDataLoading }}
                jobDataState={{ jobData, setjobData }}
            />
        </div>
    );
}

export default Explorations;
