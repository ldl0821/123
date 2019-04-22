var mdaMessageData = [];
var description = [{
        value: "STD::SpindleSpeed",
        text: '主轴转速'
    }, {
        value: "STD::SpindleOverride",
        text: '主轴倍率'
    }, {
        value: "STD::FeedSpeed",
        text: '进给量'
    }, {
        value: "STD::FeedOverride",
        text: '进给倍率'
    }, ],
    _Mac_nbr;
var mac_nbr = $.getparam("mac_nbr");
if (mac_nbr == undefined) {
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
                mac_nbr = mdaMessageData[0];
            }
        },
        error: function(error) {
            console.error(error);
        }
    });
}
app.controller('ParaCtrl', ['$scope', '$http', function($scope, $http) {
    $("#startTime").kendoDateTimePicker({ format: "yyyy/MM/dd HH:mm:ss", value: moment(new Date()).subtract(1, 'days').format('YYYY/MM/DD HH:mm:ss'), interval: 1, timeFormat: "HH:mm:ss" });
    $("#endTime").kendoDateTimePicker({ format: "yyyy/MM/dd HH:mm:ss", value: new Date(), interval: 1, timeFormat: "HH:mm:ss" });
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
                        RANK_NUM:GetMacNameListData.Data.rootMacInfo[w].RANK_NUM
                    });
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

    $scope.search = function() {
        var seriesOptions = [],
            seriesCounter = 0,
            names = $('#my-select').val() == null ? ['STD::SpindleSpeed', 'STD::SpindleOverride', 'STD::FeedSpeed', 'STD::FeedOverride'] : $('#my-select').val();
        mac = _Mac_nbr == undefined ? mac_nbr : _Mac_nbr;
        var data = {
            BeginDate: +moment($("#startTime").val()).format('X'),
            EndDate: +moment($("#endTime").val()).format('X'),
            SignList: names,
            macNo: mac
        }
        for (var i = 0; i < names.length; i++) {
            seriesOptions.push({
                name: names[i],
                data: []
            })
        }
        $("#loading").show();
        $http.post('/MachinePara/GetMogonPara', data).success(function(result) {
            result.Data.Data.sort(function(x, y) {
                return x[0] - y[0];
            });
            for (var i = 0; i < result.Data.Data.length; i++) {
                for (var j = 0; j < names.length; j++) {
                    if (typeof(result.Data.Data[i][j + 1]) === "number")
                        _.where(seriesOptions, { 'name': names[j] })[0].data.push([result.Data.Data[i][0], result.Data.Data[i][j + 1]]);
                }
            }
            for (var k = 0; k < seriesOptions.length; k++) {
                seriesOptions[k].name = _.where(description, { 'value': seriesOptions[k].name })[0].text;
            }
            $.post('/MachinePara/GetMachine_Info', { mac_nbr: mac }, function(result) {
                $("#loading").hide();
                $scope.createChart(seriesOptions, result[0].CATEGORY + '-' + result[0].mac_name + '-' + result[0].mac_no);
            })

        })
    }
    $scope.search();
    $scope.createChart = function(seriesOptions, title) {
        Highcharts.setOptions({
            　　global: {
            　　　　timezoneOffset: -8 * 60
            　　　　　　}
            });
        Highcharts.stockChart('Process', {
            chart: {
                zoomType: null,
                // pinchType: null
            },
            title: {
                text: title,
                style: {
                    fontWeight: 'bold'
                }
            },
            rangeSelector: {
                selected: 4
            },
            xAxis: {
                // events: {
                //     afterSetExtremes: afterSetExtremes
                // }
                //minRange: 3600 * 1000 // one hour
            },
            yAxis: {
                plotLines: [{
                    value: 0,
                    width: 2,
                    color: 'silver'
                }]
            },
            plotOptions: {
                series: {
                    showInNavigator: true
                }
            },
            tooltip: {
                pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.y}</b><br/>',
                valueDecimals: 0,
                followTouchMove: false,
                split: true
            },
            series: seriesOptions
        });
    }
}])

function afterSetExtremes(e) {
    var chart = $('#Process').highcharts();
    chart.showLoading('数据加载中...');
    $.getJSON('https://www.highcharts.com/samples/data/from-sql.php?start=' + Math.round(e.min) +
        '&end=' + Math.round(e.max) + '&callback=?',
        function(data) {
            chart.series[0].setData(data);
            chart.hideLoading();
        });
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

function postGetItemList(a) {
    _Mac_nbr = a.sender._old;
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
                // MAC_NBRrData = newValue;
                // description = [];
                // $('#my-select')[0].innerHTML = '';
                // $('#my-select')[0].value = '';
                // if (data.Data != null) {
                //     for (var i = 0; i < data.Data.length; i++) {
                //         description.push({ text: data.Data[i].Desc, value: data.Data[i].Name });
                //         $('#my-select').append(`<option value=${data.Data[i].Name} >${data.Data[i].Desc}</option>`);
                //     }
                // }
    
                // dataajax = data;
                // // 缺一不可  
                // $('#my-select').selectpicker('refresh');
                // $('#my-select').selectpicker('render');
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
