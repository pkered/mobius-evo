import React, { useEffect, useState, useContext } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { generationsByJobId, getJob } from "../../graphql/queries";
import { updateJob } from "../../graphql/mutations";
import * as QueryString from "query-string";
import { Link } from "react-router-dom";
import { Row, Space, Button, Spin, Form, Col, Divider, Input, Checkbox, Table, Popconfirm, Tabs, Descriptions, Collapse } from "antd";
import { Column } from "@ant-design/charts";
import { AuthContext } from "../../Contexts";
import Iframe from "react-iframe";
import { ReactComponent as Download } from "../../assets/download.svg";
import { ReactComponent as View } from "../../assets/view.svg";
import { ResumeForm } from "./JobResults_resume.js";

import "./JobResults.css";

const S3_MODEL_URL = "https://mobius-evo-userfiles131353-dev.s3.amazonaws.com/public/";
const { TabPane } = Tabs;
const { Panel } = Collapse;

function paramsRegex(params) {
    return JSON.parse(params);
    // const splits = params.replace(/\{|\}/g, '').split(',');
    // const ret = {};
    // splits.forEach(split => {
    //     const nameValSplit = split.split(':');
    //     const pName = nameValSplit[0].replace(/\"/g, '').trim();
    //     ret[pName] = nameValSplit[1].trim();
    // })
    // return ret

    // const pattern = /(\w+)=(\w+.?\w+)/gm;
    // const result = [...params.replace(/\"/g, '').matchAll(pattern)];
    // const ret = {};
    // result.forEach((match) => (ret[match[1]] = match[2]));
    // return ret;
}
async function getData(jobID, userID, setJobSettings, setJobResults, setIsLoading, callback, nextToken = null) {
    await API.graphql(
        graphqlOperation(generationsByJobId, {
            limit: 1000,
            owner: { eq: userID },
            JobID: jobID,
            items: {},
            nextToken,
        })
    )
        .then((queryResult) => {
            let queriedJobResults = queryResult.data.generationsByJobID.items;
            if (queryResult.data.generationsByJobID.nextToken) {
                getData(
                    jobID,
                    userID,
                    setJobSettings,
                    setJobResults,
                    setIsLoading,
                    callback,
                    (nextToken = queryResult.data.generationsByJobID.nextToken)
                ).catch((err) => {
                    throw err;
                });
            } else {
                callback();
            }
            setJobResults((jobResults) => {
                queriedJobResults = [...jobResults, ...queriedJobResults];
                queriedJobResults.sort((a, b) => a.GenID - b.GenID);
                return queriedJobResults;
            });
        })
        .catch((err) => {
            console.log(err);
            throw err;
        });
    await API.graphql(
        graphqlOperation(getJob, {
            id: jobID,
        })
    )
        .then((queryResult) => {
            setJobSettings(queryResult.data.getJob);
            if (queryResult.data.getJob.jobStatus === "inprogress") {
                setTimeout(() => {
                    // setIsLoading(true);
                    setJobResults([]);
                    getData(jobID, userID, setJobSettings, setJobResults, setIsLoading, callback);
                }, 3000);
            }
        })
        .catch((err) => {
            throw err;
        });
}
function viewModel(url, contextURLs = null) {
    const iframe = document.getElementById("mobius_viewer").contentWindow;
    let urls = [url];
    if (contextURLs && Array.isArray(contextURLs)) {
        for (const contextUrl of contextURLs) {
            if (contextUrl && contextUrl!=='') {
                urls.push(contextUrl);
            }
        }
    }
    console.log("urls:", urls, contextURLs);
    console.log('xxxxx\n',JSON.stringify({
        messageType: "update",
        url: urls,
    }))
    iframe.postMessage(
        {
            messageType: "update",
            url: urls,
        },
        "*"
    );
}
function FilterForm({ modelParamsState, jobResultsState, filteredJobResultsState, setIsLoadingState }) {
    const [form] = Form.useForm();
    const { modelParams, setModelParams } = modelParamsState;
    const { jobResults, setJobResults } = jobResultsState;
    const { filteredJobResults, setFilteredJobResults } = filteredJobResultsState;
    const [initialValues, setInitialValues] = useState({
        "show-group": ["live", "dead"],
    });
    const { isLoading, setIsLoading } = setIsLoadingState;
    const [isFiltering, setIsFiltering] = useState(false);

    const handleFinish = (values) => {
        setIsFiltering(true);
        setFilteredJobResults([]);
        const filteredResults = [];
        const processedValues = {};
        for (let i in values) {
            const vals = i.split("-");
            console.log(vals);
            if (!processedValues[vals[0]]) {
                processedValues[vals[0]] = {};
            }
            processedValues[vals[0]][vals[1]] = values[i];
        }
        console.log(processedValues);

        jobResults.forEach((result) => {
            const params = JSON.parse(result.params);
            if (processedValues.show && processedValues.show.group) {
                if (processedValues.show.group.length === 0) {
                    return;
                }
                if (processedValues.show.group.length === 1) {
                    if (processedValues.show.group[0] === "live") {
                        if (!result.live) {
                            return;
                        }
                    } else {
                        if (result.live) {
                            return;
                        }
                    }
                }
            }
            if (processedValues.score && (result.score < processedValues.score.min || result.score > processedValues.score.max)) {
                return;
            }
            for (const p in params) {
                if (processedValues[p] && (params[p] < processedValues[p].min || params[p] > processedValues[p].max)) {
                    return;
                }
            }
            filteredResults.push(result);
        });
        setFilteredJobResults(filteredResults);
        setIsFiltering(false);
    };
    useEffect(() => {
        const singleResult = jobResults[0];
        if (singleResult && modelParams.length === 0) {
            setModelParams(Object.keys(paramsRegex(singleResult.params)));
        }
        const resultMinMax = {
            params: modelParams.reduce((result, current, index, array) => {
                result[`${current}`] = [Infinity, -Infinity];
                return result;
            }, {}),
            score: [Infinity, -Infinity],
        };
        jobResults.forEach((result) => {
            const _params = paramsRegex(result.params);
            modelParams.forEach((param) => {
                if (_params[param] >= resultMinMax.params[`${param}`][1]) {
                    resultMinMax.params[`${param}`][1] = Math.ceil(_params[param]);
                }
                if (_params[param] <= resultMinMax.params[`${param}`][0]) {
                    resultMinMax.params[`${param}`][0] = Math.floor(_params[param]);
                }
            });
            if (result.score >= resultMinMax.score[1]) {
                resultMinMax.score[1] = Math.ceil(result.score);
            }
            if (result.score <= resultMinMax.score[0]) {
                resultMinMax.score[0] = Math.floor(result.score);
            }
        });
        let _initialValues = Object.keys(resultMinMax.params).reduce((result, current, currentIndex, array) => {
            const ret = { ...result };
            ret[`${current}-min`] = resultMinMax.params[current][0];
            ret[`${current}-max`] = resultMinMax.params[current][1];
            return ret;
        }, {});
        _initialValues["score-min"] = resultMinMax.score[0];
        _initialValues["score-max"] = resultMinMax.score[1];
        setInitialValues((initialValues) => {
            return { ...initialValues, ..._initialValues };
        });
        return () => {
            setIsLoading(false);
        };
    }, [setIsLoading, jobResults, modelParams, setModelParams, isFiltering]);
    // useEffect(() => {
    //   if (!isLoading && !isFiltering && jobResults.length===0) {
    //     if (jobSettings.jobStatus === "completed") {
    //       message.warning("filter returned 0 results");
    //     } else {
    //       message.info("search is still processing");
    //     }
    //   }
    // },[isLoading, isFiltering])
    useEffect(() => form.resetFields(), [form, initialValues]);

    return !isLoading ? (
        <Collapse>
            <Panel header="Filter Form" key="1">
                <Form form={form} onFinish={handleFinish} initialValues={initialValues}>
                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        <Row>
                            <Space
                                size="large"
                                style={{
                                    width: "100%",
                                    justifyContent: "flex-start",
                                    height: "100%",
                                    alignItems: "normal",
                                }}
                            >
                                <Col>
                                    <h3>parameters</h3>
                                    {modelParams.map((param) => {
                                        return (
                                            <Row key={`${param}-group`}>
                                                <Space>
                                                    <Form.Item name={`${param}-min`} label={param}>
                                                        <Input prefix="min" />
                                                    </Form.Item>
                                                    <Form.Item name={`${param}-max`}>
                                                        <Input prefix="max" />
                                                    </Form.Item>
                                                </Space>
                                            </Row>
                                        );
                                    })}
                                </Col>
                                <Divider type="vertical" />
                                <Col>
                                    <h3>score</h3>
                                    <Space>
                                        <Form.Item name={`score-min`} key={`score-min`}>
                                            <Input prefix="min" />
                                        </Form.Item>
                                        <Form.Item name={`score-max`} key={`score-max`}>
                                            <Input prefix="max" />
                                        </Form.Item>
                                    </Space>
                                    <Form.Item name="show-group" label="Show">
                                        <Checkbox.Group>
                                            <Checkbox value="live">live</Checkbox>
                                            <Checkbox value="dead">dead</Checkbox>
                                        </Checkbox.Group>
                                    </Form.Item>
                                </Col>
                            </Space>
                        </Row>
                        <Row style={{ justifyContent: "center" }}>
                            <Button type="primary" htmlType="submit" disabled={isFiltering}>
                                Filter
                            </Button>
                        </Row>
                    </Space>
                </Form>
            </Panel>
        </Collapse>
    ) : null;
}

