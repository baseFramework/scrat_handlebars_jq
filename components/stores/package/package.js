'use strict';

var net = require('utils/net');

exports.query = function(id){
	var url = 'package?id=' + id;
    return net.get(url);
};

exports.queryForProject = function(project_id){
	var url = 'package/project?project_id=' + project_id;
    return net.get(url);
}

exports.upload = function(id, file){
	var formData = new FormData();
    formData.append('project_id', id);
    formData.append('file', file);
    var settings = {
        data : formData,
        contentType : false,
        processData : false
    };
    return net.post('/package', settings);
}
