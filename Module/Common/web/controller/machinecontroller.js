var grid;
var image;
var validator;
var COMBOX;
var rowClick;
var ifTop = false; //判断是否上下移动
$(function() {
    var fields = {
        MAC_NBR: { type: "string" },
        GP_NBR: { type: "string" },
        MAC_NO: { type: "string" },
        ELECTRICAL_SYSTEM: { type: "string" },
        MAC_NAME: { type: "string" },
        CATEGORY: { type: "string" },
        PRICE: { type: "string" },
        MANUFACTURE: { type: "string" },
        BORN_DATE: { type: "date" },
        BUY_PERSON: { type: "string" },
        PHOTO: { type: "string" },
        MEMO: { type: "string" },
        RANK_NUM: { type: "string" },
        SERIAL_NO: { type: "string" }
    };
    var cols = [];
    cols.push({ field: "MAC_NBR", title: "", width: 80, sortable: true, filterable: false, hidden: true });
    cols.push({ field: "GP_NBR", title: "", width: 80, sortable: true, filterable: false, hidden: true });
    cols.push({ field: "RANK_NUM", title: lang.Common.Sort, width: 40, sortable: true, filterable: false });
    cols.push({ field: "CODE_NO", title: lang.Quality.MacNo, width: 80, sortable: true, filterable: false });
    cols.push({ field: "MAC_PROPERTY", title: lang.Quality.MAC_PROPERTY, width: 80, sortable: true, filterable: false });
    cols.push({ field: "CATEGORY", title: lang.Alarm.MachineName, width: 80, sortable: true, filterable: false });
    cols.push({ field: "MAC_NAME", title: lang.Common.EquipmentModel, width: 80, sortable: true, filterable: false });
    cols.push({ field: "MAC_NO", title: lang.Common.FactoryNumber, width: 80, sortable: true, filterable: false, hidden: false });
    cols.push({ field: "ELECTRICAL_SYSTEM", title: lang.Common.EquipmentSystemModel, width: 80, sortable: true, filterable: false });
    cols.push({ field: "BUY_PERSON", title: lang.Common.EquipmentManufacturer, width: 80, sortable: true, filterable: false });
    cols.push({ field: "PRICE", title: "", width: 80, sortable: true, filterable: false, hidden: true });
    cols.push({ field: "MANUFACTURE", title: lang.Common.CustomerCompanyNumber, width: 80, sortable: true, filterable: false, hidden: false });
    // cols.push({ field: "COMPANY_NAME", title: lang.Order.CustomerName, width: 80, sortable: true, filterable: false, hidden: false });
    // cols.push({ field: "BORN_DATE", title: lang.Common.ManufactureDate, width: 80, format: "{0: yyyy/MM/dd}", sortable: true, filterable: false, hidden: false });
    // cols.push({ field: "BUY_PERSON", title: "", width: 80, sortable: true, filterable: false, hidden: true });
    cols.push({ field: "PHOTO", title: "", width: 80, sortable: true, filterable: false, hidden: true });
    cols.push({ field: "MEMO", title: "", width: 80, sortable: true, filterable: false, hidden: true });
    cols.push({ field: "RANK_NUM", title: "", width: 80, sortable: true, filterable: false, hidden: true });
    cols.push({
        command: [
            { name: "cc", text: lang.Order.Location + '<i class="icon-map-marker"></i>', className: "btn green", click: mac_location },
            { name: "aa", text: lang.Order.Edit + '<i class="icon-edit"></i>', className: "btn purple", click: upd_mac },
            { name: "bb", text: lang.Order.Delete + '<i class="icon-remove-sign"></i>', className: "btn red ", click: del_mac }
        ],
        title: lang.Order.Operation,
        width: 200
    });

    grid = $("#grid").grid({
        checkBoxColumn: true,
        baseUrl: "/", //调用的URL
        selectable: "single", //行选择方式
        //sort: [{ field: "USER_NBR", dir: "ASC" }],
        scrollable: true,
        editable: false, //是否可编辑
        autoBind: false,
        resizable: true, //列宽度可调
        isPage: true,
        detailTemplate: kendo.template($("#detail-template").html()),
        filter: null,
        //server: true, //服务器端刷新，包括排序，筛选等
        actionUrl: ["machine/r/GetmachineByNewCollect", "", "", ""], //读、新增、更改、删除的URLaction
        custom: {
            PrimaryKey: "MAC_NBR",
            fields: fields,
            cols: cols
        },
        rowClick: function(param) {
            rowClick = param;
        },
        dataBound: function() {
            if (ifTop == true) {
                $('tbody[role="rowgroup"] tr').eq(rowClick[0].RANK_NUM - 1).addClass('k-state-selected');
            }
            ifTop = false;
        }
    });


    $("#tree_add").click(function() {
        var treeobj = $("#orgnizetree").data("kendoTreeView");
        var selectedNode = treeobj.select();
        if (selectedNode.length > 0) {
            var GroupInfo = {
                PID: parseInt($(treeobj.select()).find('.k-state-selected span').attr("nodeid")),
                LEVEL_NBR: parseInt($(treeobj.select()).find('.k-state-selected span').attr("level_nbr"), 10) + 1,
                GP_NAME: lang.Order.NewNode,
                RANK_NUM: 0
            }
            $.post("machine/AddMachineGroup", GroupInfo, function(data) {
                if (data.Status == 0) {
                    var obj = treeobj.append({
                        text: GroupInfo.GP_NAME,
                        id: data.Data,
                        icon: "icon-cogs",
                        PID: GroupInfo.PID,
                        LEVEL_NBR: GroupInfo.LEVEL_NBR
                    }, selectedNode);
                    BzSuccess(data.Message);
                    //进入编辑
                    treeobj.select(obj);
                    $("#tree_edit").trigger('click');

                    // $('.popover-content').prepend(`<div><input id='groupLevel'/></div>`);
                    // $("#groupLevel").kendoComboBox({
                    //     dataTextField: "text",
                    //     dataValueField: "text",
                    //     dataSource: [{ text: '车间' }, { text: '产线' }, { text: '设备厂家' }],
                    //     // value: data.Data[dataIitem].COMPANY_NAME,
                    //     // change: btnExamine
                    // });
                } else {
                    BzAlert(data.Message);
                }
            });
        } else {
            BzAlert(lang.Common.PleaseSelectANode);
        }

    });
    $("#tree_edit").click(function() {
        var GP_NAME;
        var treeobj = $("#orgnizetree").data("kendoTreeView");
        var selectedNode = treeobj.select();
        if (selectedNode.length > 0) {
            var obj = selectedNode.find('.k-state-selected span').data("BZ-editer");
            if (obj == undefined) {
                selectedNode.find('.k-state-selected span').editer({
                    url: "machine/UpdMachineGroup",
                    title: lang.Common.TextBox,
                    Ok: function(name) {
                        GP_NAME = name;
                        this.close();
                        var treeobj = $("#orgnizetree").data("kendoTreeView");
                        var GroupInfo = {
                            GP_NBR: parseInt($(treeobj.select()).find('.k-state-selected span').attr("nodeid")),
                            GP_NAME: name,
                            RANK_NUM: 0
                        }
                        $.post("machine/UpdMachineGroup", (GroupInfo), function(data) {
                            if (data.Status == 0) {
                                var treeobj = $("#orgnizetree").data("kendoTreeView");
                                $(treeobj.select()).find('.k-state-selected span').html(GP_NAME);
                                BzSuccess(data.Message);
                            } else {
                                BzAlert(data.Message);
                            }
                        });
                    }
                });
            } else {
                obj.show();
            }
        }


    });


    $("#tree_delete").click(function() {
        BzConfirm(lang.Order.Delete, function(e) {
            if (e) {
                var treeobj = $("#orgnizetree").data("kendoTreeView");
                $.post("machine/DelMachineGroup", { gourpID: $(treeobj.select()).find('.k-state-selected span').attr("nodeid") }, function(data) {
                    if (data.Status == 0) {
                        var selectedNode = treeobj.select();
                        treeobj.remove(selectedNode);
                        BzSuccess(data.Message);
                    } else {
                        BzAlert(data.Message);
                    }
                });
            }
        });
    });

    $("#add_mac").click(function() {
        var treeobj = $("#orgnizetree").data("kendoTreeView");
        var selectedNode = treeobj.select();
        if (selectedNode.length > 0) { //判断是否有选中的节点
            // SELECT * FROM dbo.COMPANY_INFO
            //调取客户数据
            $.ajax({
                url: '/TinyMCE/getClientName',
                type: 'GET',
                success: function(data) {
                    $.x5window(lang.Order.Add, kendo.template($("#popup-add").html()));
                    //图库 htc:20180629
                    $('#galleryshow').click(() => {
                        if ($("#Gallery").is(":hidden")) {
                            $("#Gallery").show();
                        } else {
                            $("#Gallery").hide();
                        }
                    });

                    COMBOX = $("#COMBOX").kendoComboBox({
                        dataTextField: "COMPANY_NAME",
                        dataValueField: "COMPANY_NO",
                        dataSource: data.Data,
                        value: data.Data[0].COMPANY_NAME,
                        change: btnExamines
                    });
                    btnExamines()
                    addOrEdit();
                },
                error: function() {
                    console.error(lang.Common.Error);
                    return false;
                }
            });

        } else {
            BzAlert(lang.Common.PleaseSelectSetOf);
        }
    });

    $("#del_mac").click(function() {
        BzConfirm(lang.Common.BatchRemoveDevices, function(e) {
            if (e) {
                var dd = grid.data("bz-grid").checkedDataRows();
                var machineId = "";
                for (var i = 0; i < dd.length; i++) {
                    machineId += dd[i].MAC_NBR + ',';
                }
                machineId = machineId.substring(0, machineId.length - 1);
                if (isNaN($($("#orgnizetree").data("kendoTreeView").select()).find('.k-state-selected span').attr("nodeid"))) {
                    BzAlert(lang.Common.PleaseSelectDeviceGroup);
                    return;
                }
                $.post("machine/DelMachine", { macs: machineId, nodeid: $($("#orgnizetree").data("kendoTreeView").select()).find('.k-state-selected span').attr("nodeid") }, function(data) {
                    if (data.Status == 0) {
                        refreshGrid();
                        BzSuccess(data.Message);
                    } else {
                        BzAlert(data.Message);
                    }
                });
            }
        });
    });


    $('#filter').bind('keypress', function(event) {
        if (event.keyCode == "13") {
            getDataByKeyWord();
        }
    });
    $("#move_mac").click(function() {
        var data = grid.data("bz-grid").checkedDataRows(); //获取勾选数据 htc:20180629
        if (data.length == 0) { //htc:20180629
            BzAlert(lang.Common.moveAlert);
            return;
        }

        var obj = $("#move_mac").data("BZ-editer");
        if (obj == undefined) {
            $("#move_mac").editer({
                type: "comboxtree",
                comboxTree: {
                    url: "/machine/GetGrouplist",
                    data: { groupID: 0 },
                    treetemplate: $("#treeview-template").html(),
                    url2: "/machine/GetKeywordGrouplist"
                },
                grouptype: 1,
                Ok: function(data) {
                    if (isNaN($($("#orgnizetree").data("kendoTreeView").select()).find('.k-state-selected span').attr("nodeid"))) {
                        BzAlert(lang.Common.PleaseSelectDeviceGroup);
                        return;
                    }
                    var dd = grid.data("bz-grid").checkedDataRows();
                    var machineiIds = "";
                    for (var i = 0; i < dd.length; i++) {
                        machineiIds += (dd[i].MAC_NBR) + ",";
                    }
                    machineiIds = machineiIds.substring(0, machineiIds.length - 1);
                    var data = {
                        groupId: data.rData,
                        machineiIds: machineiIds,
                        nodeid: $($("#orgnizetree").data("kendoTreeView").select()).find('.k-state-selected span').attr("nodeid")
                    };

                    $.post("/machine/MoveMachine", (data), function(data) {
                        if (data.Status == 0) {
                            refreshGrid();
                            BzSuccess(data.Message);
                        } else {
                            BzAlert(lang.Common.Sorry);
                            return (data.Message);
                        }
                    });
                }
            });
        } else {
            obj.show();
        }
    });


    $('#move_MoveUp').click(() => {

        if (rowClick != undefined) {
            if (isNaN($($("#orgnizetree").data("kendoTreeView").select()).find('.k-state-selected span').attr("nodeid"))) {
                BzAlert(lang.Common.PleaseSelectDeviceGroup);
                return;
            }
            $.post('/machine/r/moveMove', { id: rowClick[0].MAC_NBR, RANK_NUM: rowClick[0].RANK_NUM - 1, move: 'move_MoveUp', nodeid: $($("#orgnizetree").data("kendoTreeView").select()).find('.k-state-selected span').attr("nodeid") }, function(data) {
                if (data.Status == 0) {
                    ifTop = true;
                    BzSuccess(data.Message);
                    refreshGrid();
                    rowClick[0].RANK_NUM = +rowClick[0].RANK_NUM - 1;
                } else {
                    BzAlert(data.error);
                }
            })
        }
    })

    $('#move_MoveDown').click(() => {
        if (rowClick != undefined) {
            if (isNaN($($("#orgnizetree").data("kendoTreeView").select()).find('.k-state-selected span').attr("nodeid"))) {
                BzAlert(lang.Common.PleaseSelectDeviceGroup);
                return;
            }
            $.post('/machine/r/moveMove', { id: rowClick[0].MAC_NBR, RANK_NUM: Number(rowClick[0].RANK_NUM) + 1, move: 'move_MoveDown', nodeid: $($("#orgnizetree").data("kendoTreeView").select()).find('.k-state-selected span').attr("nodeid") }, function(data) {
                if (data.Status == 0) {
                    ifTop = true;
                    BzSuccess(data.Message);
                    refreshGrid();
                    rowClick[0].RANK_NUM = +rowClick[0].RANK_NUM + 1;
                } else {
                    BzAlert(data.error);
                }
            })
        }
    })

    $("#move_client").click(function() {
        var data = grid.data("bz-grid").checkedDataRows(); //获取勾选数据 htc:20180629
        var obj = $("#move_client").data("BZ-editer");
        if (obj == undefined) {
            var COMBOX;
            $("body").append('<div class="popover fade in editable-container editable-popup right" style="display:block;z-index:9999;">' +
                '<div class="arrow" style="left: -10px;"></div>' +
                '<h3 class="popover-title"></h3>' +
                '<div class="popover-content"> <div><div class="editableform-loading" style="display: none;"></div>' +
                '<div class="form-inline editableform" style=""><div class="control-group"><div>' +
                '<div class="editable-input" style="position: relative;">' +
                '<input type="text" id="BzEditerComboxTree" class="input-medium" style="width:170px"></div><div class="editable-buttons">' +
                '<button id="BzEditerOk" class="btn btn-primary" style="padding-bottom: 6px; padding-top: 6px; margin-top: 0px; height: 34px; border-width: 1px;"><i class="icon-ok icon-white"></i></button>' +
                '<button id="BzEditerCancel" class="btn editable-cancel" style="width: 44px; padding-bottom: 6px; padding-top: 6px; margin-top: 0px; height: 34px; border-width: 1px;"><i class="icon-remove"></i></button></div></div><div class="editable-error-block help-block" style="display: none;"></div></div></div></div></div></div>');
            //调取客户数据
            $.ajax({
                url: '/TinyMCE/getClientName',
                type: 'GET',
                success: function(data) {
                    var dataIitem = 0;
                    if (data.Data.length == 0) {
                        BzAlert(lang.Common.PleaseAddCustomer);
                        return;
                    }
                    COMBOX = $("#BzEditerComboxTree").kendoComboBox({
                        dataTextField: "COMPANY_NAME",
                        dataValueField: "COMPANY_NO",
                        dataSource: data.Data,
                        // value: data.Data[dataIitem].COMPANY_NAME,
                        // change: btnExamine
                    });
                },
                error: function() {
                    console.error(lang.Common.Error);
                    return false;
                }
            });
            $("#BzEditerOk").bind("click", { obj: this }, function(event) {
                var treeobj = $("#orgnizetree").data("kendoTreeView");
                if (isNaN(parseInt($(treeobj.select()).find('.k-state-selected span').attr("nodeid")))) { //htc:20180629
                    BzAlert(lang.Common.checkAlert);
                    return;
                }
                if (isNaN(parseInt($(treeobj.select()).find('.k-state-selected span').attr("nodeid")))) {
                    BzAlert(lang.Common.PleaseSelectDeviceGroup);
                    return;
                }
                event.stopPropagation();
                $.ajax({
                    url: '/machine/r/postBindClientName',
                    type: 'POST',
                    data: {
                        nodeid: $('#BzEditerComboxTree').val(),
                        MAC_GP_NBR: parseInt($(treeobj.select()).find('.k-state-selected span').attr("nodeid")),
                    },
                    success: function(data) {
                        BzSuccess(data.Message);
                        $('.editable-container').remove();
                    },
                    error: function(err) {
                        console.error(err);
                        return false;
                    }
                })

            });
            $("#BzEditerCancel").bind("click", { obj: this }, function(event) {
                event.stopPropagation();
                $('.editable-container').remove();
            });

            $(document).unbind("mouseup").bind("mouseup", { obj: this }, function(event) {
                if ($(event.target).parents(".editable-container").length == 0 && $(event.target).parents(".k-animation-container").length == 0 && $(event.target).parents("#Combox_orgnizetree_BzEditerComboxTree").length == 0 && $(event.target).parents("#bz_Search_obj").length == 0) {
                    $('.editable-container').remove();
                }
            });
            $(".editable-container").css({
                top: $('#move_client').offset().top + $('#move_client').height() / 2 - $(".editable-container").height() / 2 + "px",
                left: ($('#move_client').offset().left + $('#move_client').width()) + 25 + "px"
            });
        } else {
            obj.show();
        }
    });

    $("#tree_addRootNode").click(function() {
        var treeobj = $("#orgnizetree").data("kendoTreeView");
        var GroupInfo = {
            PID: 0,
            LEVEL_NBR: 1,
            GP_NAME: lang.Order.NewNode,
            RANK_NUM: 0
        }
        $.post("machine/AddMachineGroup", (GroupInfo), function(data) {
            if (data.Status == 0) {
                var obj = treeobj.append({
                    text: GroupInfo.GP_NAME,
                    id: data.Data,
                    icon: "icon-cogs",
                    PID: 0,
                    LEVEL_NBR: 1
                }, null);
                BzSuccess(data.Message);
                //进入编辑
                treeobj.select(obj);
                $("#tree_edit").trigger('click');
            } else {
                BzAlert(data.Message);
            }
        });


    });


    GetGrouplist(0, "machine/GetGrouplist", $("#treeview-template").html(), "icon-group");
    $("#tree_expand").toggle(function() {
        $("#orgnizetree").data("kendoTreeView").expand(".k-item");
    }, function() {
        $("#orgnizetree").data("kendoTreeView").collapse(".k-item");
    });

});

