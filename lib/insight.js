// wrappers and helpers that hit the insight api on a full ravencore node

'use strict';

var $ = require('./util/preconditions');
var request = require('browser-request');

function Insight(url) {

    if (!(this instanceof Insight)) {
        return new Insight(url);
    }

    $.checkArgument(url, 'First argument is required, please include the URL of the API root (e.g. https://ravencoin.network/api)');

    var getInfo = url + '/status?q=getInfo';
    request({method: 'GET', url: getInfo, json:{relaxed:true}}, (err, res, body) => {
        if (err) { return console.log(err); }
        console.log(body.url);
        console.log(body.explanation);
    });
}

module.exports = Insight;
