import React, { Component } from 'react';
import { Table } from 'reactstrap';

export default class DatasetsStatsTable extends Component {
    constructor(props) {
        super(props);
      }

    // TODO: anomaly threshold should have a comparator prepended
    // eg. >=35

    generateTableRows() {
      if (!this.props.stats || Object.keys(this.props.stats).length == 0) {
        return (<tbody></tbody>);
      }

      let num_rows = '';
      let oldestTs = '';
      let oldestTsStr = '';
      let newestTs = '';
      let newestTsStr = '';
      let threshold = 0;
      let thresholdStr = '';
      let thresholdComparatorStr = ''

      // TODO: Probably can just assume that once json is passed it will
      // the the required entries.
      if (this.props.stats.rows) {
        num_rows = this.props.stats.rows;
        num_rows = num_rows.toLocaleString(); // pretty it with commas to separate thousands
      }
      // TODO: dates should be formatted as UTC and with specific format
      if (this.props.stats.oldestTs) {
        oldestTs = new Date(this.props.stats.oldestTs);
        oldestTsStr = oldestTs.toISOString();
      }
      if (this.props.stats.newestTs) {
        newestTs = new Date(this.props.stats.newestTs);
        newestTsStr = newestTs.toISOString();
      }
      if (this.props.stats.threshold) {
        threshold = parseFloat(this.props.stats.threshold);
        thresholdStr = threshold.toLocaleString();
      }

      if (this.props.stats.thresholdComparator) {
        thresholdComparatorStr = this.props.stats.thresholdComparator;
      }
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
