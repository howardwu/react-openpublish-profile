var React = require('react');

var OpenPublishProfile = require('../src');

var address = 'mjf6CRReqGSyvbgryjE3fbGjptRRfAL7cg';
var wif = 'cPKJaNZcbvByRpJ6GLA1jLo8U4bs3rU8AvovLUbWnDqPd1XZTgCC';
var network = 'testnet';

if (window.location.search.split("?address=") && window.location.search.split("?address=")[1]) {
  address = window.location.search.split("?address=")[1];
}

React.render(
  React.createElement(OpenPublishProfile, { address: address, wif: wif, network: network }),
  document.getElementById('example')
);
