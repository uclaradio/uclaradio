// let manager edit event info

var React = require('react');
var ReactDOM = require('react-dom');

// Panel Elements
var RectImage = require('../../common/RectImage.jsx');

// Inputs
var InputEditableTextField = require('../inputs/InputEditableTextField.jsx');
var InputEditableDateTimeField = require('../inputs/InputEditableDateTimeField.jsx');
var InputCheckbox = require('../inputs/InputCheckbox.jsx');
var InputFileUpload = require('../inputs/InputFileUpload.jsx');
var ConfirmationButton = require('../inputs/ConfirmationButton.jsx');

// Bootstrap Elements
var Grid = require('react-bootstrap').Grid;
var Row = require('react-bootstrap').Row;
var Col = require('react-bootstrap').Col;
var Well = require('react-bootstrap').Well;
var FormControls = require('react-bootstrap').FormControls;

var PanelEventPage = React.createClass({
  getEventIDFromURL: function() {
    return window.location.pathname.split('/').pop();
  },

  getInitialState: function() {
    return {eventID: this.getEventIDFromURL()};
  },
  render: function() {
    return (
      <div className="showPage">
        <Event urls={this.props.urls} eventID={this.state.eventID} />
      </div>
    );
  }
});

// TODO: Finish front end for updating and deleting event
// Change from Show => Event 
var Event = React.createClass({
  getInitialState: function() {
    return {event: {}, nameVerified: false, publicVerified: false, artVerified: false};
  },
  loadDataFromServer: function() {
    $.ajax({
      url: this.props.urls.eventDataURL+this.props.eventID,
      dataType: 'json',
      cache: false,
      success: function(event) {
        this.setState({event: event});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.urls.eventDataURL, status, err.toString());
      }.bind(this)
    });
  },
  handleShowDataSubmit: function(updatedShow, successVar) {
    var oldShow = this.state.event;
    // Optimistically update local data, will be refreshed or reset after response from server
    this.setState({show: updatedShow});
    // Stringify arrays so they reach the server
    var safeShow = JSON.stringify(updatedShow);
    // don't mark as verified yet
    var unverifiedState = {};
    unverifiedState[successVar] = false;
    this.setState(unverifiedState);
    $.ajax({
      url: this.props.urls.showUpdateURL,
      dataType: 'json',
      type: 'POST',
      data: {show: safeShow},
      success: function(show) {
        var successState = {show: show};
        successState[successVar] = true;
        this.setState(successState);
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({show: oldShow});
        console.error(this.props.urls.showUpdateURL, status, err.toString());
      }.bind(this)
    });
  },
  verifyShowArt: function() {
    this.setState({artVerified: true});
  },
  unverifyShowArt: function() {
    this.setState({artVerified: false});
  },
  handleShowArtSubmit: function(data) {
    if (!data) { return; }

    var formData = new FormData();
    formData.append("img", data);
    formData.append("id", this.state.show.id);
    var request = new XMLHttpRequest();
    request.open("POST", this.props.urls.showPicURL);
    var loadData = this.loadDataFromServer;
    var verify = this.verifyShowArt;
    var unverify = this.unverifyShowArt;
    unverify();
    request.onload = function(e) {
      if (request.status == 200) {
        loadData();
        verify();
      }
      else {
        unverify();
      }
    };
    request.send(formData);
  },
  handleNameSubmit: function(title) {
    var show = $.extend(true, {}, this.state.show);
    show.title = title;
    this.handleShowDataSubmit(show, 'titleVerified');
  },
  handlePublicSubmit: function(checked) {
    var show = $.extend(true, {}, this.state.show);
    show.public = checked;
    this.handleShowDataSubmit(show, 'publicVerified');
  },
  handleDeleteShow: function() {
    $.ajax({
      url: this.props.urls.deleteShowURL,
      dataType: 'json',
      type: 'POST',
      data: {"id": this.state.show.id},
      success: function() {
        location.href = this.props.urls.deleteRedirectURL;
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.urls.deleteShowURL, status, err.toString());
      }.bind(this)
    });
  },

  componentDidMount: function() {
    this.loadDataFromServer();
  },
  render: function() {
    return (
      <div className="show">
        <Grid>
          <Well>
            <Row>
              <Col xs={12} md={4}>
                <RectImage src={this.state.event.picture || "/img/radio.png" } rounded maxWidth="380px" />
              </Col>
              <Col xs={12} md={8}>
                <h3>{this.state.event.name}</h3>
                <InputFileUpload accept=".png,.gif,.jpg,.jpeg" title="Art" onSubmit={this.handleShowArtSubmit} verified={this.state.artVerified} />
                <InputEditableTextField title="Name" currentValue={this.state.event.name}
                  onSubmit={this.handleNameSubmit} placeholder="Enter Event Name" verified={this.state.nameVerified} />
                <InputCheckbox title="Public" details="Make Event Public" checked={this.state.event.public}
                  onSelect={this.handlePublicSubmit} verified={this.state.publicVerified} />

                <ConfirmationButton confirm={"Delete '" + this.state.event.name + "'"} submit={"Really delete '" + this.state.event.name + "'?"} onSubmit={this.handleDeleteShow} />
              </Col>
            </Row>
          </Well>
        </Grid>
      </div>
    );
  }
});

export default PanelEventPage;

