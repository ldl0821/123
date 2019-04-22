var grid;
var u;
var viewModel;
var MAC_NBR;
var baseUrl = "/AlarmReasonEnd/";
$(function() {
    var fields = {
        MEMO: { type: "string" },
        TOOL_NO: { type: "string" },
        SURVEY_VAL: { type: "string" },
        EVENT_DATE: { type: "string" }
    };
    var cols = [];
    cols.push({ field: "START_DATE", title: '开始时间', width: 80, sortable: false, filterable: false,format: "{0: yyyy/MM/dd HH:mm:ss}" });
    cols.push({ field: "SCHEME_NAME", title: '方案名称', width: 80, sortable: false, filterable: false });
    // cols.push({ field: "REASONS", title: '停机原因', width: 120, sortable: false, filterable: false,template: kendo.template($("#REPAIR_REASONS").html())});
    cols.push({ field: "REASON_NAME", title: '停机原因', width: 120, sortable: false, filterable: false});
    cols.push({ field: "STATE", title: '状态', width: 80, sortable: false, filterable: false, hidden: false,template: kendo.template($("#REPAIR_STATE").html())});
    cols.push({ field: "MAC_NBR", title: '设备', width: 80, sortable: false, filterable: false, hidden: false,template: kendo.template($("#MAC_NBR_NAME").html()) });
    // cols.push({ field: "FILE_NAME", title: '文件名称', width: 100, sortable: false, filterable: false,template: kendo.template($("#template_FILE_NAME").html())});
    cols.push({ field: "DESCRIBE", title: "描述", width: 150, sortable: false, filterable: false});
    //Grid
    grid = $("#grid").grid({
        checkBoxColumn: false,
        baseUrl: baseUrl, //调用的URL
        selectable: "single", //行选择方式
        scrollable: true,
        editable: false, //是否可编辑
        //height: 300,
        resizeGridWidth: true, //列宽度可调
        customsearch: true,
        filterable: true,
        //server: true, //服务器端刷新，包括排序，筛选等
        actionUrl: ["CutterList", "", "", ""], //读、新增、更改、删除的URLaction
        custom: {
            PrimaryKey: "APPLAY_NBR",
            fields: fields,
            cols: cols
        },
    })

    function koModel() {
        var self = this;
        self.MACS = ko.observableArray([]);
        self.order_edit = function() {
            //单号维护
            $.get("/MaintenanceRequest/GetRules", function(data) {
                $.x5window(lang.Maintain.Norule, kendo.template($("#order-template").html()));
                previewModel = ko.mapping.fromJS({
                    PREFIX1: ko.observable(data.Data[2].PREFIX),
                    INFIX1: ko.observable(data.Data[2].INFIX),
                    SUFFIX1: ko.observable(data.Data[2].SUFFIX),
                    save: function(e) {
                        var data = [
                            { PREFIX: e.PREFIX1(), INFIX: e.INFIX1(), SUFFIX: e.SUFFIX1(), RULE_NBR: 3 }
                        ];
                        $.ajax({
                            url: '/MaintenanceRequest/UpdRules',
                            type: 'post',
                            data: JSON.stringify(data),
                            contentType: 'application/json',
                            success: function(data) {
                                if (data.Status == 0) {
                                    $("#x5window").data("kendoWindow").close();
                                    BzSuccess(data.Message);
                                } else {
                                    BzAlert(data.Message);
                                }
                            }
                        })
                    }
                });
                ko.applyBindings(previewModel, document.getElementById("fixviewmodel"));
            });
        };
        self.tree_refresh = function() {
            getTreeData("refresh");
        };
    }
    u = new koModel();
    viewModel = ko.applyBindings(u);

    $('#filter').bind('keypress', function(event) {
        if (event.keyCode == "13") {
            getDataByKeyWord();
        }
    });
    
});

//点击禁用按钮
function f_Enable(e) {
    var dd = grid.data("bz-grid").selectedDataRows();
    $.post("/ReasonConfig/UpdataState", { ID: dd[0].ID,IS_OPEN:!dd[0].IS_OPEN }, function(data) {
        if (data.Status == 0) {
            getDataByKeyWord();
            BzSuccess(data.Message);
        } else {
            BzAlert(data.Message);
        }
    });
}

function refreshGrid() {
    grid.grid("refresh", function() {
        return [];
    });
}

function getDataByKeyWord() { //关键字查询
    if ($("#filter").val() == "") {
        grid.grid("refresh", function() {
            return [];
        });
    } else {
        grid.grid("refresh", function() {
            return $("#filter").val();
        });
    }
}

