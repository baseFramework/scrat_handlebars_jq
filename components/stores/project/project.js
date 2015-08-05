'use strict';

var net = require('utils/net');

exports.query = function (id) {
    var url = 'project?id=' + id;
    return net.get(url);
};

exports.queryByCode = function (code) {
    var url = 'project/code?code=' + code;
    return net.get(url);
}

exports.list = function (code) {
    var url = 'project/list';
    return net.get(url);
}

exports.updateBeforeDel = function (projId, beforeDel) {
    var data = {
        proj_id: projId,
        before_del: beforeDel
    };
    return net.put('/project/setup', {data: data});
}