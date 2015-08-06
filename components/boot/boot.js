'use strict';

var each = require('each');
var router = require('router');
var storage = require('utils/storage');
var config = require('config');
var utils = require('utils');
var minify = require('widgets/minify');
var pages = {
    index: 'pages/index',
    dashboard: 'pages/dashboard'
    //task: 'pages/task',
    //logger: 'pages/logger',
    //taskrecord: 'pages/taskrecord',
    //roles:'pages/roles',
    //login: 'pages/login',
    //conf: 'pages/conf'
};


//----- 路由中间件 -----
// 初始化用户状态
function initUserInfo(ctx, next) {
    console.log('init');
   // alert('luyou');
  // $('#loadingWrap').removeClass('hide');
    showLoading();
    //readUserNameFromCookies();
    next();
}

function showLoading(){
    $("body").append("<div id='loadingbar'></div>");
    $("#loadingbar").addClass("waiting").append($("<dt/><dd/>"));
    setTimeout(function(){
        $("#loadingbar").width((50 + Math.random() * 30) + "%");
    },50);
}

var readUserNameFromCookies = function () {
    var str = document.cookie.split(';');
    window.usergroup = 0 ;
    //console.log('str:'+str);
    for (var i = 0; i < str.length; i++) {
        var stri = str[i].toString();
        if (stri.search('user_id') > 0) {
            var username = stri.split('=')[1];
            $('#nts-user-id')[0].innerText = username;
        }
        if(stri.search('user_group') > 0){
            var usergroup = stri.split('=')[1];
            console.log('usergroup:'+usergroup);
            window.usergroup = usergroup;
        }
    }
}

// 初始化工具栏
function initToolbar(ctx, next) {
    //debugger;
    var toolbar = require('widgets/toolbar');
    toolbar.init(ctx, next);
}

// 加载页面
var currentPage;
function loadPage(ctx, next) {
    //debugger;
    utils.initProjectId();
    var nav = require('widgets/nav');
    var page = ctx.params.page;
    $("#loadingbar").width("101%").delay(50).fadeOut(400, function() {
        $(this).remove();
    });
    //setTimeout(function(){
    //    $('#loadingWrap').addClass('hide');
    //},500);
    if (pages.hasOwnProperty(page)) {
        if (nav.lookUp(config.nav, page)) {
            nav(config.nav, ctx);
        } else {
            nav(ctx);
        }
        require.async(pages[page], function (p) {
            debugger;
            if (currentPage && currentPage.destory) currentPage.destory(ctx);
            currentPage = p;
            if (currentPage.init) currentPage.init(ctx);
        });
    } else {
        // 404
        next();
    }
}

//----- 页面路由 -----
router('/login', function (ctx, next) {
    ctx.params.page = 'login';
    next();
}, loadPage);

router('/:id/taskrecord/:subid', function (ctx, next) {
    ctx.params.page = 'taskrecord';
    storage.set('project_id', ctx.params.id);
    next();
}, initUserInfo, loadPage);

router('/:id/:page/:subid', function (ctx, next) {
    storage.set('project_id', ctx.params.id);
    next();
}, initUserInfo, initToolbar, loadPage);

router('/:id/:page', function (ctx, next) {
    storage.set('project_id', ctx.params.id);
    next();
}, initUserInfo, initToolbar, loadPage);

router('/', function (ctx, next) {
    ctx.params.page = 'index';
    next();
}, initUserInfo, initToolbar, loadPage);

//----- 重定向 -----
router('/:id/', function (ctx) {
    var defaultPage;
    // 获取 nav 第一个配置作为默认页
    each(config.nav, function (k, v) {
        defaultPage = v;
        return false;
    });
    defaultPage ?
        router.replace(ctx.pathname + defaultPage + ctx.search) :
        router.replace('/');
});

router('*', function (ctx) {
    // 获取上次访问的工程 id，若存在则跳到对应工程，否则跳回首页
    var id = storage.get('project_id');
    router.replace(id ? '/' + id + '/' : '/');
});

module.exports = function () {
    minify.init();
    router.start();
};