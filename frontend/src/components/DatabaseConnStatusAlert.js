import React, { Component } from 'react';
import { Alert } from 'reactstrap';

/**
 * A bit of a misnomer, as this alert pops up to notify the user
 * if the backend OR database connection succeeds / fails
 */
export default class DatabaseConnStatusAlert extends Component {
    constructor(props) {
        console.log("calling");
        super(props);

        this.showAlert.bind(this);
      }

    showAlert() {
        if (this.props.backendConnSuccess) {
            if (this.props.dbQuerySuccess) {
              return (
                  <Alert size="sm" color="success">Database connected</Alert>
                  )
            }
            return (
              <div>
              <Alert color="danger">DB Connection or Query Failed. See error below.</Alert>
              <p><font color="red">{this.props.dbErrMsg}</font></p>
              </div>
            )
        } else if (this.props.backendConnSuccess === false) {
            return (
                <Alert color="danger">Unable to connect to Express backend.
                  Please verify it is running!</Alert>
            )
        }
        // if backendConnSuccess is null, it means we haven't attempted a
        // connection yet to the backend
        return '';
    }

    render() {
      return (
        <div>{this.showAlert()}</div>
      );
    }
}
