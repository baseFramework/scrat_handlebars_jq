'use strict';

var net = require('utils/net');

exports.query = function (path, offset, limit) {
    var url = 'log?path=' + path + '&offset=' + offset + '&limit=' + limit;
    return net.get(url);
};

exports.list = function (type, env_id) {
    var url = 'log/list?type=' + type + '&env_id=' + env_id;
    return net.get(url);
}
