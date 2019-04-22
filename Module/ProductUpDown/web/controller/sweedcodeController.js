var baseUrl = "/Alarm";
var grid;
var Machine;
$(function(){
   // $("#startTime").kendoDatePicker({ format: "yyyy/MM/dd", value: moment().subtract(7, 'd')._d });
    //$("#endTime").kendoDatePicker({ format: "yyyy/MM/dd", value: new Date() });
    BindData();
    MAC_NBR = $("#MAC_NBRname").comboxTree({
        url: "/Main/GetUserMacGroup",
        data: { groupID: 0 },
        treetemplate: $("#treeview-template").html(),
        width: 184,
        diffwidth: 27,
        type: 2,
    });
    $('#input_MAC_NBRname').attr('readonly', 'readonly');
    $('#my-select').change(function() {
        var dataGetMacNoList = [];
        for (let i = 0; i < $('#my-select').val().length; i++) {
            for (let w = 0; w < GetMacNameListData.Data.rootMacInfo.length; w++) {
                if ($('#my-select').val()[i] == GetMacNameListData.Data.rootMacInfo[w].CATEGORY) {
                    dataGetMacNoList.push({
                        text: GetMacNameListData.Data.rootMacInfo[w].MAC_NO,
                        value: GetMacNameListData.Data.rootMacInfo[w].MAC_NBR,
                        paixu: GetMacNameListData.Data.rootMacInfo[w].paixu,
                        RANK_NUM:GetMacNameListData.Data.rootMacInfo[w].RANK_NUM
                    });
                }
            }
        }
        dataGetMacNoList.sort(compare('paixu', compare('RANK_NUM')));
        $("#my-selects").kendoComboBox({
            dataTextField: "text",
            dataValueField: "value",
            dataSource: dataGetMacNoList,
            value: '',
        }).data("kendoComboBox");
        // $('#my-select')[0].innerHTML = '';
        // console.log(GetMacNameListData.Data.rootMacInfo);
    })
$("#addsweedcode").click(function(){
   // $.x5window("产品上线", kendo.template($("#popup-add").html()));
   // BindMacs();
   // $("#Win_Submit").click(function(){
      var  product_name=$("#partno").val();
       var mac_nbr=$('#my-selects').val();
       var mem_nbr=$('#staffInfo').val();
       //program_no为图纸编号
       let program_no = $('#drawingno').val();
        $("#MAC_NBR").val();
        if(product_name==""||product_name==null){
            BzAlert("请输入零件号");
            return   ;
        }
        if(mac_nbr=='' || mac_nbr ==null){
            BzAlert("请选择设备编号");
            return   ;
        }
        if(mem_nbr=='' || mem_nbr ==null){
            BzAlert("请选择人员");
            return   ;
        }
        var paras={mac_nbr:mac_nbr,product_name,program_no,mem_nbr}
    $.post("/sweedcodes/AddSweedcode",paras,function(result){
        if (result.Status == 0) {
            BzSuccess(result.Message);
          //  $("#x5window").data("kendoWindow").close();
            refreshGrid();
        } else {
            BzAlert(result.Message);
        }

      });
    //});  

});

$("#search").click(function(){
    if ($('#input_MAC_NBRname').val() == '') {
        BzAlert(lang.Common.PleaseSelectDeviceGroup);
        return;
    }
    if ($('#my-select').val() == null) {
        BzAlert(lang.Common.PleaseSelectDeviceName);
        return;
    }
    if ($('#my-selects').val() == null || $('#my-selects').val() == '') {
        BzAlert(lang.Common.PleaseSelectDeviceNo);
        return;
    }
    refreshGrid();
})

$.post('/sweedcodes/getStaffInfo',{},function(data){
    if(data.Status == 0){
        $("#staffInfo").kendoComboBox({
            dataTextField: "MEMBER_NO",
            dataValueField: "MEM_NBR",
            dataSource: data.Data,
            value: '',
        }).data("kendoComboBox");
    }else{
        console.log(data);
    }
})

});
// function BindMacs(){
//     Machine= $("#MAC_NBR").multipleComboxTree({
//         url: "/StatusDetail/GetAllMachineAndMachineGroup",
//         url2: "/StatusDetail/GetKeywordMachinelist",
//         type: 2,
//         inputheight:20,
//         data: {
//             GroupId: 0
//         },
//     }).data("BZ-multipleComboxTree");

