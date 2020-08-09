import React, { useEffect, useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { listGenEvalParams, getJob } from '../../graphql/queries';
import { createGenEvalParam } from '../../graphql/mutations';
import * as QueryString from 'query-string';
import { Link } from 'react-router-dom';
import { Row, Space, Button, Spin, Form, Col, Divider, Input, Checkbox, message } from 'antd';
import { Line } from '@ant-design/charts';

function createMockData( jobID ) {
  const bools = [false, true]
  for (let i=0; i < 80; i++) {
    const score = Math.random()*40;
    API.graphql(graphqlOperation(
      createGenEvalParam,
      {
        input: {
          id: `${jobID}-${i}`,
          JobID: jobID,
          GenID: i,
          live: bools[Math.round(Math.random())],
          evalResult: JSON.stringify({score: score}),
          params:JSON.stringify({param1: Math.random()*30, param2: Math.random()*40, param3: Math.random()*50}),
          score
        }
      }
    )).then(result => console.log(result)).catch(err => console.log(err))
  }
}
async function getData(jobID, setJobSettings, setJobResults, callback, filters = null, nextToken = null) {
  let _filters = {};
  if (filters) {
    if (filters["show-group"].length === 0) {
      setJobResults([]);
      callback();
      return Promise.resolve([]);
    } else if (filters["show-group"].length === 1) {
      if (filters["show-group"][0] === "live") { // live only
        _filters = {live: {eq: true}};
      } else { // dead only
        _filters = {live: {eq: false}}
      }
    }
    _filters = {
      ..._filters,
      score: {
        gt: filters["score-min"],
        lt: filters["score-max"]
      }
    }
  }
  await API.graphql(graphqlOperation(
    listGenEvalParams,
    {
      filter: {
        JobID: {
          eq: jobID
        },
        ..._filters
      },
      nextToken
    }
  )).then( queryResult => {
      let queriedJobResults = queryResult.data.listGenEvalParams.items;
      if (queryResult.data.listGenEvalParams.nextToken) {
        getData(jobID, setJobSettings, setJobResults, callback, filters, nextToken = queryResult.data.listGenEvalParams.nextToken).catch(err=> {throw err})
      } else { callback() }
      setJobResults(jobResults => {
        queriedJobResults = [...jobResults, ...queriedJobResults];
        if (filters) {
          const params = Object.keys(JSON.parse(queriedJobResults[0].params));
          queriedJobResults = queriedJobResults.filter((jobResult, index) => {
            const jobParams = JSON.parse(jobResult.params);
            for (let i in params) {
              if (jobParams[params[i]] > filters[`${params[i]}-max`] || jobParams[params[i]] < filters[`${params[i]}-min`]) {
                return false;
              }
            }
            return true;
          })
        }
        queriedJobResults.sort((a,b) => a.GenID - b.GenID );
        return queriedJobResults;
      });
  }).catch(err => {throw err});
  await API.graphql(graphqlOperation(
    getJob,
    {
      id: jobID
    }
  )).then( queryResult => {
    setJobSettings(queryResult.data.getJob);
  }).catch(err => {throw err});
}

function FilterForm({ jobID, modelParamsState, jobSettingsState, jobResultsState }) {
  const { modelParams, setModelParams } = modelParamsState;
  const { jobSettings, setJobSettings } = jobSettingsState;
  const { jobResults, setJobResults } = jobResultsState;
  const [ initialValues, setInitialValues ] = useState({"show-group": ["live", "dead"]});
  const [ isLoading, setIsLoading ] = useState(true);
  const [ isFiltering, setIsFiltering ] = useState(false);
  const handleFinish = values => {
    setIsFiltering(true);
    setJobResults([]);
    getData(jobID, setJobSettings, setJobResults, ()=>setIsFiltering(false), values).catch(err=>console.log(err));
  };
  useEffect(()=>{
    const singleResult = jobResults[0];
    if (singleResult && modelParams.length === 0) {
      setModelParams(Object.keys(JSON.parse(singleResult.params)));
    }
    const resultMinMax = {
      params: modelParams.reduce((result, current, index, array) => {
        result[ `${current}` ] = [ Infinity, -Infinity ]
        return result
      }, {}),
      score: [ Infinity, -Infinity ]
    }
    jobResults.forEach( result => {
      const _params = JSON.parse( result.params );
      modelParams.forEach( param => {
        if ( _params[param] >= resultMinMax.params[`${param}`][1] ) { resultMinMax.params[`${param}`][1] = Math.ceil(_params[param]) }
        if ( _params[param] <= resultMinMax.params[`${param}`][0] ) { resultMinMax.params[`${param}`][0] = Math.floor(_params[param]) }
      });
      if (result.score >= resultMinMax.score[1]) { resultMinMax.score[1] = Math.ceil(result.score) }
      if (result.score <= resultMinMax.score[0]) { resultMinMax.score[0] = Math.floor(result.score) }
    })
    let _initialValues = Object.keys(resultMinMax.params).reduce((result, current, currentIndex, array) => {
      const ret = {...result};
      ret[`${current}-min`] =  resultMinMax.params[current][0];
      ret[`${current}-max`] =  resultMinMax.params[current][1];
      return ret;
    }, {});
    _initialValues["score-min"] = resultMinMax.score[0];
    _initialValues["score-max"] = resultMinMax.score[1];
    setInitialValues(initialValues => {return {...initialValues, ..._initialValues}});

    return ()=>{setIsLoading(false);}
  }, [jobResults, modelParams, setModelParams, isFiltering]);
  useEffect(() => {
    if (!isLoading && !isFiltering && jobResults.length===0) {
      if (jobSettings.jobStatus === "completed") {
        message.warning("filter returned 0 results");
      } else {
        message.info("search is still processing");
      }
    }
  },[isLoading, isFiltering])

  return (
    !isLoading?
    <Form
      onFinish={handleFinish}
      initialValues={initialValues}
    >
      <Space 
        direction="vertical"
        size="large"
        style={{width: "100%"}}
      >
        <Row>
          <Space 
            size="large"
            style={{
              width: "100%",
              justifyContent:"flex-start",
              height:"100%",
              alignItems:"normal"
            }}
          >
            <Col>
              <h3>parameters</h3>
              {modelParams.map(param=>
                <Row key={`${param}-group`}>
                  <Space>
                    <Form.Item
                      name={`${param}-min`}
                      label={param}
                    >
                      <Input prefix="min"></Input>
                    </Form.Item>
                    <Form.Item
                      name={`${param}-max`}
                    >
                      <Input prefix="max"></Input>
                    </Form.Item>
                  </Space>
                </Row>
              )}
            </Col>
            <Divider type="vertical" />
            <Col>
              <h3>score</h3>
              <Space>
                <Form.Item
                  name={`score-min`}
                  key={`score-min`}
                >
                  <Input prefix="min"></Input>
                </Form.Item>
                <Form.Item
                  name={`score-max`}
                  key={`score-max`}
                >
                  <Input prefix="max"></Input>
                </Form.Item>
              </Space>
              <Form.Item 
                name="show-group"
                label="Show"
              >
                <Checkbox.Group>
                  <Checkbox value="live">live</Checkbox>
                  <Checkbox value="dead">dead</Checkbox>
                </Checkbox.Group>
              </Form.Item>
            </Col>
          </Space>
        </Row>
        <Row style={{justifyContent: "center"}}>
          <Button
            type="primary"
            htmlType="submit"
            disabled={isFiltering}
          >Filter</Button>
        </Row>
      </Space>
    </Form>
    : null
  )
}

function ParallelPlot({ jobResults }) {
  // map params to {param:}
  let data = [];
  jobResults.forEach(result => {
    const parameters = JSON.parse(result.params);
    const paramList = Object.keys(parameters).map(paramName => { return { param: paramName, value: parameters[paramName], GenID: result.GenID } });
    data = data.concat(paramList);
  });
  const config = {
    title: {
      visible: true,
      text: "Parallel Plot of parameters",
    },
    description: {
      visible: true,
      text: "Parameter values in each Generation"
    },
    legend: {
      visible: false
    },
    data,
    xField: "param",
    yField: "value",
    seriesField: "GenID",
    responsive: true,
    events: {
      click: event=>console.log(event)
    }
  }
  return <Line {...config}/>
}
function ScorePlot({ jobResults }) {
  const config = {
    title: {
      visible: true,
      text: "Score Plot",
    },
    description: {
      visible: true,
      text: "Evaluated score over generations"
    },
    data: jobResults,
    xField: "GenID",
    yField: "score",
    responsive: true,
    events: {
      click: e=>console.log(e)
    }
  }
  return <Line {...config}/>
}

function JobResults() {
  const [ jobID, setJobID ] = useState(null);
  const [ modelParams, setModelParams ] = useState([]);
  const [ jobSettings, setJobSettings ] = useState(null);
  const [ jobResults, setJobResults ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(true);

  useEffect(()=>{
    const jobID = QueryString.parse(window.location.hash).id;
    setJobID(jobID);
    getData(jobID, setJobSettings, setJobResults, ()=>setIsLoading(false)).catch(err => console.log(err));
  }, []);

  return (
    <Space
      direction="vertical"
      size = "large"
      style = {{width:"inherit"}}
    >
      <Row>
        <h3>
          <Link to="/explorations">Explorations</Link> / {jobID}
        </h3>
      </Row>
      <Spin spinning={isLoading}>
        {!isLoading ? 
          <Space
            direction="vertical"
            size="large"
            style={{width:"100%"}}
          >
            <Button onClick={()=>createMockData(jobID)}>Mock Data</Button>
            <FilterForm 
              jobID={jobID}
              modelParamsState={{modelParams, setModelParams}}
              jobSettingsState={{jobSettings, setJobSettings}}
              jobResultsState={{jobResults, setJobResults}}
            />
            <ParallelPlot 
              jobSettings={jobSettings}
              jobResults={jobResults}
            />
            <ScorePlot
              jobSettings={jobSettings}
              jobResults={jobResults}
            />
          </Space>
          :null
        }
      </Spin>
    </Space>
  );
};

export default JobResults;