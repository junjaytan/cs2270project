import React, { Component } from 'react';
import { connect } from 'react-redux';
import Immutable from 'seamless-immutable';
import * as selectors from '../reducer';
import * as actions from '../actions';

import vegaEmbed from 'vega-embed';
import * as vlConfig from '../assets/vl_config_main';
import errorSpec from '../components/ErrorSpec';

export class MainChart extends Component {

  componentDidMount() {
    var spec = this._spec();

    var data = Immutable.asMutable(this.props.mainChartData, {deep: true});

    console.log(data);
    var divId = `#main-chart`;

    vegaEmbed(divId, spec, { "mode": "vega-lite", "actions": false, "renderer": "svg", "config": vlConfig.config })
      .then(function (res) {
        try {
          res.view
            .insert("countData", data)
            .run()
        } catch(error) {
          console.log(error);
          vegaEmbed(divId, errorSpec(), {"actions": false, "renderer": "svg"})
        }
      })
  }

  _spec() {
    return(
      {
        // "$schema": "https://vega.github.io/schema/vega-lite/v2.0.json",
        "data": { "name": "countData" },
        "mark": "line",
        "encoding": {
          "x": {
            "field": "x",
            "type": "temporal",
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
    mainChartData: selectors.getMainChartData(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    // changeError: (val) => dispatch(actions.changeError(val)),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MainChart);
