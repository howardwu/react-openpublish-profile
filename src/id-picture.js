var React = require('react');
var MD5 = require('crypto-js/md5');

var IDPicture = React.createClass({
  render: function() {
    var md5hash =  MD5(this.props.user_id);
    if (this.props.nav) {
      if (this.props.size) {
        return <img style={{height: this.props.size, width: this.props.size}} src={"http://secure.gravatar.com/avatar/" + md5hash.toString() + "?d=retro&s=200"} />;
      }
      else {
        return <img src={"http://secure.gravatar.com/avatar/" + md5hash.toString() + "?d=retro&s=200"} />;
      }
    }
    else if (this.props.size) {
      return(
        <a href={"/profile?user=" + this.props.user_id}>
          <div className="hoverIdPicture"> 
            <img style={{height: this.props.size, width: this.props.size}} src={"http://secure.gravatar.com/avatar/" + md5hash.toString() + "?d=retro&s=200"} />
          </div>
        </a>
      );
    }
    else {
      return <img src={"http://secure.gravatar.com/avatar/" + md5hash.toString() + "?d=retro&s=200"} />;
    }
  }
});

module.exports = IDPicture;
