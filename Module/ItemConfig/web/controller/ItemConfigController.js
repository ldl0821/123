$(function(){
    var MAC_NBR;
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
   /**************************为了让默认显示 加上的*********************************************/
    MAC_NBR = $("#MAC_NBRname").comboxTree({
        url: "/Main/GetUserMacGroup",
        data: { groupID: 0 },
        treetemplate: $("#treeview-template_out").html(),
        width: 184,
        diffwidth: 27,
        type: 2,
    });
    $('#input_MAC_NBRname').attr('readonly', 'readonly');
    $('#my-select').change(function() {
        $('#my-selects').html('');
        var sortData = [];
        for (let i = 0; i < $('#my-select').val().length; i++) {
            for (let w = 0; w < GetMacNameListData.Data.rootMacInfo.length; w++) {
                if ($('#my-select').val()[i] == GetMacNameListData.Data.rootMacInfo[w].CATEGORY) {
                    sortData.push(GetMacNameListData.Data.rootMacInfo[w]);
                        // $('#my-selects').append(`<option value=${GetMacNameListData.Data.rootMacInfo[w].MAC_NBR} >${GetMacNameListData.Data.rootMacInfo[w].MAC_NO}</option>`)
                }
            }
        }
        sortData.sort(compare('paixu', compare('RANK_NUM')));
        for (let z = 0; z < sortData.length; z++) {
            $('#my-selects').append(`<option value=${sortData[z].MAC_NBR} >${sortData[z].MAC_NO}</option>`);
        }
        $('#my-selects').selectpicker('refresh');
        $('#my-selects').selectpicker('render');
    })
    $('#searchData').click(()=>{
        if ($('#input_MAC_NBRname').val() == '') {
            BzAlert(lang.Common.PleaseSelectDeviceGroup);
            return;
        }
        if ($('#my-select').val() == null) {
            BzAlert(lang.Common.PleaseSelectDeviceName);
            return;
        }
        if ($('#my-selects').val() == null) {
            BzAlert(lang.Common.PleaseSelectDeviceNo);
            return;
        }
        let dataArr = $('#my-selects').val().join();
        getMacItemFind(dataArr);
    });
    $('#saveItem').click(()=>{
        let itemName='',itemParticular='',MAC_NBR;
        for(let i = 0; i < $('.transfer-list-right ul li .tyue-checkbox-txt').length;i++){
            if(i == $('.transfer-list-right ul li .tyue-checkbox-txt').length-1){
                itemName += $('.transfer-list-right ul li .tyue-checkbox-txt').eq(i).attr('title');
                itemParticular += $('.transfer-list-right ul li .tyue-checkbox-txt').eq(i).html().trim();
            }else{
                itemName += $('.transfer-list-right ul li .tyue-checkbox-txt').eq(i).attr('title')+',';
                itemParticular += $('.transfer-list-right ul li .tyue-checkbox-txt').eq(i).html().trim()+',';
            }
        }
        MAC_NBR = $('#my-selects').val().join();
        if(itemName ==''){
            BzAlert(lang.ItemConfig.checkedItemsBlank);
            return;
        }
        $.post('/ItemConfig/addMACItem',{MAC_NBR,itemName,itemParticular},(data)=>{
            if(data.Status == 0){
                BzSuccess(data.Message);
            }else{
                BzAlert(data.error);
            }
        })
    });
    //拿到设备item并且进行筛选
    function getMacItemFind(id) {
        $.ajax({
            type: "post",
            url: "/ItemConfig/GetItems",
            data: {
                macNbrs: id
            },
            success: function(data) {
                let getMacItem = [],findItem = [];
                for(let i = 0 ; i < data.Data.length;i++){
                    for(let item in data.Data[i].Items){
                        getMacItem.push(item);
                    }
                }
                let objArrLength = {};
                for(var i = 0; i < getMacItem.length; i++){ 
                    var dt=getMacItem[i]; 
                    if(objArrLength[dt]){ 
                        //存在了 
                        objArrLength[dt]++; 
                    }else{ 
                        //不存在 
                        objArrLength[dt]=1; 
                    } 
                }
                for(let item in objArrLength){
                    if(objArrLength[item] == data.Data.length){
                        findItem.push(item);
                    }   
                }
                $('.transfer-list-right ul').html('');
                $('.transfer-list-left ul').html('');
                for(let m = 0; m <findItem.length;m++){
                    $('.transfer-list-left ul').append(
                        // `<div class='findItemClass'><span data-Name='${data.Data[0].Items[`${findItem[m]}`].Name}'>${data.Data[0].Items[`${findItem[m]}`].Description}</span><input type='checkbox' class='finditemcheckbox'></div>`
                        `<li>
                            <div class='ty-tree-div'>
                                <label class='tyue-checkbox-wrapper'>
                                    <span class="tyue-checkbox">
                                        <input type="checkbox" id="tyue-checkbox-blue" class="tyue-checkbox-input">
                                    </span>
                                    <span class='tyue-checkbox-txt' title='${data.Data[0].Items[`${findItem[m]}`].Name}'>
                                        ${data.Data[0].Items[`${findItem[m]}`].Description}
                                    </span>
                                </label>
                            </div>
                        </li>`
                    );
                }
                $("#ued-transfer-1").transferItem();
            },
            error: function(err) {
                return false;
            }
        });
    };
})

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
            if (!b) { arr.push(list[i]); }
        }
    }
    return arr;
}