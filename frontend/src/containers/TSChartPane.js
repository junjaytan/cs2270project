import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Collapse, Button, CardBody, Card } from 'reactstrap';
import { Table } from 'reactstrap';
import { Charts, ChartContainer, ChartRow, YAxis, LineChart } from "react-timeseries-charts";

export class TSChartPane extends Component {
    constructor(props) {
        super(props);
        this.toggle = this.toggle.bind(this);
        this.state = { collapse: false };
      }


    // Just a PoC
    toggle() {
        this.setState(state => ({ collapse: !state.collapse }));
      }

    render(){
        return(
          <div>
            <Button color="primary" onClick={this.toggle} style={{ marginBottom: '1rem' }}>Toggle Segment Search Results</Button>
            <Collapse isOpen={this.state.collapse}>
            <Card>
                <CardBody>
                <Table>
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>First Name</th>
                      <th>Last Name</th>
                      <th>Username</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <th scope="row">1</th>
                      <td>Mark</td>
                      <td>Otto</td>
                      <td>@mdo</td>
                    </tr>
                    <tr>
                      <th scope="row">2</th>
                      <td>Jacob</td>
                      <td>Thornton</td>
                      <td>@fat</td>
                    </tr>
                    <tr>
                      <th scope="row">3</th>
                      <td>Larry</td>
                      <td>the Bird</td>
                      <td>@twitter</td>
                    </tr>
                  </tbody>
                </Table>
                </CardBody>
            </Card>
            </Collapse>
          </div>
        );
      }
}

function mapStateToProps(state) {
    return {
      // data: selectors.getData(state)
    };
  }

  function mapDispatchToProps(dispatch) {
    return {
      // fetchData: () => dispatch({ type: 'FETCH_DATA', payload:'' })
    };
  }

  export default connect(mapStateToProps, mapDispatchToProps)(TSChartPane);