import React, { Component } from 'react';

export default class AboutPage extends Component{

  render(){
    return(
      <div className="container text-left">
        <h2>MetroViz</h2>

        <p>MetroViz is a tool to visually explore anomalies in time series data.</p>

        <h4>About The Project</h4>

        <p>
          This iteration of MetroViz was developed by Junjay Tan and Mary McGrath with the goal of
          exploring near anomalous data.  Typically, anomaly detectors only return an indication of
          whether or not a data is anomalous, but not how anomalous it is.  This tool allows users
          to explore the near misses and extreme anomalies in their data by allowing them to directly
          query and filter the data for segments that match the anomaly thresholds they define.
        </p>

        <p>
          Driving the front end, is Postgres with TimescaleDB.  In addition there is a custom
          extension written as part of this project to make the range-based filtering of time series
          data performant.
          </p>

      </div>
    );
  }

}
