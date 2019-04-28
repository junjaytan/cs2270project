import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import * as selectors from '../reducer';
import * as actions from '../actions';
import Button from '../components/Button';
import DropDown from '../components/DropDown';

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
        className={this.props.queryType === q.query ? "btn btn-secondary active" : "btn btn-secondary" }
        onClick={() => this.props.changeQueryType(q)}
        >{ q.symbol }</button>
    )
  }

  queryFields() {
    return (
      <div className="query-fields">
        { this.props.queryType.fields.includes("min") &&
          <div className="input-group input-group-sm my-2">
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
        }
        { this.props.queryType.fields.length === 2 && <p className="my-0 py-0">AND</p> }
        { this.props.queryType.fields.includes("max") &&
          <div className="input-group input-group-sm my-2">
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
        }
      </div>
    )
  }

  querySection() {
    var queries = [
      {query: "le", symbol: "≤", fields: ["max"]},
      {query: "range", symbol: "range", fields: ["min", "max"]},
      {query: "ge", symbol: "≥", fields: ["min"]}
    ]

    if (this.props.selectedDataset) {
      return (
        <div className="query-selection">
          <br/>
          <p>Selct parameters:</p>

          <div className="btn-group" role="group" aria-label="Query Type">
            { queries.map((val) => this.queryButton(val)) }
          </div>

          { this.props.queryType.fields && this.queryFields() }
        </div>
      )
    }
  }

  querySearch() {
    if (this.props.queryType.query) {
      let min = this.props.minVal
      if (this.props.queryType.query === "le") {
        min = 0
      }

      let max = this.props.maxVal
      if (this.props.queryType.query === "ge") {
        max = 300
      }
      return (
        <button
          type="button"
          className="btn px-2 py-0 mx-1 btn-secondary clear-btn"
          value={this.props.value}
          onClick={ () => this.props.searchData(this.props.selectedDataset, this.props.stats, min, max) }
          >
          Search
        </button>
      )
    }
  }

  // Called when user selects a new dataset
  changeDataset(dataset) {
    this.props.changeSelectedDataset(dataset);
    // Note that logic in the actions ensures that appropriate menus
    // and tables are cleared beforehand.
    this.props.fetchStats(dataset);
  }

  handleDbParamsChange(dbParams) {
    console.log(dbParams)
    this.props.changeDbParams(dbParams);
    console.log(this.props.dbParams)
    this.props.changeSelectedDataset("");
    this.props.fetchDatasets(dbParams);
  }

  render() {
    return (
      <div className="chart-options">
        <ConnectionSettingsForm connectParams={this.props.dbParams} onConnectButtonClick={this.handleDbParamsChange}/>
        <DatabaseConnStatusAlert backendConnSuccess={this.props.backendConnSuccess}
              dbQuerySuccess={this.props.dbQuerySuccess} dbErrMsg={this.props.dbErrorMsg}/>
        <hr />
        <Container>
          <Row>
            <Col>Select a dataset:</Col>
            <Col><DropDown onClick={this.changeDataset} items={this.props.datasets}
                    curItem={this.props.selectedDataset} />
            </Col>
          </Row>
        </Container>
        <hr />
        <b>Dataset Statistics</b>
        <DatasetStatsTable stats={this.props.stats}/>

        { this.props.stats && this.querySection() }

        <br/>

        { this.querySearch() }
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
    maxVal: selectors.getMaxVal(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    searchData: (dataset, stats, min, max) => dispatch({ type: 'SEARCH_DATA', payload: {dataset: dataset, stats: stats, min: min, max: max }}),
    changeSelectedDataset: (val) => dispatch(actions.changeSelectedDataset(val)),
    changeDbParams: (val) => dispatch(actions.changeDbParams(val)),
    fetchDatasets: (dbParams) => dispatch({ type: 'FETCH_DATASETS', payload: {dbParams: dbParams} }),
    fetchStats: (dataset) => dispatch({ type: 'FETCH_STATS', payload: {dataset: dataset} }),
    changeQueryType: (val) => dispatch(actions.changeQueryType(val)),
    changeMinVal: (val) => dispatch(actions.changeMinVal(val)),
    changeMaxVal: (val) => dispatch(actions.changeMaxVal(val))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartOptions);
