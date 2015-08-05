//handlebars通用helper
Handlebars.registerHelper('isString', function(context, options){
    if(typeof context === 'string'){
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

Handlebars.registerHelper('json', function(data){
    return JSON.stringify(data);
});

Handlebars.registerHelper('length', function(data){
    if(!data){
        return 0;
    } else if(typeof data.length === 'number' || data instanceof Array || typeof data ==='string'){
        return data.length;
    } else if(typeof data === 'object'){
        return Object.keys(data).length;
    }
});

Handlebars.registerHelper('compare', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});


// 初始化项目代码
require.config(__FRAMEWORK_CONFIG__);
require.async('boot', function (boot) { boot() });
$('#mask').css('width',window.screen.width);
$('#mask').css('height',window.screen.height);