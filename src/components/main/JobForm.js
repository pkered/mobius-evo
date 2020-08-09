import React, { useState, useContext, useEffect } from 'react';
import * as QueryString from 'query-string';
import { v4 as uuidv4 } from 'uuid';
import { API, graphqlOperation } from 'aws-amplify';
import { getJob } from '../../graphql/queries';
import { createJob, updateJob } from '../../graphql/mutations';
import { uploadS3, listS3, getS3 } from '../../amplify-apis/userFiles';
import { UploadOutlined } from '@ant-design/icons';
import { AuthContext } from '../../Contexts';
import { Link } from 'react-router-dom';
import { Form, Input, InputNumber , Button, Steps, Table, Radio, Upload, message, Tag, Space, Spin, Row, Descriptions } from 'antd'
const { Step } = Steps;

function FileSelection({ nextStep, formValuesState}) {
  const { formValues, setFormValues } =  formValuesState;
  const [ genFile, setGenFile ] = useState(null);
  const [ evalFile, setEvalFile ] = useState(null);
  const [ s3Files, setS3Files ] = useState([]);
  const [ uploadedFiles, setUploadedFiles ] = useState([]);
  const [ isTableLoading, setIsTableLoading ] = useState(true);
  const onRadioCell = () => ({ style: { textAlign: "center" } });
  const columns = [
    {
      title: "File",
      dataIndex: "filename",
      key:"filename",
      sorter: true,
      sortDirections: [ "ascend", "descend" ]
    },
    {
      title: "Uploaded",
      dataIndex: "lastModified",
      key:"lastModified",
      sorter: true,
      sortDirections: [ "ascend", "descend" ],
      defaultSortOrder: "descend",
      render: (text, record, index) => (
        <Space>
          { text.toLocaleString() }
          { record.tag ? <Tag color='green' key={record.tag}>{record.tag.toUpperCase()}</Tag> : null }
        </Space>
      )
    },
    {
      title: "Gen File",
      key: "genfile",
      onCell: onRadioCell,
      width: "8em",
      render: (text, record, index) => 
        <Radio 
          value={record.filename}
          checked={record.filename===genFile}
          onChange={(event)=>setGenFile(event.target.value)}
        ></Radio>
    },
    {
      title: "Eval File",
      key: "evalfile",
      onCell: onRadioCell,
      width: "8em",
      render: (text, record, index) =>
        <Radio 
          value={record.filename}
          checked={record.filename===evalFile}
          onChange={(event)=>{setEvalFile(event.target.value)}}
        ></Radio>
    }
  ];
  const listS3files = () => {
    const uploadedSet = new Set(uploadedFiles);
    let isSubscribed = true; // prevents memory leak on unmount
    const prepS3files = files => {
      if (isSubscribed) {
        const fileList = files.map(({key, lastModified}, index) => {
          return {
            key: index,
            filename: key.split('/').pop(),
            lastModified,
            tag: uploadedSet.has(key.split('/').pop()) ? 'new' : null
          }
        });
        fileList.sort((a,b) => b.lastModified - a.lastModified); // Default descending order
        setS3Files([...fileList]);
        setIsTableLoading(false);
      }
    }; // changes state if still subscribed
    listS3(prepS3files, ()=>{});
    return () => isSubscribed = false;
  };
  useEffect(listS3files,[uploadedFiles]); // Updates when new files are uploaded
  function FileUpload() {
    function handleUpload({ file, onSuccess, onError, onProgress }) {
      uploadS3(`files/${file.name}`,file, onSuccess, onError, onProgress);
    }
    function handleChange(event) {
      if (event.file.status === "done") {
        message.success(`${event.file.name} file uploaded successfully`);
        setUploadedFiles([...uploadedFiles, ...event.fileList.map(file => file.name)]);
      } else if (event.file.status === "error") {
        message.error(`${event.file.name} file upload failed.`);
      }
    }
    return (
      <div className="upload-topbar">
        <Upload 
          accept=".js"
          multiple={true}
          customRequest={handleUpload}
          onChange={handleChange}
          showUploadList={false}
        >
          <Button>
            <UploadOutlined /> Upload
          </Button>
        </Upload>
        {/* <span>{uploadedFiles.length>0 ? `Uploaded: ${uploadedFiles.join(", ")}` : null}</span> */}
      </div>
    )
  };

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
    const _s3Files = [...s3Files];
    if (order === "ascend") {
      _s3Files.sort((a,b) => compareAscend(a[field], b[field]));
    } else {
      _s3Files.sort((a,b) => compareDescend(a[field], b[field]));
    };
    setS3Files(_s3Files);
  };
  const handleClick = async() => {
    const _formValues = { genUrl: null, evalUrl: null };
    await getS3(`files/${genFile}`, s3Url => _formValues.genUrl = s3Url.split('?')[0], ()=>{});
    await getS3(`files/${evalFile}`, s3Url => _formValues.evalUrl = s3Url.split('?')[0], ()=>{});
    setFormValues({ ...formValues, ..._formValues });
    nextStep();
  };

  return(
    <Space
      direction="vertical"
      size="middle"
      style={{width:"100%"}}    
    >
      <FileUpload />
      <Table 
        dataSource={s3Files}
        columns={columns}
        loading={isTableLoading}
        onChange={handleTableChange}
        showSorterTooltip={false}
        pagination={{
          total:s3Files.length,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: total => `${total} files`
        }}
      ></Table>
      <Row justify="end">
        <Button 
          onClick={handleClick}
          disabled={genFile===null || evalFile===null}
        >Continue</Button>
      </Row>
    </Space>
  );
};

