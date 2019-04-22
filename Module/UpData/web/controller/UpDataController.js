var GetMacNameListData;

var GetMacNameListDataAll; //用来保存所有设备名称数据

$(function() {
    var dataajax; //ajax调取获取数据
    var arrTimeStamp = [];
    var settime;
    var settimeAll = {};
    var pitchEquipment = []; //处理完之后的数据
    var pitchEquipmentData = []; //用来更改的数据
    var myChart;
    var myChartAll;
    var xAxisData = []; //用于保存时间
    var xAxisDataAll = []; //用于全部保存时间
    var radioChecked; //用于判断是全选还是分组
    var seriesDataAll = [];
    var MAC_NBRrData;
    var numberXlength;
    var intervlaFacility;


    /**************************为了让默认显示 加上的*********************************************/
    let mdaMessageData = [];
    mySelectVal = ['STD::SpindleSpeed', 'STD::SpindleOverride', 'STD::FeedSpeed', 'STD::FeedOverride'];
    var creatEcharts = document.createElement('div');
    creatEcharts.style.width = $('#main').width + 'px';
    creatEcharts.style.height = '500px';
    creatEcharts.id = 'creatEcharts';
    $('#mainpend').append(creatEcharts);
    $.ajax({
        url: '/main/getUserMachineList',
        type: 'get',
        async: false,
        success: function(data) {
            if (data.Data.GetAllMachineList.length != 0) {
                GetMacNameListDataAll = data;
                for (let i = 0; i < data.Data.GetAllMachineList.length; i++) {
                    if(data.Data.GetAllMachineList[i].MAC_NBR != null){
                        mdaMessageData.push(data.Data.GetAllMachineList[i].MAC_NBR);
                    }
                }
                MAC_NBRrData = mdaMessageData[0];
                if(getQueryString('id') == null){
                    pushArrTimeStamp(mdaMessageData[0]);
                }
            }
        },
        error: function(error) {
            console.error(error);
        }
    });
    /***********************************************************************/

    //numberXlength 失去焦点时判断值是否小于1
    $('#numberXlength').blur(function() {
        if ($('#numberXlength').val() <= 1) {
            $('#numberXlength').val('1');
        }
    })

    MAC_NBR = $("#MAC_NBRname").comboxTree({
        url: "/Main/GetUserMacGroup",
        url2: "/machine/GetKeywordMachinelist",
        data: { groupID: 0 },
        treetemplate: $("#treeview-template").html(),
        width: 140,
        diffwidth: 34,
        type: 2,
    });
    $('#input_MAC_NBRname').attr('readonly', 'readonly');

    $('#my-selecta').change(function() {
        var dataGetMacNoList = [];
        for (let i = 0; i < $('#my-selecta').val().length; i++) {
            for (let w = 0; w < GetMacNameListData.Data.rootMacInfo.length; w++) {
                if ($('#my-selecta').val()[i] == GetMacNameListData.Data.rootMacInfo[w].CATEGORY) {
                    dataGetMacNoList.push({
                        text: GetMacNameListData.Data.rootMacInfo[w].MAC_NO,
                        value: GetMacNameListData.Data.rootMacInfo[w].MAC_NBR,
                        paixu: GetMacNameListData.Data.rootMacInfo[w].paixu,
                        RANK_NUM: GetMacNameListData.Data.rootMacInfo[w].RANK_NUM,
                    });
                    //$('#my-selects').append(`<option value=${GetMacNameListData.Data.rootMacInfo[w].MAC_NBR} >${GetMacNameListData.Data.rootMacInfo[w].MAC_NO}</option>`)
                }
            }
        }
        dataGetMacNoList.sort(compare('paixu', compare('RANK_NUM')));
        $("#MAC_NBRNUMBER").kendoComboBox({
            dataTextField: "text",
            dataValueField: "value",
            dataSource: dataGetMacNoList,
            value: '',
            change: postGetItemList,
        }).data("kendoComboBox");
        $('#my-select')[0].innerHTML = '';
    })

    function postGetItemList(a) {
        // var newValue = a.sender._old;
        // $.ajax({
        //     type: "post",
        //     url: "/UpData/GetColumns",
        //     data: {
        //         macNbrs: newValue
        //     },
        //     success: function(data) {
        //         MAC_NBRrData = newValue;
        //         var description = [];
        //         $('#my-select')[0].innerHTML = '';
        //         $('#my-select')[0].value = '';
        //         if (data.Data != null) {
        //             for (var i = 0; i < data.Data.length; i++) {
        //                 description.push({ text: data.Data[i].Desc, value: data.Data[i].Name });
        //                 $('#my-select').append(`<option value=${data.Data[i].Name} >${data.Data[i].Desc}</option>`);
        //             }
        //         }

        //         dataajax = data;
        //         // 缺一不可  
        //         $('#my-select').selectpicker('refresh');
        //         $('#my-select').selectpicker('render');
        //     },
        //     error: function(err) {
        //         return false;
        //     }
        // });
        var newValue = a.sender._old;
        let getItems = new Promise((resolve, reject) => {
            $.ajax({
                type: "post",
                url: "/UpData/GetColumns",
                data: {
                    macNbrs: newValue
                },
                success: function(data) {
                    resolve(data);
                },
                error: function(err) {
                    reject(err);
                }
            });
        })
          
          let getItemsConfig = new Promise((resolve, reject) => {
            $.ajax({
                type: "post",
                url: "/main/GetMacItemList",
                data: {
                    MAC_NBR: newValue
                },
                success: function(data) {
                    resolve(data);
                },
                error: function(err) {
                    reject(err);
                }
            });
          })
          Promise.all([getItems, getItemsConfig]).then((result) => {
            MAC_NBRrData = newValue;
            description = [];
            $('#my-select')[0].innerHTML = '';
            $('#my-select')[0].value = '';
    
            if(result[1].Data.length == 0){
                result[1].Data = [{
                    Item:'STD::SpindleSpeed',
                },
                {
                    Item:'STD::SpindleOverride',
                },
                {
                    Item:'STD::FeedSpeed',
                },
                {
                    Item:'STD::FeedOverride',
                }
            ]
            }
            if (result[0].Data != null) {
                for (var i = 0; i < result[0].Data.length; i++) {
                    for(let w = 0; w < result[1].Data.length;w++){
                        if(result[0].Data[i].Name == result[1].Data[w].Item ){
                            description.push({ text: result[0].Data[i].Desc, value: result[0].Data[i].Name });
                            $('#my-select').append(`<option value=${result[0].Data[i].Name} >${result[0].Data[i].Desc}</option>`);
                        }
                    }
                }
            }
            // dataajax = data;
            // 缺一不可  
            $('#my-select').selectpicker('refresh');
            $('#my-select').selectpicker('render');
          }).catch((error) => {
            console.log(error)
          })
    }

    var mySelectVal;

    function getNowFormatDate() {
        var date = new Date();
        var seperator1 = "-";
        var seperator2 = ":";
        var month = date.getMonth() + 1;
        var strDate = date.getDate();
        if (month >= 1 && month <= 9) {
            month = "0" + month;
        }
        if (strDate >= 0 && strDate <= 9) {
            strDate = "0" + strDate;
        }
        var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate +
            " " + date.getHours() + seperator2 + date.getMinutes() +
            seperator2 + date.getSeconds();
        return currentdate;
    }

    function timestampToTime(timestamp) {
        var timestampSplit = timestamp.split('T');
        var timestampSplitT = timestampSplit[1].split('.');
        return timestampSplit[0] + ' ' + timestampSplitT[0];
    }

    function getRandomColour() {
        return "#" + (function(color) {
            return new Array(7 - color.length).join("0") + color;
        })((Math.random() * 0x1000000 | 0).toString(16));
    }

    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
    if (getQueryString('id') != null) {
        mySelectVal = ['STD::SpindleSpeed', 'STD::SpindleOverride', 'STD::FeedSpeed', 'STD::FeedOverride'];
        // mySelectVal = ['主轴转速', '主轴倍率', '进给倍率', '进给值'];
        var creatEcharts = document.createElement('div');
        creatEcharts.style.width = $('#main').width + 'px';
        creatEcharts.style.height = '500px';
        creatEcharts.id = 'creatEcharts';
        $('#mainpend').append(creatEcharts);
        pushArrTimeStamp(getQueryString('id'));
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
    //重新调数据 并且进行筛选 pitchEquipment为筛选的值
    function pushArrTimeStamp(id) {
        pitchEquipment = [];
        $.ajax({
            type: "post",
            url: "/UpData/GetItems",
            data: {
                macNbrs: id
            },
            async: true,
            success: function(data) {
                dataajax = data;
                for (var i = 0; i < mySelectVal.length; i++) {
                    for (var j = 0; j < dataajax.Data[0].Value.length; j++) {
                        if (mySelectVal[i] == dataajax.Data[0].Value[j].Name) {
                            pitchEquipment.push(dataajax.Data[0].Value[j])
                        }
                    }
                }
                if (radioChecked == 1) {
                    createEchartsAll();
                } else {
                    createEcharts();
                }
            },
            error: function(err) {
                return false;
            }
        });
    };


    function createEcharts() {
        var legendData = [];
        if (xAxisData.length > $('#numberXlength').val()) {
            xAxisData.shift();
            xAxisData.push(getNowFormatDate())
        } else {
            // xAxisData.push(timestampToTime(pitchEquipment[pitchEquipment.length - 1].EventTime))
            xAxisData.push(getNowFormatDate())
        }
        for (var t = 0; t < pitchEquipment.length; t++) {
            //不是间隔调用会进入if  是间隔调用会进入else
            if (pitchEquipmentData.length < pitchEquipment.length) {
                legendData.push(pitchEquipment[t].Description);
                pitchEquipmentData.push({
                    name: pitchEquipment[t].Description,
                    type: 'line',
                    data: [pitchEquipment[t].Value],
                    itemStyle: {
                        normal: {
                            label: { show: false },
                            lineStyle: {
                                color: getRandomColour()
                            }
                        }
                    },
                })
            } else {
                if (pitchEquipmentData[t].data.length > $('#numberXlength').val()) {
                    pitchEquipmentData[t].data.shift();
                    pitchEquipmentData[t].data.push(pitchEquipment[t].Value);
                } else {
                    pitchEquipmentData[t].data.push(pitchEquipment[t].Value);
                }
            }
        }

        //myChartAll 表
        if (myChart == null || myChart == undefined) {
            var titleName; //设备名称
            for (var i = 0; i < GetMacNameListDataAll.Data.GetAllMachineList.length; i++) {
                if (dataajax.Data[0].MacNbr == GetMacNameListDataAll.Data.GetAllMachineList[i].MAC_NBR) {
                    titleName = (GetMacNameListDataAll.Data.GetAllMachineList[i].CODE_NO == null ? '' : GetMacNameListDataAll.Data.GetAllMachineList[i].CODE_NO) + ' ' + GetMacNameListDataAll.Data.GetAllMachineList[i].CATEGORY + ' ' + GetMacNameListDataAll.Data.GetAllMachineList[i].MAC_NAME + ' ' + GetMacNameListDataAll.Data.GetAllMachineList[i].MAC_NO;
                }
            }
            myChart = echarts.init(document.getElementById('creatEcharts'));
            //原来保存随机获取的颜色
            let optionColors = [];
            for (let i = 0; i < pitchEquipmentData.length; i++) {
                optionColors.push(pitchEquipmentData[i].itemStyle.normal.lineStyle.color);
            }
            option = {
                color: optionColors,
                title: {
                    text: titleName,
                    left: 'center',
                    top: -5,
                    textStyle: {
                        fontSize: 17
                    },
                },
                tooltip: {
                    trigger: 'axis'
                },
                legend: {
                    y: 30,
                    data: legendData
                },
                grid: {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                },
                toolbox: {
                    feature: {
                        saveAsImage: {}
                    }
                },
                xAxis: {
                    type: 'category',
                    boundaryGap: false,
                    data: xAxisData
                },
                yAxis: {
                    type: 'value'
                },
                series: pitchEquipmentData
            };
            myChart.setOption(option);
        } else {
            myChart.setOption({
                xAxis: {
                    data: xAxisData
                },
                series: pitchEquipmentData
            });
        }
        window.clearTimeout(settime);
        settime = setInterval(function() {
            if (getQueryString('id') != null) {
                pushArrTimeStamp(getQueryString('id'));
            } else {
                pushArrTimeStamp(MAC_NBRrData);
            }
        }, 1000);
    }

    function createEchartsAll() {
        // xAxisDataAll.push(timestampToTime(pitchEquipment[pitchEquipment.length - 1].EventTime));
        xAxisDataAll.push(getNowFormatDate())
        if (($('#mainpend').children()).length == 0) {
            var titleName; //设备名称
            for (var i = 0; i < GetMacNameListDataAll.Data.GetAllMachineList.length; i++) {
                if (dataajax.Data[0].MacNbr == GetMacNameListDataAll.Data.GetAllMachineList[i].MAC_NBR) {
                    titleName = (GetMacNameListDataAll.Data.GetAllMachineList[i].CODE_NO == null ? '' : GetMacNameListDataAll.Data.GetAllMachineList[i].CODE_NO) + ' ' + GetMacNameListDataAll.Data.GetAllMachineList[i].CATEGORY + ' ' + GetMacNameListDataAll.Data.GetAllMachineList[i].MAC_NAME + ' ' + GetMacNameListDataAll.Data.GetAllMachineList[i].MAC_NO;
                }
            }
            for (var t = 0; t < pitchEquipment.length; t++) {
                seriesDataAll.push([pitchEquipment[t].Value]);
                var creatEcharts = document.createElement('div');
                creatEcharts.style.width = $('#main').width + 'px';
                creatEcharts.style.height = '500px';
                $('#mainpend').append(creatEcharts);
                //myChartAll 表
                myChartAll = echarts.init(creatEcharts);
                option = {
                    title: {
                        text: titleName,
                        subtext: pitchEquipment[t].Description,
                        subtextStyle: {
                            fontSize: 18
                        },
                        textStyle: {
                            fontSize: 17
                        },
                        left: 'center'
                    },
                    legend: {
                        y: '30',
                        show: false,
                    },
                    tooltip: {
                        trigger: 'axis',
                        axisPointer: {
                            animation: false
                        }
                    },
                    xAxis: {
                        type: 'category',
                        boundaryGap: false,
                        data: xAxisData
                    },
                    yAxis: {
                        type: 'value'
                    },

                    series: [{
                        name: pitchEquipment[t].Name,
                        type: 'line',
                        // showSymbol: false,
                        // hoverAnimation: false,
                        data: seriesDataAll[t],
                        itemStyle: {
                            normal: {
                                label: { show: false }
                            }
                        },
                    }]
                };
                myChartAll.setOption(option);
            }
        } else {
            for (var i = 0; i < $('#mainpend').children().length; i++) {
                myChartAll = echarts.init($('#mainpend').children()[i]);
                seriesDataAll[i].push(pitchEquipment[i].Value)
                myChartAll.setOption({
                    xAxis: {
                        data: xAxisDataAll
                    },
                    series: [{
                        data: seriesDataAll[i],
                    }]
                });
            }
        }
        window.clearTimeout(settimeAll);
        settimeAll = setInterval(function() {
            if (getQueryString('id') != null) {
                pushArrTimeStamp(getQueryString('id'));
            } else {
                pushArrTimeStamp(MAC_NBRrData);
            }
        }, 1000);

    }

    $('#searchData').click(function() {
        //删除URL参数
        var url = window.location.href; 
        var valiable = url.split('?')[0]; 
        window.history.pushState({},0,valiable);
        radioChecked = $('input:radio:checked').val();
        $('#mainpend').html('');
        mySelectVal = $("#my-select").val();
        if ($('#input_MAC_NBRname').val() == '') {
            BzAlert(lang.Common.PleaseSelectDeviceGroup);
            return;
        }
        if ($('#my-selecta').val() == null) {
            BzAlert(lang.Common.PleaseSelectDeviceName);
            return;
        }
        if ($('input[name=MAC_NBR_input]').val() == '') {
            BzAlert(lang.Common.PleaseSelectDeviceNo);
            return;
        }
        if ($('#numberXlength').val() == '') {
            BzAlert(lang.Common.PleaseSelectXAxisLength);
            return;
        }
        if ($("#my-select").val() != null || $("#my-select").val() != undefined) {
            xAxisData = []; //再次点击 X周还原
            xAxisDataAll = []; //再次点击 多个表X周还原
            pitchEquipmentData = []; //再次点击 单个表数据还原
            seriesDataAll = []; //再次点击 多个表数据还原
            myChart = undefined; //并且还原myChart  让他再次成undefined
            if (radioChecked == 1) {
                pushArrTimeStamp(MAC_NBRrData);
            } else {
                //echart 表
                var creatEcharts = document.createElement('div');
                creatEcharts.style.width = $('#main').width + 'px';
                creatEcharts.style.height = '400px';
                creatEcharts.id = 'creatEcharts';
                $('#mainpend').append(creatEcharts);
                pushArrTimeStamp(MAC_NBRrData);
            }
        } else {
            BzAlert(lang.Common.PleaseSelectAttributes);
        }

    })
})

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
        $('#my-selecta').html('');
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
            $('#my-selecta').append(`<option value=${description[i].CATEGORY} >${description[i].CATEGORY}</option>`)
        }
        // 缺一不可  
        $('#my-selecta').selectpicker('refresh');
        $('#my-selecta').selectpicker('render');
    })
}