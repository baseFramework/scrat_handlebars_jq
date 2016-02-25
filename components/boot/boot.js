'use strict';

var each = require('each');
var router = require('router');
var storage = require('utils/storage');
var config = require('config');
var pages = {
    index: 'pages/index',
    dashboard: 'pages/dashboard'
};


//----- 路由中间件 -----
// 初始化用户状态
function initSys(ctx, next) {
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
    var page = ctx.params.page;
    $("#loadingbar").width("101%").delay(50).fadeOut(400, function () {
        $(this).remove();
    });
    if (pages.hasOwnProperty(page)) {
        require.async(pages[page], function (p) {
            if (currentPage && currentPage.destory) currentPage.destory(ctx);
            currentPage = p;
            if (currentPage.init) currentPage.init(ctx);
        });
    } else {
        next();
    }
}

//----- 页面路由 -----
router('/login', function (ctx, next) {
    ctx.params.page = 'login';
    next();
}, initSys,loadPage);


router('/:page', function (ctx, next) {;
    next()
}, initSys, loadPage);

router('/', function (ctx, next) {
    ctx.params.page = 'index';
    next();
}, initSys, loadPage);


router('*', function (ctx) {
    router.replace('/' + config.nav.default);
});

module.exports = function () {
    router.start();
};