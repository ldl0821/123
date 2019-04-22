var baseUrl = "/ToolRecords/";
var gird;
$(function() {
    initToolMangememt(""); //初始化页面
    $("#startTime").kendoDatePicker({ format: "yyyy/MM/dd", value: new Date() });
    $("#endTime").kendoDatePicker({ format: "yyyy/MM/dd", value: new Date() });
})

//初始化进行时页面
function initToolMangememt(param) {
    var fields = {
        R_ID: { type: "int" },
        R_NAME: { type: "string" },
        STATUS_IDS: { type: "string" },
        EXCEPT_LIFE: { type: "string" },
        WARN_LIFE: { type: "string" },
        MAC_NBR: { type: "int" },
        MAC_NO: { type: "string" },
        MAC_NAME: { type: "string" },
        R_TYPE: { type: "int" },
        PROGRAM: { type: "string" },
        NEW_CUTTER_NO:{type:"string"},
        NEW_CUTTER_NO_NAME:{type:"string"},
        CUT_BEGIN_DATE:{type:"date"},
        // CUT_END_DATE:{type:"date"}
    };

    var col = [];
    col.push({ field: "R_ID", title: "R_ID", width: 50, sortable: false, filterable: false, hidden: true });
    col.push({ field: "R_NAME", title: "规则名称", width: 100, sortable: false, filterable: false, hidden: true });
    col.push({ field: "NEW_CUTTER_NO", title: "刀具编号", width: 100, sortable: false, filterable: false, hidden: false });
    col.push({ field: "NEW_CUTTER_UNIQUE_NO", title: "刀具 ID", width: 100, sortable: false, filterable: false, hidden: false });
    col.push({ field: "NEW_CUTTER_NO_NAME", title: "刀具名称", width: 100, sortable: false, filterable: false, hidden: false });
    col.push({ field: "EXCEPT_LIFE", title: "预计寿命(h)", width: 100, sortable: false, filterable: false, hidden: false, template: kendo.template($("#EXCEPT_LIFE2").html()) });
    col.push({ field: "WARN_LIFE", title: "预警寿命(h)", width: 100, sortable: false, filterable: false, hidden: false, template: kendo.template($("#EXCEPT_LIFE2").html()) });
    col.push({ field: "MAC_NO", title: "设备编号", width: 100, sortable: false, filterable: false, hidden: false });
    col.push({ field: "MAC_NAME", title: "设备名称", width: 100, sortable: false, filterable: false, hidden: false });
    col.push({ field: "PROGRAM", title: "程序号", width: 100, sortable: false, filterable: false, hidden: false });
    col.push({ field: "CUT_BEGIN_DATE", title: "入库时间", width: 100, sortable: false, filterable: false, hidden: false, format: "{0: yyyy-MM-dd HH:mm:ss}" });
    // col.push({ field: "CUT_END_DATE", title: "卸刀时间", width: 100, sortable: true, filterable: false, hidden: false, format: "{0: yyyy-MM-dd HH:mm:ss}" });

    grid = $("#grid").grid({
        baseUrl: baseUrl, //调用的URL
        selectable: "single", //行选择方式
        sort: [{ field: "R_ID", dir: "DESC" }],
        scrollable: true,
        editable: false, //是否可编辑
        autoBind: false,
        isPage: true,
        isPage: true,
        height: 600,
        server: true,
        customsearch: true,
        pageable: true,
        actionUrl: ["GetCutterDurationHisLifeList", "", "", ""], //读、新增、更改、删除的URLaction
        custom: {
            PrimaryKey: "R_ID",
            fields: fields,
            cols: col
        }
    });
}

//查询
$("#search").click(function() {
    grid.grid("refresh", function() {
        return [
            { field: "NEW_CUTTER_NO", Operator: "eq", value: $("#ToolNo").val() },
            { field: "BEIN_DATE", Operator: "eq", value: $("#startTime").val() },
            { field: "END_DATE", Operator: "eq", value: $("#endTime").val() },
            { field: "MAC_NBR", Operator: "eq", value: $('#my-selects').val()=='undefined'?"":$('#my-selects').val().toString() }
        ];
    }, {
        logic: "and"
    });
})