function photoevnet() {
    $(".galleryli").unbind("click");
    $(".icon-trash").unbind("click");
    $(".galleryli").click(function(e) {
        $(".galleryli .icon-ok-sign").hide();
        $(this).find(".icon-ok-sign").show();
        $("#PHOTO_img").css("backgroundImage", "url(/images/machine/" + $(this).attr("name") + ")");
        image = $(this).attr('name').split('/')[$(this).attr('name').split('/').length - 1];
    });
    $(".icon-trash").click(function(e) {
        var obj = $(this).parent().attr("name");
        var fileNameList = obj.split("/");
        var data = {
            fileName: fileNameList[fileNameList.length - 1],
            type: "NoDefault"
        }
        $.post("/machine/DeleteFile", data, function(data) {
            if (data.Status == 0) {
                $('.galleryli[name="' + obj + '"]').remove();
            } else {
                BzAlert(data.Message);
            }
        });
        e.stopPropagation();
    });
}

function getDataByKeyWord() { //关键字查询
    var ds = grid.data("bz-grid").ds;
    var data = {
        PageIndex: ds._page,
        PageSize: ds._pageSize,
        keyword: $("#filter").val(),

    }
    $.post("machine/GetKeywordMachinelist", (data), function(data) {
        if (data.Status == 0) {
            var dd = [];
            for (var i = 0; i < data.Data.List.length; i++) {
                data.Data.List[i].BORN_DATE = moment(data.Data.List[i].BORN_DATE).format("YYYY-MM-DD");
            }
            grid.data("bz-grid").ds.data(data.Data.List);
        } else {
            BzAlert(data.Message);
        }
    });
}

