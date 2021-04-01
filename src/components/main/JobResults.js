import React, { useEffect, useState, useContext } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { generationsByJobId, getJob } from "../../graphql/queries";
import * as QueryString from "query-string";
import { Link } from "react-router-dom";
import { Row, Space, Button, Spin, Form, Col, Divider, Input, Checkbox, Table } from "antd";
import { Column } from "@ant-design/charts";
import { AuthContext } from "../../Contexts";
import Iframe from "react-iframe";
import { ReactComponent as Download } from "../../assets/download.svg";
import { ReactComponent as View } from "../../assets/view.svg";
import { ResumeForm } from "./JobResults_resume.js";

const S3_MODEL_URL = "https://mobius-evo-userfiles131353-dev.s3.amazonaws.com/models/";

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
async function getData(jobID, userID, setJobSettings, setJobResults, callback, filters = null, nextToken = null) {
    let _filters = {};
    if (filters) {
        if (filters["show-group"].length === 0) {
            setJobResults([]);
            callback();
            return Promise.resolve([]);
        } else if (filters["show-group"].length === 1) {
            if (filters["show-group"][0] === "live") {
                // live only
                _filters = { live: { eq: true } };
            } else {
                // dead only
                _filters = { live: { eq: false } };
            }
        }
        _filters = {
            ..._filters,
            score: {
                gt: Number(filters["score-min"]),
                lt: Number(filters["score-max"]),
            },
        };
    }
    await API.graphql(
        graphqlOperation(generationsByJobId, {
            limit: 1000,
            owner: { eq: userID },
            JobID: jobID,
            filter: Object.keys(_filters).length > 0 ? _filters : null,
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
                    callback,
                    filters,
                    (nextToken = queryResult.data.generationsByJobID.nextToken)
                ).catch((err) => {
                    throw err;
                });
            } else {
                callback();
            }
            setJobResults((jobResults) => {
                queriedJobResults = [...jobResults, ...queriedJobResults];
                if (filters) {
                    const params = Object.keys(paramsRegex(queriedJobResults[0].params));
                    queriedJobResults = queriedJobResults.filter((jobResult, index) => {
                        const jobParams = paramsRegex(jobResult.params);
                        for (let i in params) {
                            if (jobParams[params[i]] > filters[`${params[i]}-max`] || jobParams[params[i]] < filters[`${params[i]}-min`]) {
                                return false;
                            }
                        }
                        return true;
                    });
                }
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
            if (queryResult.data.getJob.jobStatus === "processing") {
                setTimeout(() => {
                    getData(jobID, userID, setJobSettings, setJobResults, callback, filters);
                }, 5000);
            }
        })
        .catch((err) => {
            throw err;
        });
}
function FilterForm({ jobID, modelParamsState, jobSettingsState, jobResultsState }) {
    const [form] = Form.useForm();
    const { cognitoPayload } = useContext(AuthContext);
    const { modelParams, setModelParams } = modelParamsState;
    const { jobSettings, setJobSettings } = jobSettingsState;
    const { jobResults, setJobResults } = jobResultsState;
    const [initialValues, setInitialValues] = useState({
        "show-group": ["live", "dead"],
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isFiltering, setIsFiltering] = useState(false);
    const handleFinish = (values) => {
        setIsFiltering(true);
        setJobResults([]);
        getData(jobID, cognitoPayload.sub, setJobSettings, setJobResults, () => setIsFiltering(false), values).catch((err) => console.log(err));
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
    }, [jobResults, modelParams, setModelParams, isFiltering]);
    // useEffect(() => {
    //   if (!isLoading && !isFiltering && jobResults.length===0) {
    //     if (jobSettings.jobStatus === "completed") {
    //       message.warning("filter returned 0 results");
    //     } else {
    //       message.info("search is still processing");
    //     }
    //   }
    // },[isLoading, isFiltering])
    useEffect(() => form.resetFields(), [initialValues]);

    return !isLoading ? (
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
    ) : null;
}

function ScorePlot({ jobResults }) {
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
        colorField: "genFile",
        responsive: true,
        events: {
            click: (e) => console.log(e),
        },
    };
    return <Column {...config} />;
}

function viewModel(url) {
    const iframe = document.getElementById("mobius_viewer").contentWindow;
    iframe.postMessage(
        {
            messageType: "update",
            url: url,
        },
        "*"
    );
}

function ResultTable({ jobResults }) {
    let addCol = true;
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
            dataIndex: "model",
            key: "model",
            render: (text) => (
                <div>
                    <a href={text} download>
                        <Download />
                    </a>
                    <br></br>
                    <View onClick={() => viewModel(text)} />
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
            model: S3_MODEL_URL + entry.id + ".gi",
        };
        return tableEntry;
    });

    return <Table style={{ whiteSpace: "pre" }} dataSource={tableData} columns={columns} rowKey="genID" size="small" />;
}

function JobResults() {
    const [jobID, setJobID] = useState(null);
    const [modelParams, setModelParams] = useState([]);
    const [jobSettings, setJobSettings] = useState(null);
    const [jobResults, setJobResults] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const { cognitoPayload } = useContext(AuthContext);

    useEffect(() => {
        const jobID = QueryString.parse(window.location.hash).id;
        setJobID(jobID);
        getData(jobID, cognitoPayload.sub, setJobSettings, setJobResults, () => setIsLoading(false)).catch((err) => console.log(err));
    }, []);

    return (
        <Space direction="vertical" size="large" style={{ width: "inherit" }}>
            <Row>
                <h3>
                    <Link to="/explorations">Explorations</Link> / {jobID}
                </h3>
            </Row>
            <Spin spinning={isLoading}>
                {!isLoading ? (
                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                        <ResumeForm
                            jobID={jobID}
                            jobSettingsState={{ jobSettings, setJobSettings }}
                            jobResultsState={{ jobResults, setJobResults }}
                        />
                        <FilterForm
                            jobID={jobID}
                            modelParamsState={{ modelParams, setModelParams }}
                            jobSettingsState={{ jobSettings, setJobSettings }}
                            jobResultsState={{ jobResults, setJobResults }}
                        />
                        <ScorePlot jobSettings={jobSettings} jobResults={jobResults} />
                        <Space direction="horizontal" size="large" align="start">
                            <ResultTable jobResults={jobResults} />
                            <Iframe
                                url="https://design-automation.github.io/mobius-viewer-dev-0-7/"
                                width="600px"
                                height="600px"
                                id="mobius_viewer"
                            />
                        </Space>
                    </Space>
                ) : null}
            </Spin>
        </Space>
    );
}

export default JobResults;
