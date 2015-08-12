var React = require('react');

var OpenPublishProfile = require('../src');

var address = 'mjf6CRReqGSyvbgryjE3fbGjptRRfAL7cg';
var network = 'testnet';

if (window.location.search.split("?address=") && window.location.search.split("?address=")[1]) {
  address = window.location.search.split("?address=")[1];
}

React.render(
  React.createElement(OpenPublishProfile, { address: address, network: network }),
  document.getElementById('example')
);
