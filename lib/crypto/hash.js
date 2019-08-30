'use strict';

var crypto = require('crypto');
var BufferUtil = require('../util/buffer');
var $ = require('../util/preconditions');

var nodeX16rV2 = require('node-x16rv2');

var Hash = module.exports;

Hash.sha1 = function(buf) {
  $.checkArgument(BufferUtil.isBuffer(buf));
  return crypto.createHash('sha1').update(buf).digest();
};

Hash.sha1.blocksize = 512;

Hash.sha256 = function(buf) {
  $.checkArgument(BufferUtil.isBuffer(buf));
  return crypto.createHash('sha256').update(buf).digest();
};

Hash.sha256.blocksize = 512;

Hash.sha256sha256 = function(buf) {
  $.checkArgument(BufferUtil.isBuffer(buf));
  return Hash.sha256(Hash.sha256(buf));
};

Hash.ripemd160 = function(buf) {
  $.checkArgument(BufferUtil.isBuffer(buf));
  return crypto.createHash('ripemd160').update(buf).digest();
};

Hash.sha256ripemd160 = function(buf) {
  $.checkArgument(BufferUtil.isBuffer(buf));
  return Hash.ripemd160(Hash.sha256(buf));
};

Hash.sha512 = function(buf) {
  $.checkArgument(BufferUtil.isBuffer(buf));
  return crypto.createHash('sha512').update(buf).digest();
};

Hash.sha512.blocksize = 1024;

Hash.hmac = function(hashf, data, key) {
  //http://en.wikipedia.org/wiki/Hash-based_message_authentication_code
  //http://tools.ietf.org/html/rfc4868#section-2
  $.checkArgument(BufferUtil.isBuffer(data));
  $.checkArgument(BufferUtil.isBuffer(key));
  $.checkArgument(hashf.blocksize);

  var blocksize = hashf.blocksize / 8;

  if (key.length > blocksize) {
    key = hashf(key);
  } else if (key < blocksize) {
    var fill = new Buffer(blocksize);
    fill.fill(0);
    key.copy(fill);
    key = fill;
  }

  var o_key = new Buffer(blocksize);
  o_key.fill(0x5c);

  var i_key = new Buffer(blocksize);
  i_key.fill(0x36);

  var o_key_pad = new Buffer(blocksize);
  var i_key_pad = new Buffer(blocksize);
  for (var i = 0; i < blocksize; i++) {
    o_key_pad[i] = o_key[i] ^ key[i];
    i_key_pad[i] = i_key[i] ^ key[i];
  }

  return hashf(Buffer.concat([o_key_pad, hashf(Buffer.concat([i_key_pad, data]))]));
};

Hash.sha256hmac = function(data, key) {
  return Hash.hmac(Hash.sha256, data, key);
};

Hash.sha512hmac = function(data, key) {
  return Hash.hmac(Hash.sha512, data, key);
};

// Ravencoin x16r hashing -- use if available
Hash.X16R_SUPPORTED = false;

try {
  var X16R = require('@ravendevkit/node-x16r');
  Hash.X16R_SUPPORTED = (typeof X16R.x16r === 'function');
} catch (er) {}
console.log("X16R_SUPPORTED: " + Hash.X16R_SUPPORTED);

Hash.x16r = function (buf) {
  // no x16r available on some platforms
  if (Hash.X16R_SUPPORTED) {
    $.checkArgument(BufferUtil.isBuffer(buf));
    return BufferUtil.reverse(X16R.x16r(buf));
  } else {
    throw new Error("Attempting to perform x16r hash but it isn't supported in this environment.");
  }
};

// Ravencoin x16rv2 hashing
Hash.x16rv2 = function(buf) {
  $.checkArgument(BufferUtil.isBuffer(buf));
  return BufferUtil.reverse(nodeX16rV2.x16rv2(buf));
};
