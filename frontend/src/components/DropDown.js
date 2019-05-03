import React, { Component } from 'react'
import { ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

export default class DropDown extends Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false
    };
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  }

  generateItem(item) {
    return (
      <DropdownItem onClick={ () => this.props.onClick(item) } key={ item }>{ item }</DropdownItem>
    )
  }

  render() {
    return (
      <ButtonDropdown className="py-0 my-0" size="sm" isOpen={this.state.dropdownOpen} toggle={this.toggle}>
        <DropdownToggle className="py-0 my-0" caret>
          { this.props.curItem ? this.props.curItem : "Select"}
        </DropdownToggle>
        <DropdownMenu>
          { this.props.items.map( (val) => this.generateItem(val)) }
        </DropdownMenu>
      </ButtonDropdown>
    );
  }
}
