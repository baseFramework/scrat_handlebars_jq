'use strict';

var tpl = __inline('dashboard.handlebars');
var net = require('utils/net');
var router = require('router');
var locked = false;

var init = function (ctx) {
    var page = ctx.params.page;
    console.log('page:' + page);
}

exports.init = init;

exports.destory = function (newCtx) {
    unbindEvent(newCtx);
};

var render = function (selector, data) {
    $(selector).html(tpl(data));
};

var dashboard = function (id, callback) {

};

var unbindEvent = function (ctx) {

}

var bindEvent = function (ctx) {

};

    
