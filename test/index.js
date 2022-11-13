'use strict';

var should = require('chai').should();
var meowcoincore = require('../');

describe('#versionGuard', function() {
  it('global._meowcoincore should be defined', function() {
    should.equal(global._meowcoincore, meowcoincore.version);
  });

  it('throw an error if version is already defined', function() {
    (function() {
      meowcoincore.versionGuard('version');
    }).should.throw('More than one instance of meowcoincore');
  });
});
