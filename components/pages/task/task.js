'use strict';

var tasklist = __inline('tasklist.handlebars');
var taskstate = __inline('taskstate.handlebars');
var taskconfig = __inline('taskconfig.handlebars');
var monitorTpl =  __inline('taskmonitor.handlebars');
var taskStore = require('stores/task');
var monitorStore = require('stores/monitor');
var envStore = require('stores/environment');
var table = require('utils/table');
var notify = require('utils/notify');
var toolbar = require('widgets/toolbar');
var timeoutClock = null;


var render = function(selector, data) {
    $(selector).html(tasklist(data));
}

exports.init = function(ctx) {
    var projectId = ctx.params.id;
    var envId = ctx.params.subid;
    init(envId, projectId);
}

exports.destory = function(ctx) {
    var envId = ctx.params.subid;
    $("#task-list-" + envId + "-tbody").off('click', 'tr[rel="resource"]');
}


function init(envId, projectId) {
    envStore.query(envId).done(function(env) {
        var packageId = env.object.packageId;
        taskStore.queryForEnvi(envId).done(function(tasks) {
            for (var index in tasks.object) {
                if (tasks.object[index].packageId == packageId) {
                    tasks.object[index].useable = 1;
                } else { //非当前环境部署包的task设为不可用
                    tasks.object[index].useable = 0;
                }
            }
            var allData = {};
            if (tasks && tasks.object) {
                allData['taskList'] = tasks.object;
                allData['envId'] = envId;
            }
            //console.log('allData:'+allData);
            allData.taskList = dataHandler(allData.taskList);
            render('#content', allData);
            table.table('#envi-' + envId + '-task-grid .table', {
                aaSorting: [
                    [7, 'desc']
                ],
                iDisplayLength: 30
            });
            bindEvents(envId, projectId);
            //$('[data-toggle="tooltip"]').tooltip();
            //$('.taskTitle').simpletooltip()
            $('.taskTitle').tooltipster({
                position:"bottom-right"
            });
            $('.tdlist').tooltipster({
                    position:"bottom-right"
                });
            $('.fabtn').tooltipster({
                position:"bottom-right"
            })
        });
    })
}

function dataHandler(arr){
    if(arr && arr.length > 0){
        for(var i = 0 ; i < arr.length; i++){
            if(arr[i].modifyTime){
                arr[i].modifyTime = modifyTimestamp(arr[i].modifyTime);
            }
            if(arr[i].configs){
                var config = JSON.parse(arr[i].configs);
                if(config && config.extInfo && config.extInfo.remark){
                    arr[i].remark = config.extInfo.remark;
                }else{
                    arr[i].remark = '';
                }
            }else{
                arr[i].remark = '';
            }
        }
        return arr;
    }
}

function modifyTimestamp(time){
    var time = time.split('-')[1] + '-' +time.split('-')[2];
    return time;
}

function bindEvents(envId, projectId) {
    $("#task-list-" + envId + "-tbody").on('click', 'tr[rel="resource"]', function(e) {
        var taskId = $(this).attr('data-id');
        switch (e.target.getAttribute('data-title')) {
            case '启动':
                startTask(taskId);
                break;
            case '停止':
                stopTask(taskId);
                break;
            case '记录':
                taskRecord(taskId, projectId);
                break;
            case '状态':
                taskStatus(taskId);
                break;
            case '配置':
                taskConfig(taskId);
                break;
            case '监控':
                taskMonitor(taskId);
                break;
            case '删除':
                taskDelete(taskId,envId,projectId);
                break;
            case '立即执行':
                executeNow(taskId);
                break;
            default:
                //                taskStatus(taskId);
                break;
        }
    })
}

function taskDelete(taskId,envId,projectId){
    notify.dialog('确定删除该任务？', '删除任务', function(selected) {
        if (selected == '好的') {
            console.log(envId);
            taskStore.deleteTask(taskId,envId,{
                success:{
                    run:function(){
                        notify('删除成功！');
                        setTimeout(function(){
                            init(envId,projectId);
                        },500);
                    }
                },
                fail:function(data){
                    console.log(data);
                }
            })
        }
    })
}

