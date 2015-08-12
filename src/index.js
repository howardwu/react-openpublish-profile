var React = require('react');
var xhr = require('xhr');

var Post = require('./post.js');
var IDPicture = require('./id-picture.js');
var Comment = require('./comment.js');

var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var Nav = require('react-bootstrap/lib/Nav');
var NavItem = require('react-bootstrap/lib/NavItem');
var Panel = require('react-bootstrap/lib/Panel');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');
var Button = require('react-bootstrap/lib/Button');

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
      getProfileData: true
    }
  },

  generateTip: function(key, tip) {
    return (
      <Panel key={key}>
        <div>
          <div style={{float: "left"}}>
            <a href={"/profile?user=" + tip.tipper}>{tip.tipper}</a> tipped <a href={"/permalink?sha1=" + tip.post}>{tip.post}</a>
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
        
        <br /> <br /> <br />
        <hr />
        <div>
          <p>Transaction ID: <a href={"https://www.blocktrail.com/tBTC/tx/" + tip.txid}>{tip.txid}</a></p>
          <p>SHA-1: <a href={"/permalink?sha1=" + tip.post}>{tip.post}</a></p>
        </div>
      </Panel>
    );
  },

  componentDidMount: function () {
    var userPosts;
    var userTips;
    var userComments;
    var queryCount = 0;
    var queryGoal = 3;
     
    var that = this;
    this.posts(function (posts) {
      userPosts = posts;
      if (++queryCount === queryGoal) {
        that.renderProfile(userPosts, userComments, userTips);
      }
    });

    this.tips(function (tips) {
      userTips = tips;
      if (++queryCount === queryGoal) {
        that.renderProfile(userPosts, userComments, userTips);
      }
    });

    this.comments(function (comments) {
      userComments = comments;
      if (++queryCount === queryGoal) {
        that.renderProfile(userPosts, userComments, userTips);
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
      var tipped = false;
      renderPosts.push(
        <Post key={i}
              refKey={i}
              post={posts[i]} 
              tipped={tipped}
              network={this.props.network}
              user_id={this.props.user_id}
              wallet={this.props.wallet}
              blockchain={this.props.blockchain} />
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

  posts: function (callback) {
    var address = this.props.profile_id;
    xhr({
      uri: '/getPosts/user?address=' + address,
      headers: {
        "Content-Type": "application/json"
      },
      method: 'GET'
    }, function (err, resp, body) {
      console.log("Received response from server");
      if (!err) {
        var posts = JSON.parse(body).posts;
        callback(posts);
      }
    });
  },

  comments: function (callback) {
    var that = this;
    this.props.ttcClient.getComments({method: "address", query: this.props.profile_id}, function (err, resp) {
      if (err) {
        console.log(err);
      }
      else {
        callback(resp);
      }
    });
  },

  tips: function (callback) {
    var that = this;
     xhr({
      uri: '/getTips?user=' + this.props.profile_id,    
      method: 'GET'
    }, function (err, resp, body) {
      if (err) console.log("error fetching comments from server: " + err);
      else {
        callback(JSON.parse(body).tips);
      }
    });
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

  user: function (profile, user) {
    if (profile === user) {
      return (
        <div>
          <h4> Wallet Balance: {(this.props.balance).toFixed(6)} </h4>
          <h4> Bistore Balance: {(this.props.bitstore_balance).toFixed(6)} </h4>
        </div>
      );
    }
  },

  render: function() {
    if (this.state.getProfileData) {
      return (
        <div className="container">
          <Panel>
            <center>Loading</center>
          </Panel>
        </div>
      );
    }
    else {
      var balances;
      return (
        <div className="container" key={"profile"}>
          <Panel>
            <Row>
              <Col md={3} lg={3} xl={3}>
                <IDPicture user_id={this.props.profile_id} />
              </Col>
              <Col md={9} lg={9} xl={9}>
                <h2>{this.props.profile_id + "\'s Profile"}</h2>
                <h3> someEmail@gmail.com </h3>
                {this.user(this.props.profile_id, this.props.user_id)}
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