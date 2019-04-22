var grid;
var u;
var viewModel;
var MAC_NBR;
var baseUrl = "/personnel/";
$(function() {
    var fields = {
        MEMO: { type: "string" },
        TOOL_NO: { type: "string" },
        SURVEY_VAL: { type: "string" },
        EVENT_DATE: { type: "string" }
    };
    var cols = [];
    cols.push({ field: "MEMBER_NO", title: '人员编号', width: 80, sortable: false, filterable: false });
    cols.push({ field: "MEM_NAME", title: '人员名称', width: 80, sortable: false, filterable: false, hidden: false });
    cols.push({ field: "SEX", title: '性别', width: 20, sortable: false, filterable: false, template: kendo.template($("#template_SEX").html())});
    cols.push({ field: "MAC_NBR_ALLList", title: '设备编号', width: 80, sortable: false, filterable: false, hidden: false });
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
            $("#MAC_NBRname").comboxTree({
                url: "/Main/GetUserMacGroup",
                data: { groupID: 0 },
                treetemplate: $("#treeview-template").html(),
                width: 177,
                diffwidth: 27,
                type: 2,
            });
            $('#input_MAC_NBRname').attr('readonly', 'readonly');
            $('#my-select').change(function() {
                var sortData = [];
                // console.log(GetMacNameListData.Data.rootMacInfo);
                for (let i = 0; i < $('#my-select').val().length; i++) {
                    for (let w = 0; w < GetMacNameListData.Data.rootMacInfo.length; w++) {
                        if ($('#my-select').val()[i] == GetMacNameListData.Data.rootMacInfo[w].CATEGORY) {
                            sortData.push(GetMacNameListData.Data.rootMacInfo[w]);
                            // $('#my-selects').append(`<option value=${GetMacNameListData.Data.rootMacInfo[w].MAC_NBR} >${GetMacNameListData.Data.rootMacInfo[w].MAC_NO}</option>`)
                        }
                    }
                }
                sortData.sort(compare('paixu', compare('RANK_NUM')));
                $('#HiddenEleTwo').remove();
                $('#my-selects').html('');
                for (let z = 0; z < sortData.length; z++) {
                    $('#my-selects').append(`<option value=${sortData[z].MAC_NBR} >${sortData[z].MAC_NO}</option>`)
                }
                $('#my-selects').selectpicker('refresh');
                $('#my-selects').selectpicker('render');
            })
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
    if (dataItem != undefined) {
        $('#MAC_NO').val(dataItem.MEMBER_NO);
        $(`input:radio[value='${dataItem.SEX}']`).attr('checked','true');
        $(`#MEM_NAME`).val(dataItem.MEM_NAME);
        // $('#VALUE_END').val(dataItem.COMPANY_CODE);
        // $('#input_MAC_NBRfacility').val(dataItem.GP_NAME);
    }
    addviewModel = ko.mapping.fromJS({
        MODE: ko.observable(dataItem == undefined ? "" : dataItem.MODE),
        save: function(e) {
                // 全部设备表数据  循环加入字符串MAC_NBR.dataAarry
                //if (validator.form()) {
                if ($('#my-selects').val() == '' || $('#my-selects').val() == null || $('#my-selects').val() == undefined) {
                    BzAlert('设备编号不能为空');
                    return;
                }
                var applayInfo = {
                    MEMBER_NO: $('#MAC_NO').val(),
                    SEX: $('input[name="ELECTRICAL_SYSTEM"]:checked').val(),
                    FACILITY: $('#my-selects').val().join(),
                    MEM_NAME: $('#MEM_NAME').val()
                }

                if (dataItem == undefined) { //新增
                    if ($('#MAC_NO').val() == '' || $('#MAC_NO').val() == null || $('#MAC_NO').val() == undefined) {
                        BzAlert('编号不能空');
                        return;
                    }
                    if ($('#MEM_NAME').val() == '' || $('#MEM_NAME').val() == null || $('#MEM_NAME').val() == undefined) {
                        BzAlert('名字不能空');
                        return;
                    }
                    $.post(baseUrl + "AddStateList", applayInfo, function(data) {
                        if (data.Status == 0) {
                            $("#x5window").data("kendoWindow").close();
                            refreshGrid();
                            BzSuccess(data.Message);
                        } else if (data.Status == 1) {
                            BzAlert('人员编号重复');
                        }
                    });
                } else {
                    if ($('#MAC_NO').val() == '' || $('#MAC_NO').val() == null || $('#MAC_NO').val() == undefined) {
                        BzAlert('编号不能空');
                        return;
                    }
                    if ($('#MEM_NAME').val() == '' || $('#MEM_NAME').val() == null || $('#MEM_NAME').val() == undefined) {
                        BzAlert('名字不能空');
                        return;
                    }
                    var applayInfo = {
                        MEMBER_NO: $('#MAC_NO').val(),
                        SEX: $('input[name="ELECTRICAL_SYSTEM"]:checked').val(),
                        FACILITY: $('#my-selects').val().join(),
                        MEM_NBR: dataItem.MEM_NBR,
                        MEM_NAME: $('#MEM_NAME').val()
                    }
                    $.post(baseUrl + "UpdataStateList", applayInfo, function(data) {
                        if (data.Status == 0) {
                            $("#x5window").data("kendoWindow").close();
                            refreshGrid();
                            BzSuccess(data.Message);
                        } else if (data.Status == 1) {
                            BzAlert('人员编号重复');
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
    $("#MAC_NBRname").comboxTree({
        url: "/Main/GetUserMacGroup",
        data: { groupID: 0 },
        treetemplate: $("#treeview-template").html(),
        width: 177,
        diffwidth: 27,
        type: 2,
    });
    $('#input_MAC_NBRname').attr('readonly', 'readonly');
    $('#my-select').change(function() {
        var sortData = [];
        // console.log(GetMacNameListData.Data.rootMacInfo);
        for (let i = 0; i < $('#my-select').val().length; i++) {
            for (let w = 0; w < GetMacNameListData.Data.rootMacInfo.length; w++) {
                if ($('#my-select').val()[i] == GetMacNameListData.Data.rootMacInfo[w].CATEGORY) {
                    sortData.push(GetMacNameListData.Data.rootMacInfo[w]);
                    // $('#my-selects').append(`<option value=${GetMacNameListData.Data.rootMacInfo[w].MAC_NBR} >${GetMacNameListData.Data.rootMacInfo[w].MAC_NO}</option>`)
                }
            }
        }
        sortData.sort(compare('paixu', compare('RANK_NUM')));
        $('#HiddenEleTwo').remove();
        $('#my-selects').html('');
        for (let z = 0; z < sortData.length; z++) {
            $('#my-selects').append(`<option value=${sortData[z].MAC_NBR} >${sortData[z].MAC_NO}</option>`)
        }
        $('#my-selects').selectpicker('refresh');
        $('#my-selects').selectpicker('render');
    })
    $('#MAC_NO').attr('readonly','readonly')
    addOrEdit(dataItem); //编辑
}

function f_del(e) {
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    BzConfirm(lang.AddStaff.IsDeleteThisData, function(e) {
        if (e) {
            $.post(baseUrl + "DeleteStateList", { MEM_NBR: dataItem.MEM_NBR }, function(data) {
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


function addOnClick(_salf) {
    $('#input_MAC_NBRname').val($(_salf).text());
    var thisSpan = _salf;
    $.post('/Main/GetMacNameList', { nodeID: $(thisSpan).attr('nodeid') }, (data) => {
        GetMacNameListData = data;
        for(let z = 0; z <GetMacNameListData.Data.submacInfo.length;z++){
            for(let m = 0; m < GetMacNameListData.Data.rootMacInfo.length;m++){
                if(GetMacNameListData.Data.submacInfo[z].GP_NAME === GetMacNameListData.Data.rootMacInfo[m].GP_NAME){
                    GetMacNameListData.Data.rootMacInfo[m].paixu = z;
                }
            }
        }
        //拿到没有排序的添加paixu -1
        for(let qq = 0; qq < GetMacNameListData.Data.rootMacInfo.length;qq++){
            if(GetMacNameListData.Data.rootMacInfo[qq].paixu == undefined){
                GetMacNameListData.Data.rootMacInfo[qq].paixu = -1
            }
        }
        var description = [];
        dataGetMacNoList = '';
        $('#HiddenEle').remove();
        $('#my-select').html('');
        $('#my-selects').html('');
        for (let w = 0; w < data.Data.rootMacInfo.length; w++) {
            if (data.Data.rootMacInfo[w] != null) {
                description.push(data.Data.rootMacInfo[w]);
            }
        }
        for (let q = 0; q < data.Data.submacInfo.length; q++) {
            if (data.Data.submacInfo[q] != null) {
                description.push(data.Data.submacInfo[q]);
            }
        }
        //去重
        description = unique(description);
        for (var i = 0; i < description.length; i++) {
            $('#my-select').append(`<option value=${description[i].CATEGORY} >${description[i].CATEGORY}</option>`);
        }
        // 缺一不可  
        $('#my-select').selectpicker('refresh');
        $('#my-select').selectpicker('render');
    })
}

function unique(list) {
    var arr = [];
    for (var i = 0; i < list.length; i++) {
        if (i == 0) arr.push(list[i]);
        b = false;
        if (arr.length > 0 && i > 0) {
            for (var j = 0; j < arr.length; j++) {
                if (arr[j].CATEGORY == list[i].CATEGORY) {
                    b = true;
                    //break;
                }
            }
            if (!b) { arr.push(list[i]);}
        }
    }
    return arr;
}

// 按照多个字段排序
function compare(name, minor) {
    return function(o, p) {
        var a, b;
        if (o && p && typeof o === 'object' && typeof p === 'object') {
            a = o[name];
            b = p[name];
            if (a === b) {
                return typeof minor === 'function' ? minor(o, p) : 0;
            }
            if (typeof a === typeof b) {
                return a < b ? -1 : 1;
            }
            return typeof a < typeof b ? -1 : 1;
        } else {
            console.log("error");
        }
    }
}