function del_mac(e) {
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    BzConfirm(lang.Common.RemoveEquipment, function(e) {
        if (e) {
            if (isNaN($($("#orgnizetree").data("kendoTreeView").select()).find('.k-state-selected span').attr("nodeid"))) {
                BzAlert(lang.Common.PleaseSelectDeviceGroup);
                return;
            }
            $.post("machine/DelMachine", { macs: dataItem.MAC_NBR, nodeid: $($("#orgnizetree").data("kendoTreeView").select()).find('.k-state-selected span').attr("nodeid") }, function(data) {
                if (data.Status == 0) {
                    refreshGrid();
                    BzSuccess(data.Message);
                } else {
                    BzAlert(data.Message);
                }
            });
        }
    });
}

function upd_mac(e) {
    $.x5window(lang.Order.Edit, kendo.template($("#popup-add").html()));
    //图库
    $('#galleryshow').click(() => {
        if ($("#Gallery").is(":hidden")) {
            $("#Gallery").show();
        } else {
            $("#Gallery").hide();
        }
    })
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    // COMBOX = $("#COMBOX").kendoDropDownList({
    //     dataTextField: "COMPANY_NAME",
    //     dataValueField: "COMPANY_NO",
    //     filter: "contains",
    //     height: 200,
    //     dataSource: {
    //         type: "json",
    //         serverFiltering: true,
    //         transport: {
    //             read: {
    //                 url: "/AddStaff/GetCutterList",
    //             }
    //         }
    //     },
    //     optionLabel: { COMPANY_NAME: dataItem.COMPANY_NAME }
    // });
    // 调取客户数据
    $.ajax({
        url: '/TinyMCE/getClientName',
        type: 'GET',
        success: function(data) {
            var dataIitem = 0;
            if (dataItem.COMPANY_NAME != '' || dataItem.COMPANY_NAME != undefined) {
                for (let i = 0; i < data.Data.length; i++) {
                    if (dataItem.COMPANY_NAME == data.Data[i].COMPANY_NAME) {
                        dataIitem = i;
                    }
                }
            }
            COMBOX = $("#COMBOX").kendoComboBox({
                dataTextField: "COMPANY_NAME",
                dataValueField: "COMPANY_NO",
                dataSource: data.Data,
                value: data.Data[dataIitem].COMPANY_NAME,
                change: btnExamines
            });
            addOrEdit(dataItem);
        },
        error: function() {
            console.error(lang.Common.Error);
            return false;
        }
    });



}

