var bitcoin = require('bitcoinjs-lib');
var bigi = require('bigi');

function networkCheck(network) {
  return network === 'testnet' ? bitcoin.networks.testnet : null;
}

function addressFromSeed(seed, network) {
  network = networkCheck(network);
  var hash = bitcoin.crypto.sha256(seed);
  var d = bigi.fromBuffer(hash);
  var key = new bitcoin.ECKey(d);
  return key.pub.getAddress(network).toString();
}

function WIFKeyFromSeed(seed, network) {
  network = networkCheck(network);
  var hash = bitcoin.crypto.sha256(seed);
  var d = bigi.fromBuffer(hash);
  var key = new bitcoin.ECKey(d);
  var wif = key.toWIF(network);
  return wif;
}

function getAddressFromWIF(wif, network) {
  network = networkCheck(network);
  var key = bitcoin.ECKey.fromWIF(wif);
  var address = key.pub.getAddress(network).toString();
  return address;
}

function generateRandomWIF(network) {
  network = networkCheck(network);
  var key = bitcoin.ECKey.makeRandom();
  return key.toWIF(network).toString();
}

module.exports.generateRandomWIF = generateRandomWIF;
module.exports.addressFromSeed = addressFromSeed;
module.exports.WIFKeyFromSeed = WIFKeyFromSeed;
module.exports.getAddressFromWIF = getAddressFromWIF;