function startTask(taskId) {
    notify.dialog('确定启动该任务？', '启动任务', function(selected) {
        if (selected == '好的') {
            taskStore.updateStatus(taskId, 1).done(function(data) { //status==1为启动
                var statusBtn = $('[task-' + taskId + '-btn="start"]')[0];
                statusBtn.setAttribute('task-' + taskId + '-btn', 'stop');
                statusBtn.setAttribute('class', "fa fa-stop fabtn fa-lg");
                statusBtn.setAttribute('data-title','停止');
                statusBtn.setAttribute('title','停止');
                updateModifyInfo(taskId, data.object);
            })
        }
    })
}

function stopTask(taskId) {
    notify.dialog('确定停止该任务？', '停止任务', function(selected) {
        if (selected == '好的') {
            taskStore.updateStatus(taskId, 0).done(function(data) {
                var statusBtn = $('[task-' + taskId + '-btn="stop"]')[0];
                statusBtn.setAttribute('task-' + taskId + '-btn', 'start');
                statusBtn.setAttribute('class', "fa fa-check-circle fabtn fa-lg");
                statusBtn.setAttribute('data-title','启动');
                statusBtn.setAttribute('title','启动');
                updateModifyInfo(taskId, data.object);
            })
        }
    })
}

function updateModifyInfo(taskId, obj) {
    $('#tl-param-' + taskId)[0].innerText = obj.scriptParam;
    $('#tl-type-' + taskId)[0].innerText = obj.scheduleType;
    $('#tl-exp-' + taskId)[0].innerText = obj.expression;
    $('#tl-retry-' + taskId)[0].innerText = obj.retryTimes;
    $('#tl-modifyTime-' + taskId)[0].innerText = modifyTimestamp(obj.modifyTime);
    $('#tl-modifier-' + taskId)[0].innerText = obj.modifier;
    $('#task-' + taskId + '-btn')
}

function taskRecord(taskId, projectId) {
    var taskSelector = $('[task-' + taskId + '-btn="record"]')[0];
    var url = '#/' + projectId + '/taskrecord/' + taskId;
    //taskSelector.setAttribute('href', url);
    toolbar.appendBread(url, '任务历史');
    location.href = '#/' + projectId + '/taskrecord/' + taskId;
}

function taskStatus(taskId) {
    var data = {};
    data['scriptPath'] = $('#tl-scriptPath-' + taskId)[0].innerText
    data['taskId'] = taskId;
    var html = taskstate(data);
    notify.dialog(html, '任务状态', function() {
        clearTimeout(timeoutClock);
    }, {
        width: 800,
        draggable: true,
        close: function() {
            clearTimeout(timeoutClock);
        }
    });
    queryTaskStatus(taskId, null);
}

function executeNow(taskId) {
    taskStore.executeNow(taskId).done(function(ret) {
        if (ret && ret.status === 'success' && ret.object) {
            notify("任务提交成功！");
        } else {
            notify.bad("任务提交失败！");
        }
    });
}

var queryTaskStatus = function(taskId, timestamp) {
    taskStore.queryTaskStatus(taskId, timestamp).done(function(ret) {
        if (ret && ret.object && ret.object.runStatus && ret.object.logInfo) {
            $('#startTime-' + taskId)[0].value = ret.object.runStatus.st;
            $('#endTime-' + taskId)[0].value = ret.object.runStatus.et;
            $('#status-' + taskId)[0].value = mapStatusCode(ret.object.runStatus);
            $('#tsid-' + taskId)[0].value = ret.object.runStatus.id;
            var divLogInfo = $('#logInfo-' + taskId);
            if (ret.object.logInfo.content != "") {
                divLogInfo.append(ret.object.logInfo.content);
                if ($('#auto-scroll-' + taskId)[0].checked)
                    divLogInfo[0].scrollTop = divLogInfo[0].scrollHeight;
            }
        }
        timeoutClock = setTimeout(function() {
            queryTaskStatus(taskId, ret.object.logInfo.timestamp);
        }, 2000)
    });
}

