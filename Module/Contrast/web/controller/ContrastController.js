let MAC_node;
$(function() {
    $("#startTime").kendoDatePicker({ format: "yyyy/MM/dd", value: new Date() });

    $.get('/Contrast/GetProGram', (data) => {
        if (data.Status == 0) {
            data.Data.unshift({ text: '全部' });
            var MAC_NBRname = $("#MAC_NBRname").kendoComboBox({
                dataTextField: "text",
                dataValueField: "text",
                dataSource: data.Data,
                change: btnExamine
            }).data("MAC_NBRname");
        } else {
            BzAlert(data.Message)
        }
    })

    $('#startTime').change(() => {
        if (MAC_node == undefined) {
            return;
        }
        getPlanByMachine(MAC_node);
    })

    function btnExamine() {
        if (MAC_node == undefined) {
            return;
        }
        getPlanByMachine(MAC_node);
    }

    //获取所有设备组+设备
    function GetAllMachineAndMachineGroup1(id, chtml, callback) {
        function _callback(data) {
            callback(data);
        }
        $.get("/shift/GetAllMachineAndMachineGroup", { groupID: id }, function(data) {
            if (data.Status == 0) {
                $("#orgnizetree").kendoTreeView({
                    dataSource: {
                        data: machineToGroup(fomattree(gettree(data.Data.GetAllMachineGroupList, "icon-cogs")), data.Data.GetAllMachineList, "icon-cog")
                    },
                    template: kendo.template(chtml),
                    select: function(e) {
                        if (typeof(callback) != "undefined") {
                            _callback(e);
                        }
                    }
                }).data("kendoTreeView").collapse(".k-item");
            } else {
                BzAlert(data.Message);
            }
        });
    }
    GetAllMachineAndMachineGroup1(0, $("#treeview-template").html(), function(e) {
        getPlanByMachine(e.node);
    });

    // GetGrouplist(0, "machine/GetGrouplist", $("#treeview-template").html(), "icon-group");
    $("#tree_expand").toggle(function() {
        $("#orgnizetree").data("kendoTreeView").expand(".k-item");
    }, function() {
        $("#orgnizetree").data("kendoTreeView").collapse(".k-item");
    });


});

function getPlanByMachine(e) {
    if (e != undefined) {
        var id = parseInt($(e).find('[attr="treenode"]').attr("nodeid"));
        // var name = $(e).find('[attr="treenode"]').text();
        var name = $(e).find('[attr="treenode"]').text();
        var flag = parseInt($(e).find('[attr="treenode"]').attr("flag"));
    } else {
        var treeobj = $("#orgnizetree").data("kendoTreeView");
        var selectedNode = treeobj.select();
        var id = parseInt(selectedNode.find('.k-state-selected span').attr("nodeid"));
        var name = parseInt(selectedNode.find('.k-state-selected span').attr("text"));
        var flag = parseInt(selectedNode.find('.k-state-selected span').attr("flag"));
    }
    if (id == undefined) {
        return;
    }
    if (flag == 0) { //设备组
        $("#machinePlan").html(lang.Common.SchedulingPlan);
        $(".timeline").empty();
    } else { //设备
        MAC_node = e;
        $("#machinePlan").html('文件对比' + " " + name + " ");
        $.post("/Contrast/GetContrast", { id: id, time: $('#startTime').val(), timeEnd: moment($('#startTime').val()).add(1, 'days').format('YYYY/MM/DD'), compiles: $('input[name=MAC_NBRname_input]').val() == '全部' ? '' : $('input[name=MAC_NBRname_input]').val() }, function(data) {
            if (data.Status == 0) {
                $(".timeline").empty();
                $(".timeline").append(`<table class='table'><thead><tr><th class='thead-th'>行数</th><th class='thead-th'>程序号</th><th class='thead-th'>时间</th><th class='thead-th'>修改信息</th></tr></thead><tbody></tbody></table>`)
                for (let i = 0; i < data.Data.length; i++) {
                    var shtml = `<tr><td class='tbody-td'>${i+1}</td><td class='tbody-td'>${data.Data[i].PRO_GRAM}</td><td class='tbody-td'>${data.Data[i].UPDATE_TIME.split('.000Z')[0].replace('T',' ')}</td><td ><div class='tbody-td${i} tbody-tdimparity'></div></td></tr>`;
                    $(".timeline tbody").append(shtml);
                    for (let q = 0; q < data.Data[i].COMPARE_CONTENT.length; q++) {
                        $(`.tbody-td${i}`).append(`<div>修改行数:${data.Data[i].COMPARE_CONTENT[q].RowNumber}&nbsp;&nbsp;&nbsp;&nbsp;原内容:${data.Data[i].COMPARE_CONTENT[q].NewContent}&nbsp;&nbsp;&nbsp;&nbsp;<span style='background:#DDFFDD'>修改内容:${data.Data[i].COMPARE_CONTENT[q].OldContent}</span>&nbsp;&nbsp;&nbsp;&nbsp;修改类型:${data.Data[i].COMPARE_CONTENT[q].Operation_type}</div>`)
                    };
                }
            } else {
                BzAlert(data.Message);
            }
        });
    }
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
        // getDataByKeyWord();
    }

}