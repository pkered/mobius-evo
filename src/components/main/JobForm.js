import React, { useState, useContext, useEffect } from "react";
import "./JobForm.css";
import * as QueryString from "query-string";
import { v4 as uuidv4 } from "uuid";
import { API, graphqlOperation } from "aws-amplify";
import { createJob, createGenEvalParam } from "../../graphql/mutations";
import { uploadS3, listS3, getS3Url, downloadS3 } from "../../amplify-apis/userFiles";
import { UploadOutlined } from "@ant-design/icons";
import { AuthContext } from "../../Contexts";
import { Link } from "react-router-dom";
import { Form, Input, InputNumber, Button, Steps, Table, Radio, Checkbox, Upload, message, Tag, Space, Spin, Row, Descriptions, Divider } from "antd";
const testDefault = {
    description: `new test`,
    max_designs: 12,
    population_size: 3,
    tournament_size: 3,
    survival_size: 2,
    expiration: 86400,
    genFile_random_generated: 6,
    genFile_total_items: 6,
};

function SettingsForm({ formValuesState }) {
    const { cognitoPayload } = useContext(AuthContext);
    const [form] = Form.useForm();
    const { formValues, setFormValues } = formValuesState;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [genFile, setGenFile] = useState([]);
    const [evalFile, setEvalFile] = useState(null);
    const [genFiles, setGenFiles] = useState([]);
    const [evalFiles, setEvalFiles] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isTableLoading, setIsTableLoading] = useState(true);
    const [genElements, setGenElements] = useState([]);
    const onRadioCell = () => ({ style: { textAlign: "center" } });
    const genColumns = [
        {
            title: "File",
            dataIndex: "filename",
            key: "filename",
            sorter: true,
            sortDirections: ["ascend", "descend"],
        },
        {
            title: "Uploaded",
            dataIndex: "lastModified",
            key: "lastModified",
            sorter: true,
            sortDirections: ["ascend", "descend"],
            defaultSortOrder: "descend",
            render: (text, record, index) => (
                <Space>
                    {text.toLocaleString()}
                    {record.tag ? (
                        <Tag color="green" key={record.tag}>
                            {record.tag.toUpperCase()}
                        </Tag>
                    ) : null}
                </Space>
            ),
        },
        {
            title: "Select File",
            key: "genfile",
            onCell: onRadioCell,
            width: "8em",
            render: (text, record, index) => (
                <Checkbox
                    value={record.filename}
                    checked={genFile.indexOf(record.filename) !== -1}
                    onChange={async (event) => {
                        const ind = genFile.indexOf(record.filename);
                        let newGenFile;
                        if (ind !== -1) {
                            genFile.splice(ind, 1);
                            newGenFile = [...genFile];
                            setGenFile(newGenFile);
                        } else {
                            newGenFile = [...genFile, event.target.value];
                            setGenFile(newGenFile);
                        }
                        formValues.genUrl = {};
                        formValues.genKeys = [];
                        const genElements = [];
                        for (const genF of newGenFile) {
                            await getS3Url(
                                `files/gen/${genF}`,
                                (s3Url) => {
                                    formValues.genUrl[genF] = s3Url;
                                    formValues.genKeys.push(genF);
                                    genElements.push(
                                        <Form.Item label={genF} name={"genFile_" + genF} key={genF} initialValue={0}>
                                            <InputNumber min={0} onChange={onNumChange} />
                                        </Form.Item>
                                    );
                                },
                                () => {}
                            );
                        }
                        console.log("___", genFile, genElements);
                        setFormValues(formValues);
                        setGenElements(genElements);
                    }}
                ></Checkbox>
            ),
        },
    ];
    const evalColumns = [
        {
            title: "File",
            dataIndex: "filename",
            key: "filename",
            sorter: true,
            sortDirections: ["ascend", "descend"],
        },
        {
            title: "Uploaded",
            dataIndex: "lastModified",
            key: "lastModified",
            sorter: true,
            sortDirections: ["ascend", "descend"],
            defaultSortOrder: "descend",
            render: (text, record, index) => (
                <Space>
                    {text.toLocaleString()}
                    {record.tag ? (
                        <Tag color="green" key={record.tag}>
                            {record.tag.toUpperCase()}
                        </Tag>
                    ) : null}
                </Space>
            ),
        },
        {
            title: "Select File",
            key: "evalfile",
            onCell: onRadioCell,
            width: "8em",
            render: (text, record, index) => (
                <Radio
                    value={record.filename}
                    checked={record.filename === evalFile}
                    onChange={async (event) => {
                        setEvalFile(event.target.value);
                        await getS3Url(
                            `files/eval/${event.target.value}`,
                            (s3Url) => (formValues.evalUrl = s3Url),
                            () => {}
                        );
                        setFormValues(formValues);
                    }}
                ></Radio>
            ),
        },
    ];
    const listS3files = () => {
        setIsTableLoading(true);
        const uploadedSet = new Set(uploadedFiles);
        let isSubscribed = true; // prevents memory leak on unmount
        const prepS3files = (files) => {
            if (isSubscribed) {
                const fileList = files.map(({ key, lastModified }, index) => {
                    return {
                        key: index,
                        filename: key.split("/").pop(),
                        fileType: key.split("/").slice(-2, -1)[0],
                        lastModified,
                        tag: uploadedSet.has(key.split("/").pop()) ? "new" : null,
                    };
                });
                fileList.sort((a, b) => b.lastModified - a.lastModified);
                setGenFiles(fileList.filter((record) => record.fileType === "gen"));
                setEvalFiles(fileList.filter((record) => record.fileType === "eval"));
                setIsTableLoading(false);
            }
        }; // changes state if still subscribed
        listS3(prepS3files, () => {});
        return () => (isSubscribed = false);
    };
    useEffect(listS3files, [uploadedFiles]); // Updates when new files are uploaded
    function FileUpload({ uploadType }) {
        function handleUpload({ file, onSuccess, onError, onProgress }) {
            uploadS3(`files/${uploadType.toLowerCase()}/${file.name}`, file, onSuccess, onError, onProgress);
        }
        function handleChange(event) {
            if (event.file.status === "done") {
                message.success(`${event.file.name} file uploaded successfully`);
                setUploadedFiles([...uploadedFiles, ...event.fileList.map((file) => file.name)]);
            } else if (event.file.status === "error") {
                message.error(`${event.file.name} file upload failed.`);
            }
        }
        return (
            <div className="upload-topbar">
                <Upload accept=".js" multiple={true} customRequest={handleUpload} onChange={handleChange} showUploadList={false}>
                    <Button>
                        <UploadOutlined /> Upload {uploadType} File
                    </Button>
                </Upload>
            </div>
        );
    }

    const handleGenTableChange = (pagination, filters, sorter) => {
        const compareAscend = (a, b) => {
            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            } else {
                return 0;
            }
        };
        const compareDescend = (a, b) => {
            if (a > b) {
                return -1;
            } else if (a < b) {
                return 1;
            } else {
                return 0;
            }
        };
        const [field, order] = [sorter.field, sorter.order];
        const _genFiles = [...genFiles];
        if (order === "ascend") {
            _genFiles.sort((a, b) => compareAscend(a[field], b[field]));
        } else {
            _genFiles.sort((a, b) => compareDescend(a[field], b[field]));
        }
        setGenFiles(_genFiles);
    };

    const handleEvalTableChange = (pagination, filters, sorter) => {
        const compareAscend = (a, b) => {
            if (a < b) {
                return -1;
            } else if (a > b) {
                return 1;
            } else {
                return 0;
            }
        };
        const compareDescend = (a, b) => {
            if (a > b) {
                return -1;
            } else if (a < b) {
                return 1;
            } else {
                return 0;
            }
        };
        const [field, order] = [sorter.field, sorter.order];
        const _evalFiles = [...evalFiles];
        if (order === "ascend") {
            _evalFiles.sort((a, b) => compareAscend(a[field], b[field]));
        } else {
            _evalFiles.sort((a, b) => compareDescend(a[field], b[field]));
        }
        setEvalFiles(_evalFiles);
    };

    async function initParams(jobID, jobSettings) {
        let startingGenID = 0;
        const allPromises = [];
        for (let i = 0; i < jobSettings.genFile_random_generated; i++) {
            const randomIndex = Math.floor(Math.random() * jobSettings.genKeys.length);
            jobSettings["genFile_" + jobSettings.genKeys[randomIndex]] += 1;
        }
        for (const genKey of jobSettings.genKeys) {
            let genFile;
            await downloadS3(
                `files/gen/${genKey}`,
                (data) => {
                    genFile = data;
                },
                () => {}
            );
            // console.log(genFileText)
            if (!genFile) {
                console.log("Error: Unable to Retrieve Gen File!");
                return false;
            }
            const splittedString = genFile.split("/** * **/");
            const argStrings = splittedString[0].split("// Parameter:");
            const params = [];
            if (argStrings.length > 1) {
                for (let i = 1; i < argStrings.length - 1; i++) {
                    params.push(JSON.parse(argStrings[i]));
                }
                params.push(JSON.parse(argStrings[argStrings.length - 1].split("function")[0].split("async")[0]));
            }
            params.forEach((x) => {
                if (x.min && typeof x.min !== "number") {
                    x.min = Number(x.min);
                }
                if (x.max && typeof x.max !== "number") {
                    x.max = Number(x.max);
                }
                if (x.step && typeof x.step !== "number") {
                    x.step = Number(x.step);
                }
            });
            if (!params) {
                continue;
            }
            for (let i = 0; i < jobSettings["genFile_" + genKey]; i++) {
                const paramSet = {
                    id: jobID + "_" + startingGenID,
                    JobID: jobID.toString(),
                    GenID: startingGenID.toString(),
                    generation: 1,
                    genUrl: jobSettings.genUrl[genKey],
                    evalUrl: jobSettings.evalUrl,
                    evalResult: null,
                    live: true,
                    owner: jobSettings.owner,
                    params: null,
                    score: null,
                    expirationTime: null,
                    errorMessage: ''
                };
                startingGenID++;
                const itemParams = {};
                // generate the parameters used for that Gen File
                for (const param of params) {
                    if (param.hasOwnProperty("step")) {
                        let steps = (param.max - param.min) / param.step;
                        let randomStep = Math.floor(Math.random() * steps);
                        itemParams[param.name] = param.min + param.step * randomStep;
                    } else {
                        itemParams[param.name] = param.value;
                    }
                }
                paramSet.params = JSON.stringify(itemParams);
                allPromises.push(
                    API.graphql(
                        graphqlOperation(createGenEvalParam, {
                            input: paramSet,
                        })
                    )
                        .then()
                        .catch((err) => console.log(err))
                );
            }
        }
        await Promise.all(allPromises);
    }

    async function handleFinish() {
        setIsSubmitting(true);
        const jobID = uuidv4();
        const jobSettings = { ...formValues, ...form.getFieldsValue() };
        await initParams(jobID, jobSettings);
        API.graphql(
            graphqlOperation(createJob, {
                input: {
                    id: jobID,
                    userID: cognitoPayload.sub,
                    jobStatus: "inprogress",
                    owner: cognitoPayload.sub,
                    run: true,
                    evalUrl: jobSettings.evalUrl,
                    genUrl: Object.values(jobSettings.genUrl),
                    expiration: jobSettings.expiration,
                    description: jobSettings.description,
                    max_designs: jobSettings.max_designs,
                    population_size: jobSettings.population_size,
                    tournament_size: jobSettings.tournament_size,
                    survival_size: jobSettings.survival_size,
                    errorMessage: ''
                },
            })
        ).then(() => {
            setIsSubmitting(false);
            window.location.href = `/jobs/search-results#${QueryString.stringify({ id: jobID })}`;
        });
    }
    //   const formInitialValues = {
    //     description: `New Job`,
    //     max_designs: 80,
    //     population_size: 20,
    //     tournament_size: 5,
    //     survival_size: 2,
    //     expiration: 86400,
    //     genFile_random_generated: 40,
    //     genFile_total_items: 40,
    //   //   max_designs: 10,
    //   //   population_size: 2,
    //   //   tournament_size: 2,
    //   //   survival_size: 1,
    //   //   expiration: 600,
    //   }
    const formInitialValues = testDefault;

    function onPopChange(e) {
        onNumChange(null);
    }
    function onNumChange(e) {
        setTimeout(() => {
            const starting_population = Number(form.getFieldValue("population_size")) * 2;
            let totalCount = 0;
            if (formValues.genKeys) {
                formValues.genKeys.forEach((genFile) => {
                    const inpID = "genFile_" + genFile;
                    totalCount += Number(form.getFieldValue(inpID));
                });
            }
            let countDiff = starting_population - totalCount;
            const formUpdate = { genFile_total_items: starting_population };
            if (countDiff < 0) {
                if (e !== null) {
                    const inpID = document.activeElement.id.split("jobSettings_")[1];
                    formUpdate[inpID] = countDiff + Number(form.getFieldValue(inpID));
                    document.activeElement.value = formUpdate[inpID];
                    countDiff = 0;
                } else {
                    if (formValues.genKeys) {
                        formValues.genKeys.forEach((genFile) => {
                            if (countDiff >= 0) {
                                return;
                            }
                            const inpID = "genFile_" + genFile;
                            const inpCount = Number(form.getFieldValue(inpID));
                            if (inpCount === 0) {
                                return;
                            }
                            if (inpCount + countDiff >= 0) {
                                formUpdate[inpID] = inpCount + countDiff;
                                countDiff = 0;
                                return;
                            }
                            formUpdate[inpID] = 0;
                            countDiff += inpCount;
                        });
                    }
                }
            }
            formUpdate["genFile_random_generated"] = countDiff;
            form.setFieldsValue(formUpdate);
        }, 0);
    }

    // if (formValues.genKeys) {
    //     formValues.genKeys.forEach((genFile) => {
    //         formInitialValues["genFile_" + genFile] = 0;
    //         genElements.push(
    //             <Form.Item label={genFile} name={"genFile_" + genFile} key={genFile}>
    //                 <InputNumber min={0} onChange={onNumChange} />
    //             </Form.Item>
    //         );
    //     });
    // }
    return (
        <Spin spinning={isSubmitting} tip="Starting Job...">
            <Form
                name="jobSettings"
                onFinish={handleFinish}
                form={form}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                layout="horizontal"
                initialValues={formInitialValues}
            >
                <Form.Item label="Description" name="description">
                    <Input />
                </Form.Item>
                <Form.Item label="Number of Designs" name="max_designs" rules={[{ required: true }]}>
                    <InputNumber min={1} />
                </Form.Item>
                <Form.Item label="Population Size" name="population_size">
                    <InputNumber min={1} onChange={onPopChange} />
                </Form.Item>
                <Form.Item label="Tournament Size" name="tournament_size">
                    <InputNumber />
                </Form.Item>
                <Form.Item label="Survival Size" name="survival_size">
                    <InputNumber />
                </Form.Item>
                <Form.Item label="Expiration" name="expiration">
                    <InputNumber />
                </Form.Item>
                <Divider />
                <FileUpload uploadType={"Gen"} />
                <Table
                    dataSource={genFiles}
                    columns={genColumns}
                    loading={isTableLoading}
                    onChange={handleGenTableChange}
                    showSorterTooltip={false}
                    pagination={{
                        total: genFiles.length,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `${total} files`,
                    }}
                ></Table>
                <Divider />
                <FileUpload uploadType={"Eval"} />
                <Table
                    dataSource={evalFiles}
                    columns={evalColumns}
                    loading={isTableLoading}
                    onChange={handleEvalTableChange}
                    showSorterTooltip={false}
                    pagination={{
                        total: evalFiles.length,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `${total} files`,
                    }}
                ></Table>
                <Divider />
                <Form.Item label="Total Starting Items" name="genFile_total_items">
                    <InputNumber disabled />
                </Form.Item>
                {genElements}
                <Form.Item label="Random Generated" name="genFile_random_generated">
                    <InputNumber disabled />
                </Form.Item>
                <br></br>
                <Row justify="center">
                    <Button type="primary" htmlType="submit">
                        Start
                    </Button>
                </Row>
                <br></br>
                <br></br>
                <br></br>
            </Form>
        </Spin>
    );
}

function JobForm() {
    const [formValues, setFormValues] = useState({});
    const [currentStep, setCurrentStep] = useState(0);
    const steps = ["1. Select Files", `2. Job Settings`, "3. Summary"];
    const nextStep = () => setCurrentStep(Math.min(steps.length - 1, currentStep + 1));

    return (
        <div className="jobForm-container">
            <Space direction="vertical" size="large" style={{ width: "inherit" }}>
                <h1>Start New Job</h1>
                {/* <FileSelection nextStep={nextStep} formValuesState={{ formValues, setFormValues }} /> */}
                <SettingsForm formValuesState={{ formValues, setFormValues }} />
                {/* <FormToRender /> */}
            </Space>
        </div>
    );
}

export default JobForm;