/**
 * 监控配置
 * @param taskId
 */
var taskMonitor = function(taskId){
    var monitorTemp = taskStore.queryMonitorTemplates();
    var monitorP = monitorStore.query(taskId);
    var data = {};
    $.when(monitorP, monitorTemp).then(function (rules, tpl) {
        data.id = taskId;
        var rule = rules[0];
        if(rule && rule.object){
            data.alarms = rule.object;
        }
        var tplObj = tpl[0];
        if(tplObj && tplObj.object){
            data.tpls = tplObj.object;
        }
        var html = monitorTpl(data);
        notify.dialog(html, '监控配置', function(selected) {

        }, {
            width: 500,
            draggable: true,
            close: function() {
                offParseEvent(taskId);
            }
        });
        monitorEvent(taskId);
    });
}

/**
 * 任务配置
 * @param taskId
 */
var taskConfig = function(taskId) {
    var taskP = taskStore.query(taskId);
    var monitorP = monitorStore.query(taskId);
    $.when(taskP, monitorP).then(function (tasks, monitorD) {
        var data = {};
        var taskD = tasks[0];
        if (taskD && taskD.object) {
            data['id'] = taskId;
            data['code'] = taskD.object.code;
            data['param'] = taskD.object.scriptParam;
            data['path'] = taskD.object.scriptPath;
            data['exp'] = taskD.object.expression;
            data['hasChange'] = taskD.object.hasChange;
            data['retry'] = taskD.object.retryTimes;
            if(taskD.object.configs){
                var configs = JSON.parse(taskD.object.configs);
                data['configs'] = configs;
            } else {
                console.log('configs null')
            }
            
            data['alarms'] = monitorD[0].object;
        }
        var html = taskconfig(data);
        notify.dialog(html, '任务配置', function(selected) {
            if (selected === '好的') {
                var config = {};
                config['param'] = $('#tc-param-' + taskId)[0].value;
                config['type'] = $('#tc-type-' + taskId)[0].value;
                config['exp'] = $('#tc-exp-' + taskId)[0].value;
                config['retry'] = $('#tc-retry-' + taskId)[0].value;
                taskStore.updateConfig(taskId, JSON.stringify(config)).done(function(ret) {
                    if (ret && ret.object) {
                        updateModifyInfo(taskId, ret.object);
                        if (ret.object.hasChange === 1) {
                            var editIcon = '<i class="fa fa-edit" style="margin-left: 10px" title="该任务默认配置已被修改，切换包后修改将继续生效"></i>';
                            $('#tl-taskid-' + taskId)[0].innerHTML = taskId + editIcon;
                        } else if (ret.object.hasChange === 0) {
                            $('#tl-taskid-' + taskId)[0].innerHTML = taskId;
                        }
                    }
                });
                offParseEvent(taskId);
            }
        }, {
            width: 500,
            draggable: true,
            close: function() {
                offParseEvent(taskId);
            }
        });
        if (taskD.object.scheduleType === 'interval') {
            $('#tc-type-' + taskId + '-1').attr('selected', 'true');
        }
        if (taskD.object.hasChange) {
            $('#tc-tips-' + taskId)[0].innerText = '提示：当前任务使用的默认配置已被修改';
        }
        parseExp(taskId, taskD.object.scheduleType, taskD.object.expression);
        configEvent(taskId, taskD);
    });
}

