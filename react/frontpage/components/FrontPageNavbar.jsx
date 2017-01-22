// FrontPageNavbar.jsx

var React = require('react');

// Bootstrap Elements
import { Nav, NavItem, Collapse, NavDropdown, MenuItem } from 'react-bootstrap';

import { LinkContainer } from 'react-router-bootstrap';
import { browserHistory } from 'react-router';

// styling
require('./FrontPageNavbar.scss');

/**
Navigation bar for the stream frontpage, which has collapsing rows and selectable tabs
*/
var FrontPageNavbar = React.createClass({
  getInitialState: function() {
    return {open: false};
  },
  handleClick: function(selectedKey) {
    switch(selectedKey) {
      case 1:
        window.open("http://uclaradio.tumblr.com", "_blank");
        break;
      case 2:
        browserHistory.push('/streamIssues');
        break;
      case 3:
        window.open("http://apply.dailybruin.com/applications/ucla-radio/", "_blank");
        break;
      case 4:
        window.open("http://last.fm/user/uclaradio", "_blank");
        break;
      case 5:
        window.open("/panel", "_blank");
        break;
      case 10:
        this.setState({open: !this.state.open});
        break;
      default:
        break;
    }
  },
  render: function() {
    return (
      <div className="frontPageNavbar">
        { /** Large devices, hidden on xs **/ }
        <Nav justified bsStyle="pills" className="hidden-xs" onSelect={this.handleClick}>
          <LinkContainer to="/djs">
            <NavItem className="frontPageNavbarItem leftMost">
              <span className="equalWidth">
                DJs
              </span>
            </NavItem>
          </LinkContainer>
          <LinkContainer to="/events">
            <NavItem className="frontPageNavbarItem">
              <span className="equalWidth">
                Events
              </span>
            </NavItem>
          </LinkContainer>
          <LinkContainer to="/shows">
            <NavItem className="frontPageNavbarItem">
              <span className="equalWidth">
                Shows
              </span>
            </NavItem>
          </LinkContainer>
          <NavItem eventKey={10} className="frontPageNavbarItem rightMost">
            <span className="equalWidth">
              { this.state.open ? "Less" : "More" }
            </span>
          </NavItem>
        </Nav>
        <Collapse in={this.state.open} className="hidden-xs">
          <Nav justified bsStyle="pills" onSelect={this.handleClick}>
            <NavItem eventKey={1} className="frontPageNavbarItem leftMost collapsed">Blog</NavItem>
            <LinkContainer to="/streamIssues">
              <NavItem className="frontPageNavbarItem collapsed">
                Stream Issues
              </NavItem>
            </LinkContainer>
            <NavItem eventKey={3} className="frontPageNavbarItem collapsed">Apply</NavItem>
            <NavItem eventKey={4} className="frontPageNavbarItem collapsed">Air Plays</NavItem>
            <NavItem eventKey={5} className="frontPageNavbarItem rightMost collapsed">Staff Panel</NavItem>
          </Nav>
        </Collapse>

        { /** Extra Small devices, hidden on sm, md, lg **/ }
        <Nav justified bsStyle="pills" className="hidden-sm hidden-md hidden-lg" onSelect={this.handleClick}>
          <LinkContainer to="/djs">
            <NavItem className="frontPageNavbarItem fullWidth topMost">DJs</NavItem>
          </LinkContainer>
          <LinkContainer to="/events">
            <NavItem className="frontPageNavbarItem fullWidth">Events</NavItem>
          </LinkContainer>
          <LinkContainer to="/shows">
            <NavItem className="frontPageNavbarItem fullWidth">Shows</NavItem>
          </LinkContainer>
          <NavDropdown title="More" className="frontPageNavbarItem fullWidth bottomMost">
            <MenuItem className="dropdownNavbarItem" onClick={()=>{this.handleClick(1)}}>Blog</MenuItem>
            <MenuItem className="dropdownNavbarItem" onClick={()=>{this.handleClick(2)}}>Stream Issues</MenuItem>
            <MenuItem className="dropdownNavbarItem" onClick={()=>{this.handleClick(3)}}>Apply</MenuItem>
            <MenuItem className="dropdownNavbarItem" onClick={()=>{this.handleClick(4)}}>Air Plays</MenuItem>
            <MenuItem className="dropdownNavbarItem" onClick={()=>{this.handleClick(5)}}>Staff Panel</MenuItem>
          </NavDropdown>
        </Nav>
      </div>
    );
  }
});

module.exports = FrontPageNavbar;
