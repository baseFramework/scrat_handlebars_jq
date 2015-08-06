'use strict';

var tpl = __inline('dashboard.handlebars');
var addcontacts = __inline('addContacts.handlebars');
var projectS = require('stores/project');
var enviS = require('stores/environment');
var packageS = require('stores/package');
var net = require('utils/net');
var notify = require('utils/notify');
var router = require('router');
var locked = false;

var init = function (ctx) {
    var id = ctx.params.id;
    console.log('dashbroad  !!!!');
    //dashboard(id, function () {
    //    bindEvent(ctx);
    //});
}

exports.init = init;

exports.destory = function (newCtx) {
    unbindEvent(newCtx);
};

var render = function (selector, data) {
    $(selector).html(tpl(data));
};

var dashboard = function (id, callback) {
    var projectP = projectS.query(id);
    var enviP = enviS.queryForProject(id);
    var packageP = packageS.queryForProject(id);
    $.when(projectP, enviP, packageP).then(function (projectD, enviD, packageD) {
        var allData = {};
        if (projectD[0].object) {
            allData['project'] = projectD[0].object;
            allData['envi'] = enviD[0].object;
            allData['packages'] = packageD[0].object;
            if (projectD[0].object.setup) {
                allData['setup'] = JSON.parse(projectD[0].object.setup);
            }
            if (enviD[0].object) {
                var envs = enviD[0].object;
                for (var i in envs){
                    var env = envs[i];
                    if (env.contacts) {
                        env['contactsJson'] = JSON.parse(env.contacts);
                    } 
                }
            }
            render('#content', allData);
            callback && callback();
        }
    });
};

var unbindEvent = function (ctx) {
    $(".nts-dash .btn-envi-reload").off("click");
    $("#content").undelegate(".nts-dash .btn-package-upload", "click", uploadBtnAction);
    $("#content").undelegate(".nts-dash .btn-envi-switch", "click", switchBtnAction);
    $("#dash-" + ctx.params.id + "-setup").off('focusin');
    $("#dash-" + ctx.params.id + "-setup").off('focusout');
    $(".btn-add-contacts").off("click");
    $('.contacts-del').off("click");
}

var bindEvent = function (ctx) {
    $(".nts-dash .btn-envi-reload").on("click", reloadAction);
    $("#content").delegate(".nts-dash .btn-package-upload", "click", uploadBtnAction);
    $("#content").delegate(".nts-dash .btn-envi-switch", "click", switchBtnAction);
    $("#dash-" + ctx.params.id + "-setup").on('focusin', changeColor);
    $("#dash-" + ctx.params.id + "-setup").on('focusout', {ctx: ctx}, updateBeforeDel);
    $(".btn-add-contacts").on("click", {ctx: ctx}, showAddContacts);
    $('.contacts-del').on('click', {ctx: ctx}, delContacts);
};

var reloadAction = function (e) {
    var envid = $(this).data("id");
    enviS.updateEtag(envid).done(function (ret) {
        if (ret.status === "success") {
            notify("重新部署成功！1分钟内将生效。");
        }
    })
}

var uploadBtnAction = function (e) {
    var that = $(this);
    var fileInput = $('#content .nts-dash .file-package-upload');
    var pid = that.data("id");
    var file = fileInput.get(0).files[0];
    if (!locked && file) {
        packageS.upload(pid, file).done(function (ret) {
            if (ret.status == 'success') {
                notify('上传成功！');
                dashboard(pid);
            }
        });
    }
};

var switchBtnAction = function (e) {
    var that = $(this);
    var envid = that.data("id");
    var selector = $('#select-envi-' + envid);
    var packId = selector.val();
    if (packId && packId > 0) {
        enviS.switchPackage(envid, packId).done(function (data) {
            if (data.status === 'success') {
                notify('切换成功！1分钟内将生效。');
            }
        });
    } else {
        notify.bad('请选择脚本包切换');
    }
}

var updateBeforeDel = function (e) {
    var ctx = e.data.ctx;
    var input = $(this);
    input.css('color', 'gray');
    var projId = input.data('id');
    var beforeDel = trimStr(input[0].value);
    if (beforeDel != trimStr(input[0].defaultValue)) {
        projectS.updateBeforeDel(projId, beforeDel).done(function (ret) {
            if (ret.status === "success") {
                notify('设置修改成功');
                init(ctx);
            }
        })
    }
}

var showAddContacts = function (e){
    var envId = $(this).data('env-id');
    var data = {'envId':envId};
    notify.dialog(addcontacts(data), '添加联系人', function(selected) {
        if (selected === '好的') {
            var name = $.trim($("#add-contacts-"+envId + " #contact-name")[0].value)
            var address = $.trim($("#add-contacts-"+envId + " #contact-address")[0].value)
            if(name===''){
                notify.bad('姓名不能为空');
                return;
            }
            if(address===''){
                notify.bad('邮箱不能为空');
                return;
            }
            if(!valid_email(address)){
                notify.bad('请填写正确的邮箱地址');
                return;
            }
            enviS.setContact(envId, 'email', name, address).done(function (ret) {
                notify('添加联系人成功！');
                var ctx = e.data.ctx;
                init(ctx);
            })
        }
    }, {
        width: 500,
        draggable: true,
        close: function() {
        }
    });
}

var delContacts = function(e) {
    var envId = $(this).data('env-id');
    var name = $(this).data('name');
    var type = $(this).data('type');
    enviS.delContact(envId, type, name).done(function(ret) {
        notify('删除联系人成功！')
        var ctx = e.data.ctx;
        init(ctx);
    });
}

var valid_email =function(email) {
    var patten = new RegExp(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]+$/);
    return patten.test(email);
}


var changeColor = function (e) {
    var input = $(this);
    input.css('color', 'black');
}

function trimStr(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
}

    
