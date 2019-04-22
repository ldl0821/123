/**
 * Created by qb on 2016/11/28.
 */
var GetMacNameListData;
$(function() {
    var MAC_NBR;
    var dataArr = []; //保存全部设备ID   执行懒加载使用
    var intervlaFacility;
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

    function timestampToTime(timestamp) {
        var date = new Date(Number(timestamp)); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
        Y = date.getFullYear() + '-';
        M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
        D = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
        h = date.getHours() + ':';
        m = date.getMinutes() + ':';
        s = date.getSeconds();
        return Y + M + D;
    }
    $("#startTime").kendoDateTimePicker({ format: "yyyy/MM/dd HH:mm:ss", value: moment(new Date()).subtract(0, 'days').format('YYYY/MM/DD 00:00:00'), interval: 1, timeFormat: "HH:mm:ss" });
    $("#endTime").kendoDateTimePicker({ format: "yyyy/MM/dd HH:mm:ss", value: new Date(), interval: 1, timeFormat: "HH:mm:ss" });

    /**************************为了让默认显示 加上的*********************************************/
    let mdaMessageData = [];
    // let mdaMessage = localStorage.getItem('USER_MDA_MESSAGE');
    // mdaMessage = JSON.parse(mdaMessage);
    // for (let i = 0; i < mdaMessage.USER_PRE.length; i++) {
    //     mdaMessageData.push(mdaMessage.USER_PRE[i].MAC_NBR);
    // }
    // mdaMessageData = mdaMessageData.join(',');
    // PostAjax(mdaMessageData);
    $.ajax({
        url: '/main/getUserMachineList',
        type: 'get',
        async: false,
        success: function(data) {
            let Lhdata = LhsortData(data);
            data.Data.GetAllMachineList = Lhdata;
            if (data.Data.GetAllMachineList.length != 0) {
                for (let i = 0; i < data.Data.GetAllMachineList.length; i++) {
                    if(data.Data.GetAllMachineList[i].MAC_NBR != null){
                        mdaMessageData.push(data.Data.GetAllMachineList[i].MAC_NBR);
                    }
                }
                mdaMessageData = mdaMessageData.join(',');
                PostAjax(mdaMessageData);
            }
        },
        error: function(error) {
            console.error(error);
        }
    });
    /**************************为了让默认显示 加上的*********************************************/
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


    $('#pucker').click(() => {
        if ($('.elementTable')[0].style.display == 'none') {
            $(`.pagination`).find('.elementTable').slideDown();
        } else {
            $(`.pagination`).find('.elementTable').slideUp();
        }
    })


    $('#searchData').click(function() {
        //ifClick 防止多次点击
        $(`.pagination`).html('');
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
        if (!moment($('#startTime').val()).isBefore($('#endTime').val())) {
            BzAlert(lang.Common.EndTimeIsNotLessThanStartTime);
            return;
        }
        if (!moment($('#endTime').val()).isBefore(moment(new Date()).add(1,'d').format('YYYY-MM-DD'))) {
            BzAlert(lang.Common.endTimeShouldNotBeGreaterThanDay);
            return;
        }
        dataArr = $('#my-selects').val().join(',');
        PostAjax(dataArr);
    });

    //鼠标滚动时间
    // window.onscroll = () => {
    //     if (dataArr.length == 0) {
    //         return false;
    //     }
    //     var bottomScroll = $(document).height() - ($(window).scrollTop() + $(window).height());
    //     if (bottomScroll <= 200) {
    //         if (ifClick == true) {
    //             //判断是否加载完成
    //             if (dataArr.length == $('.lazyLoad').length) {
    //                 return false;
    //             }
    //             //利用长度 判断传几个值
    //             if (dataArr[$('.lazyLoad').length + 2] == undefined) {
    //                 if (dataArr[$('.lazyLoad').length] == undefined) {
    //                     return false;
    //                 } else if (dataArr[$('.lazyLoad').length + 1] == undefined) {
    //                     searchDataAjax(`${dataArr[$('.lazyLoad').length]}`);
    //                 } else {
    //                     searchDataAjax(`${dataArr[$('.lazyLoad').length]},${dataArr[$('.lazyLoad').length+1]}`);
    //                 }
    //             } else {
    //                 searchDataAjax(`${dataArr[$('.lazyLoad').length]},${dataArr[$('.lazyLoad').length+1]},${dataArr[$('.lazyLoad').length+2]}`);
    //             }
    //             ifClick = false;
    //         }
    //     }
    // }

    $('#openExcel').click(function() {
        var machines = [];
        for (var item in MAC_NBR.dataAarry) {
            machines.push(item);
        }
        if (machines.length == 0) {
            return;
        }
        var data = {
            objectIds: machines,
            startTime: $("#startTime").val(),
            endTime: $("#endTime").val()
        };
        window.open('/machineactivation/r/downloadExcel?objectIds=' + machines + '&startTime=' + data.startTime + '&endTime=' + data.endTime);
    })


    function PostAjax(id) {
        $('#allloding').show();
        /******************************************************************按天查询****************************************************************/
        if ($("input[name='searchType']:checked").val() == 0) {
            let dataArr = [];
            let keyValue;
            keyValue = JSON.stringify({
                MARS: id,
                BEGIN_DATE: $('#startTime').val(),
                END_DATE: $('#endTime').val(),
                Flag: 1,
                Show: 1,
            });
            $.post("/Statement/machineactivation/GetNewNULLActivation", {
                key: keyValue
            }, (data) => {
                // data.Data[0].sort(function(x,y){
                //     return Date.parse(x.DAY_TYPE) - Date.parse(y.DAY_TYPE);//时间正序
                // });
                // let dataArrGroupCopy = Object.assign([], data.Data);
                // console.log(dataArrGroupCopy);
                dataArr = data;
                var copyDataArr = uniqueArray(dataArr.Data[0], 'DAY_TYPE', 'MAC_NBR');
                if (copyDataArr[0] == undefined) {
                    copyDataArr = [];
                }

                //////////////////////////////////////////处理历史//////////////////////////////////////////
                var dataArrs = [];
                var dataArrTime = [];
                var datas = [];
                var valueTime = [];
                dataArrGroup = copyDataArr.map(function(item, index, arr) {
                    const i = arr.find(_item => item.MAC_NBR === _item.MAC_NBR);
                    if (i !== item) {
                        i.DAY_TYPE += item.DAY_TYPE;
                        i.DEBUG += Number(item.DEBUG);
                        i.DOWN += Number(item.DOWN);
                        i.FREE += Number(item.FREE);
                        i.OPEN_MAC_TIME.push(item.OPEN_MAC_TIME);
                        i.RUN += Number(item.RUN);
                        i.STOP += Number(item.STOP);
                        i.SUM_DURATION += Number(item.SUM_DURATION);
                        return undefined;
                    } else {
                        i.DAY_TYPE = i.DAY_TYPE;
                        i.DEBUG = i.DEBUG;
                        i.DOWN = i.DOWN;
                        i.FREE = i.FREE;
                        i.OPEN_MAC_TIME = [i.OPEN_MAC_TIME];
                        i.RUN = i.RUN;
                        i.STOP = i.STOP;
                        i.SUM_DURATION = i.SUM_DURATION;
                        return i;
                    }
                }).filter(item => item !== undefined);
                dataArrs = [];
                for (let l = 0; l < dataArrGroup.length; l++) {
                    //在这里只要把时间一样的全部去掉
                    dataArrGroup[l].OPEN_MAC_TIME = Array.from(new Set(dataArrGroup[l].OPEN_MAC_TIME));
                    dataArrGroup[l].OPEN_MAC_TIMEALL = 0;
                    for (let z = 0; z < dataArrGroup[l].OPEN_MAC_TIME.length; z++) {
                        dataArrGroup[l].OPEN_MAC_TIMEALL += dataArrGroup[l].OPEN_MAC_TIME[z];
                    }
                    datas = {};
                    datas = {
                        MAC_NO: dataArrGroup[l].MAC_NO,
                        CODE_NO: dataArrGroup[l].CODE_NO == null ? '' : dataArrGroup[l].CODE_NO,
                        MAC_NAME: dataArrGroup[l].MAC_NAME,
                        CATEGORY: dataArrGroup[l].CATEGORY,
                        DEBUG: dataArrGroup[l].DEBUG / dataArrGroup[l].SUM_DURATION,
                        MAC_NBR: dataArrGroup[l].MAC_NBR,
                        DOWN: dataArrGroup[l].DOWN / dataArrGroup[l].SUM_DURATION,
                        FREE: dataArrGroup[l].FREE / dataArrGroup[l].SUM_DURATION,
                        OPEN_MAC_TIME: dataArrGroup[l].OPEN_MAC_TIME,
                        OPEN_MAC_TIMEALL: dataArrGroup[l].OPEN_MAC_TIMEALL,
                        SUM_DURATION: dataArrGroup[l].SUM_DURATION,
                        RUN: dataArrGroup[l].RUN / dataArrGroup[l].SUM_DURATION,
                        STOP: dataArrGroup[l].STOP / dataArrGroup[l].SUM_DURATION,



                        DEBUGNUM: dataArrGroup[l].DEBUG,
                        DOWNNUM: dataArrGroup[l].DOWN,
                        FREENUM: dataArrGroup[l].FREE,
                        RUNNUM: dataArrGroup[l].RUN,
                        STOPNUM: dataArrGroup[l].STOP,
                    }
                    dataArrs.push(datas);
                    //处理好的 历史
                    var DayDataArr = [];
                    for (let i = 0; i < dataArrs.length; i++) {
                        DayDataArr.push({
                            time: dataArrs[i].CODE_NO + ' ' + dataArrs[i].CATEGORY + ' ' + dataArrs[i].MAC_NAME + ' ' + dataArrs[i].MAC_NO,
                            sumtime: (dataArrs[i].OPEN_MAC_TIMEALL / 3600).toFixed(2),
                            data: [(dataArrs[i].RUN * 100).toFixed(2), (dataArrs[i].RUN * 100).toFixed(2), (dataArrs[i].FREE * 100).toFixed(2), (dataArrs[i].DEBUG * 100).toFixed(2), (dataArrs[i].STOP * 100).toFixed(2), (dataArrs[i].DOWN * 100).toFixed(2)],
                            dataSum: [dataArrs[i].RUNNUM, dataArrs[i].RUNNUM , dataArrs[i].FREENUM , dataArrs[i].DEBUGNUM , dataArrs[i].STOPNUM , dataArrs[i].DOWNNUM],
                        })
                    }
                }
                if (DayDataArr != undefined) {
                    var ojson = {
                        "facility": {
                            // "name": $('#startTime').val() + '-' + $('#endTime').val(), //设备名称   
                            "name": $("#my-select").parent().find('button').attr("title"), //设备名称 htc:20180629
                            "plant": "", //工厂
                            "workshop": "", //车间
                            "production": '', //产线
                            "model": "", //设备型号
                            "number": '', //设备编号
                            "procedure": "", //程序号
                            "vender": "", //设备厂家
                            "echartsId": "echartsId" + $('#startTime').val() + $('#endTime').val(), //echartsId
                            "elementTitle": $('#startTime').val() + '—' + $('#endTime').val(), //设备名称
                            /**
                             ** value time时间   
                             ** totaltime  总开机时间
                             ** data[标准稼动率，运行，空闲，调试，停机，关机]
                             **/
                            "value": DayDataArr
                        }
                    }
                    $(`.pagination`).createElement(ojson);
                    $(`.pagination`).find('.elementTable table').css('height', $('.elementTableHeight').height() - 10 + 'px');
                    $(`.pagination`).find('.elementTable').hide();
                }
                $('#allloding').hide();
            })
        }
    }
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
        for(let qq = 0; qq < GetMacNameListData.Data.rootMacInfo.length;qq++){
            if(GetMacNameListData.Data.rootMacInfo[qq].paixu == undefined){
                GetMacNameListData.Data.rootMacInfo[qq].paixu = -1;
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
            $('#my-select').append(`<option value=${description[i].CATEGORY} >${description[i].CATEGORY}</option>`)
        }
        // 缺一不可  
        $('#my-select').selectpicker('refresh');
        $('#my-select').selectpicker('render');
    })
}

function uniqueArray(array, key, keys) {
    var result = [array[0]];
    for (var i = 1; i < array.length; i++) {
        var item = array[i];
        var repeat = false;
        for (var j = 0; j < result.length; j++) {
            if (item[key] == result[j][key] && item[keys] == result[j][keys]) {
                repeat = true;
                break;
            }
        }
        if (!repeat) {
            result.push(item);
        }
    }
    return result;
}