import React, { Component } from 'react';

export default class TSChart extends Component {

  render() {
    return (
      <div className="ts-chart">
        <p> I am the time series chart for { this.props.data.start_date } </p>
      </div>
    )
  }
}
