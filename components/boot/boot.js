'use strict';

var each = require('each');
var router = require('router');
var storage = require('utils/storage');
var config = require('config');
var view = require('view');
var utils = require('utils');
var pages = {
    index:'pages/index'
}
//var pages = {
//    index: 'pages/index',
//    dashboard: 'pages/dashboard',
//    task: 'pages/task',
//    logger: 'pages/logger',
//    taskrecord: 'pages/taskrecord',
//    roles:'pages/roles',
//    login: 'pages/login',
//    conf: 'pages/conf'
//};


//----- 路由中间件 -----
// 初始化用户状态
function initUserInfo(ctx, next) {
    console.log(1234);
    showLoading();
    next();
}

function showLoading() {
    $("body").append("<div id='loadingbar'></div>");
    $("#loadingbar").addClass("waiting").append($("<dt/><dd/>"));
    setTimeout(function () {
        $("#loadingbar").width((50 + Math.random() * 30) + "%");
    }, 50);
}

// 加载页面
var currentPage;
function loadPage(ctx, next) {
    utils.initProjectId();
    var nav = require('widgets/nav');
    var page = ctx.params.page;
    $("#loadingbar").width("101%").delay(50).fadeOut(400, function() {
        $(this).remove();
    });
}

//----- 页面路由 -----

/***** Router ****/
router('*', initUserInfo,view.init);

router('/index',
    loadPage,
    view.pages.index.init,
    view.pages.index.render
);

router('/detail',
    loadPage,
    view.pages.detail.init,
    view.pages.detail.render
);

// 404
router('*', function () {
    router.replace('/index');
});

// 404
router('*', function () {
    router.replace('/index');
});

module.exports = function () {
    router.start();
};