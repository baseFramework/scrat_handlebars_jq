'use strict';

var tpl = __inline('conf.handlebars');
var envStore = require('stores/environment');
var notify = require('utils/notify');

exports.init = function (ctx) {
    init(ctx);
}

exports.destory = function () {
    unbindEvent();
};

var init = function (ctx) {
    envStore.query(ctx.params.subid).done(function (ret) {
            var data = [];
            if (ret.object) {
                if (ret.object.config) {
                    data['key_value'] = JSON.parse(ret.object.config);
                }
                data['envId'] = ret.object.id;
            }
            render('#content', data);
            bindEvent(ctx);
        }
    )
}

var render = function (selector, data) {
    $(selector).html(tpl(data));
};

var bindEvent = function (ctx) {
    $('.conf .conf-apply').on('click', applyAction);
    $('.conf-add').on('click', {ctx: ctx}, addItem);
    $('.conf-refresh').on('click', {ctx: ctx}, refreshConf);
    $('.smart-form.kv .fa.fa-trash-o.fa-lg').on('click', {ctx: ctx}, deleteItem);
    $('.smart-form.kv .fa.fa-save').on('click', {ctx: ctx}, saveItem);
    $('.conf .smart-form .row .col label.input input').on('focusin', focusinAction);
    $('.conf .smart-form .row .col label.input input').on('focusout', focusoutAction);
};

var unbindEvent = function () {
    $('.conf .conf-apply').off('click');
    $('.conf-add').off('click');
    $('.conf-refresh').off('click');
    $('.smart-form.kv .fa.fa-trash-o.fa-lg').off('click');
    $('.smart-form.kv .fa.fa-save').off('click');
    $('.conf .smart-form .row .col label.input input').off('focusin');
    $('.conf .smart-form .row .col label.input input').off('focusout');
}

var applyAction = function (e) {
    var envId = $(this).data('id');
    envStore.updateEtag(envId).done(function (ret) {
        if (ret.status === "success") {
            notify("配置应用生效！");
        }
    })
}

var focusinAction = function (e) {
    var row = $(this);
    row.css('color', 'black');
}

var focusoutAction = function (e) {
    var input = $(this);
    input.css('color', 'gray');
}

var addItem = function (e) {
    var html = '<div class="row key-value"><section class="col col-4 key">' +
        '<label class="input"><input type="text" name="key" value="">' +
        '</label></section><section class="col col-4 value"><label class="input">' +
        '<input type="text" name="value" value="">' +
        '</label></section><i class="fa fa-trash-o fa-lg"></i> <i class="fa fa-save"></i></div>';
    $('#conf-KV-env-' + e.data.ctx.params.subid).append(html);
    unbindEvent();
    bindEvent(e.data.ctx);
}

var saveItem = function (e, item) {
    var envId = e.data.ctx.params.subid;
    var row = $(this).parent();
    var key = trimStr(row[0].children[0].children[0].children[0].value);
    if (key === "") {
        notify.bad('Key不能为空！');
        return;
    }
    var defaultKey = trimStr(row[0].children[0].children[0].children[0].defaultValue);
    var value = trimStr(row[0].children[1].children[0].children[0].value);
    var item = {k: key, v: value};
    if (key != defaultKey && defaultKey != "") {//Key改变，先删除旧KV，再保存新KV
        var oldItem = {k: defaultKey, v: value};
        envStore.deleteItem(envId, JSON.stringify(oldItem)).done(function (ret) {
            if (ret.status === "success") {
                console.log("delete old item sucess!");
                envStore.saveItem(envId, JSON.stringify(item)).done(function (ret) {
                    if (ret.status === "success") {
                        notify('配置项保存成功！');
//                        refreshConf(e);
                        console.log("save item sucess!");
                    }
                })
            }
        })
    } else {
        envStore.saveItem(e.data.ctx.params.subid, JSON.stringify(item)).done(function (ret) {
            if (ret.status === "success") {
                notify('配置项保存成功！');
//                refreshConf(e);
                console.log("save item sucess!");
            }
        })
    }
}

var deleteItem = function (e) {
    var envId = e.data.ctx.params.subid;
    var row = $(this).parent();
    var key = trimStr(row[0].children[0].children[0].children[0].value);
    if (key != "") {
        notify.dialog('确定删除该项？', '删除KV', function (selected) {
            if (selected === '好的') {
                var value = trimStr(row[0].children[1].children[0].children[0].value);
                var item = {k: key, v: value};
                envStore.deleteItem(envId, JSON.stringify(item)).done(function (ret) {
                    if (ret.status === "success") {
                        refreshConf(e);
                        console.log("delete item sucess!");
                        row.remove();
                    }
                })
            }
        })
    } else {
        row.remove();
    }
}

var refreshConf = function (e) {
    unbindEvent();
    init(e.data.ctx);
}


function trimStr(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}