function SettingsForm( { nextStep, formValuesState, parentID, parentData, jobType }) {
  const { cognitoPayload } = useContext(AuthContext);
  const [form] = Form.useForm();
  const { formValues, setFormValues } = formValuesState;
  const [ isSubmitting, setIsSubmitting ] =  useState(false);
  function handleFinish() {
    setIsSubmitting(true);
    const jobID = uuidv4();
    const jobSettings = {...formValues, ...form.getFieldsValue() };
    API.graphql(
      graphqlOperation(
        createJob,
        {
          input: {
            id: jobID,
            userID: cognitoPayload.sub,
            jobStatus: "inprogress",
            run: true,
            ...jobSettings,
            parentID: parentID || ""
          }
        }
      )
    ).then(
      () => {
        setIsSubmitting(false);
        setFormValues({...jobSettings, jobID});
        nextStep();
      }
    );
    if (parentID) { // add jobID to parent
      async function queriedResults(parentData) {
        let childrenID = parentData.childrenID;
        childrenID ? childrenID.push(jobID) : childrenID = [jobID]
        await API.graphql(
          graphqlOperation(
            updateJob,
            {
              input: {
                id: parentID,
                childrenID: childrenID
              }
            }
          )
        )
      };
      queriedResults(parentData);
    }
  };

  return (
    <Spin 
      spinning = {isSubmitting}
      tip="Starting Job..."
    >
      <Form 
        name="jobSettings"
        onFinish={handleFinish} 
        form={form}
        labelCol={{ span: 5 }}
        wrapperCol={{ span: 18 }}
        layout="horizontal"
        initialValues={{
          description: `New ${jobType}`,
          maxDesigns: 80,
          population_size: 20,
          tournament_size: 5,
          survival_size: 2,
          expiration: 86400,
          parentID: parentID
        }}
      >
        <Form.Item
          label="Parent ID"
          name="parentID"
        >
          <Input disabled/>
        </Form.Item>
        <Form.Item
          label="Description"
          name="description"
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Number of Designs"
          name="maxDesigns"
          rules={[{required: true}]}
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          label="Population Size"
          name="population_size"
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          label="Tournament Size"
          name="tournament_size"
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          label="Survival Size"
          name="survival_size"
        >
          <InputNumber />
        </Form.Item>
        <Form.Item
          label="Expiration"
          name="expiration"
        >
          <InputNumber />
        </Form.Item>
        <Row justify="center">
          <Button 
            type="primary"
            htmlType="submit"
          >
            Start {jobType}
          </Button>
        </Row>
      </Form>
    </Spin>
  )
}

