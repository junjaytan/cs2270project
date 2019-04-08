import React, { Component } from 'react';

export default class Button extends Component {
  render() {
    return (
      <button
        type="button"
        className="btn px-2 py-0 mx-1 btn-secondary clear-btn"
        value={this.props.value}
        onClick={ () => this.props.onClick(this.props.value) }
        >
        { this.props.title }
      </button>
    )
  }
}