function refreshGrid() {
    if ($("#filter").val() == "") {
        grid.grid("refresh", function() {
            var treeobj = $("#orgnizetree").data("kendoTreeView");
            var selectedNode = treeobj.select();
            return [
                { field: "keyword", Operator: "eq", value: parseInt(selectedNode.find('.k-state-selected span').attr("nodeid")) }
            ];
        });
    } else {
        getDataByKeyWord();
    }
}
//拿到两个字符串之间的值 
function cutstr(text, start, end) {
    var s = text.indexOf(start)
    if (s > -1) {
        var text2 = text.substr(s + start.length);
        var s2 = text2.indexOf(end);
        if (s2 > -1) {
            result = text2.substr(0, s2);
        } else result = '';
    } else result = '';
    return result;
}

function addOrEdit(dataItem) {
    App.initUniform();
    //验证
    validator = $("#machineviewmodel").validate({
        rules: {
            MAC_NO: { required: true },
            MAC_NAME: { required: true },
            //htc:20180629
            CATEGORY: { required: true },
            MANUFACTURE: { required: true },
        },
        messages: {
            MAC_NO: { required: lang.Common.IsNotEmpty },
            MAC_NAME: { required: lang.Common.IsNotEmpty },
            //htc:20180629
            CATEGORY: { required: lang.Common.IsNotEmpty },
            MANUFACTURE: { required: lang.Common.IsNotEmpty }
        }
    });

    var treeobj = $("#orgnizetree").data("kendoTreeView");
    var selectedNode = treeobj.select();
    var url = dataItem == undefined ? "/machine/r/AddMachineByNew" : "/machine/r/UpdateMachineByNew";
    //判断如果是新增 拿到.k-pager-info进行剪裁 拿到当前条数 当前条数加+1
    $("#RANK_NUM").kendoNumericTextBox({ format: "n0", min: 0, value: dataItem == undefined ? +cutstr($('.k-pager-info').html(), '共', '条') + 1 : dataItem.RANK_NUM });
    $("#PRICE").kendoNumericTextBox({ format: "c", min: 0, value: dataItem == undefined ? 0 : dataItem.PRICE });
    if (dataItem != undefined) {
        // $("#RANK_NUM").kendoNumericTextBox({ format: "n0", min: 0 });
        // $("#PRICE").kendoNumericTextBox({ format: "c", min: 0 });
        // $("#BORN_DATE").kendoDatePicker({ format: "yyyy/MM/dd" });
        $("#PHOTO").val();
        $("#MAC_NBR").val(dataItem.MAC_NBR),
            $("#MAC_NO").val(dataItem.MAC_NO),
            $("#MAC_NAME").val(dataItem.MAC_NAME),
            //$("#BORN_DATE").data("kendoDatePicker").value(dataItem.BORN_DATE),
            $("#BUY_PERSON").val(dataItem.BUY_PERSON),
            $("#CATEGORY").val(dataItem.CATEGORY),
            $("#ELECTRICAL_SYSTEM").val(dataItem.ELECTRICAL_SYSTEM),
            $("#MANUFACTURE").val(dataItem.MANUFACTURE),
            $("#MEMO").val(dataItem.MEMO),
            // $("#PRICE").data("kendoNumericTextBox").value(dataItem.PRICE),
            // $("#RANK_NUM").data("kendoNumericTextBox").value(dataItem.RANK_NUM),
            //$("#SERIAL_NO").val(dataItem.SERIAL_NO),
            $("#Nation").val(dataItem.Nation),
            $("#Province").val(dataItem.Province),
            $("#City").val(dataItem.City),
            $("#Street").val(dataItem.Street),
            $('#MAC_PROPERTY').val(dataItem.MAC_PROPERTY),
            $('#CODE_NO').val(dataItem.CODE_NO)
    }
    $("#BORN_DATE").kendoDatePicker({
        format: "yyyy/MM/dd",
        value: dataItem == undefined ? new Date() : dataItem.BORN_DATE
    });
    //保存
    $("#Win_Submit").click(function() {
        let COMBOX_VAL;
        COMBOX_VAL = COMBOX.val();
        if (validator.form()) {
            var para = {
                GP_NBR: parseInt(selectedNode.find('.k-state-selected span').attr("nodeid")),
                PHOTO: image,
                MAC_NBR: $("#MAC_NBR").val(),
                MAC_NO: $("#CATEGORY").val(),
                MAC_NAME: $("#MAC_NAME").val(),
                BORN_DATE: $("#BORN_DATE").val(),
                BUY_PERSON: $("#BUY_PERSON").val(),
                CATEGORY: $("#MAC_NO").val(),
                ELECTRICAL_SYSTEM: $("#ELECTRICAL_SYSTEM").val(),
                MANUFACTURE: $("#MANUFACTURE").val(),
                MEMO: $("#MEMO").val(),
                PRICE: $("#PRICE").data("kendoNumericTextBox").value(),
                RANK_NUM: $("#RANK_NUM").data("kendoNumericTextBox").value(),
                SERIAL_NO: COMBOX_VAL,
                Nation: $("#Nation").val(),
                Province: $("#Province").val(),
                City: $("#City").val(),
                Street: $("#Street").val(),
                CODE_NO: $('#CODE_NO').val(),
                MAC_PROPERTY: $('#MAC_PROPERTY').val()
            };
            $.post(url, para, function(data) {
                if (data.Status == 0) {
                    $("#x5window").data("kendoWindow").close();
                    refreshGrid();
                    BzSuccess(data.Message);
                } else {
                    BzAlert(data.Message);
                }
            });
        }
    });

    //获取图库列表
    $.post("/machine/ShowAllPic", function(data) {
        if (data.Status == 0) {
            var html = '<ul class="galleryul" style="margin-left: 0px; margin-bottom: 0px;">';
            for (var i = 0; i < data.Data.length; i++) {
                html = html + '<li class="galleryli" imgname="' + data.Data[i].FileName + '"  name="' + data.Data[i].FileDesc + '/' + data.Data[i].FileName + '"><a><div class="gallery" style="background-image:url(' + data.Data[i].FilePath + ')"></div></a>' + (data.Data[i].FileDesc == "Default" ? "" : '<i class="icon-trash"></i>') + '<i class="icon-ok-sign"></i><span>' + (data.Data[i].FileName.split(".")[0].length > 6 ? (data.Data[i].FileName.split(".")[0].substr(0, 6) + "...") : data.Data[i].FileName.split(".")[0]) + '</span></li>'
            }
            html = html + '</ul>';
            $("#Gallery").append(html);
            //注册图片事件
            photoevnet();
            //新增默认选择no.jpg
            if (dataItem == undefined) { //新增
                $('.galleryli[name="Default/no.jpg"]').find(".icon-ok-sign").show();
            } else {
                var path = dataItem.PHOTO.split("//");
                $('.galleryli[name="' + path[2] + '/' + path[3] + '"]').find(".icon-ok-sign").show();
            }
        } else {
            BzAlert(data.Message);
        }
    });

    if (dataItem == undefined) {
        $("#PHOTO_img").css("backgroundImage", "url(/images/machine/Default/no.jpg)");
        image = "no.jpg";
    } else {
        $("#PHOTO_img").css("backgroundImage", "url(/images/machine/NoDefault/" + dataItem.PHOTO + ")");
        image = dataItem.PHOTO.replace(/\/\//g, "/");
    }

    $("#fileupload").fileupload({ //文件上传
        dataType: 'json',
        autoUpload: true,
        url: "/machine/upload/img",
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        maxNumberOfFiles: 1,
        maxFileSize: 1000000, 
        done: function(e, data) {
            if (data.result.Status == 0) {
                console.log("url(./images/machine/NoDefault/" + data.result.Data + "?"+ +new Date()+")");
                $("#PHOTO_img").css("backgroundImage", "url(./images/machine/NoDefault/" + data.result.Data + "?"+ +new Date()+")");
                //addviewModel.PHOTO(data.result.Data);
                $("#PHOTO").val(data.result.Data);
                //添加到图库
                if ($('.galleryli[name="NoDefault/' + data.result.Data + '"]').length == 0) {
                    $("#Gallery").append('<li class="galleryli" imgname="' + data.result.Data + '" name="/NoDefault/' + data.result.Data + '"><a><div class="gallery" style="background-image:url(./images/machine/NoDefault/' + data.result.Data + '?'+ +new Date()+')"></div></a><i class="icon-trash"></i><i class="icon-ok-sign"></i><span>' + (data.result.Data.split(".")[0].length > 6 ? (data.result.Data.split(".")[0].substr(0, 6) + "...") : data.result.Data.split(".")[0]) + '</span></li>')
                }
                //注册图片事件
                photoevnet();
                BzSuccess(data.result.Message);
            } else {
                BzAlert(data.result.Message);
            }
        },
        fail: function(e, data) {
            var cc = 1;
        }
    });
}

function btnExamines(){
    $.ajax({
        url:'/machine/r/getCompanyNumber',
        type:'POST',
        data:{
            COMPANY_NAME:$('[name="COMBOX_input"]').val()
        },
        success(data){
            if(data.Status == 0){
                try {
                    $('#MANUFACTURE').val(data.Data.COMPANY_NO);
                } catch (error) {
                    $('#MANUFACTURE').val('');
                }
            }else{
                BzAlert(data.error)
            }
        },
    })
}

function mac_location(e) {
    $.x5window(lang.Order.Location, kendo.template($("#location").html()));
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    $.get('/machine/r/location?mac_nbr=' + dataItem.MAC_NBR, (result) => {
        if (result.Status == 0) {
            if (result.Data.length > 0) {
                $('#major_ip').val(result.Data[0].major_IP);
                $('#mac_ip').val(result.Data[0].MAC_IP);
                $('#mac_lon').val(result.Data[0].longitude);
                $('#mac_lat').val(result.Data[0].latitude);
                $('#SIMCardNumber').val(result.Data[0].SIM_SUM);
                $('#CollectionBoxNumber').val(result.Data[0].gather_Sum);
            }

        }
    })

    //重置机床位置
    $("#Location_Reset").click(() => {
        var major_ip = $('#major_ip').val();
        var MAC_NBR = dataItem.MAC_NBR;
        $.get('/machine/r/getlocation?major_ip=' + major_ip + '&MAC_NBR=' + MAC_NBR, (result) => {
            //只能处理返回小数点后6位数的算法
            if (result.Status == 0) {
                $('#mac_lon').val(result.Data.lbslatitude);
                $('#mac_lat').val(result.Data.lbslongitude);
            }
        })
    })

    //新增机床位置
    $('#Location_Ok').click(() => {
        var mac_location = {};
        mac_location.MAC_NBR = dataItem.MAC_NBR;
        mac_location.MAC_IP = $('#mac_ip').val();
        mac_location.major_ip = $('#major_ip').val();
        mac_location.longitude = $('#mac_lon').val();
        mac_location.latitude = $('#mac_lat').val();
        mac_location.SIMCardNumber = $('#SIMCardNumber').val();
        mac_location.CollectionBoxNumber = $('#CollectionBoxNumber').val();
        $.post('/machine/r/addLocation', mac_location, (result) => {
            if (result.Status == 0) {
                $("#x5window").data("kendoWindow").close();
                BzSuccess(result.Message);
                refreshGrid();
            }
        })
    })
}