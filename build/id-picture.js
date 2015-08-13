'use strict';

var React = require('react');
var MD5 = require('crypto-js/md5');

var IDPicture = React.createClass({
  displayName: 'IDPicture',

  render: function render() {
    var md5hash = MD5(this.props.user_id);
    if (this.props.nav) {
      if (this.props.size) {
        return React.createElement('img', { style: { height: this.props.size, width: this.props.size }, src: "http://secure.gravatar.com/avatar/" + md5hash.toString() + "?d=retro&s=200" });
      } else {
        return React.createElement('img', { src: "http://secure.gravatar.com/avatar/" + md5hash.toString() + "?d=retro&s=200" });
      }
    } else if (this.props.size) {
      return React.createElement(
        'a',
        null,
        React.createElement(
          'div',
          { className: 'hoverIdPicture' },
          React.createElement('img', { style: { height: this.props.size, width: this.props.size }, src: "http://secure.gravatar.com/avatar/" + md5hash.toString() + "?d=retro&s=200" })
        )
      );
    } else {
      return React.createElement('img', { src: "http://secure.gravatar.com/avatar/" + md5hash.toString() + "?d=retro&s=200" });
    }
  }
});

module.exports = IDPicture;