var monitorEvent = function(taskId){
    $('#alarm-add-success-' + taskId).on('click', function(e) {
        var rule = {"template_id" : "task_success"};
        monitorStore.addRule(taskId, rule).done(function(ret) {
            taskMonitor(taskId);
        });
    });

    $('#tc-alarms-' + taskId + ' .alarm-rule-del').on('click', function(e) {
        var ruleId = $(this).data('rule-id');
        if(ruleId === 'number_key_value'){

        }
        monitorStore.deleteRule(taskId, ruleId).done(function(ret) {
            taskMonitor(taskId);
        });
    });
    $('#alarm-open-' + taskId).on('click', function(e) {
        var status = $(this).data('alarm-status');
        monitorStore.setStatus(taskId, !status).done(function(ret) {
            taskMonitor(taskId);
        });
    });

    $('.tplOptions').on('click',function(e){
        var ruleId = e.currentTarget.getAttribute('data-id');
        var rule;
        if(ruleId === 'number_key_value'){
            addMonitorForm();
            $('.m-op').on('click',function(e){
                var cur = e.currentTarget;
                var op = cur.getAttribute('data-se');
                var opv = cur.innerHTML;
                document.getElementById('m-operator-val').innerHTML = opv;
                $('#m-operator').attr('data-se',op)
            })
            $('#m-btn-confirm').on('click',function(){
                 rule = {
                    "template_id" : ruleId,
                    "key":$('#m-key').val()||'',
                    "value":$('#m-value').val()||'',
                    "operator":$('#m-operator').attr('data-se')||''
                };
                monitorStore.addRule(taskId, rule).done(function(ret) {
                    taskMonitor(taskId);
                });
            });
            $('#m-btn-cancel').on('click',function(){
                $('#m-form').remove();
            })
        }else{
             rule = {"template_id" : ruleId};
            monitorStore.addRule(taskId, rule).done(function(ret) {
                taskMonitor(taskId);
            });
        }
    })
}


function addMonitorForm(){
    var tmpArr = [];
    tmpArr.push('<form id="m-form" class="form-horizontal">');
    tmpArr.push('<fieldset>');
    tmpArr.push('<div class="form-group">');
    tmpArr.push('<label class="col-md-3 control-label">报警关键字:</label>');
    tmpArr.push('<div class="col-md-6"><input id="m-key" class="form-control" type="text" value=""></div>');
    tmpArr.push('</div>');
    tmpArr.push('<div class="form-group">');
    tmpArr.push('<label class="col-md-3 control-label">判断方式:</label>');
    tmpArr.push('<div class="btn-group"><button id="m-operator" data-se="EQ" type="button" class="btn dropdown-toggle  btn-success btn-xs" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span id="m-operator-val">等于</span><span class="caret"></span></button>');
    tmpArr.push('<ul class="dropdown-menu">');
    tmpArr.push('<li><a href="javascript:void(0);" class="m-op" data-se="EQ">等于</a></li>');
    tmpArr.push('<li><a href="javascript:void(0);" class="m-op" data-se="GT">大于</a></li>');
    tmpArr.push('<li><a href="javascript:void(0);" class="m-op" data-se="GTEQ">大于等于</a></li>');
    tmpArr.push('<li><a href="javascript:void(0);" class="m-op" data-se="LT">小于</a></li>');
    tmpArr.push('<li><a href="javascript:void(0);" class="m-op" data-se="LTEQ">小于等于</a></li>');
    tmpArr.push('</ul>');
    tmpArr.push('</div>');
    tmpArr.push('</div>');
    tmpArr.push('<div class="form-group">');
    tmpArr.push('<label class="col-md-3 control-label">报警值:</label>');
    tmpArr.push('<div class="col-md-6"><input id="m-value" class="form-control" type="text" value=""></div>');
    tmpArr.push('</div>');
    tmpArr.push('<div class="form-group">');
    tmpArr.push('<a href="javascript:void(0);" class="col-md-3" style="text-align: right"><i id="m-btn-confirm" class="fa fa-check fa-lg m-btn" title="确认" data-title="确认"></i></a>');
    tmpArr.push('<a href="javascript:void(0);" class="col-md-6"><i  id="m-btn-cancel" class="fa fa-times fa-lg m-btn" title="取消" data-title="取消"></i></a>');
    tmpArr.push('</div>');
    tmpArr.push('</fieldset>');
    tmpArr.push('</form>');
    $('#monitor-bar').append(tmpArr.join(''));
    $('.m-btn').tooltipster({
        position:"bottom-right"
    });

}