function FinishedForm({ formValuesState }) {
  const { formValues, setFormValues } = formValuesState;

  return (
    <Space
      direction="vertical"
      size="large"
      style={{ width: "100%" }}
    >
      <Descriptions
        title="Your Job has been submitted"
        bordered={true}
        column={2}
      >
        <Descriptions.Item label="Gen File">{formValues.genUrl.split("/").pop()}</Descriptions.Item>
        <Descriptions.Item label="Eval File">{formValues.evalUrl.split("/").pop()}</Descriptions.Item>
        <Descriptions.Item label="Description">{formValues.description}</Descriptions.Item>
        <Descriptions.Item label="Number of Designs">{formValues.maxDesigns}</Descriptions.Item>
        <Descriptions.Item label="Population Size">{formValues.population_size}</Descriptions.Item>
        <Descriptions.Item label="Tournament Size">{formValues.tournament_size}</Descriptions.Item>
        <Descriptions.Item label="Survival Size">{formValues.survival_size}</Descriptions.Item>
        <Descriptions.Item label="Expiration">{formValues.expiration}</Descriptions.Item>
      </Descriptions>
      <Row 
        justify="center"
      >
        <Space>
          <Button 
            type="primary"
            onClick={()=>{
              setFormValues(null);
            }}
          >
            <Link to={`/explorations/search-results#${QueryString.stringify({id:formValues.jobID})}`}>View Results</Link>
          </Button>
        </Space>
      </Row>
    </Space>
  );
};

function JobForm() {
  const [ formValues, setFormValues ] = useState({});
  const [ currentStep, setCurrentStep ] = useState(0);
  const [ parentID, setParentID ] = useState("");
  const [ parentData, setParentData ] = useState(null);
  const [ jobType, setJobType ] = useState("");
  const steps = ["1. Select Files", `2. ${jobType} Settings`, "3. Summary"];
  const nextStep = () => setCurrentStep( Math.min( steps.length - 1, currentStep + 1 ));

  useEffect( ()=> {
    const hashParentID = QueryString.parse(window.location.hash).parentID;
    setParentID(hashParentID);
    setJobType(hashParentID ? "Search" : "Exploration");
    if (hashParentID) { 
      API.graphql(
        graphqlOperation(
          getJob,
          {
            id: hashParentID}
        )
      ).then(
        queriedResults => {
          const parentJob = queriedResults.data.getJob
          if (parentJob) { //check valid, completed job in db
            if (!parentJob.run) { 
              if (parentJob.jobStatus === "completed") {
                setParentData(queriedResults.data.getJob)
              } else {
                alert(`Parent Job has ${parentJob.jobStatus}. Restart Job`);
                window.location = `/explorations/${parentJob.id}`
              }
            } else{
              alert("Parent Job is still processing.")
              window.location = `/explorations/${parentJob.id}`
            }
          } else {
            alert("Invalid Parent ID. Redirecting to new exploration.");
            window.location = "/new-exploration"
          };
        }
      ).catch(err => console.log(err))
    }
  }, []);

  function FormToRender() {
    switch (currentStep) {
      case 1:
        return (
        <SettingsForm 
          nextStep={nextStep} 
          formValuesState={{formValues, setFormValues}}
          parentID={parentID}
          parentData={parentData}
          jobType={jobType}
        />);
      case 2:
        return (
        <FinishedForm 
          formValuesState={{formValues, setFormValues}}
        />);
      default:
        return (
        <FileSelection 
          nextStep={nextStep} 
          formValuesState={{formValues, setFormValues}}
        />);
    }
  }

  return (
    <div className="jobForm-container">
      <Space
        direction="vertical"
        size = "large"
        style = {{width:"inherit"}}
      >
        <h1>Start New { jobType }</h1>
        <Steps progressDot current={ currentStep }>
          {steps.map((step, index) => <Step title={step} key={index}/>)}
        </Steps>
        <FormToRender />
      </Space>
    </div>
  )
}

export default JobForm;