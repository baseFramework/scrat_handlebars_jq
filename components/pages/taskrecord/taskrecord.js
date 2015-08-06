var taskStore = require('stores/task');
var toolbar = require('widgets/toolbar');
var taskrecordTpl = __inline('taskrecord.handlebars');
var table = require('utils/table');
var startTime = '2015-01-01 01:00:00';
Date.prototype.Format = function (fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
}
var endTime = new Date().Format("yyyy-MM-dd hh:mm:ss");
var render = function (selector, data,st,en) {
    //alert(st);
    data.startTime = st.split(':')[0] +':'+ st.split(':')[1];
    data.curDate = en.split(':')[0] +':'+ en.split(':')[1];
    $(selector).html(taskrecordTpl(data));
}
var pageSize = 10;
var totalPage = 0;
var totalRecord = 0;
var firstPage = 0;
var lastPage = 0;
var nextPage = 0;
var previousPage = 0;
var currentPage = 0;

module.exports = {
    init: function (ctx) {
        var taskId = ctx.params.subid;
        taskStore.queryRecordCountsByTm(taskId,startTime,endTime).done(function (data) {
            totalRecord = data.object;
            totalPage = Math.ceil(totalRecord / pageSize);
            if (totalPage == 0) {
                lastPage = 0;
            } else {
                lastPage = totalPage - 1;
            }
            queryTaskRecord(taskId, startTime,endTime,0);
        })

    }
}

function bindEvents(taskId, selector) {
    selector.find('.pagination').on('click', function (e) {
        var input = $(this).find('input[name="pageNo"]')[0];
        switch (e.target.innerText) {
            case '首页':
                gotoFirstPage(taskId);
                break;
            case '末页':
                gotoLastPage(taskId);
                break;
            case '上一页':
                gotoPreviousPage(taskId);
                break;
            case '下一页':
                gotoNextPage(taskId);
                break;
            case 'go':
                gotoPage(taskId, input);
                break;
        }
    })
    $('.taskrecord-refresh').on('click', function (e) {
        refreshPage(taskId);
    })
    $('.taskrecord-search').on('click', function (e) {
        var tid = taskId;
        var tsid = $('#recordInput').val();
        if(tsid !== '' && tsid !== null){
            queryRecordByTsid(tid,tsid);
        }else{
            refreshPage(taskId);
        }
    })
}


function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}

function gotoFirstPage(taskId) {
    if (currentPage == firstPage) return;
    queryTaskRecord(taskId, startTime,endTime,firstPage);
}

function gotoLastPage(taskId) {
    if (currentPage == lastPage) return;
    queryTaskRecord(taskId, startTime,endTime,lastPage);
}

function gotoNextPage(taskId) {
    if (currentPage == lastPage) return;
    queryTaskRecord(taskId, startTime,endTime,nextPage);
}

function gotoPreviousPage(taskId) {
    if (currentPage == firstPage) return;
    queryTaskRecord(taskId, startTime,endTime,previousPage);
}

function refreshPage(taskId) {
    taskStore.queryRecordCount(taskId).done(function (data) {
        totalRecord = data.object;
        totalPage = Math.ceil(totalRecord / pageSize);
        if (totalPage == 0) {
            lastPage = 0;
        } else {
            lastPage = totalPage - 1;
        }
        endTime = new Date().Format("yyyy-MM-dd hh:mm:ss");
        queryTaskRecord(taskId,startTime,endTime,currentPage);
    })
}

function gotoPage(taskId, gotoSelector) {
    var gotoPageNo = parseInt(gotoSelector.value);
    if (gotoPageNo > (parseInt(lastPage) + 1) || gotoPageNo < 1 || isNaN(gotoPageNo)) {
        return;
    }
    queryTaskRecord(taskId,startTime,endTime,gotoPageNo - 1);
}

