import React, { Component } from 'react';

export default class DatasetsStatsTable extends Component {

    generateTableRows() {
      if (!this.props.stats || Object.keys(this.props.stats).length === 0) {
        return (<tbody></tbody>);
      }

      let num_rows = this.props.stats.rows;
      num_rows = num_rows.toLocaleString(); // makes it prettier it by using commas

      let oldestTs = new Date(this.props.stats.oldestTs);
      let oldestTsStr = oldestTs.toISOString();

      let newestTs = new Date(this.props.stats.newestTs);
      let newestTsStr = newestTs.toISOString();

      let numAnomPoints = this.props.stats.num_anomalous_points;
      numAnomPoints = numAnomPoints.toLocaleString();

      let threshold = parseFloat(this.props.stats.threshold);
      let thresholdStr = threshold.toLocaleString();
      let thresholdComparatorStr = this.props.stats.thresholdComparator;
      // Append comparator with threshold so it looks nice in UI (e.g., >2)
      thresholdStr = thresholdComparatorStr + ' ' + thresholdStr;

      let detectorValMin = parseFloat(this.props.stats.detectorMin).toFixed(2);
      let detectorValMax = parseFloat(this.props.stats.detectorMax).toFixed(2)
      let detectorRangeStr = `(${String(detectorValMin)}, ${String(detectorValMax)})`

      return (
        <tbody>
          <tr>
            <th scope="row">Rows</th>
            <td>{num_rows}</td>
          </tr>
          <tr>
            <th scope="row">Anomaly threshold</th>
            <td>{thresholdStr}</td>
          </tr>
          <tr>
            <th scope="row">Num Anomalous Points</th>
            <td>{numAnomPoints}</td>
          </tr>
          <tr>
            <th scope="row">Detector value range</th>
            <td>{detectorRangeStr}</td>
          </tr>
          <tr>
            <th scope="row">Oldest timestamp</th>
            <td>{oldestTsStr}</td>
          </tr>
          <tr>
            <th scope="row">Newest timestamp</th>
            <td>{newestTsStr}</td>
          </tr>
        </tbody>
      )
    }

    render() {
      return (
        <table className="table table-sm text-left mb-0 font-weight-light" style={{fontSize: ".9em"}}>
          { this.generateTableRows() }
        </table>
      )
    }
  }
