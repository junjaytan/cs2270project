import React, { Component } from 'react';
import vegaEmbed from 'vega-embed';
import * as vlConfig from '../assets/vl_config';
import errorSpec from './ErrorSpec';

export default class TSChart extends Component {

  componentDidMount() {

    var spec = this._spec();

    var data = this.props.data;
    var divId = `#` + this.props.id;

    vegaEmbed(divId, spec, { "mode": "vega-lite", "actions": false, "renderer": "svg", "config": vlConfig.config })
      .then(function (res) {
        try {
          res.view
            .insert("countData", data)
            .run()
        } catch(error) {
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
            "type": "quantitative",
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
              "type": "quantitative",
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
      <div id={this.props.id}></div>
    )
  }
}
