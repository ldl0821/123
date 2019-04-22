var grid;
var u;
var viewModel;
var MAC_NBR;
var baseUrl = "/ReasonConfig/";
$(function() {
    var fields = {
        MEMO: { type: "string" },
        TOOL_NO: { type: "string" },
        SURVEY_VAL: { type: "string" },
        EVENT_DATE: { type: "string" }
    };
    var cols = [];
    cols.push({ field: "SCHE_NAME", title: '方案名称', width: 80, sortable: false, filterable: false });
    cols.push({ field: " OUT_TIME", title: '时间(m)', width: 80, sortable: false, filterable: false });
    cols.push({ field: "STATE", title: '状态', width: 80, sortable: false, filterable: false, hidden: false,template: kendo.template($("#REPAIR_STATE").html())});
    cols.push({ field: "MAC_NBR_ALLList", title: '设备', width: 80, sortable: false, filterable: false, hidden: false });
    cols.push({ field: "IS_OPEN", title: '启用状态', width: 100, sortable: false, filterable: false,template: kendo.template($("#template_STATE").html()) });
    cols.push({ field: "DESCRIBE", title: "描述", width: 150, sortable: false, filterable: false });
    cols.push({
        command: [
            { name: "aa", text: lang.Order.Modify + '<i class="icon-edit"></i>', className: "btn purple", click: f_edit },
            { name: "bb", text: lang.Maintain.DELETE + '<i class="icon-remove-sign"></i>', className: "btn red ", click: f_del },
            // { name: "cc", text: lang.Maintain.Repair + '<i class="icon-circle-arrow-right"></i>', className: "btn green ", click: f_goRepair }
        ],
        title: lang.Order.Operation,
        width: 130
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
        }

    })
    // grid = $("#grid").kendoGrid({
    //     dataSource: {
    //         data: [{ ProductName: '123456', UnitPrice: 123456, UnitsInStock: 123456, Discontinued: false }],
    //         schema: {
    //             model: {
    //                 fields: {
    //                     ProductName: { type: "string" },
    //                     UnitPrice: { type: "number" },
    //                     UnitsInStock: { type: "number" },
    //                     Discontinued: { type: "boolean" }
    //                 }
    //             }
    //         },
    //         pageSize: 20
    //     },
    //     height: 550,
    //     scrollable: true,
    //     sortable: true,
    //     filterable: true,
    //     actionUrl: ["CutterList", "", "", ""], //读、新增、更改、删除的URLaction
    //     pageable: {
    //         input: true,
    //         numeric: false
    //     },
    //     custom: {
    //         PrimaryKey: "APPLAY_NBR",
    //         fields: fields,
    //         cols: cols
    //     },
    //     columns: [
    //         "ProductName",
    //         { field: "UnitPrice", title: "Unit Price", format: "{0:c}", width: "130px" },
    //         { field: "UnitsInStock", title: "Units In Stock", width: "130px" },
    //         { field: "Discontinued", width: "130px" }
    //     ]
    // });
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
    sanjiliandong();
    if (dataItem != undefined) {
        $('#SCHEME_NAME').val(dataItem.SCHE_NAME);
        $('#OUT_TIME').val(dataItem.OUT_TIME);
        $('#MAC_NBRALL').val(dataItem.MAC_NBRALL);
        $('#DESCRIBE').val(dataItem.DESCRIBE);
    }
    $("#STATE").kendoComboBox({
        dataTextField: "STATE_NAME",
        dataValueField: "STATE",
        dataSource: [{
            STATE:1,
            STATE_NAME:'停机'
        },{
            STATE:2,
            STATE_NAME:'运行'
        },{
            STATE:3,
            STATE_NAME:'空闲'
        },{
            STATE:4,
            STATE_NAME:'关机'
        },{
            STATE:5,
            STATE_NAME:'调试'
        }],
        value: dataItem == undefined?'':dataItem.STATE,
    });
    addviewModel = ko.mapping.fromJS({
        
        MODE: ko.observable(dataItem == undefined ? "" : dataItem.MODE),
        save: function(e) {
                if (dataItem == undefined) { //新增
                    if ($('#my-selects').val() == '' || $('#my-selects').val() == null || $('#my-selects').val() == undefined ||$('#SCHEME_NAME').val() == undefined || $('#OUT_TIME').val()== undefined || $('#STATE').val()== undefined) {
                        BzAlert(lang.Common.Sorry);
                        return;
                    }
                    var applayInfo = {
                        SCHEME_NAME: $('#SCHEME_NAME').val(),
                        OUT_TIME: $('#OUT_TIME').val(),
                        STATE: $('#STATE').val(),
                        MAC_NBR_ALL:$('#my-selects').val().join(),
                        DESCRIBE:$('#DESCRIBE').val()
                    }
                    $.post(baseUrl + "AddStateList", applayInfo, function(data) {
                        if (data.Status == 0) {
                            $("#x5window").data("kendoWindow").close();
                            refreshGrid();
                            BzSuccess(data.Message);
                        } 
                    });
                } else {
                    if ($('#my-selects').val() == '' || $('#my-selects').val() == null || $('#my-selects').val() == undefined ||$('#SCHEME_NAME').val() == undefined || $('#OUT_TIME').val()== undefined || $('#STATE').val()== undefined) {
                        BzAlert(lang.Common.Sorry);
                        return;
                    }
                    var applayInfo = {
                        ID:dataItem.ID,
                        SCHEME_NAME: $('#SCHEME_NAME').val(),
                        OUT_TIME: $('#OUT_TIME').val(),
                        STATE: $('#STATE').val(),
                        MAC_NBR_ALL:$('#my-selects').val().join(),
                        DESCRIBE:$('#DESCRIBE').val()
                    }
                    $.post(baseUrl + "UpdataStateList", applayInfo, function(data) {
                        if (data.Status == 0) {
                            $("#x5window").data("kendoWindow").close();
                            refreshGrid();
                            BzSuccess(data.Message);
                        } else if (data.Status == 1) {
                            BzAlert(lang.AddStaff.companyNoRepeat);
                        } else if (data.Status == 2) {
                            BzAlert(lang.AddStaff.companyNameRepeat);
                        }
                    });
                }
            }
            //}
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
    $.x5window(lang.Maintain.EDIT, kendo.template($("#popup-add").html()));
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    addOrEdit(dataItem); //编辑
}

function f_del(e) {
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    BzConfirm(lang.AddStaff.IsDeleteThisData, function(e) {
        if (e) {
            $.post(baseUrl + "DeleteStateList", { ID: dataItem.ID }, function(data) {
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

function f_goRepair(e) {
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    BzConfirm(lang.Maintain.ToConfirm, function(e) {
        if (e) {
            var repairInfo = {
                APPLAY_NBR: dataItem.APPLAY_NBR,
                DEGREE: dataItem.URGENCY
            }
            $.post(baseUrl + "AddRepairService", repairInfo, function(data) {
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