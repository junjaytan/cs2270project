import React, { Component } from 'react';
import { Table } from 'reactstrap';

export default class DatasetsStatsTable extends Component {
    constructor(props) {
        super(props);

        this.state = {
          numRows: '',
          currentThreshold: '',
          thresholdComparator: '',
          firstDate: '',
          lastDate: '',
        };
      }

    // TODO: anomaly threshold should have a comparator prepended
    // eg. >=35

    render() {
      return (
        <Table responsive bordered size="sm" style={{'textAlign': 'left'}}>
        <thead>
            <tr>
                <th>Metric</th>
                <th>Value</th>
            </tr>
        </thead>
        <tbody>
          <tr>
            <td>Rows</td>
            <td>{this.props.numRows}</td>
          </tr>
          <tr>
            <td>Anomaly threshold</td>
            <td>{this.props.currentThreshold}</td>
          </tr>
          <tr>
            <td>Oldest timestamp</td>
            <td>{this.props.firstDate}</td>
          </tr>
          <tr>
            <td>Newest timestamp</td>
            <td>{this.props.lastDate}</td>
          </tr>
        </tbody>
      </Table>
      )
    }
  }
