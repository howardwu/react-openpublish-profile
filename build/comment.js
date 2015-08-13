'use strict';

var React = require('react');
var Panel = require('react-bootstrap/lib/Panel');

var IDPicture = require("./id-picture.js");

function postTime(datetime) {
  var oneDay = 24 * 60 * 60 * 1000;
  var oneHour = 60 * 60 * 1000;
  var oneMinute = 60 * 1000;
  var firstDate = new Date();
  var secondDate = new Date(datetime);
  var timezoneOffset = firstDate.getTimezoneOffset() * 60 * 1000;
  var diffDays = Math.round(Math.abs((firstDate.getTime() + timezoneOffset - secondDate.getTime()) / oneDay));
  var diffHours = Math.round(Math.abs((firstDate.getTime() + timezoneOffset - secondDate.getTime()) / oneHour));
  var diffMinutes = Math.round(Math.abs((firstDate.getTime() + timezoneOffset - secondDate.getTime()) / oneMinute));
  if (diffDays > 1) return "" + diffDays + " days ago";else if (diffHours === 0 && diffMinutes === 1) return "published " + diffMinutes + " minute ago";else if (diffHours === 0) return "" + diffMinutes + " minutes ago";else if (diffHours === 1) return "" + diffHours + " hour ago";else return "" + diffHours + " hours ago";
}

var Comment = React.createClass({
  displayName: 'Comment',

  render: function render() {
    var comment = this.props.comment;
    var pendingOrConfirmed;
    if (this.props.pending) {
      pendingOrConfirmed = "Comment Pending Confirmation";
    } else {
      pendingOrConfirmed = postTime(comment.datetime);
    }
    return React.createElement(
      Panel,
      null,
      React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { className: 'commentIDPicture' },
          React.createElement(IDPicture, { size: 30, user_id: comment.commenter })
        ),
        React.createElement(
          'div',
          { className: 'commentHeader' },
          React.createElement(
            'a',
            null,
            comment.commenter
          ),
          React.createElement(
            'div',
            { style: { float: "right", fontWeight: "bold" } },
            pendingOrConfirmed
          )
        ),
        React.createElement('hr', null),
        React.createElement(
          'div',
          { className: 'commentBody' },
          comment.comment
        )
      )
    );
  }
});

module.exports = Comment;