/**
 * Created by lh on 2018/6/28.
 */
var GetMacNameListData; //用来保存选中设备名称数据
var GetMacNameListDataAll; //用来保存所有设备名称数据
var GetClientInformation; //用来保存客户信息


$(function() {
    /*************************为了让默认显示 加上的 调取所有设备**********************/
    // let mdaMessage = localStorage.getItem('USER_MDA_MESSAGE');
    // mdaMessage = JSON.parse(mdaMessage);
    // for (let i = 0; i < mdaMessage.USER_PRE.length; i++) {
    //     mdaMessageData.push(mdaMessage.USER_PRE[i].MAC_NBR);
    // }
    // PostAjax(`${mdaMessageData[0]},${mdaMessageData[1]},${mdaMessageData[2]}}`);

    $.get('/BoardConfig/writeFile', (data) => {
        if (data.Status == 0) {
            let dataFile = JSON.parse(data.Data);
            // flag是1  是滚动看板  2是组合看板
            if(dataFile.flag == 1){
                $('#introduceTime').val(+dataFile.introduceTime);
                $('#introduceSpeeds').val(+dataFile.introduceSpeeds);
                $('#introduceTimes').val(+dataFile.introduceTimes);
                $('#MAP_Time').val(+dataFile.MAP_Time);
                $('#activationTime').val(+dataFile.activationTime);
                $('#activationEleSum').val(+dataFile.activationEleSum);
                $('#activationMacSum').val(+dataFile.activationMacSum);
                $('#stateTime').val(+dataFile.stateTime);
                $('#stateEleSum').val(+dataFile.stateEleSum);
                $('#policeTime').val(+dataFile.policeTime);
                $('#policeEleSum').val(+dataFile.policeEleSum);
                $('#policeLineSum').val(+dataFile.policeLineSum);
                $('#activationStandard').val(+dataFile.activationStandard);
            }else{
                let dataArr = JSON.parse(dataFile.dataArr);
                console.log(dataArr);
                // 显示和隐藏元素
                $('.tableActive').removeClass('active');
                $('.tableActive').eq(0).addClass('active')
                $('#groupConfig').show();
                $('#scrollConfig').hide();
                // 标题
                $('#boardTitle').val(dataFile.title);
                $('#combinationLine').val(dataArr.length)
                
                // 根据combinationLine生成元素 
                $('.borderSize').html('');
                for(let i = 0; i < $('#combinationLine').val();i++){
                    let eleWidth = ((dataArr[i].width.substring(0,dataArr[i].width.length-1)/100) * $('#borderSize').width()).toFixed(0);
                    let combinationLine;
                    if(i == $('#combinationLine').val() - 1){
                        combinationLine = $(`<div style='flex:1;border:1px solid #ccc;'></div>`)
                    }else{
                        combinationLine = $(`<div style='flex: 0  0  auto;width:${eleWidth}px;border:1px solid #ccc;'><label class='moveLabel' style='display:inline-block;width:2px;height:100%;cursor:col-resize;float:right'></label></div>`)
                    }
                    $('.borderSize').append(combinationLine[0]);
                }
                addMove()

                //添加块里面的可调整的元素
                for(let i = 0; i < $('#combinationLine').val(); i++){
                    let height = 174;   // 默认高度距离上面174
                    console.log(dataArr[i]);
                    for(let m = 0; m < dataArr[i].child.length; m++){
                        if(dataArr[i].child.length == 1){
                            let eleHeight = ((dataArr[i].child[m].height.substring(0,dataArr[i].child[m].height.length-1)/100) * $('#borderSize').height()).toFixed(0);
                            let combinationLine = $(`<div data-val='${dataArr[i].child[m].id}' data-name='${dataArr[i].child[m].name}' data-lineVal='${i+1}' style='height:${eleHeight - 5}px;border:1px solid #ccc;text-align:center'><span>${dataArr[i].child[m].name}(${i+1})</span></div>`);
                            $('#borderSize > div').eq(i)[0].appendChild(combinationLine[0])
                            $('#linesNumber').val(i+1)
                            $(combinationLine[0]).wireContorl();
                        }else{
                            let eleHeight = ((dataArr[i].child[m].height.substring(0,dataArr[i].child[m].height.length-1)/100) * $('#borderSize').height()).toFixed(0);
                            let combinationLine = $(`<div data-val='${dataArr[i].child[m].id}' data-name='${dataArr[i].child[m].name}' data-lineVal='${i+1}' style='height:${eleHeight - 5}px;border:1px solid #ccc;text-align:center'><span>${dataArr[i].child[m].name}(${i+1})</span></div>`);
                            $('#borderSize > div').eq(i)[0].appendChild(combinationLine[0])
                            $('#linesNumber').val(i+1)
                            $(combinationLine[0]).wireContorl();
                            if(i != 0){
                                $('#borderSize>div').eq(i).children('div').eq(m).css({
                                    top: height
                                })
                            }
                            height += (eleHeight-5);
                        }
                    
                    }
                    // $('.borderSize>div')[+$('#linesNumber').val()-1].appendChild(combinationLine[0]);
                }

            }
        } else if (data.Status == 0) {
            console.log('没有进行配置');
            return false;
        }
        if (data.Status == -999) {
            BzAlert(data.error);
            return false;
        }
    });
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

    //调取客户ID
    $.ajax({
        url: '/TinyMCE/GetUserTable',
        type: 'post',
        success: function(data) {
            if (data.Status == 0) {
                localStorage.setItem('USER_MDA_MESSAGE', JSON.stringify(data.Data));
                if (data.Data.USER_PRE[0] == undefined) {} else {
                    ajaxReadData(data.Data.USER_PRE[0].COMPANY_NAME);
                }
            }
        },
        error: function() {
            console.error(lang.Common.Error);
            return false;
        }
    })


    //调取富文本数据
    function ajaxReadData(data) {
        GetClientInformation = data;
        $.ajax({
            url: '/TinyMCE/getNum_Name',
            type: 'post',
            data: {
                name: data,
            },
            success: function(data) {
                if (data.Status == 0) {
                    for (let i = 0; i < data.Data.length; i++) {
                        if (data.Data[i].Show == true) {
                            $("#Num_Name").kendoComboBox({
                                dataTextField: "Num_Name",
                                dataValueField: "Num_Name",
                                value: data.Data[i].Num_Name,
                                dataSource: data.Data,
                            }).data("Num_Name");
                            return;
                        }
                    }
                    $("#Num_Name").kendoComboBox({
                        dataTextField: "Num_Name",
                        dataValueField: "Num_Name",
                        dataSource: data.Data,
                    }).data("Num_Name");
                } else {
                    BzAlert(data.error);
                }
            },
            error: function() {
                console.error(lang.Common.Error);
                return false;
            }
        })
    }

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
        $('#my-selects').html('');
        var sortData = [];
        for (let i = 0; i < $('#my-select').val().length; i++) {
            for (let w = 0; w < GetMacNameListData.Data.rootMacInfo.length; w++) {
                if ($('#my-select').val()[i] == GetMacNameListData.Data.rootMacInfo[w].CATEGORY) {
                    sortData.push(GetMacNameListData.Data.rootMacInfo[w])
                        // $('#my-selects').append(`<option value=${GetMacNameListData.Data.rootMacInfo[w].MAC_NBR} >${GetMacNameListData.Data.rootMacInfo[w].MAC_NO}</option>`)
                }
            }
        }
        sortData.sort(compare('paixu', compare('RANK_NUM')));
        for (let z = 0; z < sortData.length; z++) {
            $('#my-selects').append(`<option value=${sortData[z].MAC_NBR} >${sortData[z].MAC_NO}</option>`)
        }
        $('#my-selects').selectpicker('refresh');
        $('#my-selects').selectpicker('render');
    })

    MAC_NBRALL = $("#MAC_NBRnameALL").comboxTree({
        url: "/Main/GetUserMacGroup",
        data: { groupID: 0 },
        treetemplate: $("#treeview-templateALL").html(),
        width: 184,
        diffwidth: 27,
        type: 2,
    });
    $('#input_MAC_NBRnameALL').attr('readonly', 'readonly');
    $('#my-selectALL').change(function() {
        $('#my-selectsALL').html('');
        var sortDataAll = [];
        for (let i = 0; i < $('#my-selectALL').val().length; i++) {
            for (let w = 0; w < GetMacNameListData.Data.rootMacInfo.length; w++) {
                if ($('#my-selectALL').val()[i] == GetMacNameListData.Data.rootMacInfo[w].CATEGORY) {
                    sortDataAll.push(GetMacNameListData.Data.rootMacInfo[w]);
                    // $('#my-selectsALL').append(`<option value=${GetMacNameListData.Data.rootMacInfo[w].MAC_NBR} >${GetMacNameListData.Data.rootMacInfo[w].MAC_NO}</option>`)
                }
            }
        }
        sortDataAll.sort(compare('paixu', compare('RANK_NUM')));
        for (let z = 0; z < sortDataAll.length; z++) {
            $('#my-selectsALL').append(`<option value=${sortDataAll[z].MAC_NBR} >${sortDataAll[z].MAC_NO}</option>`)
        }
        $('#my-selectsALL').selectpicker('refresh');
        $('#my-selectsALL').selectpicker('render');
    })

    $('#saveData').click(() => {
        // 判断为空
        let postData = {
            flag:1,
            introduceTime: $('#introduceTime').val(),
            introduceSpeeds: $('#introduceSpeeds').val(),
            introduceTimes: $('#introduceTimes').val(),
            MAP_Time: $('#MAP_Time').val(),
            MAP_speed: $('#MAP_speed').val(),
            MAP_frequency: $('#MAP_frequency').val(),
            activationTime: $('#activationTime').val(),
            activationEleSum: $('#activationEleSum').val(),
            activationMacSum: $('#activationMacSum').val(),
            activationChecked: $('#activationChecked').attr('checked') == 'checked',
            stateTime: $('#stateTime').val(),
            stateEleSum: $('#stateEleSum').val(),
            stateChecked: $('#stateChecked').attr('checked') == 'checked',
            policeTime: $('#policeTime').val(),
            policeEleSum: $('#policeEleSum').val(),
            policeLineSum: $('#policeLineSum').val(),
            activationStandard: $('#activationStandard').val(),
            policeChecked: $('#policeChecked').attr('checked') == 'checked',
            MAP_nbr: $('#my-selects').val() == null ? '' : $('#my-selects').val().join(','),
            ALL_nbr: $('#my-selectsALL').val() == null ? '' : $('#my-selectsALL').val().join(','),
            GetClientInformation: GetClientInformation,
            Num_Name: $('input[aria-owns="Num_Name_listbox"]').val()
        };
        //发送请求  保存为文件 文件目录在pulic/BoardConfig/文件  文件名是由userId命名
        $.post('/BoardConfig/createFile', postData, (data) => {
            if (data.Status == 0) {
                BzSuccess(data.Message);
            } else {
                BzAlert(data.error);
            }
        })
    })

    /////////////////////////////////////组合看板方法//////////////////////////////////////
    $('.tableActive').click(function(){
        $('.tableActive').removeClass('active');
        $(this).addClass('active');
        if($(this).html() == '组合看板配置'){
            $('#groupConfig').show();
            $('#scrollConfig').hide();
        }else{
            $('#scrollConfig').show();
            $('#groupConfig').hide();
        }
    })
    // 默认加载事件
    for(let i = 0; i < $('#combinationLine').val();i++){
        let combinationLine;
        if(i == $('#combinationLine').val() - 1){
            combinationLine = $("<div style='flex:1;border:1px solid #ccc;'></div>")
        }else{
            combinationLine = $("<div style='flex:1;border:1px solid #ccc;'><label class='moveLabel' style='display:inline-block;width:2px;height:100%;cursor:col-resize;float:right'></label></div>")
        }
        $('.borderSize').append(combinationLine[0]);
    }
    addMove()

    // change之后加载事件
    $('#combinationLine').change(function(){
        $('.borderSize').html('');
        for(let i = 0; i < $('#combinationLine').val();i++){
            let combinationLine;
            if(i == $('#combinationLine').val() - 1){
                combinationLine = $("<div style='flex:1;border:1px solid #ccc;'></div>")
            }else{
                combinationLine = $("<div style='flex:1;border:1px solid #ccc;'><label class='moveLabel' style='display:inline-block;width:2px;height:100%;cursor:col-resize;float:right'></label></div>")
            }
            $('.borderSize').append(combinationLine[0]);
        }
        addMove()
    })
    //  给块添加左拉  右拉 方法
    function addMove(){
        for(let i = 0; i < $('.moveLabel').length;i++){
            let eleMoveLabel = $('.moveLabel')[i];
            $(eleMoveLabel).mousedown(function(e){
                let that = this;
                let disX = e.clientX - $(that).parent().width();
                document.onmousemove = function(e) {
                        e.preventDefault();
                        var l = e.clientX - disX;
                        $(that).parent().css({
                            width: $(that).parent().width() - ($(that).parent().width() - l),
                            flex: 'none'
                        })
                        // oDiv.style.width = l + 'px';
                        // oDiv.style.height = t + 'px';
                        // oDiv.style.lineHeight = t + 'px';
                }
                document.onmouseup = function(){
                    document.onmousemove = null;
                    document.onmouseup = null;
                }
            })
            
        }
    }
    $('#addLine').click(function(){ 
        let combinationLine = $(`<div data-val='${$('#allType').val()}' data-name='${$("#allType").find("option:selected").html()}' data-lineVal='${$('#linesNumber').val()}' style='height:${$('#linesNumberHeight').val()}px;border:1px solid #ccc;text-align:center'><span>${$("#allType  option:selected").text()}(${$('#linesNumber').val()})</span></div>`);
        $('.borderSize>div')[+$('#linesNumber').val()-1].appendChild(combinationLine[0]);
        $(combinationLine[0]).wireContorl()
    })

    $('#addData').click(function(){
        // console.log($('#borderSize>div').eq(0).width())
        let dataArr = [];
        for(let i = 0; i < $('#combinationLine').val();i++){
            dataArr.push({
                id:'line'+i,
                height:'100%',
                width: ($('#borderSize>div').eq(i).width() / $('#borderSize').width() * 100).toFixed(2) + '%',
                child:[]
            })
            let divHeight = 0;
            for(let w = 0; w < $('.createEventsWire').find(`div[data-lineval=${i+1}]`).length;w++){
                divHeight += $($('.createEventsWire').find(`div[data-lineval=${i+1}]`)[w]).height();
            }
            for(let w = 0; w < $('.createEventsWire').find(`div[data-lineval=${i+1}]`).length;w++){
                dataArr[i].child.push({
                    id: $($('.createEventsWire').find(`div[data-lineval=${i+1}]`)[w]).attr('data-val'),
                    name: $($('.createEventsWire').find(`div[data-lineval=${i+1}]`)[w]).attr('data-name'),
                    width:'100%',
                    height: ($($('.createEventsWire').find(`div[data-lineval=${i+1}]`)[w]).height()/divHeight*100).toFixed(2)+'%'
                })
            }
        }
        let dataObj = {
            flag: 2,
            title: $('#boardTitle').val() == undefined ? '' : $('#boardTitle').val(),
            dataArr: JSON.stringify(dataArr)
        };
        //发送请求  保存为文件 文件目录在pulic/BoardConfig/文件  文件名是由userId命名
        $.post('/BoardConfig/createFile', dataObj, (data) => {
            if (data.Status == 0) {
                BzSuccess(data.Message);
            } else {
                BzAlert(data.error);
            }
        })
    })
});

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


function addOnClickALL(_salf) {
    $('#input_MAC_NBRnameALL').val($(_salf).text());
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
        $('#my-selectALL').html('');
        $('#my-selectsALL').html('');
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
            $('#my-selectALL').append(`<option value=${description[i].CATEGORY} >${description[i].CATEGORY}</option>`);
        }
        // 缺一不可  
        $('#my-selectALL').selectpicker('refresh');
        $('#my-selectALL').selectpicker('render');
    })
}