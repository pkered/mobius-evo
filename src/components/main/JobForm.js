import React, { useState, useContext } from 'react';
import { MenuContext } from '../../Contexts'
import { Form, Input, InputNumber , Button, Steps, Table, Radio} from 'antd'
const { Step } = Steps;

const testData = [
  {
    id:"19b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    filename:"test_file_1.mob",
    s3url: "www.filepath.path",
    uploadedAt: "123456"
  },
  {
    id:"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    filename:"test_file_2.mob",
    s3url: "www.filepath.path",
    uploadedAt: "123456"
  },
  {
    id:"9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    filename:"test_file_3.mob",
    s3url: "www.filepath.path",
    uploadedAt: "123456"
  }
]

function FileSelection({ nextStep, formValuesState}) {
  const { formValues, setFormValues } =  formValuesState;
  const [ genFile, setGenFile ] = useState(null);
  const [ evalFile, setEvalFile ] = useState(null);
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      render: (text, record, index) => index + 1
    },
    {
      title: "File",
      dataIndex: "filename",
      key:"filename"
    },
    {
      title: "Uploaded",
      dataIndex: "uploadedAt",
      key:"uploadedAt"
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

  const dataSource = testData;

  const handleClick = () => {
    setFormValues({ ...formValues, genUrl: dataSource[genFile].s3url, evalUrl: dataSource[evalFile].s3url });
    nextStep();
  }

  return(
    <div>
      <Table 
        dataSource={dataSource}
        columns={columns}
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
        {steps.map(step => <Step title={step} />)}
      </Steps>
      <FormToRender />
    </div>
  )
}

export default JobForm;