'use strict';

var _ = require('lodash');
var BN = require('../crypto/bn');
var BufferUtil = require('../util/buffer');
var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');
var Hash = require('../crypto/hash');
var JSUtil = require('../util/js');
var Network = require('../networks');
var $ = require('../util/preconditions');

var kawpow_verifier = require('kawpow-light-verifier/build/Release/obj.target/kawpow-light-verifier')

var GENESIS_BITS = 0x1d00ffff;


// These are the mainnet timestamps. 
var X16RV2_ACTIVATION_TIME = 1569945600;
var KAWPOW_ACTIVACTION_TIME = 1588788000;

// // These are the testnet timestamps
// var X16RV2_ACTIVATION_TIME = 1567533600;
// var KAWPOW_ACTIVACTION_TIME = 1585159200;

/**
 * Instantiate a BlockHeader from a Buffer, JSON object, or Object with
 * the properties of the BlockHeader
 *
 * @param {*} - A Buffer, JSON string, or Object
 * @returns {BlockHeader} - An instance of block header
 * @constructor
 */
var BlockHeader = function BlockHeader(arg) {
  if (!(this instanceof BlockHeader)) {
    return new BlockHeader(arg);
  }
  var info = BlockHeader._from(arg);
  this.version = info.version;
  this.prevHash = info.prevHash;
  this.merkleRoot = info.merkleRoot;
  this.time = info.time;
  this.timestamp = info.time;
  this.bits = info.bits;

  if (info.time < KAWPOW_ACTIVACTION_TIME) {
    this.nonce = info.nonce;
  } else {
    this.height = info.height;
    this.nonce = info.nonce;
    this.mix_hash = info.mix_hash;
  }

  if (info.hash) {
    $.checkState(
      this.hash === info.hash,
      'Argument object hash property does not match block hash.'
    );
  }

  return this;
};

/**
 * @param {*} - A Buffer, JSON string or Object
 * @returns {Object} - An object representing block header data
 * @throws {TypeError} - If the argument was not recognized
 * @private
 */
BlockHeader._from = function _from(arg) {
  var info = {};
  if (BufferUtil.isBuffer(arg)) {
    info = BlockHeader._fromBufferReader(BufferReader(arg));
  } else if (_.isObject(arg)) {
    info = BlockHeader._fromObject(arg);
  } else {
    throw new TypeError('Unrecognized argument for BlockHeader');
  }
  return info;
};

/**
 * @param {Object} - A JSON string
 * @returns {Object} - An object representing block header data
 * @private
 */
BlockHeader._fromObject = function _fromObject(data) {
  $.checkArgument(data, 'data is required');
  var prevHash = data.prevHash;
  var merkleRoot = data.merkleRoot;
  if (_.isString(data.prevHash)) {
    prevHash = BufferUtil.reverse(new Buffer(data.prevHash, 'hex'));
  }
  if (_.isString(data.merkleRoot)) {
    merkleRoot = BufferUtil.reverse(new Buffer(data.merkleRoot, 'hex'));
  }
  var info = {
    hash: data.hash,
    version: data.version,
    prevHash: prevHash,
    merkleRoot: merkleRoot,
    time: data.time,
    timestamp: data.time,
    bits: data.bits,
    height: data.height,
    nonce: data.nonce,
    mix_hash: data.mix_hash
  };
  return info;
};

/**
 * @param {Object} - A plain JavaScript object
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromObject = function fromObject(obj) {
  var info = BlockHeader._fromObject(obj);
  return new BlockHeader(info);
};

/**
 * @param {Binary} - Raw block binary data or buffer
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromRawBlock = function fromRawBlock(data) {
  if (!BufferUtil.isBuffer(data)) {
    data = new Buffer(data, 'binary');
  }
  var br = BufferReader(data);
  br.pos = BlockHeader.Constants.START_OF_HEADER;
  var info = BlockHeader._fromBufferReader(br);
  return new BlockHeader(info);
};

/**
 * @param {Buffer} - A buffer of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromBuffer = function fromBuffer(buf) {
  var info = BlockHeader._fromBufferReader(BufferReader(buf));
  return new BlockHeader(info);
};

/**
 * @param {string} - A hex encoded buffer of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromString = function fromString(str) {
  var buf = new Buffer(str, 'hex');
  return BlockHeader.fromBuffer(buf);
};

/**
 * @param {BufferReader} - A BufferReader of the block header
 * @returns {Object} - An object representing block header data
 * @private
 */
