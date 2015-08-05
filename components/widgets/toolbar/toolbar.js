'use strict';

var each = require('each');
var config = require('config').nav;
var utils = require('utils');
var projectS = require('stores/project');
var project = require('pages/project');
var notify = require('utils/notify');
var form = require('utils/form');
var log = require('utils/log');
var toolbar = module.exports = {};
var tpl = __inline('toolbar.handlebars');

var cfg = {};

toolbar.init = function (ctx, done) {
  var that = this;
  cfg = {
    breadcrumb: [],
    projects: []
  };

  var id = ctx.params.id;
  var page = ctx.params.page;
  var pageName = utils.getPageNameFromConfig(config, page);

  projectS.list().done(function (data) {
    each(data.object, function (project) {
      if (id === String(project.id)) {
        cfg.breadcrumb.push({
          link: '#!/' + id + '/',
          name: project.name
        }, {
          name: pageName
        });
        project.selected = true;
      }
      cfg.projects.push(project);
    });

    if (!cfg.breadcrumb.length) {
      cfg.breadcrumb.push({
        name: '首页'
      });
    }

    that.render('#ribbon', cfg);
    that.bindEvents();
    done && done();
  });
};

toolbar.appendBread = function (link, name) {
  var that = this;
  cfg.breadcrumb.push({
    link: link,
    name: name
  });
  that.render('#ribbon', cfg);
  that.bindEvents();
}

toolbar.render = function (selector, config) {
  $(selector).html(tpl(config));
    $('.t-msg').tooltipster({
        position:"bottom-right"
    });
   //$('#switcher').chosen();
    $('#switcher').selectpicker({
        clickCall:function(e,el,obj){
            var selectedTxt = $(e.currentTarget).find('.text')[0].innerHTML;
            var selectedId = $(e.currentTarget).find('.text').attr('dataId');
            location.href = '#!/'+selectedId+'/dashboard';
        }
    });
    //select.clickListener(function(){
    //    alert(123);
    //})
    //$("button[data-id='switcher']")[0].addEventListener('change',function(){
    //    alert(123);
    //})
};

toolbar.bindEvents = function () {
  $('#switcher_chosen').on('click', '.active-result', function (e) {
    var $el = $(e.currentTarget);
    var index = $el.data('option-array-index');
    var id = $('#switcher option')[index].value;
    if (!$el.hasClass('result-selected')) location.hash = '#/' + id + '/';
  });

  $('#btn-add-project').click(function () {
    var $this = $(this);
    var data = {};
    var curGroup = parseInt(window.usergroup);
      if(curGroup > 2){
          notify.dialog('您没有添加项目的权限，添加请联系nts负责人!','提示');
          return;
      }
    $.each(['id', 'code', 'type', 'name'], function(index, attr){
        data[attr] = $this.attr('data-category-' + attr);
    });
    var options = project.getCreateConfig(data);
    form(options).show(function(data){
      if(data){
        notify('添加成功！');
        location.href='#!/' + data.id + '/';
      }
    });
  });
};