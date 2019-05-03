import React, { Component } from 'react';
import { connect } from 'react-redux';
import Immutable from 'seamless-immutable';
import * as selectors from '../reducer';

import vegaEmbed from 'vega-embed';
import * as vega from 'vega';
import * as vlConfig from '../assets/vl_config_main';

export class MainChart extends Component {

  constructor(props) {
    super(props);
    this.view = null;
    this.data = [];
    this.updating = false;
    this.anomalyStart = this.props.mainChart.startTS
    this.anomalyEnd = this.props.mainChart.endTS
    this.updateView = this.updateView.bind(this);
    this.updateData = this.updateData.bind(this);
    this.updateUpdating = this.updateUpdating.bind(this);
  }

  updateView(v) {
    this.view = v
  }

  updateData(d) {
    this.data = d
  }

  updateUpdating(val) {
    this.updating = val
  }

  evaluateFetchdata(start, end) {
    if (!this.updating) {

      var length = end - start

      var dataStart = new Date(this.props.mainChart.startTS)
      var dataEnd = new Date(this.props.mainChart.endTS)

      var offset = dataStart.getTimezoneOffset()*60*1000
      start = start - offset
      end = end - offset

      if ((dataEnd - dataStart) - length < 1000) {
        console.log("increasing buffer")
        var startTS = new Date(start - 2*length).toISOString()
        var endTS = new Date(end + 2*length).toISOString()
        this.props.changeData(this.props.selectedDataset, startTS, endTS)
        this.updateUpdating(true);
      } else if (start - dataStart < length) {
        console.log("start triggered shit")
        var startTS = new Date(start - 2*length).toISOString()
        var endTS = new Date(end - 2*length).toISOString()
        this.props.changeData(this.props.selectedDataset, startTS, endTS)
        this.updateUpdating(true);
      } else if (dataEnd - end < length) {
        console.log("end triggered shift")
        var startTS = new Date(start + 2*length).toISOString()
        var endTS = new Date(end + 2*length).toISOString()
        this.props.changeData(this.props.selectedDataset, startTS, endTS)
        this.updateUpdating(true);
      }
    }
  }

  componentDidMount() {
    this.data = Immutable.asMutable(this.props.mainChartData, {deep: true});

    var spec = this._spec(this.anomalyStart, this.anomalyEnd);
    var divId = `#main-chart`;

    vegaEmbed(divId, spec, { "mode": "vega-lite", "actions": false, "renderer": "svg", "config": vlConfig.config })
      .then( (res) => {
        res.view
          .insert("countData", this.data)
          .runAsync()
            .then( (val) => {
              this.updateView(val)
              console.log(val)
              val.addSignalListener('grid_utcyearmonthdatehoursminutesseconds_x', (name, value) => {
                this.evaluateFetchdata(...value)
              })
            })
      })
  }

  componentDidUpdate() {
    var newData = Immutable.asMutable(this.props.mainChartData, {deep: true});

    this.view
      .change("countData",
        vega.changeset()
          .insert(newData)
          .remove(this.data))
      .runAsync()
        .then( () => {
          this.updateData(newData)
          this.updateUpdating(false)
        })
  }

  conponentWillUnmount() {
    this.view.finalize()
  }

  _spec(start, end) {
    return(
      {
        // "$schema": "https://vega.github.io/schema/vega-lite/v2.0.json",
        "autosize": "pad",
        "data": { "name": "countData" },
        "layer": [
          {
            "mark": "rect",
            "data": {
              "values": [
                {
                  "start": start,
                  "end": end
                }
              ]
            },
            "encoding": {
              "x": {
                "field": "start",
                "type": "temporal",
                "timeUnit": "utcyearmonthdatehoursminutesseconds",
                "axis": null
              },
              "x2": {
                "field": "end",
                "timeUnit": "utcyearmonthdatehoursminutesseconds"
              },
              "color": {"value": "#000080"},
              "opacity": {"value": 0.2},
              "tooltip" : [
                {
                  "field": "start",
                  "type": "temporal",
                  "timeUnit": "utcyearmonthdatehoursminutesseconds",
                  "title": "Anomaly Start"
                },
                {
                  "field": "end",
                  "type": "temporal",
                  "timeUnit": "utcyearmonthdatehoursminutesseconds",
                  "title": "Anomaly End"
                }
              ]
            }
          },
          {
            "mark": "line",
            "selection": {
              "grid": {
                "type": "interval", "bind": "scales"
              }
            },
            "encoding": {
              "x": {
                "field": "x",
                "timeUnit": "utcyearmonthdatehoursminutesseconds",
                "type": "temporal",
                "axis": {
                  "formatType": "time",
                  "format": "%Y-%m-%d %H:%M",
                  "tickCount": 2,
                  "tickSize": 1
                }
               },
              "y": {
                "field": "y",
                "type": "quantitative"
              },
              "color": {
                "value": "#3B5B8C"
              },
              "tooltip" : [
                {
                  "field": "x",
                  "type": "temporal",
                  "title": "Timestamp"
                },
                {
                  "field": "y",
                  "type": "quantitative",
                  "title": "Value"
                }
              ]
            }
          }
        ],
        "resolve": {
          "scale": {"x": "shared"}
        }
      }
    )
  }

  render() {
    return(
      <div id="main-chart"></div>
    )
  }

}

function mapStateToProps(state) {
  return {
    mainChart: selectors.getMainChart(state),
    mainChartData: selectors.getMainChartData(state),
    selectedDataset: selectors.getSelectedDataset(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    changeData: (dataset, start, end) => dispatch({ type: 'FETCH_RAW_DATA', payload: {dataset: dataset, start: start, end: end} })
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainChart);
