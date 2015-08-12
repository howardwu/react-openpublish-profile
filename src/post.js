var React = require('react');

//local imports
var BitstoreContent = require('./bitstore-content.js');
var IDPicture = require('./id-picture.js');
var Tip = require('./tip-button.js');
var Loader = require('halogen/ClipLoader');

var Panel = require('react-bootstrap/lib/Panel');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

function postTime(datetime) {
  var oneDay = 24*60*60*1000;
  var oneHour = 60*60*1000;
  var oneMinute = 60*1000;
  var firstDate = new Date();
  var secondDate = new Date(datetime);
  var timezoneOffset = firstDate.getTimezoneOffset() * 60 * 1000;
  var diffDays = Math.round(Math.abs(((firstDate.getTime() + timezoneOffset)- secondDate.getTime())/(oneDay)));
  var diffHours = Math.round(Math.abs(((firstDate.getTime() + timezoneOffset) - secondDate.getTime())/(oneHour)));
  var diffMinutes = Math.round(Math.abs(((firstDate.getTime() + timezoneOffset) - secondDate.getTime())/(oneMinute)));
  if (diffDays > 1) return "" + diffDays + " days ago";
  else if (diffHours === 0 && diffMinutes === 1) return "published " + diffMinutes + " minute ago";
  else if (diffHours === 0) return "" + diffMinutes + " minutes ago";
  else if (diffHours === 1) return "" + diffHours + " hour ago";
  else return "" + diffHours + " hours ago";
}

var Post = React.createClass({
  getInitialState: function () {
    return {
      hasTipped: this.props.tipped,
      numComments: "See",
      tipMessage: ""
    };
  },

  updateHasTipped: function () {
    this.setState({
      hasTipped: true
    })
  },

  tip: function () {
    var post = this.props.post;
    if (this.state.hasTipped || this.props.user_id === this.props.post.owner) {
      return (
        <div className="postTipButton">
          <Tip user_id={this.props.user_id} hasTipped={true} wallet={this.props.wallet} blockchain={this.props.blockchain} post={this.props.post}/>
        </div>
      );
    }
    else {
      return (
        <div className="postTipButton">
          <Tip user_id={this.props.user_id} hasTipped={false} wallet={this.props.wallet}
           blockchain={this.props.blockchain} post={this.props.post} success={this.updateHasTipped} />
        </div>
      );
    }
  },

  loadComments: function(sha1) {
    if (this.state.comments && (this.state.comments.length != 0)) {
      this.setState({
        comments: []
      });
    }
    else {
      this.setState({
        loading: true
      });

      var that = this;
      this.props.tccClient.getComments({method: "sha1", query: sha1}, function (err, resp) {
        var commentsJSX = [];
        if (err) {
          console.log("error loading comments: " + err);
          commentsJSX.push(
            <Panel key={i}>
              <center>
                <h4>Tip to See Comments</h4>
              </center>
            </Panel>
          );
          that.setState({
            comments: <div>{commentsJSX}</div>
          });
        }
        else {
          var comments = resp;
          if (comments.length > 0) {
            var length = Math.min(3, comments.length);
            for (var i = 0; i < length; i++) {
              if (comments[i].confirmed || that.props.user_id === comments[i].commenter) {
                var comment = comments[i];
                var pendingOrConfirmed = postTime(comment.datetime);
                
                commentsJSX.push(
                  <Panel key={"comments:" + i}>
                    <div>
                      <div className="commentIDPicture">
                        <IDPicture size={30} user_id={comment.commenter} />
                      </div>
                      <div className="commentHeader">
                        <a href={"/profile?user=" + comment.commenter}>{comment.commenter.substring(0, 20) + "... "}</a>
                        <div style={{float: "right", fontWeight: "bold"}}>
                          {pendingOrConfirmed}
                        </div>
                      </div>
                      <hr />
                      <div className="commentBody">
                        {comment.comment}
                      </div>
                    </div>
                  </Panel>
                );
              }
              if (i === length - 1) {
                var numLeft = comments.length - 3;
                commentsJSX.push(
                  <Panel key={i}>
                    <center>
                      <h5><a key={"comments:" + i} href={"permalink?sha1=" + sha1}>See {numLeft} more</a></h5>
                    </center>
                  </Panel>
                );
                that.setState({
                  comments: <div>{commentsJSX}</div>,
                  numComments: comments.length,
                  loading: false
                });
              }
            }
          }
          else {
            commentsJSX.push(
              <Panel key={0}>
                <center>
                  <h4>No Comments to Display</h4>
                </center>
              </Panel>
            );
            commentsJSX.push(
              <Panel key={1}>
                <center>
                  <h5><a key={"comments:" + i} href={"permalink?sha1=" + sha1}>See more</a></h5>
                </center>
              </Panel>
            );
            that.setState({
              comments: <div>{commentsJSX}</div>,
              loading: false
            });
          }
        }
      });
    }  
  },

  render: function () {
    var post = this.props.post;
    var type = post.type;
    var vowels = ["a", "e", "i", "o", "u"];
    var connector = "a";
    if (type) { 
      type = type.split("/")[0];
      if (type === "image") {
        connector = "an";
      }
      else if (type === "text") {
        connector = "a";
        type = "text file";
      }
      else if (type === "audio") {
        connector = "an";
        type = "audio file";
      }
    }
    
    var commentButton;
    if (this.state.loading) {
      commentButton = <div className="post-button">
                        <Loader style={{float: "left"}} color="#f11c08" size="15px"/>
                      </div>
    }
    else {
      commentButton = <div className="post-button" onClick={this.loadComments.bind(null, post.sha1)}>
                        {this.state.numComments} comments
                      </div>
    }
    return (
      <Panel key={post.sha1}>
        <div className="postIDPicture">
          <IDPicture size={50} user_id={post.owner} />
        </div>

        <div className="postPermalink"> 
          <a href={"permalink?sha1=" + post.sha1}>
            <Glyphicon glyph='link' />
          </a>
        </div>

        <div className="postText">
          <b> <a href={"/profile?user=" + post.owner}>{post.owner} </a> </b> published {connector} {type}
          <br />
          {postTime(post.datetime)}
        </div>

        <div className="postContent">

          <BitstoreContent post={post} permalink={false} />

          <div className="postTipActions">
            {this.tip()}
            <div className="postCommentLink">
              {commentButton}
            </div>
          </div>

          <p> {this.state.tipMessage}</p>
          <div className="postCommentBox">
            {this.state.comments}
          </div>
        </div>

      </Panel>
    );
  }
});

module.exports = Post;
