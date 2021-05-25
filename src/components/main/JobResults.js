import React, { useEffect, useState, useContext } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { generationsByJobId, getJob } from "../../graphql/queries";
import { updateJob } from "../../graphql/mutations";
import * as QueryString from "query-string";
import { Link } from "react-router-dom";
import {
    Row,
    Space,
    Button,
    Spin,
    Form,
    Col,
    Divider,
    Input,
    Checkbox,
    Table,
    Popconfirm,
    Tabs,
    Descriptions,
    Collapse,
    Alert,
    notification,
} from "antd";
import { Column, Scatter } from "@ant-design/charts";
import { AuthContext } from "../../Contexts";
import Iframe from "react-iframe";
// import { ReactComponent as Download } from "../../assets/download.svg";
import { ReactComponent as View } from "../../assets/view.svg";
import { ResumeForm } from "./JobResults_resume.js";
import Help from "./utils/Help";
import { getS3Public } from "../../amplify-apis/userFiles";
import { QuestionCircleOutlined } from "@ant-design/icons";

import "./JobResults.css";

const MOBIUS_VIEWER_URL = "https://design-automation.github.io/mobius-viewer-dev-0-7/";
const { TabPane } = Tabs;

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
function printJSONString(jsonString) {
    if (!jsonString) {
        return "";
    }
    try {
        const formattedString = JSON.stringify(JSON.parse(jsonString), null, 4);
        return formattedString.slice(1, -1);
    } catch (ex) {
        console.log("~~~~~~~~~~~~ JSON parsing error...", ex);
        return jsonString;
    }
}
function assembleModelText(data) {
    return (
        "ID: " +
        data.id +
        "\n\n" +
        "Parameters: " +
        printJSONString(data.params) +
        "\n" +
        "Evaluation Result: " +
        printJSONString(data.evalResult) +
        "\n" +
        ""
    );
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
            if (!queryResult.data.getJob || queryResult.data.getJob.jobStatus === "inprogress") {
                setTimeout(() => {
                    // setIsLoading(true);
                    setJobResults([]);
                    getData(jobID, userID, setJobSettings, setJobResults, setIsLoading, callback);
                }, 5000);
            }
        })
        .catch((err) => {
            throw err;
        });
}
function viewModel(url, contextURLs = null) {
    const iframe = document.getElementById("mobius_viewer").contentWindow;
    let urls = [];
    if (contextURLs && Array.isArray(contextURLs)) {
        for (const contextUrl of contextURLs) {
            if (contextUrl && contextUrl !== "") {
                urls.push(contextUrl);
            }
        }
    }
    urls.push(url);
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
    useEffect(() => {
        form.resetFields();
    }, [form, initialValues]);

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

function ProgressPlot({ jobSettings, jobResults, setModelText, setSelectedJobResult }) {
    const plotData = JSON.parse(JSON.stringify(jobResults));

    let minY,
        maxY = 0;
    plotData.forEach((result) => {
        if (result.score) {
            if (!minY) {
                minY = result.score;
            }
            minY = Math.min(minY, result.score);
            maxY = Math.max(maxY, result.score);
        }
        result.genFile = result.genUrl.split("/").pop() + " - " + (result.live ? "live" : "dead");
    });
    const config = {
        title: {
            visible: true,
            text: "Progress Plot",
        },
        description: {
            visible: true,
            text: "Score Progression over Generations",
        },
        data: plotData,
        xField: "generation",
        yField: "score",
        shape: "circle",
        colorField: "genFile",
        appendPadding: 10,
        size: 4,
    };
    if (jobSettings.jobStatus === "completed") {
        config.meta = {
            score: {
                min: Math.floor(minY),
                max: Math.ceil(maxY),
            },
        };
    }
    return <Scatter {...config} />;
}

function ScorePlot({ jobSettings, jobResults, setModelText, setSelectedJobResult }) {
    const plotData = JSON.parse(JSON.stringify(jobResults));
    let minY,
        maxY = 0;
    plotData.forEach((result) => {
        if (result.score) {
            if (!minY) {
                minY = result.score;
            }
            minY = Math.min(minY, result.score);
            maxY = Math.max(maxY, result.score);
        }
        result.genFile = result.genUrl.split("/").pop() + " - " + (result.live ? "live" : "dead");
    });
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
    };
    if (minY && maxY) {
        config.yAxis = {
            min: Math.floor(minY),
            max: Math.ceil(maxY),
        };
    }
    return (
        <Column
            {...config}
            onReady={(plot) => {
                plot.on("plot:click", (evt) => {
                    const { x, y } = evt;
                    const tooltipData = plot.chart.getTooltipItems({ x, y });
                    if (tooltipData.length === 0) {
                        return;
                    }
                    const data = tooltipData[0].data;
                    getS3Public(
                        data.owner + "/" + data.JobID + "/" + data.id + "_eval.gi",
                        (url) => {
                            document.getElementById("hiddenInput").value = url;
                            document.getElementById("hiddenButton").click();
                        },
                        () => {}
                    );
                    const modelText = assembleModelText(data);
                    setModelText(modelText);
                    if (evt.data && evt.data.data) {
                        setSelectedJobResult(evt.data.data);
                    }
                });
            }}
        />
    );
}

