var baseUrl = "/NewToolConfig/";
var gird;
var dataItem;
var ruleMachine;
var STATUS_IDS = "";
$(function() {
    initToolMangememt(""); //初始化页面
    // $("#startTime").kendoDatePicker({ format: "yyyy/MM/dd", value: new Date() });
    // $("#endTime").kendoDatePicker({ format: "yyyy/MM/dd", value: new Date() });
    $('#search').trigger('click')
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
        R_TYPE: { type: "int" },
        PROGRAM: { type: "string" },
        TOL_NO:{type:"string"},
        TOL_NAME:{type:"string"}
    };

    var col = [];
    col.push({ field: "R_ID", title: "R_ID", width: 50, sortable: false, filterable: false, hidden: true });
    // col.push({ field: "R_NAME", title: "规则名称", width: 100, sortable: true, filterable: false, hidden: false });
    col.push({ field: "TOL_NO", title: "刀具编号", width: 100, sortable: false, filterable: false, hidden: false });
    col.push({ field: "STATUS_IDS", title: "状态", width: 250, sortable: false, filterable: false, hidden: false, template: kendo.template($("#STATUS_IDS").html()) });;
    // col.push({ field: "TOL_NO", title: "刀具编号", width: 100, sortable: true, filterable: false, hidden: false });
    col.push({ field: "TOL_NAME", title: "刀具名称", width: 100, sortable: false, filterable: false, hidden: false });
    col.push({ field: "EXCEPT_LIFE", title: "预计寿命(h)", width: 100, sortable: false, filterable: false, hidden: false, template: kendo.template($("#EXCEPT_LIFE2").html()) });
    col.push({ field: "WARN_LIFE", title: "预警寿命(h)", width: 100, sortable: false, filterable: false, hidden: false, template: kendo.template($("#WARN_LIFE2").html()) });
    // col.push({ field: "MAC_NO", title: "设备编号", width: 100, sortable: true, filterable: false, hidden: false });
    col.push({ field: "R_TYPE", title: "类型", width: 100, sortable: false, filterable: false, hidden: false, template: kendo.template($("#R_TYPET").html()) });
    col.push({ field: "PROGRAM", title: "程序号", width: 100, sortable: false, filterable: false, hidden: false });
    col.push({
        command: [
            { name: "aa", text: lang.Order.Edit + '<i class="icon-edit"></i>', className: "btn purple", click: changeProduct },
            { name: "bb", text: lang.Order.Delete + '<i class="icon-remove-sign"></i>', className: "btn red ", click: delRow }
        ],
        title: "操作",
        width: 200
    });

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
        actionUrl: ["GetCutterRuleList", "", "", ""], //读、新增、更改、删除的URLaction
        custom: {
            PrimaryKey: "R_ID",
            fields: fields,
            cols: col
        }
    });
}


//新增
function add() {
    $.x5window(lang.Order.Add, kendo.template($("#addToolConfig").html()));
    ruleMachine = $("#ToolMachine").multipleComboxTree({
        url: "/Alarm/GetAllMachineAndMachineGroup",
        url2: "/Alarm/GetKeywordMachinelist",
        type: 2,
        inputheight:20  ,
        data: {
            GroupId: 0
        },
        //checkbox: true
    }).data("BZ-multipleComboxTree");
    $("#input_MAC_NAR").css("height", "20px");
    $("#RTYPE").change(()=>{
        var type = $("#RTYPE").val();
        if(type==2)
            $("#statusTab").removeClass("hiddenDom");
        else
            $("#statusTab").addClass("hiddenDom");
    })

    $.get(baseUrl+'getProgramList',(data)=>{
        if(data.Status==0){
            if(data.Data.length>0){
                for(var i=0;i<data.Data.length;i++)
                    $("#PROGRAM").append("<option value="+data.Data[i].PROGRAME_NAME+">"+data.Data[i].PROGRAME_NAME+"</option>");
            }
        }
    });

    $("#Save").click(function() {
        if($("#PROGRAM").val()==""||$("#EXCEPT_LIFE").val()==""||$("#WARN_LIFE").val()==""||$("#ToolNo").val()==""||$("#ToolName").val()==""){
            BzAlert("信息不全，请填写完毕！");
            return;
        }else{
            addFun();
        };
    })
}
//新增AJAX方法
function addFun() {
    var R_NAME = $("#ToolNo").val();
    var R_TYPE = parseInt($("#RTYPE").val());

    var statusArr = [];
    if(R_TYPE==2){ // 用时
        $(".statusInp").each(function(){
            if($(this).prop('checked')){
                statusArr.push($(this).val());
            }
        })
    }
    STATUS_IDS = statusArr.join(",");

    var EXCEPT_LIFE = parseFloat($("#EXCEPT_LIFE").val())*3600;
    var WARN_LIFE = parseFloat($("#WARN_LIFE").val())*3600;
    // var MAC_NBR = ruleMachine.rData;
    var MAC_NBR = 10;
    var CUTTER_GROUP_NBR = 1;
    var PROGRAM = $("#PROGRAM").val();
    var TOL_NO = $("#ToolNo").val();
    var TOL_NAME = $("#ToolName").val();

    var data = {
        R_NAME: R_NAME,
        STATUS_IDS: STATUS_IDS,
        EXCEPT_LIFE: EXCEPT_LIFE,
        WARN_LIFE: WARN_LIFE,
        MAC_NBR: MAC_NBR,
        CUTTER_GROUP_NBR: CUTTER_GROUP_NBR,
        R_TYPE: R_TYPE,
        PROGRAM: PROGRAM,
        TOL_NO:TOL_NO,
        TOL_NAME:TOL_NAME
    }
    
    $.post(baseUrl + 'InsertCutterRule', (data), function(data) {
        if (data.Status == 0) {
            $("#x5window").data("kendoWindow").close();
            BzSuccess(data.Message);
            refreshData(); //刷新页面
        } else
            BzAlert(data.Message);
    })
}

