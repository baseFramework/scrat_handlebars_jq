'use strict';

var net = require('utils/net');

exports.query = function (taskId) {
    var url = '/monitor/alarm/task/' + taskId + '/rules';
    return net.get(url);
};

exports.deleteRule = function (taskId, ruleId) {
    var url = '/monitor/alarm/task/' + taskId + '/rules/' + ruleId;
    return net.del(url);
};

exports.addRule = function (taskId, rule) {
	var url = '/monitor/alarm/task/' + taskId + '/rules';
	return net.post(url, {data: rule});
}

exports.setStatus = function (taskId, status) {
    var url = '/monitor/alarm/task/' + taskId + '/status';
    var data = {
        status: status
    };
    return net.put(url, {data: data});
};