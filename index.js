'use strict';

var meowcoincore = module.exports;

// module information
meowcoincore.version = 'v' + require('./package.json').version;
meowcoincore.versionGuard = function(global_version, check_version) {
  if (global_version !== undefined && global_version !== check_version) {
    var message = 'More than one version of meowcoincore-lib found. ' +
      'Please make sure to require meowcoincore-lib and check that submodules do' +
      ' not also include their own meowcoincore-lib versions.';
    throw new Error(message);
  }
};
meowcoincore.versionGuard(global._meowcoincore, meowcoincore.version);
global._meowcoincore = meowcoincore.version;

// crypto
meowcoincore.crypto = {};
meowcoincore.crypto.BN = require('./lib/crypto/bn');
meowcoincore.crypto.ECDSA = require('./lib/crypto/ecdsa');
meowcoincore.crypto.Hash = require('./lib/crypto/hash');
meowcoincore.crypto.Random = require('./lib/crypto/random');
meowcoincore.crypto.Point = require('./lib/crypto/point');
meowcoincore.crypto.Signature = require('./lib/crypto/signature');

// encoding
meowcoincore.encoding = {};
meowcoincore.encoding.Base58 = require('./lib/encoding/base58');
meowcoincore.encoding.Base58Check = require('./lib/encoding/base58check');
meowcoincore.encoding.BufferReader = require('./lib/encoding/bufferreader');
meowcoincore.encoding.BufferWriter = require('./lib/encoding/bufferwriter');
meowcoincore.encoding.Varint = require('./lib/encoding/varint');

// utilities
meowcoincore.util = {};
meowcoincore.util.buffer = require('./lib/util/buffer');
meowcoincore.util.js = require('./lib/util/js');
meowcoincore.util.preconditions = require('./lib/util/preconditions');

// errors thrown by the library
meowcoincore.errors = require('./lib/errors');

// main meowcoincoin library
meowcoincore.Address = require('./lib/address');
meowcoincore.Asset = require('./lib/asset');
meowcoincore.Block = require('./lib/block');
meowcoincore.MerkleBlock = require('./lib/block/merkleblock');
meowcoincore.BlockHeader = require('./lib/block/blockheader');
meowcoincore.HDPrivateKey = require('./lib/hdprivatekey.js');
meowcoincore.HDPublicKey = require('./lib/hdpublickey.js');
meowcoincore.Networks = require('./lib/networks');
meowcoincore.Opcode = require('./lib/opcode');
meowcoincore.PrivateKey = require('./lib/privatekey');
meowcoincore.PublicKey = require('./lib/publickey');
meowcoincore.Script = require('./lib/script');
meowcoincore.Transaction = require('./lib/transaction');
meowcoincore.URI = require('./lib/uri');
meowcoincore.Unit = require('./lib/unit');

// Insight-related
// use XMLHttpRequest in browser window if available, otherwise use wrapper
// this is to satisfy browser-request which looks for it in global scope
var XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;
if (typeof window !== 'undefined' && typeof window.XMLHttpRequest === 'function') {
  // console.log("XMLHttpRequest is available in window");
} else {
  // console.log("setting XMLHttpRequest in global");
  global.XMLHttpRequest = XMLHttpRequest;
}
meowcoincore.Insight = require('./lib/insight');

// dependencies, subject to change
meowcoincore.deps = {};
meowcoincore.deps.bnjs = require('bn.js');
meowcoincore.deps.bs58 = require('bs58');
meowcoincore.deps.Buffer = Buffer;
meowcoincore.deps.elliptic = require('elliptic');
meowcoincore.deps._ = require('lodash');
meowcoincore.deps.nodeX16rV2 = require('node-x16rv2');
meowcoincore.deps.nodeX16r = require('node-x16r');

// Internal usage, exposed for testing/advanced tweaking
meowcoincore.Transaction.sighash = require('./lib/transaction/sighash');
