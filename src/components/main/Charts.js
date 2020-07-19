import React from 'react';

function ChartBanner({jobDescription, jobID}) {
  return(
    <div className="main-banner">
      <h2>{jobDescription}</h2>
      <span>ID: {jobID}</span>
    </div>
  );
};

function RenderedCharts() {
  return(
    <div>Charts</div>
  );
};

function Charts({jobDescription, jobID}) {
  return (
    <div>
      <ChartBanner />
      <RenderedCharts />
    </div>
  );
};

export default Charts;