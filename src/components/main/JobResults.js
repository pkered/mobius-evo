import React, { useEffect, useState, useContext } from 'react';
import { API, graphqlOperation, formContainer } from 'aws-amplify';
import { generationsByJobId, getJob } from '../../graphql/queries';
import { createGenEvalParam } from '../../graphql/mutations';
import * as QueryString from 'query-string';
import { Link } from 'react-router-dom';
import { Row, Space, Button, Spin, Form, Col, Divider, Input, Checkbox, message, Table } from 'antd';
import { Line } from '@ant-design/charts';
import { AuthContext } from '../../Contexts';
import { useForm } from 'antd/lib/form/Form';

const S3_MODEL_URL = 'https://mobius-evo-userfiles131353-dev.s3.amazonaws.com/models/';

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
function paramsRegex(params) {
  const pattern = /(\w+)=(\w+.?\w+)/gm;
  const result = [...params.matchAll(pattern)]
  const ret = {}
  result.forEach( match => ret[match[1]] = match[2] )
  return ret;
}
async function getData(jobID, userID, setJobSettings, setJobResults, callback, filters = null, nextToken = null) {
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
        gt: Number(filters["score-min"]),
        lt: Number(filters["score-max"])
      }
    }
  }
  await API.graphql(graphqlOperation(
    generationsByJobId,
    {
      limit: 1000,
      owner: { eq: userID },
      JobID: jobID,
      filter: Object.keys(_filters).length > 0 ? _filters: null,
      items: {},
      nextToken
    }
  )).then( queryResult => {
      let queriedJobResults = queryResult.data.generationsByJobID.items;
      if (queryResult.data.generationsByJobID.nextToken) {
        getData(jobID, userID, setJobSettings, setJobResults, callback, filters, nextToken = queryResult.data.generationsByJobID.nextToken).catch(err=> {throw err})
      } else { callback() }
      setJobResults(jobResults => {
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
          })
        }
        queriedJobResults.sort((a,b) => a.GenID - b.GenID );
        return queriedJobResults;
      });
  }).catch(err => {console.log(err); throw err});
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
  const [form] = Form.useForm();
  const {cognitoPayload} = useContext(AuthContext)
  const { modelParams, setModelParams } = modelParamsState;
  const { jobSettings, setJobSettings } = jobSettingsState;
  const { jobResults, setJobResults } = jobResultsState;
  const [ initialValues, setInitialValues ] = useState({"show-group": ["live", "dead"]});
  const [ isLoading, setIsLoading ] = useState(true);
  const [ isFiltering, setIsFiltering ] = useState(false);
  const handleFinish = values => {
    setIsFiltering(true);
    setJobResults([]);
    getData(jobID, cognitoPayload.sub, setJobSettings, setJobResults, ()=>setIsFiltering(false), values).catch(err=>console.log(err));
  };
  useEffect(()=>{
    const singleResult = jobResults[0];
    if (singleResult && modelParams.length === 0) {
      setModelParams(Object.keys(paramsRegex(singleResult.params)));
    }
    const resultMinMax = {
      params: modelParams.reduce((result, current, index, array) => {
        result[ `${current}` ] = [ Infinity, -Infinity ]
        return result
      }, {}),
      score: [ Infinity, -Infinity ]
    }
    jobResults.forEach( result => {
      const _params = paramsRegex( result.params );
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
  // useEffect(() => {
  //   if (!isLoading && !isFiltering && jobResults.length===0) {
  //     if (jobSettings.jobStatus === "completed") {
  //       message.warning("filter returned 0 results");
  //     } else {
  //       message.info("search is still processing");
  //     }
  //   }
  // },[isLoading, isFiltering])
  useEffect(()=>form.resetFields(),[initialValues])

  return (
    !isLoading?
    <Form
      form={form}
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
                {
                  return(
                  <Row key={`${param}-group`}>
                    <Space>
                      <Form.Item
                        name={`${param}-min`}
                        label={param}
                      >
                        <Input prefix="min" />
                      </Form.Item>
                      <Form.Item
                        name={`${param}-max`}
                      >
                        <Input prefix="max" />
                      </Form.Item>
                    </Space>
                  </Row>
                  )
                }
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
                  <Input prefix="min" />
                </Form.Item>
                <Form.Item
                  name={`score-max`}
                  key={`score-max`}
                >
                  <Input prefix="max" />
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
  try {
    jobResults.forEach(result => {
      const parameters = paramsRegex(result.params);
      const paramList = Object.keys(parameters).map(paramName => { return { param: paramName, value: parameters[paramName], GenID: result.GenID } });
      data = data.concat(paramList);
    });
  } catch(err) {console.log(err)}
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

function ResultTable({ jobResults }) {
    console.log(jobResults)
    let addCol = true;
    const columns = [
        {
          title: 'ID',
          dataIndex: 'genID',
          key: 'genID',
          defaultSortOrder: 'ascend',
          sorter: (a, b) => a.genID - b.genID
        }
    ];
    const tableData = jobResults.map(entry => {
        const tableEntry = {
            genID: entry.GenID,
            live: entry.live? 'True':'False',
            score: entry.score,
            model: S3_MODEL_URL + entry.id + '.gi'
        };
        if (entry.params) {
            const paramsString = entry.params.replace(/\{|\}/g, '');
            const params = paramsString.split(',')
            params.forEach(param => {
                const splittedParam = param.split('=');
                if (addCol) {
                    columns.push({
                        title: splittedParam[0],
                        dataIndex: splittedParam[0],
                        key: splittedParam[0],
                        sorter: (a, b) => a[splittedParam[0]] - b[splittedParam[0]]
                    })
                }
                let val = parseFloat(splittedParam[1])
                if (isNaN(val)) {
                    val = splittedParam[1];
                }
                tableEntry[splittedParam[0]] = val;
            });
            if (addCol) {
                addCol = false;
            }
        }
        return tableEntry;
    });

    // if (tableData.length > 0 && tableData[0].params) {
    //     const params = JSON.parse(tableData[0].params);
    //     Object.keys(params).forEach(paramName => {
    //         columns.push({
    //             title: paramName,
    //             dataIndex: paramName,
    //             key: paramName,
    //             sorter: (a, b) => a[paramName] - b[paramName]
    //         })
    //     })

    // }
    columns.push({
        title: 'Live',
        dataIndex: 'live',
        key: 'live',
        sorter: (a, b) => b.live.length - a.live.length
    });
    columns.push({
        title: 'Score',
        dataIndex: 'score',
        key: 'score',
        sorter: (a, b) => a.score - b.score
    });
    columns.push({
        title: 'Model',
        dataIndex: 'model',
        key: 'model',
        render: text => <a href={text}>File</a>,
    });

    return <Table dataSource={tableData} columns={columns} />;

}

function JobResults() {
  const [ jobID, setJobID ] = useState(null);
  const [ modelParams, setModelParams ] = useState([]);
  const [ jobSettings, setJobSettings ] = useState(null);
  const [ jobResults, setJobResults ] = useState([]);
  const [ isLoading, setIsLoading ] = useState(true);
  const { cognitoPayload } = useContext(AuthContext)

  useEffect(()=>{
    const jobID = QueryString.parse(window.location.hash).id;
    setJobID(jobID);
    getData(jobID, cognitoPayload.sub, setJobSettings, setJobResults, ()=>setIsLoading(false)).catch(err => console.log(err));
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
            <ResultTable
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