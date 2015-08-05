'use strict';

var net = require('utils/net');

exports.queryByTaskId = function(tid) {
    var url = 'taskrecord/task?tid=' + tid;
    return net.get(url);
};

exports.query = function(id) {
    var url = 'task?id=' + id;
    return net.get(url);
};

exports.queryForEnvi = function(env_id) {
    var url = 'task/env?env_id=' + env_id;
    return net.get(url);
}

/**
 * 查询监控模板
 * @returns {*}
 */
exports.queryMonitorTemplates = function(){
    var url = 'monitor/alarm/templates';
    return net.get(url)
}

exports.queryByPage = function(tid, st,en,page_no, page_size) {
    var url = 'taskrecord/page?tid=' + tid + '&page_no=' + page_no + '&page_size=' + page_size;
    return net.get(url);
}

exports.queryRecordByTsID = function(tid,tsid){
    var url = 'taskrecord/tsid?tid=' + tid + '&tsid=' + tsid;
    return net.get(url);
}

exports.queryRecordByTm = function(tid,st,en,page_no, page_size){
    var url = 'taskrecord/page/starttime?tid='+tid+'&min_time='+st+'&max_time='+en+'&page_no='+page_no+'&page_size='+page_size;
    return net.get(url);
}

exports.queryRecordCountsByTm = function(tid,st,en){
    var url = 'taskrecord/count/starttime?tid='+tid+'&min_time='+st+'&max_time='+en;
    return net.get(url);
}


exports.queryRecordCount = function(tid) {
    var url = 'taskrecord/count?tid=' + tid;
    return net.get(url);
}

exports.updateStatus = function(id, status) {
    var data = {
        id: id,
        status: status
    };
    var url = 'task/status';
    return net.put(url,{data:data});
}

exports.updateConfig = function(id, config) {
    var data = {
        id: id,
        config: config
    };
    var url = 'task/config';
    return net.put(url, {
        data: data
    });
}

exports.queryTaskStatus = function(tid, timestamp) {
    var url = 'task/status?tid=' + tid + '&timestamp=' + timestamp;
    return net.get(url);
}

exports.deleteTask = function(tid,envId,opt){
    var url = 'task?tid=' + tid + '&env_id=' + envId;
    return net.del(url,opt);
}

exports.parseExp = function(type, exp) {
    return net.get('task/parsexp?type=' + type + '&exp=' + exp);
}

exports.executeNow = function(taskId) {
    var url = 'task/executenow';
    return net.post(url, {
        data: {
            tid: taskId
        }
    });
}