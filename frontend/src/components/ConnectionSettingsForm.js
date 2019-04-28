import React, {Component} from 'react';
import { Button, InputGroup, InputGroupAddon, InputGroupText, Input} from 'reactstrap';

export default class ConnectionSettingsForm extends Component {
  constructor(props) {
    super(props);

    // Note: currently duplicates state vars from parent, since
    // we can update these independently (i.e., in the form)
    // vs only needing to update the parent when we want to try connecting to db.
    this.state = {
      host: this.props.connectParams.host,
      user: this.props.connectParams.user,
      pw: this.props.connectParams.pw,
      dbName: this.props.connectParams.dbName,
      schema: this.props.connectParams.schema,
      metadataTable: this.props.connectParams.metadataTable,
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
    this.props.onConnectButtonClick({
      host: this.state.host,
      dbName: this.state.dbName,
      user: this.state.user,
      pw: this.state.pw,
      schema: this.state.schema,
      metadataTable: this.state.metadataTable,
    });
  }

  render() {
    return (
      <div className="mx-1">
      <InputGroup className="my-1" size="sm">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>Host</InputGroupText>
        </InputGroupAddon>
        <Input name="host" defaultValue={this.state.host} onChange={this.handleInputChange}/>
      </InputGroup>

      <div className="form-row mb-1">
        <div className="col-6">
          <InputGroup size="sm">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>DB &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</InputGroupText>
            </InputGroupAddon>
            <Input name="dbName" defaultValue={this.state.dbName} onChange={this.handleInputChange}/>
          </InputGroup>
        </div>
        <div className="col-6">
          <InputGroup size="sm">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>User</InputGroupText>
            </InputGroupAddon>
            <Input name="user" defaultValue={this.state.user} onChange={this.handleInputChange}/>
          </InputGroup>
        </div>
      </div>
      <div className="form-row">
        <div className="col-6">
          <InputGroup size="sm">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>Schema</InputGroupText>
            </InputGroupAddon>
            <Input name="schema" defaultValue={this.state.schema} onChange={this.handleInputChange}/>
          </InputGroup>
        </div>
        <div className="col-6">
          <InputGroup size="sm">
            <InputGroupAddon addonType="prepend">
              <InputGroupText>Password</InputGroupText>
            </InputGroupAddon>
            <Input name="pw" type="password" defaultValue={this.state.pw} onChange={this.handleInputChange}/>
          </InputGroup>
        </div>
      </div>
      <InputGroup className="mt-1" size="sm">
        <InputGroupAddon addonType="prepend">
          <InputGroupText>MetadataTable</InputGroupText>
        </InputGroupAddon>
        <Input name="metadataTable" defaultValue={this.state.metadataTable} onChange={this.handleInputChange}/>
      </InputGroup>
      <Button className="my-2" color="secondary" size="sm" onClick={this.handleClick}>Connect</Button>
      </div>
    )
  }
}