var configEvent = function(taskId, ret) {
    $('#tc-recovery-' + taskId).on('click', function(e) {
        $('#tc-param-' + taskId)[0].value = ret.object.sScriptParam;
        $('#tc-type-' + taskId)[0].value = ret.object.sScheduleType;
        $('#tc-exp-' + taskId)[0].value = ret.object.sExpression;
        $('#tc-retry-' + taskId)[0].value = ret.object.sRetryTimes;
        $('.ui-dialog-buttonset .btn.btn-primary').attr('class', 'btn btn-primary');
        $('#tc-tips-' + taskId)[0].innerText = '';
        parseExp(taskId, ret.object.sScheduleType, ret.object.sExpression);
    })
    $('#tc-exp-' + taskId).on('focusout', function(e) {
        var type = $('#tc-type-' + taskId)[0].value;
        var exp = $('#tc-exp-' + taskId)[0].value;
        parseExp(taskId, type, exp);
    });
    $('#tc-type-' + taskId).on('change', function(e) {
        var type = $('#tc-type-' + taskId)[0].value;
        var exp = $('#tc-exp-' + taskId)[0].value;
        parseExp(taskId, type, exp);
    });
    $('#tc-recovery-' + taskId).on('mouseover', function(e) {
        var tips = '<p>默认配置:</p>';
        tips += '<p>脚本参数:' + ret.object.sScriptParam + '</p>';
        tips += '<p>调度类型:' + ret.object.sScheduleType + '</p>';
        tips += '<p>表达式: ' + ret.object.sExpression + '</p>';
        tips += '<p>重试次数: ' + ret.object.sRetryTimes + '</p>';
        tooltip.pop(this, tips);
    });

    $('#alarm-add-success-' + taskId).on('click', function(e) {
        alert('hide');
        var rule = {"template_id" : "task_success"};
        monitorStore.addRule(taskId, rule).done(function(ret) {
            taskConfig(taskId);
        });
    });
    $('#tc-alarms-' + taskId + ' .alarm-rule-del').on('click', function(e) {
        var ruleId = $(this).data('rule-id');
        monitorStore.deleteRule(taskId, ruleId).done(function(ret) {
            taskConfig(taskId);
        });
    });
}

var offParseEvent = function(taskId) {
    $('#tc-recovery-' + taskId).off('click');
    $('#tc-exp-' + taskId).off('focusout');
    $('#tc-type-' + taskId).off('change');
    $('#alarm-open-' + taskId).off('click');
    $('#tc-alarms-' + taskId + ' .alarm-rule-del').off('click');
    $('#alarm-add-success-' + taskId).off('click');
}


var parseExp = function(taskId, type, exp) {
    taskStore.parseExp(type, exp).done(function(ret) {
        if (ret && ret.object) {
            if (ret.object.isValid === 'false') {
                $('#tc-mess-' + taskId)[0].innerHTML = 'ERROR：' + ret.object.message;
                $('.ui-dialog-buttonset .btn.btn-primary').attr('class', 'btn btn-primary disabled');
            } else {
                $('#tc-mess-' + taskId)[0].innerHTML = '触发时间：' + ret.object.message;
                $('.ui-dialog-buttonset .btn.btn-primary').attr('class', 'btn btn-primary');
            }
        }
    })
}

/*
 * <pre>
 * ts:task status 任务状态:e(enable)/d(disable)
 * ss:scheduler status 调度状态：r(run)/w(wait)/t(retry)
 * id:tsid
 * st:start time 本次调度开始时间
 * et:end time 最后调度结束时间
 * sr:scheduler result 最后一次调度结果
 * rc:retry count 失败重试次数
 * </pre>
 * */
var mapStatusCode = function(status) {
    if (status.ts === 'd') {
        return '停止';
    }

    if (status.ts === 'e') {
        if (status.ss === 'r') {
            if (status.rc == '' || status.rc === '0') {
                return '运行中...';
            } else {
                return '第' + status.rc + '次重试运行中...';
            }
        }

        if (status.ss === 'w') {
            return '等待中...';
        }
    }
    return '';
}