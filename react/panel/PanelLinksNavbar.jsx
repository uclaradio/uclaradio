// PanelLinksNavbar.jsx

var React = require('react');

var linksURL = "/panel/api/userlinks";

// Bootstrap elements
var Navbar = require('react-bootstrap').Navbar;
var Nav = require('react-bootstrap').Nav;
var NavItem = require('react-bootstrap').NavItem;
import { LinkContainer } from 'react-router-bootstrap';

/**
*  Navbar which loads links available to the current user logged
*  into the DJ panel
*/
var PanelLinksNavbar = React.createClass({
  getInitialState: function() {
    return {links: []};
  },
  loadDataFromServer: function() {
    $.ajax({
      url: linksURL,
      dataType: 'json',
      cache: false,
      success: function(o) {
        this.setState({links: o.links, loggedin: o.loggedin});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(linksURL, status, err.toString());
      }.bind(this)
    });
  },
  // provided a node element and a link, this function will wrap
  // a span with class 'navbarSelected' around the element
  // if the provided link is the same as the current path ('/panel/...')
  styleLink: function(element, link) {
    if (link == window.location.pathname) {
      return <span className="navbarSelected">{element}</span>;
    }
    return element;
  },
  componentDidMount: function() {
    this.loadDataFromServer();
  },
  render: function() {
    var styleLink = this.styleLink;
    var links = this.state.links.map(function(link, i) {
      return (
        <LinkContainer to={link.link} key={i}>
          <NavItem>{styleLink(link.title, link.link)}</NavItem>
        </LinkContainer>
      );
    });
    return (
      <div className="panelLinksNavbar">
        <Navbar>
          <Navbar.Header>
            <Navbar.Brand>
              <a href="/panel/home">{styleLink("Secret DJ Panel", "/panel/home")}</a>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          <Navbar.Collapse>
            <Nav>
              {links}
            </Nav>
            {this.state.loggedin
              ?
            <Nav pullRight>
              <NavItem id="navbarLogout" eventKey={1} href="/panel/logout">Log Out</NavItem>
            </Nav>
            :
            ''
            }
          </Navbar.Collapse>
        </Navbar>
      </div>
    );
  }
});

module.exports = PanelLinksNavbar;
