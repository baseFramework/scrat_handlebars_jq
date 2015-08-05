'use strict';

var net = require('utils/net');

exports.query = function (id) {
    var url = 'environment?id=' + id;
    return net.get(url);
};

exports.queryForProject = function (project_id) {
    var url = 'environment/project?project_id=' + project_id;
    return net.get(url);
}

exports.switchPackage = function (envi_id, newPackId) {
    var data = {
        id: envi_id,
        package_id: newPackId
    };
    return net.put('environment/switch/package', { data: data });
}

exports.getConfig = function (env_id) {
    var url = '/environment/config?env_id=' + env_id;
    return net.get(url);
}

exports.saveItem = function (env_id, item) {
    var data = {
        env_id: env_id,
        item: item
    };
    return net.put('/environment/item/save', {data: data});
}

exports.deleteItem = function (env_id, item) {
    var data = {
        env_id: env_id,
        item: item
    };
    return net.put('/environment/item/del', {data: data});
}

exports.updateEtag = function (env_id) {
    return net.put('/environment/etag?env_id=' + env_id);
}

exports.setContact = function (env_id, type, name, address) {
    var data = {
        name: name,
        address: address
    };
    var url = '/environment/contacts/env/' + env_id + '/' + type
    return net.put(url, {data: data});
}

exports.delContact = function (env_id, type, name) {
    var data = {
        name: name,
    };
    var url = '/environment/contacts/env/' + env_id + '/' + type
    return net.del(url, {data: data});
}