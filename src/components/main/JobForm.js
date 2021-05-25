import React, { useState, useContext, useEffect } from "react";
import "./JobForm.css";
import * as QueryString from "query-string";
import { v4 as uuidv4 } from "uuid";
import { API, graphqlOperation } from "aws-amplify";
import { createJob, createGenEvalParam } from "../../graphql/mutations";
import { uploadS3, listS3, getS3Url, downloadS3 } from "../../amplify-apis/userFiles";
import { UploadOutlined } from "@ant-design/icons";
import { AuthContext } from "../../Contexts";
import {
    Form,
    Input,
    InputNumber,
    Button,
    Tooltip,
    Table,
    Radio,
    Checkbox,
    Upload,
    message,
    Tag,
    Space,
    Spin,
    Row,
    Collapse,
    notification,
    Modal
} from "antd";
import Help from "./utils/Help";
import helpJSON from "../../assets/help/help_text_json";

const testDefault = {
    description: `new test`,
    max_designs: 100,
    population_size: 20,
    tournament_size: 5,
    survival_size: 3,
    expiration_days: 30,
    genFile_random_generated: 40,
    genFile_total_items: 40,
};
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

function FileSelectionModal({ isModalVisibleState, genFilesState, setEvalFile, replacedUrl, replaceEvalCheck }) {
    const [s3Files, setS3Files] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isTableLoading, setIsTableLoading] = useState(true);
    const { genFiles, setGenFiles } = genFilesState;
    const { isModalVisible, setIsModalVisible } = isModalVisibleState;
    const [newFile, setnewFile] = useState(null);

    const handleOk = async () => {
        if (!replaceEvalCheck) {
            handleGenOk();
        } else {
            handleEvalOk();
        }
    };
    const handleGenOk = async () => {
        if (!newFile) {
            setIsModalVisible(false);
            return;
        }
        let newUrl = "";
        await getS3Url(
            `files/gen/${newFile}`,
            (s3Url) => (newUrl = s3Url),
            () => {}
        );
        let okCheck = false;
        if (!replacedUrl) {
            if (genFiles.indexOf(newUrl) !== -1) {
                notify('Unable to add gen file!', 'Job already contains Gen file to be added.')
                return;
            }
            genFiles.push(newUrl);
            okCheck = true;
        } else {
            const genIndex = genFiles.indexOf(replacedUrl);
            if (genIndex !== -1) {
                genFiles.splice(genIndex, 1, newUrl);
                okCheck = true;
            }
        }
        if (okCheck) {
            setGenFiles(genFiles);
        }
        setIsModalVisible(false);
    };
    const handleEvalOk = async () => {
        if (!newFile) {
            setIsModalVisible(false);
            return;
        }
        let newUrl = "";
        await getS3Url(
            `files/eval/${newFile}`,
            (s3Url) => (newUrl = s3Url),
            () => {}
        );
        setEvalFile(newUrl);
        setIsModalVisible(false);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
    };

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
            title: "Select File",
            key: "evalfile",
            onCell: onRadioCell,
            width: "8em",
            render: (text, record, index) => (
                <Radio
                    value={record.filename}
                    checked={record.filename === newFile}
                    onChange={(event) => {
                        setnewFile(event.target.value);
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
                const fileList = [];
                files.forEach(({ key, lastModified }, index) => {
                    const fileUrlSplit = key.split("/");
                    if (replaceEvalCheck && fileUrlSplit[fileUrlSplit.length - 2] === "gen") {
                        return;
                    } else if (!replaceEvalCheck && fileUrlSplit[fileUrlSplit.length - 2] === "eval") {
                        return;
                    }
                    fileList.push({
                        key: index,
                        filename: key.split("/").pop(),
                        lastModified,
                        tag: uploadedSet.has(key.split("/").pop()) ? "new" : null,
                    });
                });
                fileList.sort((a, b) => b.lastModified - a.lastModified); // Default descending order
                setS3Files([...fileList]);
                setnewFile(null);
                setIsTableLoading(false);
            }
        }; // changes state if still subscribed
        listS3(prepS3files, () => {});
        return () => (isSubscribed = false);
    };
    useEffect(listS3files, [uploadedFiles, isModalVisible]); // Updates when new files are uploaded
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
    return (
        <>
            <Modal title="Select File" visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
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
                </Space>
            </Modal>
        </>
    );
}

