import React, { useState, useContext, useEffect } from "react";
import "./JobForm.css";
import * as QueryString from "query-string";
import { v4 as uuidv4 } from "uuid";
import { API, graphqlOperation } from "aws-amplify";
import { createJob, createGenEvalParam } from "../../graphql/mutations";
import { uploadS3, listS3, getS3, downloadS3 } from "../../amplify-apis/userFiles";
import { UploadOutlined } from "@ant-design/icons";
import { AuthContext } from "../../Contexts";
import { Link } from "react-router-dom";
import { Form, Input, InputNumber, Button, Steps, Table, Radio, Checkbox, Upload, message, Tag, Space, Spin, Row, Descriptions, Divider } from "antd";
const { Step } = Steps;
const testDefault = {
    description: `new test`,
    maxDesigns: 12,
    population_size: 3,
    tournament_size: 3,
    survival_size: 2,
    expiration: 86400,
    genFile_random_generated: 6,
    genFile_total_items: 6,
};

function FileSelection({ nextStep, formValuesState }) {
    const { formValues, setFormValues } = formValuesState;
    const [genFile, setGenFile] = useState([]);
    const [evalFile, setEvalFile] = useState(null);
    const [s3Files, setS3Files] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isTableLoading, setIsTableLoading] = useState(true);
    const onRadioCell = () => ({ style: { textAlign: "center" } });
    const columns = [
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
            title: "Gen File",
            key: "genfile",
            onCell: onRadioCell,
            width: "8em",
            render: (text, record, index) => (
                <Checkbox
                    value={record.filename}
                    checked={genFile.indexOf(record.filename) !== -1}
                    onChange={(event) => {
                        const ind = genFile.indexOf(record.filename);
                        if (ind !== -1) {
                            genFile.splice(ind, 1);
                            setGenFile([...genFile]);
                        } else {
                            setGenFile([...genFile, event.target.value]);
                            if (evalFile === event.target.value) {
                                setEvalFile(null);
                            }
                        }
                    }}
                ></Checkbox>
            ),
        },
        {
            title: "Eval File",
            key: "evalfile",
            onCell: onRadioCell,
            width: "8em",
            render: (text, record, index) => (
                <Radio
                    value={record.filename}
                    checked={record.filename === evalFile}
                    onChange={(event) => {
                        setEvalFile(event.target.value);
                        const genIndex = genFile.indexOf(event.target.value);
                        if (genIndex !== -1) {
                            genFile.splice(genIndex, 1);
                            setGenFile([...genFile]);
                        }
                    }}
                ></Radio>
            ),
        },
    ];
    const listS3files = () => {
        const uploadedSet = new Set(uploadedFiles);
        let isSubscribed = true; // prevents memory leak on unmount
        const prepS3files = (files) => {
            if (isSubscribed) {
                const fileList = files.map(({ key, lastModified }, index) => {
                    return {
                        key: index,
                        filename: key.split("/").pop(),
                        lastModified,
                        tag: uploadedSet.has(key.split("/").pop()) ? "new" : null,
                    };
                });
                fileList.sort((a, b) => b.lastModified - a.lastModified); // Default descending order
                setS3Files([...fileList]);
                setIsTableLoading(false);
            }
        }; // changes state if still subscribed
        listS3(prepS3files, () => {});
        return () => (isSubscribed = false);
    };
    useEffect(listS3files, [uploadedFiles]); // Updates when new files are uploaded
    function FileUpload() {
        function handleUpload({ file, onSuccess, onError, onProgress }) {
            uploadS3(`files/${file.name}`, file, onSuccess, onError, onProgress);
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
                        <UploadOutlined /> Upload
                    </Button>
                </Upload>
                {/* <span>{uploadedFiles.length>0 ? `Uploaded: ${uploadedFiles.join(", ")}` : null}</span> */}
            </div>
        );
    }

    const handleTableChange = (pagination, filters, sorter) => {
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
        const _s3Files = [...s3Files];
        if (order === "ascend") {
            _s3Files.sort((a, b) => compareAscend(a[field], b[field]));
        } else {
            _s3Files.sort((a, b) => compareDescend(a[field], b[field]));
        }
        setS3Files(_s3Files);
    };
    const handleClick = async () => {
        const _formValues = { genKeys: [], genUrl: {}, evalUrl: null };
        for (const genF of genFile) {
            await getS3(
                `files/${genF}`,
                (s3Url) => {
                    _formValues.genUrl[genF] = s3Url.split("?")[0];
                    _formValues.genKeys.push(genF);
                },
                () => {}
            );
        }
        await getS3(
            `files/${evalFile}`,
            (s3Url) => (_formValues.evalUrl = s3Url.split("?")[0]),
            () => {}
        );
        setFormValues({ ...formValues, ..._formValues });
        nextStep();
    };

    return (
        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <FileUpload />
            <Table
                dataSource={s3Files}
                columns={columns}
                loading={isTableLoading}
                onChange={handleTableChange}
                showSorterTooltip={false}
                pagination={{
                    total: s3Files.length,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total) => `${total} files`,
                }}
            ></Table>
            <Row justify="end">
                <Button onClick={handleClick} disabled={genFile === null || evalFile === null}>
                    Continue
                </Button>
            </Row>
        </Space>
    );
}

