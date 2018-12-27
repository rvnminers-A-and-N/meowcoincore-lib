'use strict';

var _ = require('lodash');
var $ = require('./util/preconditions');
var errors = require('./errors');
var BufferReader = require('./encoding/bufferreader');
var BufferUtil = require('./util/buffer');
var buffer = require('buffer');
var JSUtil = require('./util/js');
var Base58 = require('./encoding/base58')

/**
 * Instantiate an asset from a RVNX hex String or Buffer, or a map of properties.
 */
function Asset(from) {
  if (!(this instanceof Asset)) {
    return new Asset(from);
  }
    
  $.checkArgument(from, 'First argument is required, please include asset data.');

  $.checkArgument(BufferUtil.isBuffer(from) || typeof from === 'string' || typeof from === 'object', 
                  'First argument must be a hex String or Buffer, or Object of props.');

  var info;
  if (BufferUtil.isBuffer(from)) {
    info = Asset._fromBuffer(from);
  } else if (typeof from === 'string') {
    info = Asset._fromHex(from);
  } else if (typeof from === 'object') {
    info = from;
  } else {
    throw new TypeError();
  }

  JSUtil.defineImmutable(this, info);

  return this;
}

Asset.scriptMarkers = {};
Asset.scriptMarkers.ISSUE = new buffer.Buffer('72766e71', 'hex');
Asset.scriptMarkers.TRANSFER = new buffer.Buffer('72766e74', 'hex');
Asset.scriptMarkers.REISSUE = new buffer.Buffer('72766e72', 'hex');

// matches out.scriptPubKey.type in getrawtransaction (verbose)
Asset.scriptTypes = {};
Asset.scriptTypes.ISSUE = "new_asset";
Asset.scriptTypes.TRANSFER = "transfer_asset";
Asset.scriptTypes.REISSUE = "reissue_asset";
Asset.isAssetScriptType = function(type) { return _.endsWith(type, 'asset'); }

Asset.assetTypes = {};
Asset.assetTypes.ISSUE = 'Issue';
Asset.assetTypes.TRANSFER = 'Transfer';
Asset.assetTypes.REISSUE = 'Reissue';

Asset._fromBuffer = function(buffer) {
  var info = {}
  var br = new BufferReader(buffer);
  var scriptMarker = br.read(4);
  info.name = br.readVarLengthBuffer().toString('ascii');
  info.amount = br.readInt64LEBN().toNumber();
  if (BufferUtil.equals(scriptMarker, Asset.scriptMarkers.ISSUE)) {
    info.type = Asset.assetTypes.ISSUE;
    info.units = br.readInt8();
    info.reissuable = !!br.readInt8();
    info.hasIPFS = !!br.readInt8();
    if (info.hasIPFS) {
      br.read(2)
      info.IPFSHash = Base58.encode(Buffer.concat([new Buffer([0x12, 0x20]), br.read(32)]))
    }
  } else if (BufferUtil.equals(scriptMarker, Asset.scriptMarkers.TRANSFER)) {
    info.type = Asset.assetTypes.TRANSFER;
  } else if (BufferUtil.equals(scriptMarker, Asset.scriptMarkers.REISSUE)) {
    info.type = Asset.assetTypes.REISSUE;
    var units = br.readInt8();
    if (units >= 0) {
      info.units = units;
    }
    info.reissuable = !!br.readInt8();
    if (!br.finished()) {
      br.read(2);
      info.IPFSHash = Base58.encode(Buffer.concat([new Buffer([0x12, 0x20]), br.read(32)]));
    }
  } else {
    throw new TypeError("Unknown asset script marker: " + BufferUtil.bufferToHex(scriptMarker));
  }
  return info;
};

Asset._fromHex = function(str) {
  return Asset._fromBuffer(new buffer.Buffer(str, 'hex'));
};

module.exports = Asset;