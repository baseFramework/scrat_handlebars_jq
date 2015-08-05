'use strict';

var each = require('each');

// 从配置中根据 page id 获取 name
exports.getPageNameFromConfig = (function () {
  var cache = {};
  return function (config, page) {
    if (cache[page]) return cache[page];
    each(config, function (v, k) {
      if (page === k) {
        cache[page] = v.name;
        return false;
      }else if (v.children) {
        each(v.children, function (sv, sk) {
          if (page === sk) {
            cache[page] = sv.name;
            return false;
          }
        });
        if (cache[page]) return false;
      } else if(v.dynamicChild) {
        if(v.dynamicChild.key === page){
          cache[page] = v.name;
          return false;
        }
      }
    });
    return cache[page];
  };
})();

/***
 * 初始化项目ID
 */
exports.initProjectId = function(){
    var curHash = location.hash.split('#!/');
    if(curHash[1]){
        var projectId = curHash[1].split('/')[0];
        if(projectId){
            window.projectID = projectId;
        }
    }
}