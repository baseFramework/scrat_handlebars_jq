'use strict';

var tpl = __inline('login.handlebars');
var net = require('utils/net');
var notify = require('utils/notify');
var log = require('utils/log');

exports.init = function (ctx) {
    net.get('/login').done(function (ret) {
        if (ret && ret.object) {
            location.href = ret.object;
            console.log("Redirect to Napi authorize api");
        }
    })
}