function ScorePlot({ jobResults, contextUrl, setModelText }) {
    const plotData = JSON.parse(JSON.stringify(jobResults));

    plotData.forEach((result) => (result.genFile = result.genUrl.split("/").pop() + " - " + (result.live ? "live" : "dead")));
    const config = {
        title: {
            visible: true,
            text: "Score Plot",
        },
        description: {
            visible: true,
            text: "Evaluated score over generations",
        },
        data: plotData,
        xField: "GenID",
        yField: "score",
        seriesField: "genFile",
        slider: {
            start: 0,
            end: 1,
        },
        responsive: true,
    };
    return (
        <Column
            {...config}
            onReady={(plot) => {
                plot.on("element:click", (arg) => {
                    const data = arg.data.data;
                    document.getElementById('hiddenInput').value = S3_MODEL_URL + data.owner + "/" + data.JobID + "/" + data.id + "_eval.gi";
                    document.getElementById('hiddenButton').click();
                    setModelText(data.evalResult);
                });
            }}
        />
    );
}

function ResultTable({ jobResults, contextUrl, setModelText }) {
    const columns = [
        {
            title: "ID",
            dataIndex: "genID",
            key: "genID",
            defaultSortOrder: "ascend",
            sorter: (a, b) => a.genID - b.genID,
        },
        {
            title: "Gen File",
            dataIndex: "genFile",
            key: "genFile",
        },
        {
            title: "Parameters",
            dataIndex: "params",
            key: "params",
        },
        {
            title: "Generation",
            dataIndex: "generation",
            key: "generation",
            sorter: (a, b) => a.generation - b.generation,
        },
        {
            title: "Live",
            dataIndex: "live",
            key: "live",
            sorter: (a, b) => b.live.length - a.live.length,
        },
        {
            title: "Score",
            dataIndex: "score",
            key: "score",
            sorter: (a, b) => a.score - b.score,
        },
        {
            title: "Model",
            dataIndex: "genModel",
            key: "genModel",
            render: (modelData) => (
                <div>
                    {/* <a href={modelData.model} target='_blank' download>
                        <Download />
                    </a>
                    <br></br> */}
                    <View
                        onClick={() => {
                            console.log(modelData);
                            viewModel(modelData.model, [contextUrl]);
                            setModelText(modelData.resultText);
                            // setModelText(JSON.stringify(JSON.parse(modelData.resultText), null, 4))
                        }}
                    />
                </div>
            ),
        },
        {
            title: "Eval",
            dataIndex: "evalModel",
            key: "evalModel",
            render: (modelData) => (
                <div>
                    <View
                        onClick={async () => {
                            console.log(modelData);
                            viewModel(modelData.model, [contextUrl]);
                            setModelText(modelData.resultText);
                        }}
                    />
                </div>
            ),
        },
    ];
    const tableData = jobResults.map((entry) => {
        let paramsString = "";
        if (entry.params) {
            paramsString = entry.params
                .replace(/\{|\}|"/g, "")
                .replace(/,|,\s/g, " \n")
                .replace(/:/g, ": ");
        }
        const tableEntry = {
            genID: entry.GenID,
            genFile: entry.genUrl.split("/").pop(),
            live: entry.live ? "True" : "False",
            generation: entry.generation,
            params: paramsString,
            score: entry.score,
            genModel: {
                model: S3_MODEL_URL + entry.owner + "/" + entry.JobID + "/" + entry.id + ".gi",
                resultText: entry.evalResult,
            },
            evalModel: {
                model: S3_MODEL_URL + entry.owner + "/" + entry.JobID + "/" + entry.id + "_eval.gi",
                resultText: entry.evalResult,
            },
        };
        return tableEntry;
    });
    return (
        <Collapse>
            <Panel header="Result Table" key="1">
                <Table style={{ whiteSpace: "pre" }} dataSource={tableData} columns={columns} rowKey="genID" size="small" />
            </Panel>
        </Collapse>
    );
}

function JobResults() {
    const [jobID, setJobID] = useState(null);
    const [modelParams, setModelParams] = useState([]);
    const [jobSettings, setJobSettings] = useState(null);
    const [jobResults, setJobResults] = useState([]);
    const [filteredJobResults, setFilteredJobResults] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { cognitoPayload } = useContext(AuthContext);
    const [modelText, setModelText] = useState("");
    const [contextUrl, setContextUrl] = useState("");
    useEffect(() => {
        const jobID = QueryString.parse(window.location.hash).id;
        setJobID(jobID);
        getData(jobID, cognitoPayload.sub, setJobSettings, setJobResults, setIsLoading, () => setIsLoading(false))
            .then()
            .catch((err) => console.log(err));
    }, [cognitoPayload]);

    const CancelJob = () => {
        function cancelJob() {
            API.graphql(
                graphqlOperation(updateJob, {
                    input: {
                        id: jobID,
                        jobStatus: "cancelling",
                        run: false,
                    },
                })
            ).catch((err) => console.log({ cancelJobError: err }));
        }
        return (
            <Popconfirm placement="topRight" title="Cancel Search?" onConfirm={cancelJob} okText="Yes" cancelText="No">
                <Button type="default">Cancel</Button>
            </Popconfirm>
        );
    };
    function getDisplayUrlString(data, isGen = false) {
        if (!data) {
            return "";
        }
        let urlString = "";
        if (isGen) {
            urlString = data.map((url) => url.split("/").pop()).join(", ");
            return urlString;
        }
        urlString = data.split("/").pop();
        return urlString;
    }

    const genTableColumns = [
        {
            title: "Gen File",
            dataIndex: "genFile",
            key: "genFile",
            defaultSortOrder: "ascend",
        },
        {
            title: "Total Items",
            dataIndex: "numItems",
            key: "numItems",
        },
        {
            title: "Live Items",
            dataIndex: "liveItems",
            key: "liveItems",
        },
    ];
    let genTableData = [];
    if (jobSettings) {
        genTableData = jobSettings.genUrl.map((genUrl) => {
            const genFile = genUrl.split("/").pop();
            const genTableEntry = {
                genUrl: genUrl,
                genFile: genFile,
                numItems: jobResults.filter((result) => result.genUrl === genUrl).length,
                liveItems: jobResults.filter((result) => result.genUrl === genUrl && result.live === true).length,
            };
            return genTableEntry;
        });
    }
    const expandedSettings = ["max_designs", "population_size", "survival_size", "tournament_size", "expiration"];

    return (
        <Space direction="vertical" size="large" style={{ width: "inherit" }}>
            <Row>
                <h3>
                    <Link to="/jobs">Jobs</Link> - {jobID}
                </h3>
            </Row>
            {jobSettings ? (
                <>
                    <Row>
                        <h1>{jobSettings.description}</h1>
                    </Row>
                    <Tabs defaultActiveKey="1">
                        <TabPane tab="Results" key="1">
                            <Spin spinning={isLoading}>
                                {!isLoading ? (
                                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                        <FilterForm
                                            modelParamsState={{ modelParams, setModelParams }}
                                            jobResultsState={{ jobResults, setJobResults }}
                                            filteredJobResultsState={{ filteredJobResults, setFilteredJobResults }}
                                            setIsLoadingState={{ isLoading, setIsLoading }}
                                        />
                                        <ScorePlot
                                            jobResults={filteredJobResults ? filteredJobResults : jobResults}
                                            contextUrl={contextUrl}
                                            setModelText={setModelText}
                                        />
                                        <Space direction="horizontal" size="large" align="start">
                                            <Input id='contextUrlInput' defaultValue={contextUrl}></Input>
                                            <Button
                                                onClick={() => {
                                                    const val = document.getElementById('contextUrlInput').value;
                                                    setContextUrl(val);
                                                }}
                                            >
                                                apply
                                            </Button>
                                            <Input id='hiddenInput' className='hiddenElement'></Input>
                                            <Button id='hiddenButton' className='hiddenElement'
                                                onClick={() => {
                                                    const val = document.getElementById('hiddenInput').value;
                                                    viewModel(val, [contextUrl])
                                                }}
                                            >
                                                apply
                                            </Button>

                                        </Space>
                                        <Iframe
                                            url="https://design-automation.github.io/mobius-viewer-dev-0-7/"
                                            width="100%"
                                            height="600px"
                                            id="mobius_viewer"
                                        />
                                        <Input.TextArea className="textArea" value={modelText}></Input.TextArea>
                                        <ResultTable
                                            jobResults={filteredJobResults ? filteredJobResults : jobResults}
                                            contextUrl={contextUrl}
                                            setModelText={setModelText}
                                        />
                                    </Space>
                                ) : null}
                            </Spin>
                        </TabPane>
                        <TabPane tab="Settings" key="2">
                            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                <Descriptions
                                    bordered={true}
                                    size="small"
                                    column={1}
                                    style={{
                                        color: "rgba(0,0,0,0.5)",
                                    }}
                                >
                                    <Descriptions.Item label="genFile" key="genFile">
                                        {getDisplayUrlString(jobSettings.genUrl, true)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="evalFile" key="evalFile">
                                        {getDisplayUrlString(jobSettings.evalUrl)}
                                    </Descriptions.Item>
                                    {expandedSettings.map((dataKey) => (
                                        <Descriptions.Item label={dataKey} key={dataKey}>
                                            {jobSettings[dataKey]}
                                        </Descriptions.Item>
                                    ))}
                                </Descriptions>
                                <Table dataSource={genTableData} columns={genTableColumns} rowKey="genUrl"></Table>
                            </Space>
                        </TabPane>
                        <TabPane tab="Resume" key="3">
                            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                {jobSettings && (jobSettings.jobStatus === "completed" || jobSettings.jobStatus === "cancelled") ? (
                                    <ResumeForm
                                        jobID={jobID}
                                        jobSettingsState={{ jobSettings, setJobSettings }}
                                        jobResultsState={{ jobResults, setJobResults }}
                                        getData={getData}
                                        setIsLoading={setIsLoading}
                                    />
                                ) : (
                                    <></>
                                )}
                                {jobSettings && jobSettings.jobStatus === "inprogress" ? <CancelJob /> : <></>}
                            </Space>
                        </TabPane>
                    </Tabs>
                    <br />
                    <br />
                </>
            ) : null}
        </Space>
    );
}

export default JobResults;
