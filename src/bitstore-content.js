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
          <a>
            <img className="bitstoreImagePreview" src={post.uri}/>
          </a>
        );
      }
      else if (type === "text") {
        return (
          <Panel>
            <a>
              <iframe width="100%" frameBorder="0" src={post.uri} />
            </a>
          </Panel>
        );
      }
      else if (type === "audio") {
        return <Audio uri={post.uri} />;
      }
      else if (type === "" || type === null) {
        return (
          <a>
            <img src={"/public/images/raw.png"} />
          </a>
        );
      }
      else if (type === "application") {
        return (
          <Panel>
            <a>
              <iframe width="100%" frameBorder="0" src={post.uri} />
            </a>
          </Panel>
        ); 
      }
    }
    else if (permalink) {
      if (type === "image") {
        return <img width="100%" src={post.uri} />;
      }
      else {
        return (
          <Panel>
            <iframe width="100%" frameBorder="0" src={post.uri} />
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
