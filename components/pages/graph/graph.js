'use strict';

module.exports = {
  init: function (ctx) {
    this.id = ctx.params.id;
    this.render('#content');
  },
  render: function (selector) {
    $(selector).html('<h1>Hello, graph!</h1>');
  }
};