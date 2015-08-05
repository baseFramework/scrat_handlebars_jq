'use strict';

var tpl = __inline('index.handlebars');

module.exports = {
    init: function () {
        this.render('#content');
    },
    render: function (selector) {
        $(selector).html(tpl());
    }
};