function SettingsForm({ nextStep, formValuesState, jobType }) {
    const { cognitoPayload } = useContext(AuthContext);
    const [form] = Form.useForm();
    const { formValues, setFormValues } = formValuesState;
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function initParams(jobID, jobSettings) {
        let expiration = 86400;
        if (jobSettings.expiration) {
            expiration = jobSettings.expiration;
        }
        const expiration_time = Math.round(Date.now() / 1000) + expiration;
        let startingGenID = 0;
        const allPromises = [];
        for (let i = 0; i < jobSettings.genFile_random_generated; i++) {
            const randomIndex = Math.floor(Math.random() * jobSettings.genKeys.length);
            jobSettings["genFile_" + jobSettings.genKeys[randomIndex]] += 1;
        }
        for (const genKey of jobSettings.genKeys) {
            let genFile;
            await downloadS3(
                `files/${genKey}`,
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
                    maxDesigns: jobSettings.maxDesigns,
                    population_size: jobSettings.population_size,
                    tournament_size: jobSettings.tournament_size,
                    survival_size: jobSettings.survival_size,
                },
            })
        ).then(() => {
            setIsSubmitting(false);
            setFormValues({ ...jobSettings, jobID });
            nextStep();
        });
    }
    //   const formInitialValues = {
    //     description: `New ${jobType}`,
    //     maxDesigns: 80,
    //     population_size: 20,
    //     tournament_size: 5,
    //     survival_size: 2,
    //     expiration: 86400,
    //     genFile_random_generated: 40,
    //     genFile_total_items: 40,
    //   //   maxDesigns: 10,
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
            formValues.genKeys.forEach((genFile) => {
                const inpID = "genFile_" + genFile;
                totalCount += Number(form.getFieldValue(inpID));
            });
            let countDiff = starting_population - totalCount;
            const formUpdate = { genFile_total_items: starting_population };
            if (countDiff < 0) {
                if (e !== null) {
                    const inpID = document.activeElement.id.split("jobSettings_")[1];
                    formUpdate[inpID] = countDiff + Number(form.getFieldValue(inpID));
                    document.activeElement.value = formUpdate[inpID];
                    countDiff = 0;
                } else {
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
            formUpdate["genFile_random_generated"] = countDiff;
            form.setFieldsValue(formUpdate);
        }, 0);
    }
    formValues.genKeys.forEach((genFile) => {
        formInitialValues["genFile_" + genFile] = 0;
    });
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
                <Form.Item label="Number of Designs" name="maxDesigns" rules={[{ required: true }]}>
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
                <Form.Item label="Total Starting Items" name="genFile_total_items">
                    <InputNumber disabled />
                </Form.Item>
                {formValues.genKeys.map((genFile) => {
                    return (
                        <Form.Item label={genFile} name={"genFile_" + genFile} key={genFile}>
                            <InputNumber min={0} onChange={onNumChange} />
                        </Form.Item>
                    );
                })}
                <Form.Item label="Random Generated" name="genFile_random_generated">
                    <InputNumber disabled />
                </Form.Item>
                <Row justify="center">
                    <Button type="primary" htmlType="submit">
                        Start {jobType}
                    </Button>
                </Row>
            </Form>
        </Spin>
    );
}

function FinishedForm({ formValuesState }) {
    const { formValues, setFormValues } = formValuesState;

    return (
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <Descriptions title="Your Job has been submitted" bordered={true} column={2}>
                <Descriptions.Item label="Gen File">
                    {Object.values(formValues.genUrl)
                        .map((url) => url.split("/").pop())
                        .join(", ")}
                </Descriptions.Item>
                <Descriptions.Item label="Eval File">{formValues.evalUrl.split("/").pop()}</Descriptions.Item>
                <Descriptions.Item label="Description">{formValues.description}</Descriptions.Item>
                <Descriptions.Item label="Number of Designs">{formValues.maxDesigns}</Descriptions.Item>
                <Descriptions.Item label="Population Size">{formValues.population_size}</Descriptions.Item>
                <Descriptions.Item label="Tournament Size">{formValues.tournament_size}</Descriptions.Item>
                <Descriptions.Item label="Survival Size">{formValues.survival_size}</Descriptions.Item>
                <Descriptions.Item label="Expiration">{formValues.expiration}</Descriptions.Item>
            </Descriptions>
            <Row justify="center">
                <Space>
                    <Button
                        type="primary"
                        onClick={() => {
                            setFormValues(null);
                        }}
                    >
                        <Link
                            to={`/explorations/search-results#${QueryString.stringify({
                                id: formValues.jobID,
                            })}`}
                        >
                            View Results
                        </Link>
                    </Button>
                </Space>
            </Row>
        </Space>
    );
}

function JobForm() {
    const [formValues, setFormValues] = useState({});
    const [currentStep, setCurrentStep] = useState(0);
    const [parentData, setParentData] = useState(null);
    const [jobType, setJobType] = useState("");
    const steps = ["1. Select Files", `2. ${jobType} Settings`, "3. Summary"];
    const nextStep = () => setCurrentStep(Math.min(steps.length - 1, currentStep + 1));

    function FormToRender() {
        switch (currentStep) {
            case 0:
                return <FileSelection nextStep={nextStep} formValuesState={{ formValues, setFormValues }} />;
            case 1:
                return <SettingsForm nextStep={nextStep} formValuesState={{ formValues, setFormValues }} parentData={parentData} jobType={jobType} />;
            case 2:
                return <FinishedForm formValuesState={{ formValues, setFormValues }} />;
            default:
                return <FileSelection nextStep={nextStep} formValuesState={{ formValues, setFormValues }} />;
        }
    }

    return (
        <div className="jobForm-container">
            <Space direction="vertical" size="large" style={{ width: "inherit" }}>
                <h1>Start New {jobType}</h1>
                <Steps progressDot current={currentStep}>
                    {steps.map((step, index) => (
                        <Step title={step} key={index} />
                    ))}
                </Steps>
                <FormToRender />
            </Space>
        </div>
    );
}

export default JobForm;
