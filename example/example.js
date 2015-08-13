var React = require('react');

var tipToComment = require('tip-to-comment-client');
var commonBlockchain = require('blockcypher-unofficial');
var testCommonWallet = require('test-common-wallet');
var ope

var OpenPublishProfile = require('../src');

var address = 'mjf6CRReqGSyvbgryjE3fbGjptRRfAL7cg';
var wif = 'cPKJaNZcbvByRpJ6GLA1jLo8U4bs3rU8AvovLUbWnDqPd1XZTgCC';
var network = 'testnet';

var commonBlock = commonBlockchain({
  network: network,
  inBrowser: true
});

var commonWallet = testCommonWallet({
  commonBlockchain: commonBlock,
  network: network,
  wif: wif
});

var tipToComment = tipToComment({
  inBrowser: true,
  commonWallet: commonWallet
});
var openpublishState = require('openpublish-state')({
  network: network
});

if (window.location.search.split("?address=") && window.location.search.split("?address=")[1]) {
  address = window.location.search.split("?address=")[1];
}

React.render(
  React.createElement(OpenPublishProfile, { 
    address: address, 
    network: network, 
    commonBlockchain: commonBlock, 
    commonWallet: commonWallet,
    tipToComment: tipToComment,
    openpublishState: openpublishState 
  }),
  document.getElementById('example')
);
