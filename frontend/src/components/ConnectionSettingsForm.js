import React, {Component} from 'react';
import { Button, InputGroup, InputGroupAddon, InputGroupText, Input} from 'reactstrap';

export default class ConnectionSettingsForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      db: "ecgdb",
      schema: "public",
      metadataTable: "anomaly_meta"
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  }

  handleInputChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleClick() {
    console.log("db: " + this.state.db + " schema: " + this.state.schema +
                " metadataTable: " + this.state.metadataTable);
  }

  render() {
    return (
      <div>
      <h5>Connection Settings</h5>
      <InputGroup size="sm">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>DB &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</InputGroupText>
        </InputGroupAddon>
        <Input name="db" defaultValue={this.state.db} onChange={this.handleInputChange}/>
      </InputGroup>
      <InputGroup size="sm">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>Schema</InputGroupText>
        </InputGroupAddon>
        <Input name="schema" defaultValue={this.state.schema} onChange={this.handleInputChange}/>
      </InputGroup>
      <InputGroup size="sm">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>MetadataTable</InputGroupText>
        </InputGroupAddon>
        <Input name="metadataTable" defaultValue={this.state.metadataTable} onChange={this.handleInputChange}/>
      </InputGroup>
      <Button color="secondary" size="sm" onClick={this.handleClick}>Connect</Button>
      </div>
    )
  }
}