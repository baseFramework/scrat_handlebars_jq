
var request = function(method, url, opt){
    opt = $.extend({
        async : true,
        dataType : 'json',
        type : method
    }, opt);
    opt.project_id = parseInt(window.projectID) || '';
    if(!opt.data){
        opt.data = {}
    }
    opt.data.project_id = opt.project_id;
    var deferred = $.ajax(url, opt).fail(function(jqXHR, textStatus, errorThrown){
    });
    deferred.done(function(data){
        if(opt.hasOwnProperty('success')){
            if(data.status === 'success'){
                opt.success.run(data);
            }else{
                if(opt.fail){
                    opt.fail(data);
                }
            }
        }
        if(data.status !== 'success'){
            if(data.error && data.error.code == 10001){
                location.href=data.object.login_url;
            } else {
            }
            return false;
        }
    });
    return deferred;
};

exports.get = function(url, opt){
    return request('GET', url, opt);
};

exports.put = function(url, opt){
    return request('PUT', url, opt);
};

exports.post = function(url, opt){
    return request('POST', url, opt);
};

exports.del = function(url, opt){
    return request('DELETE', url, opt);
};