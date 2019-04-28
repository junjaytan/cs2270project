import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as selectors from '../reducer';
import * as actions from '../actions';
import TSChart from '../components/TSChart';
import OverviewChart from '../components/OverviewChart';
import * as _ from 'lodash';

export class ChartPane extends Component{

  headerDescription() {
    if (this.props.selectedDataset) {
      return <h5> Longest 10 segments where { this.props.selectedDataset } is as you selected </h5>
    } else {
      return <h5> Follow the instructions on the left, to select a dataset to explore </h5>
    }
  }

  // transform query return to x, y coordinates
  transformedData(data, id) {
    var newData = []
    var startDate = new Date(data.start_date)
    var endDate = new Date(data.end_date)
    var totTime = endDate - startDate
    var n = data.number_points
    var spanLength = totTime / (n -1)

    var dt = startDate
    _.forEach(data.json_agg, (val) => {
      newData.push({"x": dt, "y": val})
      dt = new Date(dt.valueOf() + spanLength)
    })

    var dataObj = {"data": newData, "id": `tsdata-`+id, "start_date": startDate, "end_date": endDate, "number_points": n}

    return dataObj
  }

  chartMinis() {
    var count = 0
    var data = []
    _.forEach(this.props.data, (val) => {
      data.push(this.transformedData(val, count))
      count += 1
    })

    console.log(data)



    return (
      data.map((val) =>
        <tr className="chart-mini" key={val.id} >
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

  render(){
    return(
      <div className="chartpane">
        { this.headerDescription() }

        <table>
          <tbody>
            { this.chartMinis() }
          </tbody>
        </table>
      </div>
    );
  }

}

function mapStateToProps(state) {
  return {
    selectedDataset: selectors.getSelectedDataset(state),
    data: selectors.getData(state),
    queryType: selectors.getQueryType(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    // fetchData: () => dispatch({ type: 'FETCH_DATA', payload:'' })
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartPane);
