import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as selectors from '../reducer';
import * as actions from '../actions'
import Spinner from '../components/Spinner';
import ChartPane from './ChartPane';
import ChartOptions from './ChartOptions';
import ChartStats from '../components/ChartStats';

export class ContentPage extends Component {

  // <Spinner loading={true} className="spinner" size={100} />
  render(){

    return(
      <div className="content-page">
        <div className="left-pane">
          <div>
            <ChartOptions />
          </div>
        </div>

        <div className="right-pane">
          <div className="content-pane">
            <ChartPane />
          </div>
        </div>
      </div>
    );
  }

}

function mapStateToProps(state) {
  return {
    error: selectors.getError(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeError: (val) => dispatch(actions.changeError(val)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ContentPage);
