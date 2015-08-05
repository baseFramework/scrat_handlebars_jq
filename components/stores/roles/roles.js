'use strict';

var net = require('utils/net');

/**
 * 查询拥有某个项目权限的所有用户
 * @returns {*}
 */
exports.queryMemberships = function() {
    var url = 'memberships/list/project';
    return net.get(url);
};

/**
 * 查询所有用户
 * @returns {*}
 */
exports.queryUsers = function(){
    var url = 'user/list';
    return net.get(url);
}

/**
 * 增加用户
 * @param opt
 * @returns {*}
 */
exports.addUser = function(opt){
    var url = '/memberships/project';
    return net.post(url,opt);
}

/**
 * 删除用户
 * @param opt
 * @returns {*}
 */
exports.removeUser = function(opt){
    var url = '/memberships/project';
    return net.del(url,opt);
}