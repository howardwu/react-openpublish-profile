var wallet = require('./bitcoin.js');

function createBitstoreClient(wif, network){
  var bitstore = require('bitstore')({
    privateKey: wif,
    network: network
  });
  return bitstore;
}

function getBistoreClientInfo(wif, network, callback){
   var bitstoreClient = createBitstoreClient(wif, network);
   bitstoreClient.wallet.get(function (err, res) {
    if (err) {
      callback(err, null);
    }
    else {
      callback(false, res);
    }
  });
}

module.exports = getBistoreClientInfo;