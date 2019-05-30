// wrappers and helpers that hit the insight api on a full ravencore node

'use strict';

var _ = require('lodash');
var $ = require('./util/preconditions');
var request = require('browser-request');
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

Insight.prototype._apiUrl = function(path) {
    return encodeURI(this.url + path);
}

// generic get
Insight.prototype.passthroughGet = function (url, callback) {
    return request({ method: 'GET', url: this._apiUrl(url), json: { relaxed: true } }, callback);
}

Insight.prototype.addrAssetUtxo = function (addr, asset, callback) {
    var url = this._apiUrl('/addr/' + addr + '/asset/' + asset + '/utxo');
    return request({ method: 'GET', url: url, json: { relaxed: true } }, callback);
}

Insight.summarizeAssetUtxos = function (utxos) {
    console.log(utxos);
    var summary = {};
    for (var i in utxos) {
        var utxo = utxos[i];
        console.log(utxo);
        if (!_.has(summary, utxo.assetName)) {
            summary[utxo.assetName] = 0;
        }
        summary[utxo.assetName] = summary[utxo.assetName] + utxo.satoshis;
    }
    return summary;
}

Insight.prototype.addrAssets = function (addr, callback) {
    var url = this._apiUrl('/addr/' + addr + '/asset/*/utxo');
    return request({ method: 'GET', url: url, json: { relaxed: true } }, function(err, res, body) {
        if (err) { return console.log(err); }
        callback(Insight.summarizeAssetUtxos(body));
    });
}

Insight.prototype.addrTxs = function(addr, callback) {
    var url = this._apiUrl('/txs/?address=' + addr);
    return request({ method: 'GET', url: url, json: { relaxed: true } }, callback);
}

module.exports = Insight;
