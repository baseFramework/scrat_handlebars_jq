'use strict';

var each = require('each');
var enviS = require('stores/environment');
var tpl = __inline('nav.handlebars');
var toolbar = require('widgets/toolbar');
var exports = module.exports = Nav;
var proto = Nav.prototype;

Handlebars.registerHelper('subNav', function (children) {
    if (Handlebars.Utils.isArray(children)) {
        return tpl(children);
    } else {
        return '';
    }
});

function Nav(config, ctx) {

    if (!(this instanceof Nav)) return new Nav(config, ctx);
    if (!ctx) {
        ctx = config;
        config = {};
    }
    // 处理配置
    var cfgPromise = this.processConfig(config, ctx.params.id, ctx.params.page, ctx.params.subid);
    $.when(cfgPromise).then(function (cfg) {
        // 渲染导航列表
        proto.render('#left-panel nav', cfg);
        // 绑定事件
        proto.bindEvents();
    })
}

proto.processConfig = function (config, id, page, subId) {
    var that = this;
    var cfg = [];
    var promiseList = [];
    each(config, function (v, k) {
        var item = {
            page: k,
            url: '#!/' + id + '/' + k,
            icon: v.icon,
            name: v.name
        };
        if (page === k) item.active = true;

        if (v.children) {
            delete item.url;
            item.children = [];
            each(v.children, function (sv, sk) {
                var subItem = {
                    page: sk,
                    url: '#!/' + id + '/' + sk,
                    name: sv.name
                };
                if (page === sk) {
                    item.open = true;
                    subItem.active = true;

                }
                item.children.push(subItem);
            });
        }

        //处理动态菜单
        if (v.dynamicChild) {
            delete item.url;
            if (!item.children) {
                item.children = [];
            }
            var dc = v.dynamicChild;
            if (dc.type === 'environment') {
                var enviP = enviS.queryForProject(id);
                enviP.then(function (data) {
                    if (data.object) {
                        each(data.object, function (envi) {
                            var subItem = {
                                page: dc.key,
                                url: '#!/' + id + '/' + dc.key + '/' + envi.id,
                                name: envi.name
                            };
                            if (page === dc.key && envi.id == subId) {
                                item.open = true;
                                subItem.active = true;
                                //更新顶部导航菜单
                                toolbar.appendBread(subItem.url, envi.name);
                            }
                            item.children.push(subItem);
                        });
                    }
                });
                promiseList.push(enviP);
            }
        }
        if (!v.hideFromSidebar) cfg.push(item);
    });
    var deferred = $.Deferred();
    $.when.apply($, promiseList).then(function () {
        deferred.resolve(cfg);
    });
    return deferred.promise();
};

proto.render = function (selector, config) {
    $(selector).html(tpl(config));
    var $li = $(selector).find('.open');
    if ($li.length) {
        $li.find('em').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
        $li.find('ul').slideToggle(0);
    }
};

proto.bindEvents = function () {
    $('#left-panel nav > ul > li > a').click(function (e) {
      //  $('#loadingWrap').removeClass('hide');
        var $el = $(e.currentTarget).parent();
        if ($el.find('ul').length > 0) {
            $el.toggleClass('open');
            if ($el.hasClass('open')) {
                $el.find('em').removeClass('fa-plus-square-o').addClass('fa-minus-square-o');
            } else {
                $el.find('em').removeClass('fa-minus-square-o').addClass('fa-plus-square-o');
            }
            $el.find('ul').slideToggle();
            //setTimeout(function(){
            //    $('#loadingWrap').addClass('hide');
            //},500);
        }
    });
};

exports.lookUp = function (config, page) {
    var found = false;
    each(config, function (v, k) {
        if (page === k) {
            found = true;
            return false;
        } else if (v.children) {
            each(v.children, function (sv, sk) {
                if (page === sk) {
                    found = true;
                    return false;
                }
            });
            if (found) return false;
        } else if (v.dynamicChild) {
            if (v.dynamicChild.key === page) {
                found = true;
                return false;
            }
        }
    });
    return found;
};