BlockHeader._fromBufferReader = function _fromBufferReader(br) {
  var info = {};
  info.version = br.readInt32LE();
  info.prevHash = br.read(32);
  info.merkleRoot = br.read(32);
  info.time = br.readUInt32LE();
  info.bits = br.readUInt32LE();

  if (info.time < KAWPOW_ACTIVACTION_TIME) {
    info.nonce = br.readUInt32LE();
  } else {
    info.height = br.readUInt32LE();
    info.nonce = br.readUInt64LEBN();
    info.mix_hash = br.read(32);
  }
  
  return info;
};

/**
 * @param {BufferReader} - A BufferReader of the block header
 * @returns {BlockHeader} - An instance of block header
 */
BlockHeader.fromBufferReader = function fromBufferReader(br) {
  var info = BlockHeader._fromBufferReader(br);
  return new BlockHeader(info);
};

/**
 * @returns {Object} - A plain object of the BlockHeader
 */
BlockHeader.prototype.toObject = BlockHeader.prototype.toJSON = function toObject() {

  if (this.time < KAWPOW_ACTIVACTION_TIME) {
    return {
      hash: this.hash,
      version: this.version,
      prevHash: BufferUtil.reverse(this.prevHash).toString('hex'),
      merkleRoot: BufferUtil.reverse(this.merkleRoot).toString('hex'),
      time: this.time,
      bits: this.bits,
      nonce: this.nonce
    };
  } else {
    return {
      hash: this.hash,
      version: this.version,
      prevHash: BufferUtil.reverse(this.prevHash).toString('hex'),
      merkleRoot: BufferUtil.reverse(this.merkleRoot).toString('hex'),
      time: this.time,
      bits: this.bits,
      height: this.height,
      nonce: this.nonce,
      mix_hash: BufferUtil.reverse(this.mix_hash).toString('hex')
    };
  }
};

/**
 * @returns {Buffer} - A Buffer of the BlockHeader
 */
BlockHeader.prototype.toBuffer = function toBuffer() {
  return this.toBufferWriter().concat();
};

/**
 * @returns {Buffer} - A Buffer of the BlockHeader
 */
BlockHeader.prototype.toHeaderBuffer = function toHeaderBuffer() {
  return this.toHeaderBufferWriter().concat();
};

/**
 * @returns {string} - A hex encoded string of the BlockHeader
 */
BlockHeader.prototype.toString = function toString() {
  return this.toBuffer().toString('hex');
};

/**
 * @param {BufferWriter} - An existing instance BufferWriter
 * @returns {BufferWriter} - An instance of BufferWriter representation of the BlockHeader
 */
BlockHeader.prototype.toBufferWriter = function toBufferWriter(bw) {
  if (!bw) {
    bw = new BufferWriter();
  }

  bw.writeInt32LE(this.version);
  bw.write(this.prevHash);
  bw.write(this.merkleRoot);
  bw.writeUInt32LE(this.time);
  bw.writeUInt32LE(this.bits);
  if (this.time < KAWPOW_ACTIVACTION_TIME) {
    bw.writeUInt32LE(this.nonce);
  } else {
    bw.writeUInt32LE(this.height);
    bw.writeUInt64LEBN(this.nonce);
    bw.write(this.mix_hash);
  }

  return bw;
};

/**
 * Returns the target difficulty for this block
 * @param {Number} bits
 * @returns {BN} An instance of BN with the decoded difficulty bits
 */
BlockHeader.prototype.getTargetDifficulty = function getTargetDifficulty(bits) {
  bits = bits || this.bits;

  var target = new BN(bits & 0xffffff);
  var mov = 8 * ((bits >>> 24) - 3);
  while (mov-- > 0) {
    target = target.mul(new BN(2));
  }
  return target;
};

/**
 * @param {BufferWriter} - An existing instance BufferWriter
 * @returns {BufferWriter} - An instance of BufferWriter representation of the BlockHeader used for getting the kawpow header hash
 */
BlockHeader.prototype.toHeaderBufferWriter = function toHeaderBufferWriter(bw) {
  if (!bw) {
    bw = new BufferWriter();
  }

  bw.writeInt32LE(this.version);
  bw.write(this.prevHash);
  bw.write(this.merkleRoot);
  bw.writeUInt32LE(this.time);
  bw.writeUInt32LE(this.bits);
  bw.writeUInt32LE(this.height);

  return bw;
};

