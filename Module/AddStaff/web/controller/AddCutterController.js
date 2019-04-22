var grid;
var u;
var viewModel;
var MAC_NBR;
var baseUrl = "/AddStaff/";
$(function() {
    var fields = {
        MEMO: { type: "string" },
        TOOL_NO: { type: "string" },
        SURVEY_VAL: { type: "string" },
        EVENT_DATE: { type: "string" }
    };
    var cols = [];
    cols.push({ field: "COMPANY_NO", title: lang.AddStaff.companyNo, width: 80, sortable: true, filterable: false });
    cols.push({ field: " COMPANY_NAME", title: lang.AddStaff.companyName, width: 80, sortable: true, filterable: false });
    cols.push({ field: "COMPANY_CODE", title: lang.AddStaff.companyCode, width: 80, sortable: true, filterable: false, hidden: false });
    cols.push({ field: "GP_NAME", title: lang.MachineStatus.DEVICE_GROUP, width: 80, sortable: true, filterable: false, hidden: false });
    // cols.push({ field: "EVENT_DATE", title: '时间', width: 80, sortable: true, filterable: false });
    // cols.push({ field: "MEM_NBR", title: "申请人ID", width: 80, sortable: true, filterable: false, hidden: true });
    //cols.push({ field: "START_END", title: '结束时间', width: 100, sortable: true, format: "{0: HH:mm}", filterable: false });
    //cols.push({ field: "URGENCY", title: $.Translate("ServiceMaintain.URGENCY"), width: 80, sortable: true, filterable: false, template: kendo.template($("#URGENCY").html()) });
    //cols.push({ field: "MODE", title: '方式', width: 100, sortable: true, filterable: false });
    //cols.push({ field: "CONTACT", title: "联系方式", width: 150, sortable: true, filterable: false });
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
                            //  $.post("/MaintenanceRequest/UpdRules", JSON.stringify(data), function(data) {
                            //      if (data.Status == 0) {
                            //          $("#x5window").data("kendoWindow").close();
                            //          BzSuccess(data.Message);
                            //      } else {
                            //          BzAlert(data.Message);
                            //      }
                            //  });
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




function addOrEdit(dataItem) {

    // MAC_NBRfacility = $("#MAC_NBRfacility").comboxTree({
    //     url: "/Alarm/GetAllMachineAndMachineGroupLiHao",
    //     url2: "/Alarm/GetKeywordMachinelist",
    //     data: { groupID: 0 },
    //     treetemplate: $("#treeview-template").html(),
    //     width: 186,
    //     diffwidth: 24,
    //     type: 2,
    // });



    // $('.add-on').click(() => {
    //     window.clearInterval(intervlaFacility);
    //     intervlaFacility = setInterval(() => {
    //         if ($('.k-in')[0] != undefined) {
    //             for (let i = 0; i < $('.k-in').length; i++) {
    //                 $('.k-in').eq(i).click(function() {
    //                     $('#input_MAC_NBRfacility').val($(this).text());
    //                     var thisSpan = this.getElementsByTagName('span')[0];
    //                     nodeID = $(thisSpan).attr('nodeid');
    //                     window.clearInterval(intervlaFacility);
    //                 })
    //             }
    //         }
    //     }, 100)
    // })
    if (dataItem != undefined) {
        $('#MAC_NBR').val(dataItem.COMPANY_NO);
        $('#URGENCY_TEXT').val(dataItem.COMPANY_NAME);
        $('#VALUE_END').val(dataItem.COMPANY_CODE);
        // $('#input_MAC_NBRfacility').val(dataItem.GP_NAME);
    }

    //validator = $("#maintainviewmodel").validate({
    //    rules: {
    //        NAME: { required: true },
    //        DEGREE: { required: true },
    //        STATUS_NBR: { required: true },
    //        MEM_COUNT: { required: true }
    //    },
    //    messages: {
    //        NAME: { required: $.Translate("Common.NOT_NULL") },
    //        DEGREE: { required: $.Translate("Common.NOT_NULL") },
    //        STATUS_NBR: { required: $.Translate("Common.NOT_NULL") },
    //        MEM_COUNT: { required: $.Translate("Common.NOT_NULL") }
    //    }
    //});
    addviewModel = ko.mapping.fromJS({
        MODE: ko.observable(dataItem == undefined ? "" : dataItem.MODE),
        save: function(e) {
                // 全部设备表数据  循环加入字符串MAC_NBR.dataAarry

                //if (validator.form()) {
                var applayInfo = {
                    //COMPANY_NO  公司编号  COMPANY_NAME公司名称  COMPANY_CODE 公司代码  P_STR1新增人  P_STR2 新增时间
                    COMPANY_NO: $('#MAC_NBR').val(),
                    COMPANY_NAME: $('#URGENCY_TEXT').val(),
                    COMPANY_CODE: $('#VALUE_END').val(),
                    P_STR1: JSON.parse(localStorage.getItem('UserInfo')).UserId,
                }

                if (dataItem == undefined) { //新增
                    if ($('#MAC_NBR').val() == '' || $('#MAC_NBR').val() == null || $('#MAC_NBR').val() == undefined) {
                        BzAlert(lang.AddStaff.companyNoAlert);
                        return;
                    }
                    if ($('#URGENCY_TEXT').val() == '' || $('#URGENCY_TEXT').val() == null || $('#URGENCY_TEXT').val() == undefined) {
                        BzAlert(lang.AddStaff.companyNameAlert);
                        return;
                    }

                    $.post(baseUrl + "AddStateList", applayInfo, function(data) {
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
                } else {
                    if ($('#MAC_NBR').val() == '' || $('#MAC_NBR').val() == undefined || $('#MAC_NBR').val() == null) {
                        BzAlert(lang.AddStaff.companyNoAlert);
                        return;
                    }
                    if ($('#URGENCY_TEXT').val() == '' || $('#URGENCY_TEXT').val() == null || $('#URGENCY_TEXT').val() == undefined) {
                        BzAlert(lang.AddStaff.companyNameAlert);
                        return;
                    }
                    var applayInfo = {
                        COMPANY_NBR: dataItem.COMPANY_NBR,
                        COMPANY_NO: $('#MAC_NBR').val(),
                        COMPANY_NAME: $('#URGENCY_TEXT').val(),
                        COMPANY_CODE: $('#VALUE_END').val(),
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
            $.post(baseUrl + "DeleteStateList", { COMPANY_NBR: dataItem.COMPANY_NBR }, function(data) {
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