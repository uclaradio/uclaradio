// home.html
// let DJ edit personal info

var React = require('react');
var ReactDOM = require('react-dom');

var urls = {
  url: "/panel/api/faq"
};

// Panel Elements
var PanelLinksNavbar = require('./PanelLinksNavbar.jsx');

// Boostrap Components
var Accordion = require('react-bootstrap').Accordion;
var Panel = require('react-bootstrap').Panel;
var Input = require('react-bootstrap').Input;
var Button = require('react-bootstrap').Button;
var Grid = require('react-bootstrap').Grid;

var PanelFAQPage = React.createClass({
  render: function() {
    return (
      <div className="panelPage">
        <Grid>
          <FAQ urls={this.props.urls} />
        </Grid>
      </div>
    );
  }
});

var FAQ = React.createClass({
  getInitialState: function() {
    return {faqs: [], tempFAQs: [], editable: false, editing: false};
  },
  loadDataFromServer: function() {
    $.ajax({
      url: this.props.urls.url,
      dataType: 'json',
      cache: false,
      success: function(o) {
        this.setState({faqs: o.faqs});
        if (o.editable) {
          this.setState({editable: o.editable})
        }
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.urls.url, status, err.toString());
      }.bind(this)
    });
  },
  updateFAQ: function(faqs) {
    this.setState({tempFAQs: faqs});
  },
  updateQuestion: function(qid, value) {
    var faqs = this.state.tempFAQs;
    var faq = faqs[qid];
    faq.question = value;
    faqs[qid] = faq;
    this.setState({tempFAQs: faqs});
  },
  updateAnswer: function(qid, value) {
    var faqs = this.state.tempFAQs;
    var faq = faqs[qid];
    faq.answer = value;
    faqs[qid] = faq;
    this.setState({tempFAQs: faqs});
  },
  addQuestion: function() {
    var faqs = this.state.tempFAQs;
    var lastID = (faqs.length > 0) ? faqs[faqs.length-1].id + 1 : 1;
    faqs.push({"id": lastID, "question": "", "answer": ""});
    this.setState({tempFAQs: faqs});
  },
  deleteQuestion: function(qid) {
    var faqs = this.state.tempFAQs;
    faqs.splice(qid, 1);
    this.setState({tempFAQs: faqs});
  },
  submitData: function() {
    var oldFAQs = this.state.faqs;
    // optimistically update local info
    this.setState({faqs: this.state.tempFAQs});
    $.ajax({
      url: this.props.urls.url,
      dataType: 'json',
      type: 'POST',
      data: {faqs: JSON.stringify(this.state.tempFAQs)},
      success: function(faqs) {
        this.setState({editing: false, tempFAQs: []});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({faqs: oldFAQs});
        console.error(this.props.urls.url, status, err.toString());
      }.bind(this)
    });
  },
  toggleEditing: function() {
    this.setState({tempFAQs: this.state.faqs.slice(0), editing: !this.state.editing});
  },
  componentDidMount: function() {
    this.loadDataFromServer();
  },
  render: function() {
    if (this.state.editing) {
      var updateQuestion = this.updateQuestion;
      var updateAnswer = this.updateAnswer;
      var deleteQuestion = this.deleteQuestion;
      var faqs = this.state.tempFAQs.map(function(question, i) {
        return (<QuestionEdit key={i} qid={i} question={question.question} answer={question.answer}
                  handleUpdateQuestion={updateQuestion} handleUpdateAnswer={updateAnswer} handleDelete={deleteQuestion} />
              );
      });
    }
    else {
      var questions = this.state.faqs.map(function(faq, i) {
        return (<Panel header={faq.question} eventKey={i} key={i}>
                  {faq.answer}
                </Panel>
              );
      });
    }
    return (
      <div className="faq">
          {this.state.editing
          ?
          <div className="editQuestions">
            {faqs}
            <div className="mainActions">
              <a onClick={this.addQuestion}>+ Add New Question</a>
              <span className="rightFloat">
                <Button onClick={this.submitData} className="lightPadding">Submit</Button>
                <Button className="cancelLink lightPadding" onClick={this.toggleEditing}>Cancel</Button>
              </span>
            </div>
          </div>
          :
          <div className="questions">
            <Accordion>
              {questions}
            </Accordion>
            {this.state.editable
            ?
              <p className="mainActions"><a className="rightFloat" onClick={this.toggleEditing}>Edit</a></p>
            :
              ''
            }
          </div>
          }
      </div>
    );
  }
});

var QuestionEdit = React.createClass({
  updateQuestion: function(e) {
    this.props.handleUpdateQuestion(this.props.qid, e.target.value);
  },
  updateAnswer: function(e) {
    this.props.handleUpdateAnswer(this.props.qid, e.target.value);
  },
  deleteQuestion: function() {
    this.props.handleDelete(this.props.qid);
  },
  render: function() {
    return (
      <div className="questionEdit">
        <p className="actions">Question {this.props.qid + 1} <a className="cancelLink rightFloat" onClick={this.deleteQuestion}>Delete</a></p>
        <form className="form-horizontal">
          <Input
            type="text"
            value={this.props.question}
            placeholder="Question"
            ref="input"
            groupClassName="input"
            wrapperClassName="col-xs-12"
            onChange={this.updateQuestion} />
          <Input
            type="textarea"
            value={this.props.answer}
            placeholder="Answer"
            ref="input"
            groupClassName="input"
            wrapperClassName="col-xs-12"
            onChange={this.updateAnswer} />
          </form>
      </div>
    );
  }
});

export default PanelFAQPage;
