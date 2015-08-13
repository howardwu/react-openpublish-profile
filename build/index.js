'use strict';

var React = require('react');
var xhr = require('xhr');

var Post = require('./post.js');
var Comment = require('./comment.js');
var IDPicture = require('./id-picture.js');
var getBitstoreBalance = require('./bitstore.js');

var Row = require('react-bootstrap/lib/Row');
var Col = require('react-bootstrap/lib/Col');
var Nav = require('react-bootstrap/lib/Nav');
var Panel = require('react-bootstrap/lib/Panel');
var Button = require('react-bootstrap/lib/Button');
var NavItem = require('react-bootstrap/lib/NavItem');
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

var Profile = React.createClass({
  displayName: 'Profile',

  getInitialState: function getInitialState() {
    return {
      getProfileData: true,
      balance: "Loading...",
      bitstore_balance: "Loading..."
    };
  },

  componentDidMount: function componentDidMount() {
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

  balance: function balance() {
    var that = this;
    this.props.commonBlockchain.Addresses.Summary([this.props.address], function (err, resp) {
      if (err) {
        console.log("error retrieving balance from common-blockchain");
      } else {
        var balance = resp[0].balance / 100000000;
        getBitstoreBalance(that.props.wif, that.props.network, function (error, bitstoreBalance) {
          that.setState({
            balance: balance,
            bitstore_balance: bitstoreBalance.body.balance / 100000000,
            updateBalance: false
          });
        });
      }
    });
  },

  posts: function posts(callback) {
    this.props.openpublishState.findAssetsByUser({ address: this.props.address }, function (err, assets) {
      if (!err) {
        callback(assets.posts);
      }
    });
  },

  tips: function tips(callback) {
    // this.props.openpublishState.findTipsByUser({ address: this.props.address },
    //   function (err, tips) {
    //     if (!err) {
    //       callback(tips);
    //     }
    //   }
    // );

    var that = this;
    xhr({
      url: 'http://coinvote-testnet.herokuapp.com/getTips?user=' + this.props.address,
      method: 'GET'
    }, function (err, resp, body) {
      if (err) console.log("error fetching comments from server: " + err);else {
        callback(JSON.parse(body));
      }
    });
  },

  comments: function comments(callback) {
    this.props.tipToComment.getComments({
      method: "address",
      query: this.props.address
    }, function (err, resp) {
      if (err) {
        console.error(err);
      } else {
        callback(resp);
      }
    });
  },

  renderProfile: function renderProfile(posts, comments, tips) {
    var renderTips = [];
    var renderComments = [];
    var renderPosts = [];
    for (var i = 0; i < tips.length; i++) {
      var tip = tips[i];
      renderTips.push(this.generateTip("tips" + i, tip));
    }
    for (var i = comments.length - 1; i >= 0; i--) {
      var comment = comments[i];
      comment.body = comment.comment;
      renderComments.push(React.createElement(Comment, { key: "comments: " + i, comment: comment }));
    }
    for (var i = 0; i < posts.length; i++) {
      var post = posts[i];
      var tipped = false;
      renderPosts.push(React.createElement(Post, { key: i,
        refKey: i,
        post: posts[i],
        tipped: tipped,
        network: this.props.network,
        user_id: this.props.commonWallet.address,
        wallet: this.props.commonWallet,
        blockchain: this.props.commonBlockchain,
        tccClient: this.props.tipToComment }));
    }
    this.setState({
      posts: renderPosts,
      comments: renderComments,
      tips: renderTips,
      content: renderPosts,
      getProfileData: false
    });
  },

  generateTip: function generateTip(key, tip) {
    return React.createElement(
      Panel,
      { key: key },
      React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { style: { float: "left" } },
          React.createElement(
            'a',
            null,
            tip.tipper
          ),
          ' tipped ',
          React.createElement(
            'a',
            null,
            tip.post
          )
        ),
        React.createElement(
          'div',
          { style: { float: "right", fontSize: "15px", fontWeight: "bold" } },
          postTime(tip.datetime)
        )
      ),
      React.createElement('br', null),
      React.createElement(
        'div',
        null,
        React.createElement(
          'div',
          { className: 'tipPicture' },
          React.createElement(IDPicture, { size: 50, user_id: tip.tipper })
        ),
        React.createElement(Glyphicon, { glyph: 'arrow-right', className: 'tipArrow' }),
        React.createElement(
          'div',
          { className: 'tipPicture' },
          React.createElement(IDPicture, { size: 50, user_id: tip.owner })
        )
      ),
      React.createElement('br', null),
      ' ',
      React.createElement('br', null),
      React.createElement('hr', null),
      React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          null,
          'Transaction ID: ',
          React.createElement(
            'a',
            { href: "https://www.blocktrail.com/tBTC/tx/" + tip.txid },
            tip.txid
          )
        )
      )
    );
  },

  renderContent: function renderContent(type) {
    if (type === "posts" && this.state.content !== this.state.posts) {
      this.setState({
        content: this.state.posts
      });
    } else if (type === "comments" && this.state.content !== this.state.comments) {
      console.log(this.state.comments);
      this.setState({
        content: this.state.comments
      });
    } else if (type === "tips" && this.state.content !== this.state.tips) {
      this.setState({
        content: this.state.tips
      });
    }
  },

  render: function render() {
    if (this.state.getProfileData) {
      return React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
          Panel,
          null,
          React.createElement(
            'center',
            null,
            'Loading Profile'
          )
        )
      );
    } else {
      var balances;
      return React.createElement(
        'div',
        { className: 'container' },
        React.createElement(
          Panel,
          null,
          React.createElement(
            Row,
            null,
            React.createElement(
              Col,
              { md: 3, lg: 3, xl: 3 },
              React.createElement(IDPicture, { user_id: this.props.address })
            ),
            React.createElement(
              Col,
              { md: 9, lg: 9, xl: 9 },
              React.createElement(
                'h2',
                null,
                this.props.address + "\'s Profile"
              ),
              React.createElement(
                'h4',
                null,
                'Wallet Balance: ',
                this.state.balance
              ),
              React.createElement(
                'h4',
                null,
                'Bistore Balance: ',
                this.state.bitstore_balance
              )
            )
          )
        ),
        React.createElement(
          Row,
          null,
          React.createElement(
            Col,
            { md: 3, lg: 3, xl: 3 },
            React.createElement(
              Panel,
              null,
              React.createElement(
                Nav,
                { className: 'profileOption', stacked: true },
                React.createElement(
                  NavItem,
                  { eventKey: 1, onClick: this.renderContent.bind(null, "posts") },
                  'Posts'
                ),
                React.createElement(
                  NavItem,
                  { bsSeventKey: 2, onClick: this.renderContent.bind(null, "comments") },
                  'Comments'
                ),
                React.createElement(
                  NavItem,
                  { eventKey: 3, onClick: this.renderContent.bind(null, "tips") },
                  'Tips'
                )
              )
            )
          ),
          React.createElement(
            Col,
            { md: 9, lg: 9, xl: 9 },
            this.state.content
          )
        )
      );
    }
  }
});

module.exports = Profile;