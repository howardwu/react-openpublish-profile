'use strict';

var React = require('react');

var Panel = require('react-bootstrap/lib/Panel');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

// A React component for wrapping around Bitstore content.
var BitstoreContent = React.createClass({
  displayName: 'BitstoreContent',

  render: function render() {
    var permalink = this.props.permalink;
    var post = this.props.post;
    var type = post.type;
    if (type) {
      type = post.type.split('/')[0];
    }

    if (!permalink) {
      if (type === "image") {
        return React.createElement(
          'a',
          null,
          React.createElement('img', { className: 'bitstoreImagePreview', src: post.uri })
        );
      } else if (type === "text") {
        return React.createElement(
          Panel,
          null,
          React.createElement(
            'a',
            null,
            React.createElement('iframe', { width: '100%', frameBorder: '0', src: post.uri })
          )
        );
      } else if (type === "audio") {
        return React.createElement(Audio, { uri: post.uri });
      } else if (type === "" || type === null) {
        return React.createElement(
          'a',
          null,
          React.createElement('img', { src: "/public/images/raw.png" })
        );
      } else if (type === "application") {
        return React.createElement(
          Panel,
          null,
          React.createElement(
            'a',
            null,
            React.createElement('iframe', { width: '100%', frameBorder: '0', src: post.uri })
          )
        );
      }
    } else if (permalink) {
      if (type === "image") {
        return React.createElement('img', { width: '100%', src: post.uri });
      } else {
        return React.createElement(
          Panel,
          null,
          React.createElement('iframe', { width: '100%', frameBorder: '0', src: post.uri })
        );
      }
    } else {
      return React.createElement(
        'div',
        null,
        'Unable to recognize content type '
      );
    }
  }
});

var Audio = React.createClass({
  displayName: 'Audio',

  getInitialState: function getInitialState() {
    return {
      activated: false
    };
  },

  toggle: function toggle() {
    this.setState({
      activated: true
    });
  },

  render: function render() {
    if (this.state.activated) {
      return React.createElement('iframe', { width: '100%', iframe: true, width: '100%', frameBorder: '0', src: this.props.uri });
    } else {
      return React.createElement(
        'a',
        { href: "permalink?sha1=" + post.sha1 },
        React.createElement(Glyphicon, { onClick: this.toggle, style: { "fontSize": "100px" }, glyph: 'play' })
      );
    }
  }
});

module.exports = BitstoreContent;