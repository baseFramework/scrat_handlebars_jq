'use strict';

var tpl = __inline('logger.handlebars');
var logger = require('stores/logger');
var project = require('stores/project');
var env = require('stores/environment');
var net = require('utils/net');
var notify = require('utils/notify');
var limit = 200;
var pos = 0;
var logLength = 0;
var isNotify = false;

var render = function (selector, data) {
    $(selector).html(tpl(data));
}

exports.init = function (ctx) {
    var envId = ctx.params.subid;
    init(envId);
}

exports.destory = function (ctx) {
    $('.logger-list-tree.treeview').off('nodeSelected');
    $('.btn.btn-info.logger-to-end').off('click');
    $(window).off('scroll');
}

var init = function (envId) {
    env.query(envId).done(function (data) {
        var logList = logger.list(data.object.type, envId);
        $.when(logList).then(function (log) {
            var data = {};
            var treeData = {};
            if (log && log.object) {
                data['envId'] = envId;
                treeData = getTree(log.object);
            }
            render('#content', data);
            $('.logger-list-tree').treeview({data: treeData, levels: 1, collapseIcon: 'glyphicon glyphicon-folder-open',
                expandIcon: 'glyphicon glyphicon-folder-close', nodeIcon: ''});
            bindEvent();
        });
    })
}

var getTree = function (data) {
    for (var i = 0; i < data.length; i++) {
        if (data[i].isFile == true) {
            data[i]['icon'] = 'fa fa-file-o';
        } else {
            getTree(data[i].nodes);
        }
    }
    return data;
}

var bindEvent = function () {
    $('.logger-list-tree.treeview').on('nodeSelected', clickTreeAction);
    $('.btn.btn-info.logger-to-end').on('click', toEndAction);
    $(window).on('scroll', scrollContentAction);
}

var toEndAction = function () {
    var logContent = $('.logger-content');
    var path = logContent.attr('path');
    if (path) {
        pos = logLength - 15000;
        if (pos > 0) {
            queryLog(logContent, path);
        }
    }
}

var clickTreeAction = function (event, node) {
    if (node.isFile == true) {
        pos = 0;
        isNotify = false;
        var logContent = $('.logger-content');
        logContent.attr('path', node.path);
        queryLog(logContent, node.path);
    }
}

var scrollContentAction = function () {
    var logContent = $('.logger-content');
    var path = logContent.attr('path');
    if (path) {
        var windowTop = $(window).scrollTop();
        var windowHeight = $(window).height();
        var contentHeight = logContent.height();
        if (windowTop >= (contentHeight - windowHeight)) {
            queryLog(logContent, path, 'append');
        }
    }
}

var queryLog = function (logContent, path, op) {
    logger.query(path, pos, limit).done(function (data) {
        var html = data.object.content;
        pos = data.object.pos;
        logLength = data.object.fileLength;
        if (op == 'append') {
            if (html) {
                logContent.append(html);
                isNotify = false;
            }
        } else {
            logContent.html(html);
        }
        if (data.object.isEnd && !isNotify) {
            isNotify = true;
            notify('日志加载完毕！');
        }
    });
}
