import React, { useState, useContext, useEffect } from 'react';
import { uploadS3, listS3, getS3 } from '../../amplify-apis/userFiles';
import { UploadOutlined } from '@ant-design/icons';
import { MenuContext } from '../../Contexts'
import { Form, Input, InputNumber , Button, Steps, Table, Radio, Upload, message } from 'antd'
const { Step } = Steps;

function FileSelection({ nextStep, formValuesState}) {
  const { formValues, setFormValues } =  formValuesState;
  const [ genFile, setGenFile ] = useState(null);
  const [ evalFile, setEvalFile ] = useState(null);
  const [ s3Files, setS3Files ] = useState([]);
  const [ uploadedFiles, setUploadedFiles ] = useState([]);
  const [ isTableLoading, setIsTableLoading ] = useState(true);
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
      render: (text, record, index)=>text.toLocaleString() // Date Object
    },
    {
      title: "Gen File",
      key: "genfile",
      render: (text, record, index) => 
        <Radio 
          value={index}
          checked={index===genFile}
          onChange={(event)=>setGenFile(event.target.value)}
        ></Radio>
    },
    {
      title: "Eval File",
      key: "evalfile",
      render: (text, record, index) =>
        <Radio 
          value={index}
          checked={index===evalFile}
          onChange={(event)=>{setEvalFile(event.target.value)}}
        ></Radio>
    }
  ];

  const listS3files = () => {
    const prepS3files = files => {
      const fileList = files.map(({key, lastModified}, index) => {
        return {
          key: index,
          filename: key.split('/').pop(),
          lastModified
        }
      });
      fileList.sort((a,b) => b.lastModified - a.lastModified); // Default descending order
      setS3Files([...fileList]);
      setIsTableLoading(false);
    };
    listS3(prepS3files, ()=>{});
  };
  useEffect(listS3files,[uploadedFiles]); // Updates when new files are uploaded
  function FileUpload() {
    function handleUpload({ file, onSuccess, onError, onProgress }) {
      uploadS3(`files/${file.name}`,file, onSuccess, onError, onProgress);
    }
    function handleChange(event) {
      if (event.file.status === "done") {
        message.success(`${event.file.name} file uploaded successfully`);
        setUploadedFiles([...uploadedFiles, event.file.name]);
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
    await getS3(`files/${s3Files[genFile].filename}`, s3Url => _formValues.genUrl = s3Url.split('?')[0], ()=>{});
    await getS3(`files/${s3Files[evalFile].filename}`, s3Url => _formValues.evalUrl = s3Url.split('?')[0], ()=>{});
    setFormValues({ ...formValues, ..._formValues });
    nextStep();
  };

  return(
    <div>
      <FileUpload />
      <Table 
        dataSource={s3Files}
        columns={columns}
        loading={isTableLoading}
        onChange={handleTableChange}
        showSorterTooltip={false}
      ></Table>
      <Button 
        onClick={handleClick}
        disabled={genFile===null || evalFile===null}
      >Continue</Button>
    </div>
  );
};

function SettingsForm( { nextStep, formValuesState }) {
  const [form] = Form.useForm();
  const { formValues, setFormValues } = formValuesState;
  function handleFinish() {
    setFormValues({...formValues, ...form.getFieldValue()});
    nextStep();
  };

  return (
    <Form 
      name="jobSettings"
      onFinish={handleFinish} 
      form={form}
      initialValues={{
        description: "",
        maxDesigns: 80,
        population_size: 20,
        tournament_size: 5,
        survival_size: 2,
        expiration: 86400
      }}
    >
      <Form.Item
        label="Job Description"
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
      <Form.Item>
        <Button 
          type="primary"
          htmlType="submit"
        >Start Job</Button>
      </Form.Item>
    </Form>
  )
}

function FinishedForm({ setCurrentStep, formValuesState }) {
  const { formValues, setFormValues } = formValuesState;
  const { setMenuState } = useContext(MenuContext);
  return (
    <div>
      { Object.keys(formValues).map(currKey => <div>{`${currKey}: ${formValues[currKey]}`}</div>) }
      <Button 
        type="primary"
        onClick={()=>{
          setMenuState('charts');
          setFormValues(null);
        }}
      >View Results</Button>
      <Button 
        onClick={()=>{
          setCurrentStep(0);
          setFormValues(null);
        }}
      >Start New Job</Button>
    </div>
  );
};

function JobForm() {
  // const [ formValues, dispatch ] = useReducer(reducer, {})
  const [ formValues, setFormValues ] = useState({});
  const [ currentStep, setCurrentStep ] = useState(0);
  const steps = ["1. Select Files", "2. Job Settings", "3. Finished"];
  const nextStep = () => setCurrentStep( Math.min( steps.length - 1, currentStep + 1 ));

  function FormToRender() {
    switch (currentStep) {
      case 1:
        return (
        <SettingsForm 
          nextStep={nextStep} 
          formValuesState={{formValues, setFormValues}}
        />);
      case 2:
        return (
        <FinishedForm 
          setCurrentStep={setCurrentStep}
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
      <h1>Start an Evolution Job</h1>
      <Steps progressDot current={ currentStep }>
        {steps.map((step, index) => <Step title={step} key={index}/>)}
      </Steps>
      <FormToRender />
    </div>
  )
}

export default JobForm;