'use strict';

var React = require('react');
var xhr = require('xhr');

var openpublish = require('openpublish');
var Loader = require('halogen/ClipLoader');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

var TipButton = React.createClass({
  displayName: 'TipButton',

  getInitialState: function getInitialState() {
    return {
      isLoading: false,
      hasTipped: this.props.hasTipped
    };
  },

  tipAmount: function tipAmount(callback) {
    xhr({
      url: 'https://api.bitcoinaverage.com/ticker/global/USD/',
      useXDR: true,
      method: 'GET'
    }, function (err, resp, body) {
      if (err) {
        console.log("error fetching bitcoin price" + err);
        callback(null);
      } else {
        var price = parseFloat(JSON.parse(body).last);
        callback(Math.round(0.03 / price * 100000000));
      }
    });
  },

  tipUpdate: function tipUpdate(post) {
    if (this.props.user_id) {
      if (post.owner === this.props.user_id) {
        this.setState({
          isLoading: false, hasTipped: true,
          tipMessage: "Can't tip your own post!"
        });
        return;
      }
      var that = this;
      this.setState({ isLoading: true });

      this.tipAmount(function (amount) {
        var amount = amount || 13000;
        var destination = post.owner;
        var sha1 = post.sha1;
        var address = that.props.user_id;
        openpublish.tip({
          destination: destination,
          sha1: sha1,
          address: address,
          amount: amount,
          commonWallet: that.props.wallet,
          commonBlockchain: that.props.blockchain
        }, function (error, tipTx) {
          if (error) {
            console.log("did not update balances: " + error);
            that.setState({ isLoading: false, hasTipped: false,
              tipMessage: "error processing your tip. Make sure you have enough bitcoin in your wallet!" });
          } else {
            var tipBody = { owner: post.owner, sha1: post.sha1, txid: tipTx.txid };
            xhr({
              uri: '/tip',
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(tipBody)
            }, function (error, response, body) {
              if (response.statusCode === 500) {
                console.log("couldnt send tip to server" + error);
              } else {
                post.tips += 1;
                that.setState({ isLoading: false, hasTipped: true, post: post,
                  tipMessage: "Tip successful. Awaiting confirmation from the blockchain." });
                if (that.props.success) {
                  tipBody.tipper = that.props.user_id;
                  that.props.success(tipBody);
                }
              }
            });
          }
        });
      });
    } else {
      this.setState({
        isLoading: false,
        hasTipped: false,
        tipMessage: "You must be logged in to tip!"
      });
    }
  },

  render: function render() {
    if (this.state.isLoading) {
      return React.createElement(
        'div',
        { className: 'post-button' },
        React.createElement(Loader, { style: { float: "left" }, color: '#f11c08', size: '20px' })
      );
    } else {
      if (this.state.hasTipped) {
        return React.createElement(
          'div',
          { className: 'post-button' },
          React.createElement(Glyphicon, { glyph: 'heart', style: { color: "red" } }),
          ' ',
          this.props.post.tips
        );
      } else {
        return React.createElement(
          'div',
          { className: 'post-button', onClick: this.tipUpdate.bind(null, this.props.post) },
          React.createElement(Glyphicon, { glyph: 'heart' }),
          ' ',
          this.props.post.tips
        );
      }
    }
  }
});

module.exports = TipButton;