function SettingsForm({currentStateManage}) {
    const { cognitoPayload } = useContext(AuthContext);
    const { currentState, setCurrentState } = currentStateManage;
    const [form] = Form.useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [genFiles, setGenFiles] = useState([]);
    const [evalFile, setEvalFile] = useState(null);
    
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [replacedUrl, setReplacedUrl] = useState(null);
    const [replaceEvalCheck, setReplacedEvalCheck] = useState(false);

    const showModalGen = (url) => {
        setReplacedUrl(url);
        setReplacedEvalCheck(false);
        setIsModalVisible(true);
    };
    const showModalEval = () => {
        setReplacedUrl("");
        setReplacedEvalCheck(true);
        setIsModalVisible(true);
    };

    const deleteGenFile = async (url) => {
        const urlIndex = genFiles.indexOf(url);
        if (urlIndex !== -1) {
            genFiles.splice(urlIndex, 1);
            setGenFiles(genFiles);
            setCurrentState(!currentState)
        }
    };


    async function initParams(jobID, jobSettings) {
        let startingGenID = 0;
        const allPromises = [];
        const genUrls = {}
        const genKeys = jobSettings.genUrl.map( url => {
            const key = url.split('/').pop();
            genUrls[key] = url;
            return key;
        });
        for (let i = 0; i < jobSettings.genFile_random_generated; i++) {
            const randomIndex = Math.floor(Math.random() * jobSettings.genUrl.length);
            jobSettings["genFile_" + genKeys[randomIndex]] += 1;
        }
        for (const genKey of genKeys) {
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
                    genUrl: genUrls[genKey],
                    evalUrl: jobSettings.evalUrl,
                    evalResult: null,
                    live: true,
                    owner: jobSettings.owner,
                    params: null,
                    score: null,
                    expirationTime: null,
                    errorMessage: null,
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
        const jobID = uuidv4();
        const jobSettings = { ...form.getFieldsValue() };
        if (!genFiles || !evalFile) {
            notify("Unable to Start Job", "Please select at least one Gen File and one Eval File!", true);
            return;
        }
        // jobSettings.expiration = jobSettings.expiration_days * 24 * 60 * 60;
        setIsSubmitting(true);
        jobSettings.genUrl = genFiles;
        jobSettings.evalUrl = evalFile;
        await initParams(jobID, jobSettings);
        const jobParam = {
            id: jobID,
            userID: cognitoPayload.sub,
            jobStatus: "inprogress",
            owner: cognitoPayload.sub,
            run: true,
            evalUrl: jobSettings.evalUrl,
            genUrl: jobSettings.genUrl,
            expiration: null,
            description: jobSettings.description,
            max_designs: jobSettings.max_designs,
            population_size: jobSettings.population_size,
            tournament_size: jobSettings.tournament_size,
            survival_size: jobSettings.survival_size,
            errorMessage: null,
        };
        console.log(jobParam)
        API.graphql(
            graphqlOperation(createJob, {
                input: jobParam,
            })
        ).then(() => {
            setIsSubmitting(false);
            window.location.href = `/searches/search-results#${QueryString.stringify({ id: jobID })}`;
        });
    }
    function handleFinishFail() {
        notify("Unable to Start Job", "Please check for Errors in form!", true);
    }
    const formInitialValues = testDefault;

    function onPopChange(e) {
        onNumChange(null);
    }
    function onNumChange(e) {
        setTimeout(() => {
            const starting_population = Number(form.getFieldValue("population_size")) * 2;
            let totalCount = 0;
            genFiles.forEach((genUrl) => {
                const genFile = genUrl.split("/").pop();
                const inpID = "genFile_" + genFile;
                totalCount += Number(form.getFieldValue(inpID));
            });
            let countDiff = starting_population - totalCount;
            const formUpdate = { genFile_total_items: starting_population };
            if (countDiff < 0) { countDiff = 0; }
            formUpdate["genFile_random_generated"] = countDiff;
            form.setFieldsValue(formUpdate);
        }, 0);
    }
    function checkTournament(_, value) {
        const popVal = form.getFieldValue("population_size");
        const survivalVal = form.getFieldValue("survival_size");
        if (value > popVal * 2) {
            return Promise.reject(new Error("Tournament size must not be larger than 2 * population_size!"));
        }
        if (value > survivalVal) {
            return Promise.resolve();
        }
        return Promise.reject(new Error("Tournament size must be larger than Survival size!"));
    }
    function checkSurvival(_, value) {
        const tournamentVal = form.getFieldValue("tournament_size");
        if (value < tournamentVal) {
            return Promise.resolve();
        }
        return Promise.reject(new Error("Survival size must be smaller than Tournament size!"));
    }

    function checkGenFile(_) {
        const formVal = form.getFieldsValue();
        const totalVal = Number(formVal.genFile_total_items);
        let totalCount = 0;
        genFiles.forEach((genUrl) => {
            const genFile = genUrl.split("/").pop();
            const inpID = "genFile_" + genFile;
            totalCount += Number(formVal[inpID]);
        });
        if (totalVal < totalCount) {
            return Promise.reject(new Error('Total number of genFile parameters cannot be higher than Total Starting Items'));
        }
        return Promise.resolve();
    }


    const genExtra = (part) => <Help page="start_new_job_page" part={part}></Help>;
    let helpText = {};
    try {
        helpText = helpJSON.hover.start_new_job_page;
    } catch (ex) {}
    const rules = [{ required: true }];

    const genTableData = genFiles.map((genUrl) => {
        const genFile = genUrl.split("/").pop();
        const tableEntry = {
            genUrl: genUrl,
            genFile: genFile,
            fileAction: genUrl,
        };
        return tableEntry;
    });
    const evalTableData = [];
    if (evalFile) {
        evalTableData.push({
            evalUrl: evalFile,
            evalFile: evalFile.split("/").pop(),
            fileAction: evalFile,
        });
    }
    const genTableColumns = [
        {
            title: "Gen File",
            dataIndex: "genFile",
            key: "genFile",
            defaultSortOrder: "ascend",
        },
        {
            title: "Action",
            dataIndex: "fileAction",
            key: "fileAction",
            render: (url) => (
                <>
                    <Button type="text" htmlType="button" onClick={() => showModalGen(url)}>
                        replace
                    </Button>
                    <br></br>
                    <Button type="text" htmlType="button" onClick={() => deleteGenFile(url)}>
                        delete
                    </Button>
                </>
            ),
        },
    ];
    const evalTableColumns = [
        {
            title: "Eval File",
            dataIndex: "evalFile",
            key: "evalFile",
        },
        {
            title: "Action",
            dataIndex: "fileAction",
            key: "fileAction",
            render: () => (
                <Button type="text" htmlType="button" onClick={() => showModalEval()}>
                    replace
                </Button>
            ),
        },
    ];

    return (
        <>
        <Spin spinning={isSubmitting} tip="Starting Job...">
            <Form
                name="jobSettings"
                onFinish={handleFinish}
                onFinishFailed={handleFinishFail}
                scrollToFirstError={true}
                requiredMark={false}
                form={form}
                labelCol={{ span: 6 }}
                wrapperCol={{ span: 16 }}
                labelAlign="left"
                layout="horizontal"
                initialValues={formInitialValues}
            >
                <Collapse defaultActiveKey={["1", "2", "3", "4"]}>
                    <Collapse.Panel header="Search Settings" key="1" extra={genExtra("settings_1")}>
                        <Tooltip placement="topLeft" title={helpText.description}>
                            <Form.Item label="Description" name="description">
                                <Input />
                            </Form.Item>
                        </Tooltip>

                        <Tooltip placement="topLeft" title={helpText.max_designs}>
                            <Form.Item label="Number of Designs" name="max_designs" rules={rules}>
                                <InputNumber min={1} />
                            </Form.Item>
                        </Tooltip>

                        <Tooltip placement="topLeft" title={helpText.population_size}>
                            <Form.Item label="Population Size" name="population_size" rules={rules}>
                                <InputNumber min={1} onChange={onPopChange} />
                            </Form.Item>
                        </Tooltip>

                        <Tooltip placement="topLeft" title={helpText.tournament_size}>
                            <Form.Item label="Tournament Size" name="tournament_size" rules={[...rules, { validator: checkTournament }]}>
                                <InputNumber />
                            </Form.Item>
                        </Tooltip>

                        <Tooltip placement="topLeft" title={helpText.survival_size}>
                            <Form.Item label="Survival Size" name="survival_size" rules={[...rules, { validator: checkSurvival }]}>
                                <InputNumber />
                            </Form.Item>
                        </Tooltip>

                        {/* <Tooltip placement="topLeft" title={helpText.expiration}>
                            <Form.Item label="Expiration" name="expiration_days" rules={rules}>
                                <InputNumber 
                                    formatter={value =>(value === '1')?`1 day`:`${value} days`}
                                    parser={value => value.replace(/[^0-9.]/g, '')}
                                    min={1}
                                />
                            </Form.Item>
                        </Tooltip> */}
                    </Collapse.Panel>
                    <Collapse.Panel header="Generative Settings" key="2" extra={genExtra("gen_file")}>
                        <Button htmlType="button" onClick={() => showModalGen(null)}>Add Gen File</Button>
                        <Table dataSource={genTableData} columns={genTableColumns} rowKey="genUrl"></Table>
                    </Collapse.Panel>
                    <Collapse.Panel header="Evaluative Settings" key="3" extra={genExtra("eval_file")}>
                        <Button htmlType="button" onClick={() => showModalEval(null)}>Add Eval File</Button>
                        <Table dataSource={evalTableData} columns={evalTableColumns} rowKey="evalUrl"></Table>
                    </Collapse.Panel>
                    <Collapse.Panel header="Initialization Settings" key="4" extra={genExtra("settings_2")}>
                        <Tooltip placement="topLeft" title={helpText.total_items}>
                            <Form.Item label="Total Starting Items" name="genFile_total_items">
                                <InputNumber disabled />
                            </Form.Item>
                        </Tooltip>
                        {genFiles.map((genUrl) => {
                            const genFile = genUrl.split("/").pop();
                            return (
                                <Form.Item label={genFile} name={"genFile_" + genFile} key={"genFile_" + genFile} rules={[...rules, {validator: checkGenFile}]}>
                                    <InputNumber min={0} onChange={onNumChange}/>
                                </Form.Item>
                            );
                        })}
                        <Tooltip placement="topLeft" title={helpText.random_generated}>
                            <Form.Item label="Random Generated" name="genFile_random_generated">
                                <InputNumber disabled />
                            </Form.Item>
                        </Tooltip>
                    </Collapse.Panel>
                </Collapse>
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
        <FileSelectionModal
            isModalVisibleState={{ isModalVisible, setIsModalVisible }}
            genFilesState={{ genFiles, setGenFiles }}
            setEvalFile={setEvalFile}
            replacedUrl={replacedUrl}
            replaceEvalCheck={replaceEvalCheck}
        />

        </>
    );
}

function JobForm() {
    const [currentState, setCurrentState] = useState(false);
    return (
        <div className="jobForm-container">
            <Space direction="vertical" size="large" style={{ width: "inherit" }}>
                <Space direction="horizontal" size="small" align="baseline">
                    <h1>Start New Search</h1>
                    <Help page="start_new_job_page" part="main"></Help>
                </Space>

                {/* <FileSelection nextStep={nextStep} formValuesState={{ formValues, setFormValues }} /> */}
                <SettingsForm currentStateManage={{currentState, setCurrentState}}/>
                {/* <FormToRender /> */}
            </Space>
        </div>
    );
}

export default JobForm;
