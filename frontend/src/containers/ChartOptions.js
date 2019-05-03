import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as selectors from '../reducer';
import * as actions from '../actions';
import DropDown from '../components/DropDown';
import Spinner from '../components/Spinner';

import ConnectionSettingsForm from '../components/ConnectionSettingsForm'
import DatasetStatsTable from '../components/DatasetStatsTable'
import DatabaseConnStatusAlert from '../components/DatabaseConnStatusAlert'

class ChartOptions extends Component {

  constructor(props) {
    super(props);

    this.handleDbParamsChange = this.handleDbParamsChange.bind(this);
    this.changeDataset = this.changeDataset.bind(this);
  }

  queryButton(q) {
    return (
      <button key={ q.query } type="radio"
        className={this.props.queryType.query === q.query ? "btn btn-secondary py-0 active" : "btn btn-secondary py-0" }
        onClick={() => this.props.changeQueryType(q)}
        >{ q.symbol }</button>
    )
  }

  queryFields() {
    return (
      <div className="query-fields form-row">
        <div className="input-group input-group-sm my-1 col-6">
          <div className="input-group-prepend">
            <span className="input-group-text" id="min">≥</span>
          </div>
          <input
            type="text"
            className="form-control"
            aria-label="Min Value"
            aria-describedby="min"
            value={ this.props.minVal }
            onChange={ (event) => this.props.changeMinVal(event.target.value) }>
          </input>
        </div>
        <div className="input-group input-group-sm my-1 col-6">
          <div className="input-group-prepend">
            <span className="input-group-text" id="max">≤</span>
          </div>
          <input
            type="text"
            className="form-control"
            aria-label="Max Value"
            aria-describedby="max"
            value={ this.props.maxVal }
            onChange={ (event) => this.props.changeMaxVal(event.target.value) }>
          </input>
        </div>
      </div>
    )
  }

  timeRange() {
    return (
      <div className="time-range form-row">
        <div className="input-group input-group-sm my-1 col-6">
          <div className="input-group-prepend">
            <span className="input-group-text" id="min">≥</span>
          </div>
          <input
            type="datetime-local"
            className="form-control"
            aria-label="Start Datetime"
            aria-describedby="start"
            value={ this.props.startTS }
            onChange={ (event) => this.props.changeStartTS(event.target.value) }>
          </input>
        </div>
        <div className="input-group input-group-sm my-1 col-6">
          <div className="input-group-prepend">
            <span className="input-group-text" id="max">≤</span>
          </div>
          <input
            type="datetime-local"
            className="form-control"
            aria-label="End Datetime"
            aria-describedby="end"
            value={ this.props.endTS }
            onChange={ (event) => this.props.changeEndTS(event.target.value) }>
          </input>
        </div>
      </div>
    )
  }

  querySection() {
    return (
      <div className="query-selection">
        <div className="anomaly-thresholds">
          <p className="text-left mb-0 pb-0">Anomaly Thresholds</p>
          { this.queryFields() }
        </div>
        <div className="time-range">
          <p className="text-left mb-0 pb-0">Time Range</p>
          { this.timeRange() }
        </div>
      </div>
    )
  }

  querySearch() {
    let min = this.props.minVal
    let max = this.props.maxVal
    let start = this.props.startTS
    let end = this.props.endTS
    return (
      <button
        type="button"
        className="btn px-2 py-0 my-1 mx-1 btn-secondary clear-btn"
        value={this.props.value}
        onClick={ () => this.props.searchData(this.props.selectedDataset, min, max, start, end) }
        >
        Search
      </button>
    )
  }

  // Called when user selects a new dataset
  changeDataset(dataset) {
    this.props.changeSelectedDataset(dataset);
    // Note that logic in the actions ensures that appropriate menus
    // and tables are cleared beforehand.
    this.props.fetchStats(dataset);
  }

  handleDbParamsChange(dbParams) {
    this.props.changeDbParams(dbParams);
    this.props.changeSelectedDataset("");
    this.props.fetchDatasets(dbParams);
  }

  render() {
    return (
      <div className="chart-options">
        <div className="card mb-2">
          <div className="card-header py-1">
            DB Connection Settings
          </div>
          <ConnectionSettingsForm connectParams={this.props.dbParams} onConnectButtonClick={this.handleDbParamsChange}/>
          { (!this.props.backendConnSuccess || !this.props.dbQuerySuccess) &&
            <DatabaseConnStatusAlert backendConnSuccess={this.props.backendConnSuccess}
              dbQuerySuccess={this.props.dbQuerySuccess} dbErrMsg={this.props.dbErrorMsg}/>
          }
        </div>

        { this.props.datasets.length > 0 &&
          <div className="card mb-2">
            <div className="card-header py-1">
              Select Dataset: &nbsp;&nbsp;
              <DropDown onClick={this.changeDataset} items={this.props.datasets}
                      curItem={this.props.selectedDataset} />
            </div>
            <div className="card-body my-1 py-1 mx-1 px-0">
              { this.props.loading ?
                <Spinner loading={this.props.loading} />
                :
                <DatasetStatsTable stats={this.props.stats}/>
              }
            </div>
          </div>
        }

        { this.props.endTS &&
          <div className="card mb-2">
            <div className="card-header py-1">
              Query Parameters
            </div>
            <div className="card-body my-1 py-1 mx-1 px-0">
              { this.querySection() }
              { this.querySearch() }
            </div>
          </div>
        }
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    data: selectors.getData(state),
    dbParams: selectors.getDbParams(state),
    backendConnSuccess: selectors.getBackendConnSuccess(state),
    dbQuerySuccess: selectors.getDbQuerySuccess(state),
    dbErrorMsg: selectors.getDbErrorMsg(state),
    selectedDataset: selectors.getSelectedDataset(state),
    stats: selectors.getStats(state),
    datasets: selectors.getDatasets(state),
    queryType: selectors.getQueryType(state),
    minVal: selectors.getMinVal(state),
    maxVal: selectors.getMaxVal(state),
    startTS: selectors.getStartTS(state),
    endTS: selectors.getEndTS(state),
    loading: selectors.getLoadingStats(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    searchData: (dataset, min, max, start, end) => dispatch({ type: 'SEARCH_DATA', payload: {dataset: dataset, min: min, max: max, start: start, end: end }}),
    changeSelectedDataset: (val) => dispatch(actions.changeSelectedDataset(val)),
    changeDbParams: (val) => dispatch(actions.changeDbParams(val)),
    fetchDatasets: (dbParams) => dispatch({ type: 'FETCH_DATASETS', payload: {dbParams: dbParams} }),
    fetchStats: (dataset) => dispatch({ type: 'FETCH_STATS', payload: {dataset: dataset} }),
    changeQueryType: (val) => dispatch(actions.changeQueryType(val)),
    changeMinVal: (val) => dispatch(actions.changeMinVal(val)),
    changeMaxVal: (val) => dispatch(actions.changeMaxVal(val)),
    changeStartTS: (val) => dispatch(actions.changeStartTS(val)),
    changeEndTS: (val) => dispatch(actions.changeEndTS(val))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartOptions);