// }
function BindData(){
   var fields={       
    UP_DOWN_NBR:{type:"int"},
    MAC_NO:{type:"string"},
    MAC_NAME:{type:"string"},
    MAC_NBR:{type:"int"},
    UP_TIME:{type:"date"},
    DOWN_TIME:{type:"date"},
    PRODUCT_NAME:{type:"string"},
    PROGRAM_NO:{type:"string"},
    UP_MEM:{type:"int"},
    DOWN_MEM:{type:"int"},
    MEMO:{type:"string"},
    UPMEM_NAME:{type:"string"},
    DOWNMEM_NAME:{type:"string"}
   };

   var cols=[];
   cols.push({ field: "UP_DOWN_NBR", title: 'id', width: 80, sortable: true, filterable: false, hidden: true });
   cols.push({ field: "PRODUCT_NAME", title: '零件号', width: 80, sortable: true, filterable: false, hidden: false });
   cols.push({ field: "PROGRAM_NO", title: '图纸编号', width: 80, sortable: true, filterable: false, hidden: false });
   cols.push({ field: "MAC_NO", title: '设备编号', width: 80, sortable: true, filterable: false, hidden: false });
   cols.push({ field: "MAC_NAME", title: '设备名称', width: 80, sortable: true, filterable: false, hidden: false });
   cols.push({ field: "MAC_NBR", title: '设备id', width: 80, sortable: true, filterable: false, hidden: true });
   cols.push({ field: "UP_MEM", title: '上线员工ID', width: 80, sortable: true, filterable: false, hidden: true });
   cols.push({ field: "UPMEM_NAME", title: '上线用户', width: 80, sortable: true, filterable: false, hidden: false });
   cols.push({ field: "UP_TIME", title: '上线时间', width: 80, sortable: true, filterable: false, hidden: false , format: "{0: yyyy/MM/dd HH:mm:ss}"});
//    cols.push({ field: "", title: '最大值', width: 80, sortable: true, filterable: false, hidden: false });
//    cols.push({ field: "", title: '最小值', width: 80, sortable: true, filterable: false, hidden: false });
   cols.push({ field: "DOWN_MEM", title: '有效工时', width: 80, sortable: true, filterable: false, hidden: true });
   cols.push({ field: "DOWN_MEM", title: '下线人员ID', width: 80, sortable: true, filterable: false, hidden: true });
   cols.push({ field: "DOWNMEM_NAME", title: '下线用户', width: 80, sortable: true, filterable: false, hidden: false });
   cols.push({ field: "DOWN_TIME", title: '下线时间', width: 80, sortable: true, filterable: false, hidden: false , format: "{0: yyyy/MM/dd HH:mm:ss}"});
   cols.push({ field: "MEMO", title: '备注', width: 80, sortable: true, filterable: false, hidden: false });
    cols.push({
        command: [
            { name: "aa", text:"下线" + '<i class="icon-edit"></i>', className: "btn purple",click:editsweedcpde},
            { name: "bb", text: "删除" + '<i class="icon-remove-sign"></i>', className: "btn red ",click:delsweedcode }
        ],
        title: lang.Order.Operation,
        width: 200
    });
   grid=$("#grid").grid({

    checkBoxColumn: false,
        baseUrl: "", //调用的URL
        selectable: "single", //行选择方式
        //sort: [{ field: "USER_NBR", dir: "ASC" }],
        scrollable: true,
        editable: false, //是否可编辑
        autoBind: false,
        height: 300,
        resizeGridWidth: true, //列宽度可调
        isPage: true,
        customsearch: true,
        server: true, //服务器端刷新，包括排序，筛选等
        actionUrl: ["/sweedcodes/GetUplineList", "", "", ""], //读、新增、更改、删除的URLaction
        custom: {
            PrimaryKey: "UP_DOWN_NBR",
            fields: fields,
            cols: cols
        }
   });

}

function refreshGrid() {
    //if ($("#filter").val() == "") {
        grid.grid("refresh", function() {
           var macs=[];
            macs.push($('#my-selects').val())
            return [
                { field: "macs", Operator: "eq", value:macs },
                { field: "programer", Operator: "eq", value:"" }
            ];
        });
    // } else {
    //     getDataByKeyWord();
    // }
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
    //按照多个字段排序
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

function editsweedcpde(e){
    if($('#staffInfo').val() == '' || $('#staffInfo').val()== undefined){
        BzAlert('请选择人员编号');
        return;
    }
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    var paras=
    {
        updown_nbr:dataItem.UP_DOWN_NBR,mac_nbr:dataItem.MAC_NBR,product_name:dataItem.PRODUCT_NAME,down_mem:$('#staffInfo').val(),
         program_no:dataItem.PROGRAM_NO,up_mem:dataItem.UP_MEM,memo:dataItem.MEMO,up_time:  moment(dataItem.UP_TIME).format('YYYY-MM-DD hh:MM:ss')
    };
    $.post("/sweedcodes/UpdeteUpdown",paras,function(result){

        if (result.Status == 0) {
            BzSuccess(result.Message);
            refreshGrid();
        } else {
            BzAlert(result.Message);
        }
    })

}
function delsweedcode(e){
    var dataItem = this.dataItem($(e.currentTarget).closest("tr"));
    var paras={updown_nbr:dataItem.UP_DOWN_NBR};
    $.post("/sweedcodes/DelUpdown",paras,function(result){

        if (result.Status == 0) {
            BzSuccess(result.Message);
            refreshGrid();
        } else {
            BzAlert(result.Message);
        }
    })

}