function ResultTable({ jobResults, contextUrl, setModelText, setSelectedJobResult }) {
    const columns = [
        {
            title: "ID",
            dataIndex: "genID",
            key: "genID",
            defaultSortOrder: "ascend",
            width: 50,
            fixed: "left",
            sorter: (a, b) => a.genID - b.genID,
        },
        {
            title: "Parameters",
            dataIndex: "params",
            key: "params",
            width: 300,
            fixed: "left",
        },
        {
            title: "Gen File",
            dataIndex: "genFile",
            key: "genFile",
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
            title: "Gen Model",
            dataIndex: "genModel",
            key: "genModel",
            width: 100,
            fixed: "right",
            align: "center",
            render: (genModel, allData) => (
                <div>
                    <View
                        onClick={() => {
                            document.getElementById("hiddenInput").value = genModel;
                            viewModel(genModel, [contextUrl]);
                            setModelText(allData.resultText);
                            setSelectedJobResult(allData);
                        }}
                    />
                </div>
            ),
        },
        {
            title: "Eval Model",
            dataIndex: "evalModel",
            key: "evalModel",
            width: 100,
            fixed: "right",
            align: "center",
            render: (evalModel, allData) => (
                <div>
                    <View
                        onClick={async () => {
                            document.getElementById("hiddenInput").value = evalModel;
                            viewModel(evalModel, [contextUrl]);
                            setModelText(allData.resultText);
                            setSelectedJobResult(allData);
                        }}
                    />
                </div>
            ),
        },
    ];
    const errorRows = [];
    const tableData = jobResults.map((entry) => {
        let paramsString = "";
        if (entry.params) {
            paramsString = entry.params
                .replace(/\{|\}|"/g, "")
                .replace(/,|,\s/g, " \n")
                .replace(/:/g, ": ");
        }
        const tableEntry = {
            id: entry.id,
            genID: entry.GenID,
            genFile: entry.genUrl.split("/").pop(),
            live: entry.live ? "True" : "False",
            generation: entry.generation,
            params: paramsString,
            score: entry.score,
            rowClass: entry.errorMessage ? "error-row" : "default-row",
            genModel: "",
            evalModel: "",
            resultText: assembleModelText(entry),
        };
        getS3Public(
            entry.owner + "/" + entry.JobID + "/" + entry.id,
            (data) => {
                tableEntry.genModel = data + ".gi";
                tableEntry.evalModel = data + "_eval.gi";
            },
            () => {}
        );

        if (entry.errorMessage) {
            errorRows.push(entry.GenID);
        }
        return tableEntry;
    });
    return (
        <Table
            style={{ whiteSpace: "pre" }}
            dataSource={tableData}
            columns={columns}
            rowKey="genID"
            rowClassName={(record, index) => record.rowClass}
            size="small"
            scroll={{ x: 1000 }}
            sticky
        />
    );
}

function ErrorList({ jobSettings, jobResults }) {
    const [alertOpened, setAlertOpened] = useState(true);
    const toggleAlert = () => setAlertOpened((currentState) => !currentState);
    if (!alertOpened) {
        return (
            <Alert
                message="ERRORS"
                type="error"
                description="..."
                action={
                    <Button size="small" type="text" onClick={toggleAlert} danger>
                        Show More
                    </Button>
                }
            />
        );
    }
    let errors = [];
    if (jobSettings.jobStatus !== "cancelled") {
        return <></>;
    }
    let count = 0;
    jobResults.forEach((result) => {
        if (result.errorMessage) {
            const errStr = "id-" + result.GenID + ": " + result.errorMessage;
            errors.push(errStr);
            errors.push(<br key={count.toString()} />);
            count += 1;
        }
    });
    return (
        <Alert
            message="ERRORS"
            type="error"
            description={<code>{errors}</code>}
            action={
                <Button size="small" type="text" onClick={toggleAlert} danger>
                    Collapse
                </Button>
            }
        />
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
    const [selectedJobResult, setSelectedJobResult] = useState(null);
    useEffect(() => {
        const jobID = QueryString.parse(window.location.hash).id;
        setJobID(jobID);
        getData(jobID, cognitoPayload.sub, setJobSettings, setJobResults, setIsLoading, () => setIsLoading(false))
            .then()
            .catch((err) => console.log(err));
    }, [cognitoPayload]);

    const notify = (title, text, isWarn = false) => {
        if (isWarn) {
            notification.error({
                message: title,
                description: text,
            });
            return;
        }
        notification.open({
            message: title,
            description: text,
        });
    };

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
            <Popconfirm
                placement="topRight"
                title="Stop Process?"
                onConfirm={cancelJob}
                icon={<QuestionCircleOutlined style={{ color: "red" }} />}
                okText="Yes"
                cancelText="No"
            >
                <Button type="primary" danger>
                    Stop Process
                </Button>
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
    async function downloadSelectedModel(isGen = false) {
        if (!selectedJobResult) {
            notify("Unable to Download!", "No result was selected, unable to download gi model.", true);
            return;
        }
        let url;
        if (isGen) {
            if (selectedJobResult.genModel) {
                url = selectedJobResult.genModel;
            } else {
                getS3Public(
                    selectedJobResult.owner + "/" + selectedJobResult.JobID + "/" + selectedJobResult.id + ".gi",
                    (data) => (url = data),
                    () => (url = "")
                );
            }
        } else {
            if (selectedJobResult.evalModel) {
                url = selectedJobResult.evalModel;
            } else {
                getS3Public(
                    selectedJobResult.owner + "/" + selectedJobResult.JobID + "/" + selectedJobResult.id + "_eval.gi",
                    (data) => (url = data),
                    () => (url = "")
                );
            }
        }
        await fetch(url).then((t) => {
            return t.blob().then((b) => {
                const a = document.getElementById("hiddenLink");
                a.href = URL.createObjectURL(b);
                a.setAttribute("download", selectedJobResult.id + (isGen ? "_gen" : "_eval") + ".gi");
                a.click();
            });
        });
    }
    async function openViewerInNewTab(isGen = false) {
        if (!selectedJobResult) {
            notify("Unable to Download!", "No result was selected, unable to download gi model.", true);
            return;
        }
        let url;
        if (isGen) {
            if (selectedJobResult.genModel) {
                url = selectedJobResult.genModel;
            } else {
                getS3Public(
                    selectedJobResult.owner + "/" + selectedJobResult.JobID + "/" + selectedJobResult.id + ".gi",
                    (data) => (url = data),
                    () => (url = "")
                );
            }
        } else {
            if (selectedJobResult.evalModel) {
                url = selectedJobResult.evalModel;
            } else {
                getS3Public(
                    selectedJobResult.owner + "/" + selectedJobResult.JobID + "/" + selectedJobResult.id + "_eval.gi",
                    (data) => (url = data),
                    () => (url = "")
                );
            }
        }
        const a = document.getElementById("hiddenLink");
        a.href = MOBIUS_VIEWER_URL + "?file=" + url;
        a.setAttribute("download", null);
        a.target = "_blank";
        a.click();
    }

    const genExtra = (part) => <Help page="result_page" part={part}></Help>;
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
    const expandedSettings = ["max_designs", "population_size", "survival_size", "tournament_size"];
    return (
        <Space direction="vertical" size="large" style={{ width: "inherit" }}>
            <br></br>
            <Spin spinning={isLoading}>
            {jobSettings ? (
                <>
                    <Row>
                        <h1>Search: {jobSettings.description}</h1>
                    </Row>
                    <Tabs defaultActiveKey="1" size="large">
                        <TabPane tab="Results" key="1">
                                {!isLoading ? (
                                    <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                        <ErrorList jobResults={jobResults} jobSettings={jobSettings}></ErrorList>
                                        <Collapse defaultActiveKey={["3", "4"]}>
                                            <Collapse.Panel header="Filter Form" key="1" extra={genExtra("result_filter_form")}>
                                                <FilterForm
                                                    modelParamsState={{ modelParams, setModelParams }}
                                                    jobResultsState={{ jobResults, setJobResults }}
                                                    filteredJobResultsState={{ filteredJobResults, setFilteredJobResults }}
                                                    setIsLoadingState={{ isLoading, setIsLoading }}
                                                />
                                            </Collapse.Panel>
                                            <Collapse.Panel header="Progress Plot" key="2" extra={genExtra("result_progress_plot")}>
                                                <ProgressPlot
                                                    jobSettings={jobSettings}
                                                    jobResults={filteredJobResults ? filteredJobResults : jobResults}
                                                    setModelText={setModelText}
                                                    setSelectedJobResult={setSelectedJobResult}
                                                />
                                            </Collapse.Panel>
                                            <Collapse.Panel header="Score Plot" key="3" extra={genExtra("result_score_plot")}>
                                                <ScorePlot
                                                    jobSettings={jobSettings}
                                                    jobResults={filteredJobResults ? filteredJobResults : jobResults}
                                                    setModelText={setModelText}
                                                    setSelectedJobResult={setSelectedJobResult}
                                                />
                                            </Collapse.Panel>
                                            <Collapse.Panel header="Mobius Viewer" key="4" extra={genExtra("result_mobius_viewer")}>
                                                <Iframe url={MOBIUS_VIEWER_URL} width="100%" height="600px" id="mobius_viewer" />
                                                <br></br>
                                                <Space direction="horizontal" size="large" style={{ width: "100%" }} align="start">
                                                    <Input.TextArea className="textArea" value={modelText} autoSize={true}></Input.TextArea>
                                                    <Space direction="vertical">
                                                        <Space direction="horizontal">
                                                            Context Url
                                                            <Input id="contextUrlInput" defaultValue={contextUrl}></Input>
                                                            <Button
                                                                onClick={() => {
                                                                    const val = document.getElementById("contextUrlInput").value;
                                                                    document.getElementById("hiddenContextUrl").value = val;
                                                                    setContextUrl(val);
                                                                    document.getElementById("hiddenButton").click();
                                                                }}
                                                            >
                                                                apply
                                                            </Button>
                                                            <input id="hiddenInput" className="hiddenElement"></input>
                                                            <input id="hiddenContextUrl" className="hiddenElement"></input>
                                                            <Button
                                                                id="hiddenButton"
                                                                className="hiddenElement"
                                                                onClick={() => {
                                                                    const val = document.getElementById("hiddenInput").value;
                                                                    const contextUrl = document.getElementById("hiddenContextUrl").value;
                                                                    viewModel(val, [contextUrl]);
                                                                }}
                                                            >
                                                                apply
                                                            </Button>
                                                        </Space>
                                                        <Button onClick={() => downloadSelectedModel(true)}>Download Gen</Button>
                                                        <Button onClick={() => downloadSelectedModel()}>Download Eval</Button>
                                                        <Button onClick={() => openViewerInNewTab(true)}>Open Gen model In New Browser</Button>
                                                        <Button onClick={() => openViewerInNewTab()}>Open Eval model In New Browser</Button>
                                                    </Space>
                                                </Space>
                                            </Collapse.Panel>
                                            <Collapse.Panel header="Result Table" key="5" extra={genExtra("result_result_table")}>
                                                <ResultTable
                                                    jobResults={filteredJobResults ? filteredJobResults : jobResults}
                                                    contextUrl={contextUrl}
                                                    setModelText={setModelText}
                                                    setSelectedJobResult={setSelectedJobResult}
                                                />
                                            </Collapse.Panel>
                                        </Collapse>
                                    </Space>
                                ) : null}
                        </TabPane>
                        <TabPane tab="Settings" key="2">
                            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                                <Collapse defaultActiveKey={["1", "2"]}>
                                    <Collapse.Panel header="Search Settings" key="1" extra={genExtra("settings_job_settings")}>
                                        <Descriptions
                                            bordered={true}
                                            size="small"
                                            column={1}
                                            style={{
                                                color: "rgba(0,0,0,0.5)",
                                            }}
                                        >
                                            <Descriptions.Item label="ID" key="id">
                                                {jobSettings.id}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="description" key="description">
                                                {jobSettings.description}
                                            </Descriptions.Item>
                                            <Descriptions.Item label="last_modified" key="updatedAt">
                                                {new Date(jobSettings.updatedAt).toLocaleString()}
                                            </Descriptions.Item>
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
                                            {/* <Descriptions.Item label="expiration" key="expiration">
                                                {String(Number(jobSettings.expiration) / 86400) + ' day(s)'}
                                            </Descriptions.Item> */}
                                        </Descriptions>
                                    </Collapse.Panel>
                                    <Collapse.Panel header="Generative Details" key="2" extra={genExtra("settings_gen_details")}>
                                        <Table dataSource={genTableData} columns={genTableColumns} rowKey="genUrl"></Table>
                                    </Collapse.Panel>
                                </Collapse>
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
                    <a id="hiddenLink" className="hiddenElement"></a>
                </>
            ) : null}
        </Spin>
        </Space>
    );
}

export default JobResults;
