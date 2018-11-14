'use strict';

/* jshint maxstatements: 30 */

var chai = require('chai');
var should = chai.should();
var expect = chai.expect;

var ravencore = require('..');
var Asset = ravencore.Asset;

describe('Asset', function () {
  // var buf = Buffer.concat([new Buffer([60]), pubkeyhash]);

  it('can\'t build without data', function () {
    (function () {
      return new Asset();
    }).should.throw('Invalid Argument: First argument is required, please include asset data.');
  });

  it('can\'t build without hex string or buffer data', function () {
    (function () {
      return new Asset(42);
    }).should.throw('Invalid Argument: First argument must be a hex String or Buffer, or Object of props.');
  });

  it('can\'t build with bad script marker', function () {
    (function () {
      return new Asset("72766e0005415353455400e8764817000000000100");
    }).should.throw('Unknown asset script marker: 72766e00');
  });

  it('can deserialize ISSUE with IPFS', function () {
    (function () {
      var asset = new Asset("72766e7106464f4f42415200e8764817000000000001122051c87ba0b5f1bc07f19513007f22f4a9dd9211560d416094cd15de1e5080f311");
      asset.name.should.eq("FOOBAR");
      asset.amount.should.eq(100000000000);
      asset.type.should.eq(Asset.assetTypes.ISSUE);
      asset.units.should.eq(0);
      asset.reissuable.should.eq(false);
      asset.hasIPFS.should.eq(true);
      asset.IPFSHash.should.eq("QmTqu3Lk3gmTsQVtjU7rYYM37EAW4xNmbuEAp2Mjr4AV7E");
    }).should.not.throw();
  });

  it('can deserialize ISSUE without IPFS', function () {
    (function () {
      var asset = new Asset("72766e7105415353455400e8764817000000000100");
      asset.name.should.eq("ASSET");
      asset.amount.should.eq(100000000000);
      asset.type.should.eq(Asset.assetTypes.ISSUE);
      asset.units.should.eq(0);
      asset.reissuable.should.eq(true);
      asset.hasIPFS.should.eq(false);
      expect(asset).not.to.have.key('IPFSHash');
    }).should.not.throw();
  });

  it('can deserialize TRANSFER', function () {
    (function () {
      var asset = new Asset("72766e7405415353455400e40b5402000000");
      asset.name.should.eq("ASSET");
      asset.amount.should.eq(10000000000);
      asset.type.should.eq(Asset.assetTypes.TRANSFER);
    }).should.not.throw();
  });

  it('can deserialize REISSUE with IPFS', function () {
    (function () {
      var asset = new Asset("72766e7205415353455400b864d945000000ff011220da203afd5eda1f45deeafb70ae9d5c15907cd32ec2cd747c641fc1e9ab55b8e8");
      asset.name.should.eq("ASSET");
      asset.amount.should.eq(300000000000);
      asset.type.should.eq(Asset.assetTypes.REISSUE);
      expect(asset).not.to.have.key('units');
      asset.reissuable.sh
      asset.IPFSHash.should.eq("Qmd286K6pohQcTKYqnS1YhWrCiS4gz7Xi34sdwMe9USZ7u");
    }).should.not.throw();
  });

  it('can deserialize REISSUE without IPFS', function () {
    (function () {
      var asset = new Asset("72766e7205415353455400b864d9450000000201");
      asset.name.should.eq("ASSET");
      asset.amount.should.eq(300000000000);
      asset.type.should.eq(Asset.assetTypes.REISSUE);
      asset.units.should.eq(2);
      asset.reissuable.should.eq(true);
      expect(asset).not.to.have.key('IPFSHash');
    }).should.not.throw();
  });

  it('can be build from a map', function() {
    (function () {
      var asset = new Asset({name: "FROM_SCRATCH", amount: 450});
    }).should.not.throw();
  });

});
