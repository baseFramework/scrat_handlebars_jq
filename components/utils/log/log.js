var ERROR_CODE_MAP = {};

var notify = require('utils/notify');

exports.error = function(err, title){
    var message = '未知错误';
    switch (typeof err){
        case 'number':
            message = ERROR_CODE_MAP[err];
            break;
        case 'string':
            message = err;
            break;
        default :
            message = ERROR_CODE_MAP[err.code] || err.message;
            if(err.reason){
                message += '<br/>' + err.reason;
            }
    }
    notify.bad(message, title);
};

exports.notice = function(message, title){
    return notify(message, title);
};