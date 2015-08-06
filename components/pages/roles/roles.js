'use strict';

var tpl = __inline('roles.handlebars');
var projectS = require('stores/project');
var enviS = require('stores/environment');
var net = require('utils/net');
var notify = require('utils/notify');
var router = require('router');
var rolesStore = require('stores/roles');
var projectId;
var memlists = [];
var userlists = [];
var rolePicsConf = {
    Owner: 'http://image.uc.cn/s/uae/g/12/nts/head1.png',
    Master: 'http://image.uc.cn/s/uae/g/12/nts/head2.png',
    Developer: 'http://image.uc.cn/s/uae/g/12/nts/head6.png',
    Operator: 'http://image.uc.cn/s/uae/g/12/nts/head4.png',
    Reporter: 'http://image.uc.cn/s/uae/g/12/nts/head5.png',
    Guest: 'http://image.uc.cn/s/uae/g/12/nts/head3.png'
}

var init = function (ctx) {
    var id = ctx.params.id;
    projectId = id;
    roles(id);
}

exports.init = init;

exports.destory = function (newCtx) {
    //unbindEvent(newCtx);
};

var render = function (selector, data) {
    $(selector).html(tpl(data));
};

var roles = function (id) {
    var memberlist = rolesStore.queryMemberships();
    var userlist = rolesStore.queryUsers();
    $.when(memberlist,userlist).then(function(members,users){
            if(members[0] && members[0].object){
                memlists = members[0].object;
            }else{
                memlists = [];
            }
            if(users[0] && users[0].object){
                userlists = users[0].object;
            }else{
                userlists = [];
            }
        var data = {}
        data.userlists = userlists;
        data.memberlist = memberHandler(memlists);
        data.rolelist = [
            {
                id:'Owner',
                name:'Owner'
             },
            {
                id:'Master',
                name:'Master'
            },
            {
                id:'Developer',
                name:'Developer'
            },
            {
                id:'Operator',
                name:'Operator'
            },
            {
                id:'Reporter',
                name:'Reporter'
            },
            {
                id:'Guest',
                name:'Guest'
            }
        ];
        data.rolePicsConf = rolePicsConf;
        console.log(data.memberlist)
        render('#content', data);
        $('#userSwiter').selectpicker({
            clickCall:function(e,el,obj){
                //var selectedTxt = $(e.currentTarget).find('.text')[0].innerHTML;
                //var selectedId = $(e.currentTarget).find('.text').attr('dataId');
                //location.href = '#!/'+selectedId+'/dashboard';
            }
        });
        $('#roleSwiter').selectpicker({
            clickCall:function(e,el,obj){
            }
        });
        bindEvents();
    })

    function memberHandler(arr){
        for(var i = 0;i<arr.length; i++){
            arr[i].logo = rolePicsConf[arr[i].roleName];
        }
        return arr;
    }

    function bindEvents(){
        $('#role-add').on('click',function(e){
            var role = $('button[data-id=roleSwiter]').attr('title');
            var user = $('button[data-id=userSwiter]').attr('title');
            if('Nothing selected' === user){
                notify.bad('请选择用户！');
                return;
            }
            var option = {
                data:{
                    user_name:user,
                    role_name:role
                },
                success:{
                    run:function(){
                        notify('添加成功！');
                        setTimeout(function(){
                            //location.reload();
                            roles(projectId);
                        },1000)
                    }
                }
            }
            rolesStore.addUser(option);
        });
        $('.role-remove').on('click',function(e){
            var curTag = e.currentTarget;
            var user = curTag.getAttribute('data-name');
            var role = curTag.getAttribute('data-role');
            var option = {
                data:{
                    user_name:user
                },
                success:{
                    run: function(){
                notify('删除成功！');
                setTimeout(function(){
                    //location.reload();
                    roles(projectId);
                },1000)
            }
                }
            }
            rolesStore.removeUser(option);
        });
    }
};