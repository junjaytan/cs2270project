import React, { Component } from 'react';
import { Table } from 'reactstrap';

export default class DatasetsStatsTable extends Component {
    constructor(props) {
        super(props);
      }

    generateTableRows() {
      if (!this.props.stats || Object.keys(this.props.stats).length == 0) {
        return (<tbody></tbody>);
      }

      let num_rows = this.props.stats.rows;
      num_rows = num_rows.toLocaleString(); // makes it prettier it by using commas

      let oldestTs = new Date(this.props.stats.oldestTs);
      let oldestTsStr = oldestTs.toISOString();

      let newestTs = new Date(this.props.stats.newestTs);
      let newestTsStr = newestTs.toISOString();

      let threshold = parseFloat(this.props.stats.threshold);
      let thresholdStr = threshold.toLocaleString();
      let thresholdComparatorStr = this.props.stats.thresholdComparator;
      // Append comparator with threshold so it looks nice in UI (e.g., >2)
      thresholdStr = thresholdComparatorStr + thresholdStr;

      let detectorValMin = parseFloat(this.props.stats.detectorMin).toFixed(2);
      let detectorValMax = parseFloat(this.props.stats.detectorMax).toFixed(2)
      let detectorRangeStr = `(${String(detectorValMin)}, ${String(detectorValMax)})`

      return (
        <tbody>
        <tr>
          <td>Rows</td>
          <td>{num_rows}</td>
        </tr>
        <tr>
          <td>Anomaly threshold</td>
          <td>{thresholdStr}</td>
        </tr>
        <tr>
          <td>Detector value range</td>
          <td>{detectorRangeStr}</td>
        </tr>
        <tr>
          <td>Oldest timestamp</td>
          <td>{oldestTsStr}</td>
        </tr>
        <tr>
          <td>Newest timestamp</td>
          <td>{newestTsStr}</td>
        </tr>
      </tbody>
      )
    }

    render() {
      return (
        <Table responsive bordered size="sm" style={{'textAlign': 'left'}}>
        {this.generateTableRows()}
      </Table>
      )
    }
  }
