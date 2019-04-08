import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as selectors from '../reducer';
import * as actions from '../actions';
import Button from '../components/Button';
import DropDown from '../components/DropDown';

class ChartOptions extends Component {

  constructor(props) {
    super(props);

    // if the datasets aren't loaded, go fetch it
    if (this.props.datasets.length === 0) this.props.fetchDatasets();
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
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text" id="min">min value</span>
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
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text" id="max">max value</span>
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
      return (
        <button
          type="button"
          className="btn px-2 py-0 mx-1 btn-secondary clear-btn"
          value={this.props.value}
          onClick={ () => this.props.searchData(this.props.selectedDataset, this.props.queryType, this.props.minVal, this.props.maxVal) }
          >
          Search
        </button>
      )
    }
  }

  render() {
    return (
      <div className="chart-options">
        <p>Select a dataset:</p>
        <DropDown onClick={this.props.changeSelectedDataset} items={this.props.datasets} curItem={this.props.selectedDataset} />

        { this.querySection() }

        <br/>

        { this.querySearch() }
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    data: selectors.getData(state),
    selectedDataset: selectors.getSelectedDataset(state),
    datasets: selectors.getDatasets(state),
    queryType: selectors.getQueryType(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    searchData: (dataset, query, min, max) => dispatch({ type: 'SEARCH_DATA', payload: {dataset: dataset, queryType: query, minVal: min, maxVal: max }}),
    changeSelectedDataset: (val) => dispatch(actions.changeSelectedDataset(val)),
    fetchDatasets: () => dispatch({ type: 'FETCH_DATASETS', payload:'' }),
    changeQueryType: (val) => dispatch(actions.changeQueryType(val)),
    changeMinVal: (val) => dispatch(actions.changeMinVal(val)),
    changeMaxVal: (val) => dispatch(actions.changeMaxVal(val))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChartOptions);
