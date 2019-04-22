function sanjiliandong(){
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
    $('#my-selects').html('');
    for (let z = 0; z < sortData.length; z++) {
        $('#my-selects').append(`<option value=${sortData[z].MAC_NBR} >${sortData[z].MAC_NO}</option>`)
    }
    $('#hiddenMySelects').css({
        display:'none'
    })
    $('#my-selects').selectpicker('refresh');
    $('#my-selects').selectpicker('render');
})
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
        $('#hiddenMySelect').css({
            'display':'none'
        });
        $('.shebeis').css({
            position:'relative',
            left:'35px'
        })
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