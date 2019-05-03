import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as selectors from '../reducer';
import * as actions from '../actions';

export class MainChart extends Component {

  // <Spinner loading={true} className="spinner" size={100} />
  render(){

    return(
      <div className="main-chart">
        { !this.props.mainChart.startTS &&
          <h5>Use the panel to the left to search for a result to display.</h5>
        }

        { this.props.mainChart.startTS &&
          <p>I am the main chart, I start at { this.props.mainChart.startTS.toISOString() }</p>
        }
      </div>
    );
  }

}

function mapStateToProps(state) {
  return {
    mainChart: selectors.getMainChart(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    // changeError: (val) => dispatch(actions.changeError(val)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainChart);
