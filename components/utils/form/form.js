var notify = require('utils/notify');
var net = require('utils/net');
var tpl = {
    dialog : function(data){
        var html = '<div id="' + data.id + '" class="smart-form">';
        var inputs = [];
        $.each(data.inputs, function(key, item){
            var html = '<label class="label">' + item.label + '</label>';
            html += '<label class="' + item.type + '">';
            if(item.icon){
                html += '<i class="icon-append fa fa-' + item.icon + '"></i>';
            }
            switch (item.type){
                case 'input':
                    html += '<input type="text" name="' + key + '"' + (item.def ? ' value="' + item.def + '"' : '') + (item.disabled ? ' disabled="disabled"' : '') + '>';
                    break;
                case 'textarea':
                    html += '<textarea rows="2" name="' + key + '"' + (item.disabled ? ' disabled="disabled"' : '') + '>' + (item.def || '') + '</textarea>';
                    break;
            }
            html += '</label>';
            inputs.push({
                type : item.type,
                html : html
            });
        });
        for(var i = 0, len = inputs.length; i < len; i++){
            html += '<div class="row">';
            var curr = inputs[i];
            var next = inputs[i+1];
            if(curr.type === 'input' && next && next.type === 'input'){
                html += '<section class="form-group col col-md-6">';
                html += curr.html;
                html += '</section>';
                html += '<section class="form-group col col-md-6">';
                html += next.html;
                html += '</section>';
                i++;
            } else {
                html += '<section class="form-group col col-md-12">';
                html += curr.html;
                html += '</section>';
            }
            html += '</div>';
        }

        if(data.needAuth === true){
            html += '<div class="row">';
            html += '<section class="form-group col col-md-12">';
            html += '<label class="label">权限</label>';
            html += '<div style="border: 1px solid #999;padding:5px 10px;">';
            html += '<div data-rel="auth">';
            if(data.allowUsers){
                try {
                    var allowUsers = JSON.parse(data.allowUsers);
                    $.each(allowUsers, function(k, v){
                        html += '<div style="height: 25px;line-height: 25px;">';
                        html += '<span data-rel="username" style="display: inline-block;width: 80px;">' + k + '</span>';
                        html += '<input type="checkbox" name="' + k + '-c" ' + (v.c ? 'checked' : '') + '/> 创建&nbsp;&nbsp;&nbsp;';
                        html += '<input type="checkbox" name="' + k + '-r" ' + (v.r ? 'checked' : '') + '/> 读取&nbsp;&nbsp;&nbsp;';
                        html += '<input type="checkbox" name="' + k + '-u" ' + (v.u ? 'checked' : '') + '/> 更新&nbsp;&nbsp;&nbsp;';
                        html += '<input type="checkbox" name="' + k + '-d" ' + (v.d ? 'checked' : '') + '/> 删除 ';
                        html += '<i data-rel="remove-user" class="fa fa-times-circle-o pull-right" style="line-height:25px;cursor: pointer;"></i>';
                        html += '</div>';
                    });
                } catch (e){}
            }
            html += '</div>';
            html += '<div class="clearfix">';
            html += '<span data-rel="add-user" class="btn btn-success pull-right" style="padding: 3px 5px;margin-left:5px;">添加</span>';
            html += '<span style="position:relative;" class="pull-right">';
            html += '<input data-rel="add-user-name" type="text" style="height:21px;line-height:21px;padding-left:30px;">';
            html += '<i style="border-right:1px solid #BDBDBD;position:absolute;top:2px;left:0" class="icon-append fa fa-user"></i>';
            html += '</span>';
            html += '</div>';
            html += '</div>';
            html += '</section>';
            html += '</div>';
        }
        html += '</div>';
        return html;
    }
};

var index = 0;

