import React, { Component } from 'react';
import { Navbar, Nav, NavItem } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import logo from '../assets/metroviz-logo.svg'


export default class HeaderNavigation extends Component{

  render(){
    return(
      <Navbar className="header-nav" dark expand="md">
        <a href="www.google.com" target="_blank" rel="noopener noreferrer">
          <img alt="MetroViz Logo" src={logo} className="metroviz-logo mr-4" />
        </a>
        <Nav className="ml-auto" navbar>
          <NavItem>
            <NavLink className="nav-link dark h5 my-0 py-0" exact to="/">Main</NavLink>
          </NavItem>
          <NavItem>
            <NavLink className="nav-link dark h5 my-0 py-0" to="/about">About</NavLink>
          </NavItem>
        </Nav>
      </Navbar>
    );
  }

}