//编辑
function changeProduct(e) {
    $.x5window(lang.Order.Edit, kendo.template($("#addToolConfig").html()));
    ruleMachine = $("#ToolMachine").multipleComboxTree({
        url: "/Alarm/GetAllMachineAndMachineGroup",
        url2: "/Alarm/GetKeywordMachinelist",
        type: 2,
        inputheight:20  ,
        data: {
            GroupId: 0
        }
    }).data("BZ-multipleComboxTree");
    $("#RTYPE").change(()=>{
        var type = $("#RTYPE").val();
        if(type==2)
            $("#statusTab").removeClass("hiddenDom");
        else
            $("#statusTab").addClass("hiddenDom");
    })
    
    $.ajax({
        url: baseUrl+'getProgramList',
        async: false,
        success: function(data) {
            if(data.Status==0){
                if(data.Data.length>0){
                    for(var i=0;i<data.Data.length;i++)
                        $("#PROGRAM").append("<option value="+data.Data[i].PROGRAME_NAME+">"+data.Data[i].PROGRAME_NAME+"</option>");
                }
            }
        }
    });

    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    $("#R_NAME").val(dataItem.R_NAME);
    $("#EXCEPT_LIFE").val((parseFloat(dataItem.EXCEPT_LIFE)/3600).toFixed(2));
    $("#WARN_LIFE").val((parseFloat(dataItem.WARN_LIFE)/3600).toFixed(2));
    $("#PROGRAM").val(dataItem.PROGRAM);
    $("#RTYPE").val(dataItem.R_TYPE);
    $("#input_ToolMachine").val(dataItem.MAC_NAME);
    $("#ToolNo").val(dataItem.TOL_NO);
    $("#ToolName").val(dataItem.TOL_NAME);

    // 回显状态
    if(dataItem.R_TYPE==2) { // 用时
        $("#statusTab").removeClass("hiddenDom");

        var arr = dataItem.STATUS_IDS.split(",");
        $(".statusInp").each(function(){
            var thisVal = $(this).val();
            for(var i=0;i<arr.length;i++){
                if(thisVal==arr[i]){
                    $(this).attr('checked','checked')
                }
            }
        })
    }

    $("#Save").click(function() {
        var R_TYPE = parseInt($("#RTYPE").val());
        var statusArr = [];
        if(R_TYPE==2){ // 用时
            $(".statusInp").each(function() {
                if($(this).prop('checked')) {
                    statusArr.push($(this).val());
                }
            })
        }
        STATUS_IDS = statusArr.join(",");
        
        var data = {
            R_ID:dataItem.R_ID,
            R_NAME: $("#ToolNo").val(),
            STATUS_IDS: STATUS_IDS,
            EXCEPT_LIFE: parseFloat($("#EXCEPT_LIFE").val())*3600,
            WARN_LIFE: parseFloat($("#WARN_LIFE").val())*3600,
            // MAC_NBR: ruleMachine.rData==undefined?dataItem.MAC_NBR:ruleMachine.rData,
            MAC_NBR: 10,
            CUTTER_GROUP_NBR: dataItem.CUTTER_GROUP_NBR,
            R_TYPE: R_TYPE,
            PROGRAM: $("#PROGRAM").val(),
            TOL_NO: $("#ToolNo").val(),
            TOL_NAME: $("#ToolName").val()
        }

        $.post(baseUrl + 'UpdateCutterRule', (data), function(data) {
            if (data.Status == 0) {
                $("#x5window").data("kendoWindow").close();
                BzSuccess(data.Message);
                refreshData(); //刷新页面
            } else {
                BzAlert(data.Message);
            }
        })
    })
}

//删除行
function delRow(e) {
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    $.post(baseUrl + 'DelCutterRule', ({R_ID:dataItem.R_ID}), function(data) {
        if (data.Status == 0) {
            BzSuccess(data.Message);
            refreshData(); //刷新页面
        } else {
            BzAlert(data.Message);
        }
    })
}

//查询
$("#search").click(function() {
    refreshData();
})

//刷新数据
function refreshData(){
    grid.grid("refresh", function() {
        return [
            { field: "PROGRAM", Operator: "eq", value: $("#prodName").val() },
            { field: "MAC_NBR", Operator: "eq", value:  $('#my-selects').val()=='undefined'?"":$('#my-selects').val().toString()  },
            { field: "R_TYPE", Operator: "eq", value: $("#R_TYPE").val() },
        ];
    }, {
        logic: "and"
    });
}