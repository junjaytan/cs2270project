import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as selectors from '../reducer';
import * as actions from '../actions';
import TSChart from '../components/TSChart';
import MainChart from './MainChart';
import Spinner from '../components/Spinner';
import * as _ from 'lodash';

export class ChartPane extends Component{

  headerDescription() {
    if (!this.props.selectedDataset) {
      return <h5> Follow the instructions on the left, to select a dataset to explore </h5>
    }
  }

  // transform query return to x, y coordinates
  transformedData(data, id) {
    var startDate = new Date(data.start_date)
    var endDate = new Date(data.end_date)
    var n = data.number_points

    // console.log(data)

    var newData = _.zipWith(data.ts_agg, data.json_agg, data.anom_agg, (ts, val, anom) => {
      var dt = new Date(ts + 'Z')
      return {"x": dt, "y": val, "a": anom}
    })

    // console.log(newData)

    var dataObj = {"data": newData, "id": `tsdata-`+id, "start_date": startDate, "end_date": endDate, "number_points": n}
    return dataObj
  }

  handleChartChange(start, end, data) {
    this.props.changeMainChart(start, end);
    this.props.changeMainChartData(data);
    this.props.changeChartPane("mainchart");
  }

  chartMinis() {
    var count = 0
    var data = []
    _.forEach(this.props.data, (val) => {
      data.push(this.transformedData(val, count))
      count += 1
    })

    return (
      data.map((val) =>
        <tr className="chart-mini" key={val.id} onClick={() => this.handleChartChange(val.start_date, val.end_date, val.data)} >
          <td>{val.start_date.toISOString()}</td>
          <td>{val.end_date.toISOString()}</td>
          <td>{val.number_points}</td>
          <td>
            <TSChart data={val.data} id={val.id}/>
          </td>
        </tr>
      )
    )
  }

  navTabs() {
    var t = "nav-link mb-0"
    var m = "nav-link mb-0"

    if (this.props.chartPane === "tsmini"){
      t = t + " btn-secondary active"
      m = m + " btn-outline-secondary"
    } else {
      m = m + " btn-secondary active"
      t = t + " btn-outline-secondary"
    }

    return (
      <ul className="nav nav-tabs mb-0">
        <li className={"nav-item mb-0 py-0"}>
          <button className={t} onClick={() => this.props.changeChartPane("tsmini")}>Results</button>
        </li>
        <li className="nav-item mb-0 py-0">
          <button className={m} onClick={() => this.props.changeChartPane("mainchart")}>Chart</button>
        </li>
      </ul>
    )
  }

  renderTSMinis() {
    return(
      <div className="tsminis">
        { this.props.loading &&
          <Spinner loading={this.props.loading} size={100} />
        }
        { this.props.data.length > 0 && !this.props.loading &&
          <table className="ts-table table table-sm table-hover mb-0 my-2 font-weight-light">
            <thead>
              <tr>
                <th scope="col">Start Datetime</th>
                <th scope="col">End Datetime</th>
                <th scope="col"># Datapoints</th>
                <th scope="col">Preview</th>
              </tr>
            </thead>
            <tbody>
              { this.chartMinis() }
            </tbody>
          </table>
        }
      </div>
    )
  }

  render(){
    return(
      <div className="chartpane">
        { this.props.data.length > 0 && this.navTabs() }

        { this.headerDescription() }

        { this.props.chartPane === "tsmini" &&
          this.renderTSMinis()
        }

        { this.props.chartPane === "mainchart" &&
          <div>
            { !this.props.mainChart.startTS ?
              <h5>Select a results row to explore the surrounding data</h5>
            :
              <MainChart/>
            }

          </div>
        }

      </div>
    );
  }

}

function mapStateToProps(state) {
  return {
    selectedDataset: selectors.getSelectedDataset(state),
    data: selectors.getData(state),
    queryType: selectors.getQueryType(state),
    loading: selectors.getLoadingCharts(state),
    chartPane: selectors.getChartPane(state),
    mainChart: selectors.getMainChart(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeChartPane: (val) => dispatch(actions.changeChartPane(val)),
    changeMainChart: (start, end) => dispatch(actions.changeMainChart({startTS: start, endTS: end})),
    changeMainChartData: (data) => dispatch(actions.changeMainChartData(data))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartPane);