/**
 * @link https://en.bitcoin.it/wiki/Difficulty
 * @return {Number}
 */
BlockHeader.prototype.getDifficulty = function getDifficulty() {
  var difficulty1TargetBN = this.getTargetDifficulty(GENESIS_BITS).mul(new BN(Math.pow(10, 8)));
  var currentTargetBN = this.getTargetDifficulty();

  var difficultyString = difficulty1TargetBN.div(currentTargetBN).toString(10);
  var decimalPos = difficultyString.length - 8;
  difficultyString = difficultyString.slice(0, decimalPos) + '.' + difficultyString.slice(decimalPos);

  return parseFloat(difficultyString);
};

/**
 * @returns {Buffer} - The little endian hash buffer of the header
 */
BlockHeader.prototype._getHash = function hash() {
  var buf = this.toBuffer();

  if (this.time >= KAWPOW_ACTIVACTION_TIME) {
    var headerbuf = this.toHeaderBuffer();

    // Create the string objects
    var headerhash = BufferUtil.reverse(Hash.sha256sha256(headerbuf)).toString('hex');
    var mixhash = BufferUtil.reverse(this.mix_hash).toString('hex');
    var nonce = this.nonce.toString('hex');

    // Ensure that the nonce is 16 characters
    if (nonce.length != 16) {
      while (nonce.length != 16) {
        nonce = '0' + nonce;
      }
    }

    // Create the buffers
    var header_hash = Buffer.from(headerhash, 'utf8');
    var mix_hash = Buffer.from(mixhash, 'utf8');
    var str_nonce = Buffer.from(nonce, 'utf8');
    var boundary = Buffer.from("ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", 'utf8');

    // Compute kawpow hash
    let out = kawpow_verifier.node_light_verify(header_hash, mix_hash, str_nonce, boundary);
    return out;
  }

  if (this.time >= X16RV2_ACTIVATION_TIME) {
    return BufferUtil.reverse(Hash.x16rv2(buf));
  } else {
    return BufferUtil.reverse(Hash.x16r(buf));
  }
};

var idProperty = {
  configurable: false,
  enumerable: true,
  /**
   * @returns {string} - The big endian hash buffer of the header
   */
  get: function() {
    if (!this._id) {
      if (this.time < KAWPOW_ACTIVACTION_TIME) {
        this._id = BufferReader(this._getHash()).readReverse().toString('hex');
      } else {
        this._id = this._getHash();
      }
    }
    return this._id;
  },
  set: _.noop
};
Object.defineProperty(BlockHeader.prototype, 'id', idProperty);
Object.defineProperty(BlockHeader.prototype, 'hash', idProperty);

/**
 * @returns {Boolean} - If timestamp is not too far in the future
 */
BlockHeader.prototype.validTimestamp = function validTimestamp() {
  var currentTime = Math.round(new Date().getTime() / 1000);
  if (this.time > currentTime + BlockHeader.Constants.MAX_TIME_OFFSET) {
    return false;
  }
  return true;
};

/**
 * @returns {Boolean} - If the proof-of-work hash satisfies the target difficulty
 */
BlockHeader.prototype.validProofOfWork = function validProofOfWork() {
  //var pow = new BN(this.id, 'hex');

  // TODO add KAWPOW proofOfWork checks. 

  var pow = 0;

  if (this.time >= X16RV2_ACTIVATION_TIME) {
    pow = new BN(Hash.x16rv2(this.toBuffer()));
  } else {
    pow = new BN(Hash.x16r(this.toBuffer()));
  }

  var target = this.getTargetDifficulty();

  if (pow.cmp(target) > 0) {
    return false;
  }
  return true;
};

/**
 * @returns {string} - A string formatted for the console
 */
BlockHeader.prototype.inspect = function inspect() {
  return '<BlockHeader ' + this.id + '>';
};

BlockHeader.Constants = {
  START_OF_HEADER: 8, // Start buffer position in raw block data
  MAX_TIME_OFFSET: 2 * 60 * 60, // The max a timestamp can be in the future
  LARGEST_HASH: new BN('10000000000000000000000000000000000000000000000000000000000000000', 'hex')
};

module.exports = BlockHeader;
