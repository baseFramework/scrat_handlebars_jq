exports.table = function(selector, options){
    options = $.extend({
        iDisplayLength : 20,
        bAutoWidth: false,
        "sPaginationType" : "bootstrap_full",
        "sDom" : "<'dt-top-row'><'dt-wrapper't><'dt-row dt-bottom-row'<'row'<'col-sm-5'i><'col-sm-7 text-right'p>>",
        "oLanguage" : {
            "sProcessing": "正在加载中......",
            "sLengthMenu": "每页显示 _MENU_ 条记录",
            "sZeroRecords": "对不起，查询不到相关数据！",
            "sEmptyTable": "表中无数据存在！",
            "sInfo": "当前显示 _START_ 到 _END_ 条，共 _TOTAL_ 条",
            "sInfoFiltered": "找到 _MAX_ 条",
            "sSearch": "搜索",
            "oPaginate": {
                "sFirst": "首页",
                "sPrevious": "上一页",
                "sNext": "下一页",
                "sLast": "末页"
            }
        },
        "bSortCellsTop" : true
    }, options);
    var oTable = $(selector).dataTable(options);

    var filters = oTable.find("thead input");

    /* Add the events etc before DataTables hides a column */
    filters.keyup(function() {
        oTable.fnFilter(this.value, oTable.oApi._fnVisibleToColumnIndex(oTable.fnSettings(), $(this).parent().parent().index()));
    });

    filters.each(function() {
        this.initVal = this.value;
    });
    filters.focus(function() {
        if (this.className == "search_init") {
            this.className = "";
            this.value = "";
        }
    });
    filters.blur(function() {
        if (this.value == "") {
            this.className = "search_init";
            this.value = this.initVal;
        }
    });
};