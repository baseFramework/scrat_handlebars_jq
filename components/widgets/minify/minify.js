'use strict';

var storage = require('utils/storage');

exports.init = function () {
  this.bindEvents();
  if (storage.get('minified')) this.toggle(true);
};

exports.bindEvents = function () {
  $('.minifyme').click(exports.toggle);
};

exports.toggle = function (enable) {
  var $body = $(document.body);
  enable = enable === true || !$body.hasClass('minified');

  if (enable) {
    $body.addClass('minified');
  } else {
    $body.removeClass('minified');
  }
  storage.set('minified', enable);
};