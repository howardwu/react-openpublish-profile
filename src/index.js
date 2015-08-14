var React = require('react');
var xhr = require('xhr');

var Post = require('./post.js');
var Comment = require('./comment.js');
var IDPicture = require('./id-picture.js');

var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var Nav = require('react-bootstrap/lib/Nav');
var Panel = require('react-bootstrap/lib/Panel');
var Button = require('react-bootstrap/lib/Button');
var NavItem = require('react-bootstrap/lib/NavItem');
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

var Profile = React.createClass({
  getInitialState: function() {
    return {
      getProfileData: true,
      balance: "Loading...",
    }
  },

  componentDidMount: function () {
    this.balance();
    var that = this;
    this.posts(function (posts) {
      that.tips(function (tips) {
        that.comments(function (comments) {
          that.renderProfile(posts, comments, tips);
        });
      });
    });
  },

  balance: function () {
    var that = this;
    this.props.commonBlockchain.Addresses.Summary([ this.props.address ], function (err, resp) {
      if (err) {
        console.log("error retrieving balance from common-blockchain");
      }
      else {
        var balance = resp[0].balance / 100000000;
        that.setState({
          balance: balance
        });
      }
    });
  },

  posts: function (callback) {
    this.props.openpublishState.findDocsByUser({ address: this.props.address },
      function (err, assets) {
        if (!err) {
          callback(assets);
        }
      }
    );
  },

  tips: function (callback) {
    this.props.openpublishState.findTipsByUser({ address: this.props.address },
      function (err, tips) {
        if (!err) {
          callback(tips);
        }
      }
    );
  },

  comments: function (callback) {
    this.props.tipToComment.getComments({
      method: "address",
      query: this.props.address
    }, function (err, resp) {
      if (err) {
        console.error(err);
      }
      else {
        callback(resp);
      }
    });
  },

  renderProfile: function(posts, comments, tips) {
    var renderTips = [];
    var renderComments = [];
    var renderPosts = [];
    for (var i = 0; i < tips.length; i++) {
      var tip = tips[i];
      renderTips.push(this.generateTip("tips" + i, tip));
    }
    for (var i = comments.length - 1 ; i >= 0; i--) {
      var comment = comments[i];
      comment.body = comment.comment;
      renderComments.push(
        <Comment key={"comments: " + i} comment={comment}/>
      );
    }
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      var tipped = this.props.address === this.props.commonWallet.address;
      renderPosts.push(
        <Post key={i}
              refKey={i}
              post={posts[i]} 
              tipped={tipped}
              network={this.props.network}
              user_id={this.props.commonWallet.address}
              wallet={this.props.commonWallet}
              blockchain={this.props.commonBlockchain}
              tccClient={this.props.tipToComment}
              owner={this.props.address} />
      );
    }
    this.setState({
      posts: renderPosts,
      comments: renderComments,
      tips: renderTips,
      content: renderPosts,
      getProfileData: false
    });
  },

  generateTip: function(key, tip) {
    return (
      <Panel key={key}>
        <div>
          <div style={{float: "left"}}>
            <a>{tip.tipper}</a> tipped <a>{tip.post}</a>
          </div>
          <div style={{float: "right", fontSize: "15px", fontWeight: "bold"}}>
            {postTime(tip.datetime)}
          </div>
        </div>
        <br />
        <div>
          <div className="tipPicture">
            <IDPicture size={50} user_id={tip.tipper}/>
          </div>

          <Glyphicon glyph='arrow-right' className="tipArrow"/>
          <div className="tipPicture">
            <IDPicture size={50} user_id={tip.owner}/>
          </div>
        </div>
        <br /> <br />
        <hr />
        <div>
          <p>Transaction ID: <a href={"https://www.blocktrail.com/tBTC/tx/" + tip.txid}>{tip.txid}</a></p>
        </div>
      </Panel>
    );
  },

  renderContent: function(type) {
    if (type === "posts" && (this.state.content !== this.state.posts)) {
      this.setState({
        content: this.state.posts
      });
    }
    else if (type === "comments" && (this.state.content !== this.state.comments)) {
      console.log(this.state.comments);
      this.setState({
        content: this.state.comments
      });
    }
    else if (type === "tips" && (this.state.content !== this.state.tips)) {
      this.setState({
        content: this.state.tips
      });
    }
  },

  render: function() {
    if (this.state.getProfileData) {
      return (
        <div className="container">
          <Panel>
            <center>Loading Profile</center>
          </Panel>
        </div>
      );
    }
    else {
      var balances;
      return (
        <div className="container">
          <Panel>
            <Row>
              <Col md={3} lg={3} xl={3}>
                <IDPicture user_id={this.props.address} />
              </Col>
              <Col md={9} lg={9} xl={9}>
                <h2>{this.props.address + "\'s Profile"}</h2>
                <h4>Wallet Balance: {this.state.balance}</h4>
                <h4>Bistore Balance: {this.state.bitstore_balance}</h4>
              </Col>
            </Row>
          </Panel>

          <Row>
            <Col md={3} lg={3} xl={3}>
              <Panel>
                <Nav className="profileOption" stacked>
                  <NavItem eventKey={1} onClick={this.renderContent.bind(null, "posts")}>
                    Posts
                  </NavItem>
                  <NavItem bsSeventKey={2} onClick={this.renderContent.bind(null, "comments")}>
                    Comments
                  </NavItem>
                  <NavItem eventKey={3} onClick={this.renderContent.bind(null, "tips")}>
                    Tips
                  </NavItem>
                </Nav>
              </Panel>
            </Col>
            <Col md={9} lg={9} xl={9}>
              {this.state.content}
            </Col>
          </Row>
        </div>
      );
    }
  }
});

module.exports = Profile;
