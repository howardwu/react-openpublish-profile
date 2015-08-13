'use strict';

var React = require('react');

//local imports
var BitstoreContent = require('./bitstore-content.js');
var IDPicture = require('./id-picture.js');
var Tip = require('./tip-button.js');
var Loader = require('halogen/ClipLoader');

var Panel = require('react-bootstrap/lib/Panel');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

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

var Post = React.createClass({
  displayName: 'Post',

  getInitialState: function getInitialState() {
    return {
      hasTipped: this.props.tipped,
      numComments: "See",
      tipMessage: ""
    };
  },

  updateHasTipped: function updateHasTipped() {
    this.setState({
      hasTipped: true
    });
  },

  setTipErrorMessage: function setTipErrorMessage(error) {
    this.setState({
      tipMessage: error
    });
  },

  tip: function tip() {
    var post = this.props.post;
    if (this.state.hasTipped) {
      return React.createElement(
        'div',
        { className: 'postTipButton' },
        React.createElement(Tip, { user_id: this.props.user_id, hasTipped: true, wallet: this.props.wallet, blockchain: this.props.blockchain, post: this.props.post })
      );
    } else {
      return React.createElement(
        'div',
        { className: 'postTipButton' },
        React.createElement(Tip, { user_id: this.props.user_id, hasTipped: false, wallet: this.props.wallet,
          blockchain: this.props.blockchain, post: this.props.post, success: this.updateHasTipped, failure: this.setTipErrorMessage })
      );
    }
  },

  loadComments: function loadComments(sha1) {
    if (this.state.comments && this.state.comments.length != 0) {
      this.setState({
        comments: []
      });
    } else {
      this.setState({
        loading: true
      });

      var that = this;
      this.props.tccClient.getComments({ method: "sha1", query: sha1 }, function (err, resp) {
        var commentsJSX = [];
        if (err) {
          console.log("error loading comments: " + err);
          commentsJSX.push(React.createElement(
            Panel,
            { key: i },
            React.createElement(
              'center',
              null,
              React.createElement(
                'h4',
                null,
                'Tip to See Comments'
              )
            )
          ));
          that.setState({
            comments: React.createElement(
              'div',
              null,
              commentsJSX
            )
          });
        } else {
          var comments = resp;
          if (comments.length > 0) {
            var length = Math.min(3, comments.length);
            var numLeft = Math.max(0, comments.length - 3);
            for (var i = 0; i < length; i++) {
              if (comments[i].confirmed || that.props.user_id === comments[i].commenter) {
                var comment = comments[i];
                var pendingOrConfirmed = postTime(comment.datetime);

                commentsJSX.push(React.createElement(
                  Panel,
                  { key: "comments:" + i },
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
                        comment.commenter.substring(0, 20) + "... "
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
                ));
              }
              if (numLeft > 0) {
                commentsJSX.push(React.createElement(
                  Panel,
                  { key: i },
                  React.createElement(
                    'center',
                    null,
                    React.createElement(
                      'h5',
                      null,
                      React.createElement(
                        'a',
                        { key: "comments:" + i },
                        'See ',
                        numLeft,
                        ' more'
                      )
                    )
                  )
                ));
              }
            }
            that.setState({
              comments: { commentsJSX: commentsJSX },
              numComments: comments.length,
              loading: false
            });
          } else {
            commentsJSX.push(React.createElement(
              Panel,
              { key: 0 },
              React.createElement(
                'center',
                null,
                React.createElement(
                  'h4',
                  null,
                  'No Comments to Display'
                )
              )
            ));
            that.setState({
              comments: React.createElement(
                'div',
                null,
                commentsJSX
              ),
              loading: false
            });
          }
        }
      });
    }
  },

  render: function render() {
    var post = this.props.post;
    var type = post.type;
    var vowels = ["a", "e", "i", "o", "u"];
    var connector = "a";
    if (type) {
      type = type.split("/")[0];
      if (type === "image") {
        connector = "an";
      } else if (type === "text") {
        connector = "a";
        type = "text file";
      } else if (type === "audio") {
        connector = "an";
        type = "audio file";
      }
    }

    var commentButton;
    if (this.state.loading) {
      commentButton = React.createElement(
        'div',
        { className: 'post-button' },
        React.createElement(Loader, { style: { float: "left" }, color: '#f11c08', size: '15px' })
      );
    } else {
      commentButton = React.createElement(
        'div',
        { className: 'post-button', onClick: this.loadComments.bind(null, post.sha1) },
        this.state.numComments,
        ' comments'
      );
    }
    return React.createElement(
      Panel,
      { key: post.sha1 },
      React.createElement(
        'div',
        { className: 'postIDPicture' },
        React.createElement(IDPicture, { size: 50, user_id: this.props.owner })
      ),
      React.createElement(
        'div',
        { className: 'postPermalink' },
        React.createElement(
          'a',
          null,
          React.createElement(Glyphicon, { glyph: 'link' })
        )
      ),
      React.createElement(
        'div',
        { className: 'postText' },
        React.createElement(
          'b',
          null,
          ' ',
          React.createElement(
            'a',
            null,
            this.props.owner,
            ' '
          ),
          ' '
        ),
        ' published ',
        connector,
        ' ',
        type,
        React.createElement('br', null),
        postTime(post.created_at)
      ),
      React.createElement(
        'div',
        { className: 'postContent' },
        React.createElement(BitstoreContent, { post: post, permalink: false })
      ),
      React.createElement(
        'div',
        { className: 'postTipActions' },
        this.tip(),
        React.createElement(
          'div',
          { className: 'postCommentLink' },
          commentButton
        ),
        React.createElement(
          'div',
          { className: 'postTipError' },
          ' ',
          this.state.tipMessage
        )
      ),
      React.createElement(
        'div',
        { className: 'postCommentBox' },
        this.state.comments
      )
    );
  }
});

module.exports = Post;