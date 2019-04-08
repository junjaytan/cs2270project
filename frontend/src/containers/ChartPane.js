import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as selectors from '../reducer';
import * as actions from '../actions';
import TSChart from '../components/TSChart';
import OverviewChart from '../components/OverviewChart';

export class ChartPane extends Component{

  headerDescription() {
    if (this.props.selectedDataset) {
      return <h5> x length segments where { this.props.selectedDataset } is as you selected </h5>
    } else {
      return <h5> Follow the instructions on the left, to selct a dataset to explore </h5>
    }
  }

  chartMinis() {
    return (
      this.props.data.map((val) =>
        <div className="chart-mini">
          <TSChart data={val} />
        </div>
      )
    )
  }

  render(){
    return(
      <div className="chartpane">
        { this.headerDescription() }

        { this.chartMinis() }
      </div>
    );
  }

}

function mapStateToProps(state) {
  return {
    selectedDataset: selectors.getSelectedDataset(state),
    data: selectors.getData(state),
    queryType: selectors.getQueryType(state),
    minVal: selectors.getMinVal(state),
    maxVal: selectors.getMaxVal(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    // fetchData: () => dispatch({ type: 'FETCH_DATA', payload:'' })
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartPane);