function queryTaskRecord(taskId, startTime,endTime , page) {
    $('#spinner').removeClass('hide');
    $('#mask').removeClass('hide');
    taskStore.queryRecordByTm(taskId, startTime,endTime,page, pageSize).done(function (data) {
        var allData = {};
        allData['taskId'] = taskId;
        allData['taskRecords'] = data.object;
        allData['count'] = totalRecord;
        allData['startRecordNo'] = getStartRecordNo(page);
        allData['endRecordNo'] = getEndRecordNo(page);
        allData['pageNo'] = parseInt(page) + 1;
        allData['lastPageNo'] = totalPage;
        render('#content', allData,startTime,endTime);
        $('#mask').addClass('hide');
        $('#spinner').addClass('hide');
        currentPage = parseInt(page);
        nextPage = getNextPageNo(page);
        previousPage = getPreviousPageNo(page);
        var pageBtn = $('.dataTables_paginate.paging_bootstrap_full');
        bindEvents(taskId, pageBtn);
        $('.recbtn').tooltipster({
            position:"bottom-right"
        });
        $('#input-date').datetimepicker({
            autoclose: true,
            todayBtn: true,
            startDate:new Date('2015-01-01 01:00:00'),
            endDate:new Date(),
            format: "yyyy-mm-dd hh:ii"
        }).on('changeDate',function(){
            var st = $('#rec-start-tm').val();
            var en = $('#rec-end-tm').val();
            //$('#input-date-end').datetimepicker('setStartDate' ,new Date(st));
            st +=":00";
            en +=":00";
            startTime = st;
            //alert(startTime);
            endTime = en;
            queryReacordByTime(taskId,st,en);
        });
        $('#input-date-end').datetimepicker({
            autoclose: true,
            todayBtn: true,
            startDate:new Date('2015-01-01 01:00:00'),
            endDate:new Date(),
            format: "yyyy-mm-dd hh:ii"
        }).on('changeDate',function(){
            var st = $('#rec-start-tm').val();
            var en = $('#rec-end-tm').val();
            //$('#input-date').datetimepicker('setEndDate',new Date(en));
            st +=":00";
            en +=":00";

            startTime = st;
            endTime = en;
            queryReacordByTime(taskId,st,en);
        });
    })
}

/**
 * 根据时间查询日志
 * @param st
 * @param en
 */
function queryReacordByTime(tid,st,en){
    $('#spinner').removeClass('hide');
    $('#mask').removeClass('hide');
    var nst = st.split(':')[0] +':'+ st.split(':')[1];
    var nen = en.split(':')[0] +':'+ en.split(':')[1];
    var timeData = taskStore.queryRecordByTm(tid,st,en,0,10);
    var timeCounts = taskStore.queryRecordCountsByTm(tid,st,en);
    $.when(timeData, timeCounts).then(function(data,counts){
        $('.datetimepicker').remove();
        data = data[0];
        if(isArray(data.object) === false){
            var tempObj = data.object;
            data.object = [];
            data.object.push(tempObj);
        }
        totalPage = Math.ceil(counts[0].object / pageSize);
        if (totalPage == 0) {
            lastPage = 0;
        } else {
            lastPage = totalPage - 1;
        }
        //console.log(data.object);
        var page = 0;
        var allData = {};
        allData['taskId'] = tid;
        allData['taskRecords'] = data.object;
        allData['count'] = totalRecord;
        allData['startRecordNo'] = getStartRecordNo(page);
        allData['endRecordNo'] = getEndRecordNo(page);
        allData['pageNo'] = parseInt(page) + 1;
        allData['lastPageNo'] = totalPage;
        render('#content', allData,nst,nen);
        currentPage = parseInt(page);
        nextPage = getNextPageNo(page);
        previousPage = getPreviousPageNo(page);
        var pageBtn = $('.dataTables_paginate.paging_bootstrap_full');
        bindEvents(tid, pageBtn);
        $('.recbtn').tooltipster({
            position:"bottom-right"
        });
        $('#input-date').datetimepicker({
            autoclose: true,
            todayBtn: true,
            startDate:new Date('2015-01-01 01:00:00'),
            endDate:new Date(),
            format: "yyyy-mm-dd hh:ii"
        }).on('changeDate',function(){
            var st = $('#rec-start-tm').val();
            var en = $('#rec-end-tm').val();
            //$('#input-date-end').datetimepicker('setStartDate' ,new Date(st));
            st +=":00";
            en +=":00";
            startTime = st;
            endTime = en;
            if(tid){
                queryReacordByTime(tid,st,en);
            }
        });
        $('#input-date-end').datetimepicker({
            autoclose: true,
            todayBtn: true,
            startDate:new Date(startTime),
            endDate:new Date(),
            format: "yyyy-mm-dd hh:ii"
        }).on('changeDate',function(){
            var st = $('#rec-start-tm').val();
            var en = $('#rec-end-tm').val();
            //$('#input-date').datetimepicker('setEndDate',new Date(en));
            st +=":00";
            en +=":00";
            startTime = st;
            endTime = en;
            if(tid){
                queryReacordByTime(tid,st,en);
            }
        });
        $('#spinner').addClass('hide');
        $('#mask').addClass('hide');
    })
}

