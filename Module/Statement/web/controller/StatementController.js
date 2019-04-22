/**
 * Created by qb on 2016/11/28.
 */
var GetMacNameListData; //用来保存选中设备名称数据
var GetMacNameListDataAll; //用来保存所有设备名称数据
let classShiftArr = []; //班次保存设备

$(function() {
    var MAC_NBR;
    var ifClick = true;
    var dataArr = []; //保存全部设备ID   执行懒加载使用
    var intervlaFacility;
    var dataGetMacNoList;
    let mdaMessageData = []; //用于懒加载

    /*************************为了让默认显示 加上的 调取所有设备**********************/
    // let mdaMessage = localStorage.getItem('USER_MDA_MESSAGE');
    // mdaMessage = JSON.parse(mdaMessage);
    // for (let i = 0; i < mdaMessage.USER_PRE.length; i++) {
    //     mdaMessageData.push(mdaMessage.USER_PRE[i].MAC_NBR);
    // }
    // PostAjax(`${mdaMessageData[0]},${mdaMessageData[1]},${mdaMessageData[2]}}`);
    $("#startTime").kendoDateTimePicker({ format: "yyyy/MM/dd HH:mm:ss", value: moment(new Date()).subtract(7, 'days').format('YYYY/MM/DD 00:00:00'), interval: 1, timeFormat: "HH:mm:ss" });
    $("#endTime").kendoDateTimePicker({ format: "yyyy/MM/dd HH:mm:ss", value: moment(new Date()).format('YYYY/MM/DD HH:mm:ss'), interval: 1, timeFormat: "HH:mm:ss" });
    // $.ajax({
    //     type: "post",
    //     url: "/Statement/GetClasses",
    //     async: false,
    //     data: {
    //         //machine: machine == undefined ? dataSting : machine,   //machine必填
    //         MARS: id,
    //         BEGIN_DATE: moment($('#startTime').val()).format('YYYY-MM-DD'),
    //         END_DATE: moment($('#endTime').val()).format('YYYY-MM-DD'),
    //         // endTime: "2018/03/03",
    //         // machine: "11,12,13,14,15,16,17,",
    //         // startTime: "2018/03/01"
    //     },
    //     success: function(data) {
    //         if (data.Data.length != 0) {
    //             $("input[name='searchType']:checked").val(3)
    //         }else{
    //             console.log(lang.Statement.NoFlight);
    //         }
    //     },
    //     error: function(err) {
    //         return false;
    //     }
    // });
    $.ajax({
        url: '/main/getUserMachineList',
        type: 'get',
        async: false,
        success: function(data) {
            if (data.Data.GetAllMachineList.length != 0) {
                let Lhdata = LhsortData(data);
                GetMacNameListDataAll = data;
                data.Data.GetAllMachineList = Lhdata;
                // GetMacNameListDataAll = data;
                for (let i = 0; i < data.Data.GetAllMachineList.length; i++) {
                    if(data.Data.GetAllMachineList[i].MAC_NBR != null){
                        mdaMessageData.push(data.Data.GetAllMachineList[i].MAC_NBR);
                    }
                }
                $.ajax({
                    type: "post",
                    url: "/Statement/GetClasses",
                    async: false,
                    data: {
                        //machine: machine == undefined ? dataSting : machine,   //machine必填
                        MARS: mdaMessageData.join(),
                        BEGIN_DATE: moment($('#startTime').val()).format('YYYY-MM-DD'),
                        END_DATE: moment($('#endTime').val()).format('YYYY-MM-DD'),
                        // endTime: "2018/03/03",
                        // machine: "11,12,13,14,15,16,17,",
                        // startTime: "2018/03/01"
                    },
                    success: function(data) {
                        if (data.Data.length != 0) {
                            let arrClass = [];
                            classShiftArr = data.Data;
                            $("input[name='searchType'][value='4']").parent().addClass('checked');
                            $("input[name='searchType'][value='1']").parent().removeClass('checked');
                            $("input[name='searchType'][value='1']").removeAttr('checked');
                            $("input[name='searchType'][value='4']").attr('checked','checked');
                        }else{
                            console.log(lang.Statement.NoFlight);
                        }
                    },
                    error: function(err) {
                        return false;
                    }
                });
                PostAjax(`${mdaMessageData[0]},${mdaMessageData[1]},${mdaMessageData[2]}`);
            }
        },
        error: function(error) {
            console.error(error);
        }
    })

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
        mdaMessageData = [];
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
        // dataArr = $('#my-selects').val().join();
        dataArr = $('#my-selects').val();
        mdaMessageData = dataArr;
        // PostAjax(dataArr);
        if (mdaMessageData.length == 0) {
            return;
        } else if (mdaMessageData.length == 1) {
            PostAjax(`${mdaMessageData[0]}`);
        } else if (mdaMessageData.length == 2) {
            PostAjax(`${mdaMessageData[0]},${mdaMessageData[1]}`);
        } else if (mdaMessageData.length >= 3) {
            PostAjax(`${mdaMessageData[0]},${mdaMessageData[1]},${mdaMessageData[2]}`);
        }
    });

   

    $('#openExcel').click(function() {
        mdaMessageData = [];
        Macs = "";
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
        // dataArr = $('#my-selects').val().join();
        dataArr = $('#my-selects').val();
        mdaMessageData = dataArr;
        // PostAjax(dataArr);
        if (mdaMessageData.length == 0) {
            return;
        } else if (mdaMessageData.length == 1) {
            Macs = `${mdaMessageData[0]}`;
        } else if (mdaMessageData.length == 2) {
            Macs = (`${mdaMessageData[0]},${mdaMessageData[1]}`);
        } else if (mdaMessageData.length >= 3) {
            Macs = (`${mdaMessageData[0]},${mdaMessageData[1]},${mdaMessageData[2]}`);
        }

        var keyValue = JSON.stringify([{
            MARS: Macs,
            BEGIN_DATE: moment($('#startTime').val()).add(1, 'd').format('YYYY-MM-DD'),
            END_DATE: moment($('#endTime').val()).format('YYYY-MM-DD'),
            IS_SHIFT: $("input[name='searchType']:checked").val(),
            IS_HISTORY: 0,
        }, {
            MARS: Macs,
            BEGIN_DATE: moment($('#startTime').val()).add(1, 'd').format('YYYY-MM-DD'),
            END_DATE: moment($('#endTime').val()).format('YYYY-MM-DD'),
            IS_SHIFT: $("input[name='searchType']:checked").val(),
            IS_HISTORY: 1,
        }, {
            MARS: Macs,
            BEGIN_DATE: moment($('#endTime').val()).format('YYYY-MM-DD') + ' 00:00:00',
            END_DATE: $('#endTime').val(),
            IS_SHIFT: $("input[name='searchType']:checked").val(),
            IS_HISTORY: 1,
        }])
        window.open('/Statement/r/outExcel?keyValue=' + keyValue);
    });


    //鼠标滚动时间
    window.onscroll = () => {
            if (mdaMessageData.length == 0) {
                return false;
            }
            var bottomScroll = $(document).height() - ($(window).scrollTop() + $(window).height());
            if (bottomScroll <= 200) {
                if (ifClick == true) {
                    //判断是否加载完成
                    if (mdaMessageData.length == $('.lazyLoad').length) {
                        return false;
                    }
                    ifClick = false;
                    //利用长度 判断传几个值
                    if (mdaMessageData[$('.lazyLoad').length + 2] == undefined) {
                        if (mdaMessageData[$('.lazyLoad').length] == undefined) {
                            return false;
                        } else if (mdaMessageData[$('.lazyLoad').length + 1] == undefined) {
                            PostAjax(`${mdaMessageData[$('.lazyLoad').length]}`);
                        } else {
                            PostAjax(`${mdaMessageData[$('.lazyLoad').length]},${mdaMessageData[$('.lazyLoad').length+1]}`);
                        }
                    } else {
                        PostAjax(`${mdaMessageData[$('.lazyLoad').length]},${mdaMessageData[$('.lazyLoad').length+1]},${mdaMessageData[$('.lazyLoad').length+2]}`);
                    }
                }
            }
        }
        /**************************为了让默认显示 加上的*********************************************/

    function PostAjax(id) {
        var addDataId = id.split(','),
            keyValue = JSON.stringify({
                MARS: id,
                BEGIN_DATE: $('#startTime').val(),
                END_DATE: $('#endTime').val(),
                Flag: $("input[name='searchType']:checked").val(),
                Show: 1,
            });
        $('.pagination').append(`<div id='loading' style='font-size:25px;text-align:center;margin-top:10px;margin-bottom:20px;'>
        <i class='icon-spinner icon-spin'></i>
            ${lang.MachineStatus.AreTryingToLoadData}
        </div>`)
        /******************************************************************按天查询****************************************************************/
        if ($("input[name='searchType']:checked").val() == 1) {
            $.post('/Statement/machineactivation/GetNewNULLActivation', {
                key: keyValue
            }, (data) => {
                data.Data[0].sort(function(x,y){
                    return Date.parse(x.END_DATE) - Date.parse(y.END_DATE);//时间正序
                });
                let dataArrGroup = data.Data[0].map(function(item, index, arr) {
                    const i = arr.find(_item => item.MAC_NBR === _item.MAC_NBR);
                    if (i !== item) {
                        i.BEGIN_DATE.push(item.BEGIN_DATE);
                        i.DEBUG.push(item.DEBUG);
                        i.DOWN.push(item.DOWN);
                        i.FREE.push(item.FREE);
                        i.OPEN_MAC_TIME.push(item.OPEN_MAC_TIME);
                        i.RUN.push(item.RUN);
                        i.STOP.push(item.STOP);
                        i.SUM_DURATION.push(item.SUM_DURATION);
                        return undefined;
                    } else {
                        i.BEGIN_DATE = [i.BEGIN_DATE];
                        i.DEBUG = [i.DEBUG];
                        i.DOWN = [i.DOWN];
                        i.FREE = [i.FREE];
                        i.OPEN_MAC_TIME = [i.OPEN_MAC_TIME];
                        i.RUN = [i.RUN];
                        i.STOP = [i.STOP];
                        i.SUM_DURATION = [i.SUM_DURATION];
                        return i;
                    }
                }).filter(item => item !== undefined);
                for (var l = 0; l < dataArrGroup.length; l++) {
                    let dataArrs = [];
                    for (var a = 0; a < dataArrGroup[l].BEGIN_DATE.length; a++) {
                        datas = {};
                        datas = {
                            DEBUG: dataArrGroup[l].DEBUG[a] / dataArrGroup[l].SUM_DURATION[a],
                            BEGIN_DATE: dataArrGroup[l].BEGIN_DATE[a],
                            DOWN: dataArrGroup[l].DOWN[a] / dataArrGroup[l].SUM_DURATION[a],
                            FREE: dataArrGroup[l].FREE[a] / dataArrGroup[l].SUM_DURATION[a],
                            OPEN_MAC_TIME: dataArrGroup[l].OPEN_MAC_TIME[a],
                            SUM_DURATION: dataArrGroup[l].SUM_DURATION[a],
                            RUN: dataArrGroup[l].RUN[a] / dataArrGroup[l].SUM_DURATION[a],
                            STOP: dataArrGroup[l].STOP[a] / dataArrGroup[l].SUM_DURATION[a],
                            DEBUGNUM: dataArrGroup[l].DEBUG[a],
                            DOWNNUM: dataArrGroup[l].DOWN[a],
                            FREENUM: dataArrGroup[l].FREE[a],
                            RUNNUM: dataArrGroup[l].RUN[a] ,
                            STOPNUM: dataArrGroup[l].STOP[a],
                        }
                        dataArrs.push(datas);
                    }
                    //处理好的 历史
                    let DayDataArr = [];
                    for (let i = 0; i < dataArrs.length; i++) {
                        DayDataArr.push({
                            time: BeginDateReplace(dataArrs[i].BEGIN_DATE),
                            sumtime: (dataArrs[i].OPEN_MAC_TIME / 3600).toFixed(2),
                            data: [(dataArrs[i].RUN * 100).toFixed(2), (dataArrs[i].RUN * 100).toFixed(2), (dataArrs[i].FREE * 100).toFixed(2), (dataArrs[i].DEBUG * 100).toFixed(2), (dataArrs[i].STOP * 100).toFixed(2), (dataArrs[i].DOWN * 100).toFixed(2)],
                            dataSum: [dataArrs[i].RUNNUM, dataArrs[i].RUNNUM , dataArrs[i].FREENUM , dataArrs[i].DEBUGNUM , dataArrs[i].STOPNUM , dataArrs[i].DOWNNUM],
                        })
                    }
                    let ojson = {
                        "facility": {
                            "name": (dataArrGroup[l].CODE_NO == null ? ' ' : dataArrGroup[l].CODE_NO) + dataArrGroup[l].CATEGORY + dataArrGroup[l].MAC_NAME + dataArrGroup[l].MAC_NO, //设备名称
                            "plant": dataArrGroup[l].BUY_PERSON, //工厂
                            "workshop": dataArrGroup[l].CATEGORY, //车间
                            "model": dataArrGroup[l].MAC_NAME, //设备型号
                            "production": dataArrGroup[l].GP_NAME, //产线
                            "number": dataArrGroup[l].MAC_NO, //设备编号
                            "procedure": "", //程序号
                            "vender": "", //设备厂家
                            "echartsId": "echartsId" + dataArrGroup[l].MAC_NAME + dataArrGroup[l].CATEGORY + dataArrGroup[l].MAC_NO, //echartsId
                            "elementTitle": (dataArrGroup[l].CODE_NO == null ? ' ' : dataArrGroup[l].CODE_NO) + ' ' + dataArrGroup[l].CATEGORY + ' ' + dataArrGroup[l].MAC_NAME + ' ' + dataArrGroup[l].MAC_NO, //设备名称
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
                ifClick = true;
                $('#loading').remove();
            })
        } else  if($("input[name='searchType']:checked").val() == 4){
            /******************************************************************按班次查询*************************************************************/
            $.post('/Statement/machineactivation/GetNewNULLActivation', {
                key: keyValue
            }, (data) => {
                for(let v = 0; v < GetMacNameListDataAll.Data.GetAllMachineList.length;v++){
                    for(let vv = 0; vv < data.Data[0].length;vv++){
                        if(GetMacNameListDataAll.Data.GetAllMachineList[v].MAC_NBR ==  data.Data[0][vv].MAC_NBR){
                            data.Data[0][vv].RANK_NUM = GetMacNameListDataAll.Data.GetAllMachineList[v].RANK_NUM;
                        }
                    }
                }
                data.Data[0].sort(compare('RANK_NUM', compare('END_DATE')));   
                //for(let o = 0; o < data.Data[0].length;o++){
                //    if(data.Data[0][o].SHIFT_NBR > 0){
                //        for(let c = 0;c < data.Data[0].length;c++){
		//		console.log(o+"---"+c+":"+data.Data[0][o].DAY_TYPE+"||"+data.Data[0][c].DAY_TYPE);
                //            if(data.Data[0][o].DAY_TYPE  == data.Data[0][c].DAY_TYPE && data.Data[0][c].SHIFT_NBR == 0){
                //                data.Data[0].splice(c,1);
                //            }
                //        }
                //    }
                //}
                //解决超出下标报错问题 htc:20181101
                for(let o = 0; o < data.Data[0].length;o++){
                     if(data.Data[0][o].SHIFT_NBR > 0){
                	    var temp_array= data.Data[0].length;
                        for(let c = 0;c < temp_array;c++){
                            if(data.Data[0][o].DAY_TYPE  == data.Data[0][c].DAY_TYPE && data.Data[0][o].MAC_NBR  == data.Data[0][c].MAC_NBR  && data.Data[0][c].SHIFT_NBR == 0){
                                data.Data[0].splice(c,1);
                                c--;
                                temp_array--;
                            }
                        }
                    }
                }
                let dataArrGroup = data.Data[0].map(function(item, index, arr) {
                    const i = arr.find(_item => item.MAC_NBR === _item.MAC_NBR);
                    if (i !== item) {
                        i.DAY_TYPE.push(item.DAY_TYPE);
                        i.DEBUG.push(item.DEBUG);
                        i.DOWN.push(item.DOWN);
                        i.FREE.push(item.FREE);
                        i.OPEN_MAC_TIME.push(item.OPEN_MAC_TIME);
                        i.RUN.push(item.RUN);
                        i.STOP.push(item.STOP);
                        i.SHIFT_NAME.push(item.SHIFT_NAME);
                        i.SHIFT_NBR.push(item.SHIFT_NBR);
                        i.SUM_DURATION.push(item.SUM_DURATION);
                        i.BEGIN_DATE.push(item.BEGIN_DATE);
                        return undefined;
                    } else {
                        i.DAY_TYPE = [i.DAY_TYPE];
                        i.DEBUG = [i.DEBUG];
                        i.DOWN = [i.DOWN];
                        i.FREE = [i.FREE];
                        i.OPEN_MAC_TIME = [i.OPEN_MAC_TIME];
                        i.RUN = [i.RUN];
                        i.STOP = [i.STOP];
                        i.SHIFT_NAME = [i.SHIFT_NAME];
                        i.SHIFT_NBR = [i.SHIFT_NBR];
                        i.SUM_DURATION = [i.SUM_DURATION];
                        i.BEGIN_DATE = [i.BEGIN_DATE];
                        return i;
                    }
                }).filter(item => item !== undefined);
                for (let l = 0; l < dataArrGroup.length; l++) {
                    //添加少的半天
                    let SHIFT_NBRLength = 0;
                    for(let ww = 0;ww <dataArrGroup[l].SHIFT_NBR.length;ww++){
                        if(dataArrGroup[l].SHIFT_NBR[ww] == 0){
                            SHIFT_NBRLength++;
                        }else{
                            break;
                        }
                    }
                    if(SHIFT_NBRLength != dataArrGroup[l].SHIFT_NBR.length && SHIFT_NBRLength != 0){
                        let  AddkeyValue = JSON.stringify({
                            MARS: dataArrGroup[l].MAC_NBR,
                            BEGIN_DATE: moment(dataArrGroup[l].BEGIN_DATE[SHIFT_NBRLength]).format('YYYY/MM/DD 00:00:00'),
                            END_DATE: moment(dataArrGroup[l].BEGIN_DATE[SHIFT_NBRLength]).format('YYYY/MM/DD HH:mm:ss'),
                            Flag: 1,
                            Show: 1,
                        });
                        $.ajax({  
                            type:"post",  
                            url: "/Statement/machineactivation/GetNewNULLActivation",  
                            data:  {
                                key: AddkeyValue
                            },  
                            async: false,  
                            success : function(data){  
                                dataArrGroup[l].BEGIN_DATE.splice(SHIFT_NBRLength, 0, data.Data[0][0].BEGIN_DATE);
                                dataArrGroup[l].DAY_TYPE.splice(SHIFT_NBRLength, 0,data.Data[0][0].DAY_TYPE+' 00:00:00');
                                dataArrGroup[l].DEBUG.splice(SHIFT_NBRLength, 0,data.Data[0][0].DEBUG);
                                dataArrGroup[l].DOWN.splice(SHIFT_NBRLength, 0,data.Data[0][0].DOWN);
                                dataArrGroup[l].FREE.splice(SHIFT_NBRLength, 0,data.Data[0][0].FREE);
                                dataArrGroup[l].OPEN_MAC_TIME.splice(SHIFT_NBRLength, 0,data.Data[0][0].OPEN_MAC_TIME);
                                dataArrGroup[l].RUN.splice(SHIFT_NBRLength, 0,data.Data[0][0].RUN);
                                dataArrGroup[l].SHIFT_NAME.splice(SHIFT_NBRLength, 0,' '+data.Data[0][0].END_DATE.replace('T',' '));
                                dataArrGroup[l].SHIFT_NBR.splice(SHIFT_NBRLength, 0,data.Data[0][0].SHIFT_NBR);
                                dataArrGroup[l].STOP.splice(SHIFT_NBRLength, 0,data.Data[0][0].STOP);
                                dataArrGroup[l].SUM_DURATION.splice(SHIFT_NBRLength, 0,data.Data[0][0].SUM_DURATION);
                            }  
                        });
                    }

                    dataArrs = [];
                    dataArrTime = Array.from(new Set(dataArrGroup[l].DAY_TYPE));
                    for (var w = 0; w < dataArrTime.length; w++) {
                        datas = [];
                        for (var a = 0; a < dataArrGroup[l].DAY_TYPE.length; a++) {
                            if (dataArrTime[w] == dataArrGroup[l].DAY_TYPE[a]) {
                                datas.push({
                                    DEBUG: dataArrGroup[l].DEBUG[a] / dataArrGroup[l].SUM_DURATION[a],
                                    DAY_TYPE: dataArrGroup[l].DAY_TYPE[a],
                                    DOWN: dataArrGroup[l].DOWN[a] / dataArrGroup[l].SUM_DURATION[a],
                                    FREE: dataArrGroup[l].FREE[a] / dataArrGroup[l].SUM_DURATION[a],
                                    OPEN_MAC_TIME: dataArrGroup[l].OPEN_MAC_TIME[a],
                                    SUM_DURATION: dataArrGroup[l].SUM_DURATION[a],
                                    RUN: dataArrGroup[l].RUN[a] / dataArrGroup[l].SUM_DURATION[a],
                                    STOP: dataArrGroup[l].STOP[a] / dataArrGroup[l].SUM_DURATION[a],
                                    SHIFT_NAME: dataArrGroup[l].SHIFT_NAME[a],


                                    DEBUGNUM: dataArrGroup[l].DEBUG[a],
                                    DOWNNUM: dataArrGroup[l].DOWN[a],
                                    FREENUM: dataArrGroup[l].FREE[a],
                                    RUNNUM: dataArrGroup[l].RUN[a] ,
                                    STOPNUM: dataArrGroup[l].STOP[a],

                                })
                            }
                        }
                        dataArrs.push(datas);
                    }
                    //处理完历史
                    let DayDataArr = [];
                    for (let i = 0; i < dataArrs.length; i++) {
                        let DayDataTwoArr = [];
                        for (let n = 0; n < dataArrs[i].length; n++) {
                            DayDataTwoArr.push({
                                time: dataArrs[i][n].DAY_TYPE.replace('T', ' ').substr(0, dataArrs[i][n].DAY_TYPE.length - 9),
                                sumtime: (dataArrs[i][n].OPEN_MAC_TIME / 3600).toFixed(2),
                                SHIFT_NAME: dataArrs[i][n].SHIFT_NAME==null?'':dataArrs[i][n].SHIFT_NAME,
                                data: [(dataArrs[i][n].RUN * 100).toFixed(2), (dataArrs[i][n].RUN * 100).toFixed(2), (dataArrs[i][n].FREE * 100).toFixed(2), (dataArrs[i][n].DEBUG * 100).toFixed(2), (dataArrs[i][n].STOP * 100).toFixed(2), (dataArrs[i][n].DOWN * 100).toFixed(2)],
                                dataSum: [dataArrs[i][n].RUNNUM, dataArrs[i][n].RUNNUM , dataArrs[i][n].FREENUM , dataArrs[i][n].DEBUGNUM , dataArrs[i][n].STOPNUM , dataArrs[i][n].DOWNNUM],
                            })
                        }
                        DayDataArr.push(DayDataTwoArr);
                    }
                    var ojson = {
                        "facility": {
                            "name": dataArrGroup[l].CATEGORY + dataArrGroup[l].MAC_NAME + dataArrGroup[l].MAC_NO, //设备名称
                            "plant": dataArrGroup[l].BUY_PERSON, //工厂
                            "workshop": dataArrGroup[l].CATEGORY, //车间
                            "production": dataArrGroup[l].GP_NAME, //产线
                            "model": dataArrGroup[l].MAC_NAME, //设备型号
                            "number": dataArrGroup[l].MAC_NO, //设备编号
                            "procedure": "", //程序号
                            "vender": "", //设备厂家
                            "echartsId": "echartsId" + dataArrGroup[l].CATEGORY + dataArrGroup[l].MAC_NO + dataArrGroup[l].MAC_NAME, //echartsId
                            "elementTitle": (dataArrGroup[l].CODE_NO == null ? ' ' : dataArrGroup[l].CODE_NO) + ' ' + dataArrGroup[l].CATEGORY + ' ' + dataArrGroup[l].MAC_NAME + ' ' + dataArrGroup[l].MAC_NO, //设备名称
                            /**
                             ** value time时间   
                             ** totaltime  总开机时间
                             ** data[标准稼动率，运行，空闲，调试，停机，关机]
                             **/
                            "value": DayDataArr
                        }
                    }
                    $(`.pagination`).createElementClasses(ojson);
                    $(`.pagination`).find('.elementTable table').css('height', $('.elementTableHeight').height() - 10 + 'px');
                    ifClick = true;
                    $(`.pagination`).find('.elementTable').hide();
                }
                ifClick = true;
                $('#loading').remove();
            })
        }else{
            $.post('/Statement/machineactivation/GetNewNULLActivation', {
                key: keyValue
            }, (data) => {
                data.Data[0].sort(function(x,y){
                    return Date.parse(x.END_DATE) - Date.parse(y.END_DATE);//时间正序
                });
                let dataArrGroup = data.Data[0].map(function(item, index, arr) {
                    const i = arr.find(_item => item.MAC_NBR === _item.MAC_NBR);
                    if (i !== item) {
                        i.DAY_TYPE.push(item.DAY_TYPE);
                        i.DEBUG.push(item.DEBUG);
                        i.DOWN.push(item.DOWN);
                        i.FREE.push(item.FREE);
                        i.OPEN_MAC_TIME.push(item.OPEN_MAC_TIME);
                        i.RUN.push(item.RUN);
                        i.STOP.push(item.STOP);
                        i.SUM_DURATION.push(item.SUM_DURATION);
                        return undefined;
                    } else {
                        i.DAY_TYPE = [i.DAY_TYPE];
                        i.DEBUG = [i.DEBUG];
                        i.DOWN = [i.DOWN];
                        i.FREE = [i.FREE];
                        i.OPEN_MAC_TIME = [i.OPEN_MAC_TIME];
                        i.RUN = [i.RUN];
                        i.STOP = [i.STOP];
                        i.SUM_DURATION = [i.SUM_DURATION];
                        return i;
                    }
                }).filter(item => item !== undefined);
                for (var l = 0; l < dataArrGroup.length; l++) {
                    let dataArrs = [];
                    for (var a = 0; a < dataArrGroup[l].DAY_TYPE.length; a++) {
                        datas = {};
                        datas = {
                            DEBUG: dataArrGroup[l].DEBUG[a] / dataArrGroup[l].SUM_DURATION[a],
                            DAY_TYPE: dataArrGroup[l].DAY_TYPE[a],
                            DOWN: dataArrGroup[l].DOWN[a] / dataArrGroup[l].SUM_DURATION[a],
                            FREE: dataArrGroup[l].FREE[a] / dataArrGroup[l].SUM_DURATION[a],
                            OPEN_MAC_TIME: dataArrGroup[l].OPEN_MAC_TIME[a],
                            SUM_DURATION: dataArrGroup[l].SUM_DURATION[a],
                            RUN: dataArrGroup[l].RUN[a] / dataArrGroup[l].SUM_DURATION[a],
                            STOP: dataArrGroup[l].STOP[a] / dataArrGroup[l].SUM_DURATION[a],


                            DEBUGNUM: dataArrGroup[l].DEBUG[a],
                            DOWNNUM: dataArrGroup[l].DOWN[a],
                            FREENUM: dataArrGroup[l].FREE[a],
                            RUNNUM: dataArrGroup[l].RUN[a] ,
                            STOPNUM: dataArrGroup[l].STOP[a],
                        }
                        dataArrs.push(datas);
                    }
                    //处理好的 历史
                    let DayDataArr = [];
                    for (let i = 0; i < dataArrs.length; i++) {
                        DayDataArr.push({
                            time: dataArrs[i].DAY_TYPE.replace('T', ' ').substr(0, dataArrs[i].DAY_TYPE.length - 9),
                            sumtime: (dataArrs[i].OPEN_MAC_TIME / 3600).toFixed(2),
                            data: [(dataArrs[i].RUN * 100).toFixed(2), (dataArrs[i].RUN * 100).toFixed(2), (dataArrs[i].FREE * 100).toFixed(2), (dataArrs[i].DEBUG * 100).toFixed(2), (dataArrs[i].STOP * 100).toFixed(2), (dataArrs[i].DOWN * 100).toFixed(2)],

                            dataSum: [dataArrs[i].RUNNUM, dataArrs[i].RUNNUM , dataArrs[i].FREENUM , dataArrs[i].DEBUGNUM , dataArrs[i].STOPNUM , dataArrs[i].DOWNNUM],

                        })
                    }
                    let ojson = {
                        "facility": {
                            "name": (dataArrGroup[l].CODE_NO == null ? ' ' : dataArrGroup[l].CODE_NO) + dataArrGroup[l].CATEGORY + dataArrGroup[l].MAC_NAME + dataArrGroup[l].MAC_NO, //设备名称
                            "plant": dataArrGroup[l].BUY_PERSON, //工厂
                            "workshop": dataArrGroup[l].CATEGORY, //车间
                            "model": dataArrGroup[l].MAC_NAME, //设备型号
                            "production": dataArrGroup[l].GP_NAME, //产线
                            "number": dataArrGroup[l].MAC_NO, //设备编号
                            "procedure": "", //程序号
                            "vender": "", //设备厂家
                            "echartsId": "echartsId" + dataArrGroup[l].MAC_NAME + dataArrGroup[l].CATEGORY + dataArrGroup[l].MAC_NO, //echartsId
                            "elementTitle": (dataArrGroup[l].CODE_NO == null ? ' ' : dataArrGroup[l].CODE_NO) + ' ' + dataArrGroup[l].CATEGORY + ' ' + dataArrGroup[l].MAC_NAME + ' ' + dataArrGroup[l].MAC_NO, //设备名称
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
                ifClick = true;
                $('#loading').remove();
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
            if (!b) { arr.push(list[i]);}
        }
    }
    return arr;
}

function BeginDateReplace(a){
    if(moment(a).format('YYYY-MM-DD') == moment($('#startTime').val()).format('YYYY-MM-DD')) {
        return $('#startTime').val();
    }else if(moment(a).format('YYYY-MM-DD') == moment($('#endTime').val()).format('YYYY-MM-DD')){
        return $('#endTime').val();
    }else{
        return a.replace('T', ' ').substr(0, a.length - 9);
    }
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