// wrappers and helpers that hit the insight api on a full ravencore node

'use strict';

var _ = require('lodash');
var $ = require('./util/preconditions');

var request = require('request');
var browserRequest = require('browser-request');
if (typeof window !== 'undefined' && typeof window.XMLHttpRequest === 'function') {
    request = browserRequest;
}
var rp = require('request-promise')

var JSUtil = require('./util/js');
var Networks = require('./networks');

function Insight(url) {
    if (!(this instanceof Insight)) {
        return new Insight(url);
    }

    $.checkArgument(url, 'First argument is required, please include the URL of the API root (e.g. https://ravencoin.network/api)');

    var getInfo = url + '/status?q=getInfo';
    var info = {};
    request({method: 'GET', url: getInfo, json:{relaxed: true}}, function(err, res, body) {
        if (err) { return console.log(err); }
        info.network = Networks.get(body.info.network);
    });

    JSUtil.defineImmutable(this, {
        url: url,
        network: info.network
    });

    return this;
}

Insight.summarizeAssetUtxos = function (utxos) {
    var summary = {};
    for (var i in utxos) {
        var utxo = utxos[i];
        if (!_.has(summary, utxo.assetName)) {
            summary[utxo.assetName] = 0;
        }
        summary[utxo.assetName] = summary[utxo.assetName] + utxo.satoshis;
    }
    return summary;
}

Insight.prototype._toQueryString = function (obj) {
    return _.map(obj, function (v, k) {
        return encodeURIComponent(k) + '=' + encodeURIComponent(v);
    }).join('&');
}

Insight.prototype._apiUrl = function (path, params) {
    var uri = encodeURI(this.url + path);
    if (params !== undefined) {
        uri = uri + '?' + this._toQueryString(params);
    }
    return { uri: uri, json: true };
}

// generic get e.g. '/status?q=getInfo'
Insight.prototype.passthroughGet = function (url, callback) {
    var url = this._apiUrl(url);
    rp(url)
    .then(function(resp) { callback(resp); });
}

Insight.prototype.addrAssetUtxo = function (addr, asset, callback) {
    var url = this._apiUrl('/addr/' + addr + '/asset/' + asset + '/utxo');
    rp(url)
    .then(function(resp) { callback(resp); });
}

Insight.prototype.addrAssets = function (addr, callback) {
    var url = this._apiUrl('/addr/' + addr + '/asset/*/utxo');
    rp(url)
    .then(function(resp) { callback(Insight.summarizeAssetUtxos(resp)); });
}

Insight.prototype.addrTxs = function(addr, callback) {
    var url = this._apiUrl('/txs/?address=' + addr);
    rp(url)
    .then(function(resp) { callback(resp); });
}

Insight.prototype.listAssets = function(opts, callback) {
    var params = _.defaults(opts, {'asset': '*',
                                   'verbose': false,
                                   'size': 100,
                                   'skip': 0});
    var url = this._apiUrl('/assets', params);
    rp(url)
    .then(function(resp) { callback(resp); });
}

module.exports = Insight;