function queryRecordByTsid(tid,tsid){
    taskStore.queryRecordByTsID(tid,tsid).done(function(data){
        if(isArray(data.object) === false){
            var tempObj = data.object;
            data.object = [];
            data.object.push(tempObj);
        }
        var page = 0;
        var allData = {};
        allData['taskId'] = tid;
        allData['taskRecords'] = data.object;
        allData['count'] = totalRecord;
        allData['startRecordNo'] = getStartRecordNo(page);
        allData['endRecordNo'] = getEndRecordNo(page);
        allData['pageNo'] = parseInt(page) + 1;
        allData['lastPageNo'] = totalPage;
        render('#content', allData,startTime,endTime);
        currentPage = parseInt(page);
        nextPage = getNextPageNo(page);
        previousPage = getPreviousPageNo(page);
        var pageBtn = $('.dataTables_paginate.paging_bootstrap_full');
        bindEvents(tid, pageBtn);
        $('.recbtn').tooltipster({
            position:"bottom-right"
        });
        $('.recbtn').tooltipster({
            position:"bottom-right"
        });
        $('#input-date').datetimepicker({
            autoclose: true,
            todayBtn: true,
            startDate:new Date('2015-01-01 01:00:00'),
            endDate:new Date(),
            format: "yyyy-mm-dd hh:ii"
        }).on('changeDate',function(){
            var st = $('#rec-start-tm').val();
            var en = $('#rec-end-tm').val();
            //$('#input-date-end').datetimepicker('setStartDate' ,new Date(st));
            st +=":00";
            en +=":00";
            startTime = st;
            //alert(startTime);
            endTime = en;
            queryReacordByTime(tid,st,en);
        });
        $('#input-date-end').datetimepicker({
            autoclose: true,
            todayBtn: true,
            startDate:new Date('2015-01-01 01:00:00'),
            endDate:new Date(),
            format: "yyyy-mm-dd hh:ii"
        }).on('changeDate',function(){
            var st = $('#rec-start-tm').val();
            var en = $('#rec-end-tm').val();
            //$('#input-date').datetimepicker('setEndDate',new Date(en));
            st +=":00";
            en +=":00";

            startTime = st;
            endTime = en;
            queryReacordByTime(tid,st,en);
        });
    })
}

function getNextPageNo(page) {
    if (page == lastPage) {
        $('li[class="last"]').attr('class', 'last disabled');
        $('li[class="next"]').attr('class', 'next disabled');
        return lastPage;
    } else {
        $('li[class="last"]').attr('class', 'last');
        $('li[class="next"]').attr('class', 'next');
        return parseInt(page) + 1;
    }
}

function getPreviousPageNo(page) {
    if (page == 0) {
        $('li[class="first"]').attr('class', 'first disabled');
        $('li[class="prev"]').attr('class', 'prev disabled');
        return 0;
    } else {
        $('li[class="first"]').attr('class', 'first');
        $('li[class="prev"]').attr('class', 'prev');
        return parseInt(page) - 1;
    }
}
function getStartRecordNo(page) {
    if (totalPage == 0) return 0;
    return (page * pageSize + 1);
}

function getEndRecordNo(page) {
    if (page == lastPage) {
        return totalRecord;
    } else {
        return (parseInt(page) + 1) * pageSize;
    }
}
