var exports = module.exports = function(message, title){
    $.smallBox({
        title : title || '好消息',
        content : "<i class='fa fa-clock-o'></i> <i>" + (message || '不知道该说什么了。。。') + "</i>",
        color : "#659265",
//        color : "#296191",
        iconSmall : "fa fa-check fa-2x fadeInRight animated",
//        iconSmall : "fa fa-thumbs-up bounce animated",
        timeout : 4000
    });
};

exports.bad = function(message, title){
    $.smallBox({
        title : title || "发生错误",
        content : "<i class='fa fa-clock-o'></i> <i>" + (message || '未知错误，呵呵') + "</i>",
        color : "#C46A69",
        iconSmall : "fa fa-times fa-2x fadeInRight animated",
        timeout : 4000
    });
};

exports.confirm = function(message, title, callback){
    $.SmartMessageBox({
        title : title || '请确认',
        content : message,
        buttons : '[取消][好的]'
    }, function(ButtonPressed){ callback(ButtonPressed === '好的') });
};

/*
 * CONVERT DIALOG TITLE TO HTML
 * REF: http://stackoverflow.com/questions/14488774/using-html-in-a-dialogs-title-in-jquery-ui-1-10
 */
$.widget("ui.dialog", $.extend({}, $.ui.dialog.prototype, {
    _title : function(title) {
        if (!this.options.title) {
            title.html("&#160;");
        } else {
            title.html(this.options.title);
        }
    }
}));

exports.dialog = function(message, title, callback, settings){
    var selector = '#dialog';
    if(settings && settings.selector){
        selector = settings.selector;
        delete settings.selector;
    }
    settings = $.extend({
        autoOpen : false,
        resizable : false,
        draggable : false,
        modal : true
    }, settings);
    settings.width = settings.width || Math.min($(document.body).width() * 0.4, 400);
    settings.title = '<div class="widget-header"><h4><i class="icon-ok"></i> ' + title + '</h4></div>';
    settings.autoOpen = true;
    var buttons = settings.buttons || '[取消][好的]';
    if(buttons && typeof buttons === 'string'){
        var match = buttons.match(/\[[^\[\]]+\]/g);
        buttons = [];
        $.each(match, function(index, label){
            label = label.replace(/[\[\]]/g, '');
            var clazz = 'btn btn-primary';
            switch (label.toLowerCase()){
                case 'no':
                case 'cancel':
                case '取消':
                case '不':
                case '否':
                    clazz = 'btn btn-default';
                    break;
            }
            buttons.push({
                html : label,
                'class' : clazz,
                click : (function(index, label, callback){
                    return function(){
                        if(!callback || callback(label, $(this)) !== false){
                            $(this).dialog('destroy');
                        }
                    };
                })(index, label, callback)
            });
        });
    }
    settings.buttons = buttons;
    return $(selector).html('<div style="width: 100%;overflow-x: hidden;">' + message + '</div>').dialog(settings);
};

var eventCenter = $(document.body);

exports.trigger = function(){
    return eventCenter.trigger.apply(eventCenter, arguments);
};
exports.on = function(){
    var len = arguments.length - 1;
    var fn = arguments[len];
    arguments[len] = function(e, data){
        return fn.call(this, data);
    };
    return eventCenter.on.apply(eventCenter, arguments);
};