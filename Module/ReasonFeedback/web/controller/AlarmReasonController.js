var grid;
var u;
var viewModel;
var MAC_NBR;
var baseUrl = "/AlarmReason/";
$(function() {
    var fields = {
        MEMO: { type: "string" },
        TOOL_NO: { type: "string" },
        SURVEY_VAL: { type: "string" },
        EVENT_DATE: { type: "string" }
    };
    var cols = [];
    cols.push({ field: "START_DATE", title: '开始时间', width: 120, sortable: false, filterable: false});
    cols.push({ field: "SCHEME_NAME", title: '方案名称', width: 80, sortable: false, filterable: false });
    // cols.push({ field: "REASONS", title: '停机原因', width: 120, sortable: false, filterable: false,template: kendo.template($("#REPAIR_REASONS").html())});
    cols.push({ field: "REASON_NAME", title: '停机原因', width: 120, sortable: false, filterable: false,template: kendo.template($("#REPAIR_REASONS").html())});
    cols.push({ field: "STATE", title: '状态', width: 80, sortable: false, filterable: false, hidden: false,template: kendo.template($("#REPAIR_STATE").html())});
    cols.push({ field: "MAC_NBR", title: '设备', width: 80, sortable: false, filterable: false, hidden: false,template: kendo.template($("#MAC_NBR_NAME").html()) });
    // cols.push({ field: "IS_FILE", title: '是否上传文件', width: 100, sortable: false, filterable: false,template: kendo.template($("#template_STATE").html()) });
    // cols.push({ field: "FILE_NAME", title: '文件名称', width: 100, sortable: false, filterable: false,template: kendo.template($("#template_FILE_NAME").html())});
    cols.push({ field: "DESCRIBE", title: "描述", width: 120, sortable: false, filterable: false});
    cols.push({
        command: [
            // { name: "aa", text: lang.Maintain.UploadFile + '<i class="icon-edit"></i>', className: "btn purple", click: f_edit },
            { name: "cc", text: '添加原因' + '<i class="icon-edit"></i>', className: "btn blue", click: f_edit_cause },
            { name: "bb", text: lang.Order.Complete + '<i class="icon-remove-sign"></i>', className: "btn green ", click: f_del },
        ],
        title: lang.Order.Operation,
        width: 180
    });

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
        self.grid_add = function(e) {
            $.x5window(lang.Order.Add, kendo.template($("#popup-add").html()));
            addOrEdit(); //新增
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

function f_edit_cause(e){
    $.x5window(lang.Order.Add, kendo.template($("#popup-add").html()));
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    addOrEdit(dataItem); //新增
}

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


function addOrEdit(dataItem) {
    if(dataItem !=undefined){
        $.ajax({
            url: '/AlarmReason/getAlarmReason',
            type: 'POST',
            success: function(data) {
                $("#REASON").kendoComboBox({
                    dataTextField: "REASON",
                    dataValueField: "ID",
                    dataSource: data.Data,
                    // value: data.Data[0].COMPANY_NAME,
                    // change: btnExamines
                });
            },
            error: function() {
                console.error(lang.Common.Error);
                return false;
            }
        });
    }
    addviewModel = ko.mapping.fromJS({
        MODE: ko.observable(dataItem == undefined ? "" : dataItem.MODE),
        save: function(e) {
            if (dataItem == undefined) { //新增
                if ($('#REASON').val() == '' || $('#REASON').val() == null || $('#REASON').val() == undefined) {
                    BzAlert('请输入停机原因');
                    return;
                }
                var applayInfo = {
                    REASON: $('#REASON').val(),
                }
                $.post(baseUrl + "AddStateList", applayInfo, function(data) {
                    if (data.Status == 0) {
                        $("#x5window").data("kendoWindow").close();
                        refreshGrid();
                        BzSuccess(data.Message);
                    } 
                });
            }else{
                // 0 是手输   1 是下拉
                let ifAdd = 0;
                if ($('input[name="REASON_input"]').attr('aria-activedescendant') == 'REASON_option_selected' ) {
                    ifAdd = 1;
                }
               $.post('/AlarmReason/updataAlarmReason',{REASON:$('#REASON').val(),ID:dataItem.ID,ifAdd},(data) => {
                if (data.Status == 0) {
                    $("#x5window").data("kendoWindow").close();
                    refreshGrid();
                    BzSuccess(data.Message);
                } 
               })
            }
        }
    });
    ko.applyBindings(addviewModel, document.getElementById("addviewmodel"));
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

function f_edit(e) {
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    $("#btn_file").click()
    $("#btn_file").fileupload({ //文件上传
        dataType: 'json',
        autoUpload: true,
        type:'POST',
        formData:{ID:dataItem.ID},
        url: "/AlarmReason/uploadFile",
        maxNumberOfFiles: 1,
        maxFileSize: 1000000, 
        done: function(e, data) {
            if (data.result.Status == 0) {
                getDataByKeyWord();
                BzSuccess(data.result.Message);
            } else {
                console.error('发生了错误');
            }
        },
        fail: function(e, data) {
            var cc = 1;
        }
    });
}

function f_del(e) {
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    if(dataItem.REASON_NAME == null){
        BzAlert('请先完善信息');
        return;
    }
    BzConfirm("确定要完成么？", function(e) {
        if (e) {
            $.post(baseUrl + "CompleteStateList", { ID: dataItem.ID }, function(data) {
                if (data.Status == 0) {
                    grid.grid("refresh");
                    BzSuccess(data.Message);
                } else {
                    BzAlert(data.Message);
                }
            });
        }
    });
}