var Form = function(options){
    var inputs = this.inputs = {};
    $.each(options.inputs || {}, function(key, value){
        var input;
        if(typeof value === 'string'){
            input = {
                type : 'input',
                label : value
            }
        } else {
            value.type = value.type || 'input';
            input = value;
        }
        if(!input.icon){
            switch (key){
                case 'name':
                    input.icon = 'eye';
                    break;
                case 'code':
                    input.icon = 'key';
                    break;
                case 'description':
                    input.icon = 'info-circle';
                    break;
            }
        }
        inputs[key] = input;
    });
    //console.log(inputs);
    this.allowUsers = options.allowUsers;
    this.process = options.process || function(){};
    this.title = options.title;
    this.action = options.action;
    this.method = options.method || 'POST';
    this.needAuth = options.needAuth;
    this.id = 'create_form_' + (index++);
};

function showError($ele, message, key){
    var $parent = $ele.parent();
    $parent.append('<span for="' + key + '" class="help-block">' + message + '</span>');
    $parent.parent().addClass('has-error');
}

Form.prototype.show = function(callback){
    var html = tpl.dialog(this);
    var self = this;
    var dialog = notify.dialog(html, this.title, function(selected, dialog){
        if(selected === '好的'){
            var element = $('#' + self.id);
            element.find('.has-error').removeClass('has-error');
            element.find('.help-block').remove();
            var inputData = {};
            element.find('input,textarea,select').each(function(){
                var $this = $(this);
                var key = $this.attr('name');
                inputData[key] = {
                    ele : $this,
                    val : $this.val()
                };
            });
            var valid = true;
            var formData = {};
            if(self.needAuth !== false){
                var allowUsers = {};
                element.find('[data-rel="username"]').each(function(){
                    var username = $(this).text().trim();
                    if(username){
                        var auth = {};
                        auth.c = element.find('input[name="' + username + '-c"]').get(0).checked;
                        auth.r = element.find('input[name="' + username + '-r"]').get(0).checked;
                        auth.u = element.find('input[name="' + username + '-u"]').get(0).checked;
                        auth.d = element.find('input[name="' + username + '-d"]').get(0).checked;
                        allowUsers[username] = auth;
                    }
                });
                formData.allow_users = JSON.stringify(allowUsers);
            }
            $.each(self.inputs, function(key, input){
                var data = inputData[key] || {};
                var message;
                if(input.required && !data.val){
                    if(input.message && input.message.required){
                        message = input.message.required;
                    } else if(typeof input.required === 'string'){
                        message = input.required;
                    } else {
                        message = '必须填写该字段';
                    }
                    showError(data.ele, message, key);
                    valid = false;
                } else if(input.reg && !input.reg.test(data.val)){
                    if(input.message && input.message.reg){
                        message = input.message.reg;
                    } else {
                        message = '该字段格式不正确';
                    }
                    showError(data.ele, message, key);
                    valid = false;
                } else {
                    formData[key] = data.val;
                }
            });
            if(valid){
                var result = self.process(formData);
                if(typeof result === 'undefined'){
                    result = formData;
                }
                var method = self.method.toLowerCase();
                net[method](self.action, {data:result}).done(function(ret){
                    if(ret.status === 'success'){
                        dialog.dialog('destroy');
                        callback(ret.object);
                    }
                });
            }
            return false;
        }
    });
    dialog.on('click', '[data-rel="remove-user"]', function(){
        $(this).parent().remove();
    });
    dialog.find('[data-rel="add-user"]').click(function(){
        var input = dialog.find('[data-rel="add-user-name"]');
        var username = input.val().trim();
        if(username && /^\w+$/.test(username)){
            var html = '<div style="height: 25px;line-height: 25px;">';
            html += '<span data-rel="username" style="display: inline-block;width: 80px;">' + username + '</span>';
            html += '<input type="checkbox" name="' + username + '-c" checked/> 创建&nbsp;&nbsp;&nbsp;';
            html += '<input type="checkbox" name="' + username + '-r" checked/> 读取&nbsp;&nbsp;&nbsp;';
            html += '<input type="checkbox" name="' + username + '-u" checked/> 更新&nbsp;&nbsp;&nbsp;';
            html += '<input type="checkbox" name="' + username + '-d" checked/> 删除 ';
            html += '<i data-rel="remove-user" class="fa fa-times-circle-o pull-right" style="line-height:25px;cursor: pointer;"></i>';
            html += '</div>';
            dialog.find('[data-rel="auth"]').append(html);
            input.val('');
        }
    });
};

module.exports = function(options){
    return new Form(options);
};