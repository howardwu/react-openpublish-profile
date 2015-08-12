var React = require('react');

var Panel = require('react-bootstrap/lib/Panel');
var Glyphicon = require('react-bootstrap/lib/Glyphicon');

// A React component for wrapping around Bitstore content.
var BitstoreContent = React.createClass({
  render: function() {
    var permalink = this.props.permalink;
    var post = this.props.post;
    var type = post.type;
    if (type){
      type = post.type.split('/')[0];
    }

    if (!permalink) {
      if (type === "image") {
        return (
          <a href={"permalink?sha1=" + post.sha1}>
            <img className="bitstoreImagePreview" src={"https://bitstore-test.blockai.com/" + post.owner + "/sha1/" + post.sha1}/>
          </a>
        );
      }
      else if (type === "text") {
        return (
          <Panel>
            <a href={"permalink?sha1=" + post.sha1}>
              <iframe width="100%" frameBorder="0" src={"https://bitstore-test.blockai.com/" + post.owner + "/sha1/" + post.sha1} />
            </a>
          </Panel>
        );
      }
      else if (type === "audio") {
        return <Audio uri={"https://bitstore-test.blockai.com/" + post.owner + "/sha1/" + post.sha1} />;
      }
      else if (type === "" || type === null) {
        return (
          <a href={"permalink?sha1=" + post.sha1}>
            <img src={"/images/raw.png"} />
          </a>
        );
      }
      else if (type === "application") {
        return (
          <Panel>
            <a href={"permalink?sha1=" + post.sha1}>
              <iframe width="100%" frameBorder="0" src={"https://bitstore-test.blockai.com/" + post.owner + "/sha1/" + post.sha1} />
            </a>
          </Panel>
        ); 
      }
    }
    else if (permalink) {
      if (type === "image") {
        return <img width="100%" src={"https://bitstore-test.blockai.com/" + post.owner + "/sha1/" + post.sha1} />;
      }
      else {
        return (
          <Panel>
            <iframe width="100%" frameBorder="0" src={"https://bitstore-test.blockai.com/" + post.owner + "/sha1/" + post.sha1} />
          </Panel>
        );
      }
    }
    else {
      return <div>Unable to recognize content type </div>;
    }  
  }
});


var Audio = React.createClass({
  getInitialState: function() {
    return{
      activated: false,
    };
  },

  toggle: function(){
    this.setState({
      activated: true
    });
  },

  render: function() {
    if (this.state.activated) {
      return <iframe width="100%" iframe width="100%" frameBorder="0" src={this.props.uri} />;
    }
    else {
      return (
        <a href={"permalink?sha1=" + post.sha1}>
          <Glyphicon onClick={this.toggle} style={{"fontSize": "100px",}} glyph='play' />
        </a>
      );
    }
  }
});

module.exports = BitstoreContent;
