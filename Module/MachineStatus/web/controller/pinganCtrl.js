var GetMacNameListData, mdaMessageData = [],
    step = 4,
    kendoDate,
    ifClick = true,
    startTime,
    BEGIN_DATE = moment().format('YYYY-MM-DD'),
    END_DATE;
app.controller('StatusCtrl', ['$scope', '$http', function($scope, $http) {
    $scope.dateList = [];
    $("#startTime").kendoDateTimePicker({ format: "yyyy/MM/dd HH:mm:ss", value: moment(new Date()).subtract(3, 'days').set('hour', 0).set('minute', 0).set('second', 0).format('YYYY/MM/DD HH:mm:ss'), interval: 1, timeFormat: "HH:mm:ss" });
    $("#endTime").kendoDateTimePicker({ format: "yyyy/MM/dd HH:mm:ss", value: new Date(), interval: 1, timeFormat: "HH:mm:ss" });
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

    let types = [
        { status: 1, name: lang.Maintain.报警, color: '#f5280c' },
        { status: 2, name: lang.Maintain.运行, color: '#4ecf1f' },
        { status: 3, name: lang.Maintain.空闲, color: '#e6d215' },
        { status: 4, name: lang.Maintain.关机, color: '#606765' },
        { status: 5, name: lang.Maintain.调试, color: '#1b24f7' }
    ];

    $scope.defaultsLoding = () => {
        $http.get('/main/getUserMachineList').success(function(data) {
            if (data.Data.GetAllMachineList.length != 0) {
                let Lhdata = LhsortData(data);
                GetMacNameListDataAll = data;
                data.Data.GetAllMachineList = Lhdata;
                for (let i = 0; i < data.Data.GetAllMachineList.length; i++) {
                    if(data.Data.GetAllMachineList[i].MAC_NBR != null){
                        mdaMessageData.push(data.Data.GetAllMachineList[i].MAC_NBR);
                    }
                }
                var para;
                for (let index = 0; index < step; index++) {
                    if (para === undefined) {
                        para = mdaMessageData[index];
                    } else {
                        para = para + ',' + mdaMessageData[index];
                    }
                }
                $scope.GetValue(BEGIN_DATE, END_DATE, para);
            }
        })
    }
    $scope.defaultsLoding();

    $scope.search = () => {

        BEGIN_DATE = $('#startTime').val();
        END_DATE = $('#endTime').val();
        var startTime = moment(BEGIN_DATE),
            endTime = moment(END_DATE),
            dates = [];

        if (startTime > endTime || $('#my-selects').val() == null) {
            return;
        }

        $('.status_list').empty();
        $('.status_list').append('<input id="dates" style="margin-top: 20px" />');

        for (let index = startTime; index < endTime; index.add(1, 'd')) {
            dates.push({
                Date: index.format('YYYY-MM-DD')
            });
        }
        kendoDate = $("#dates").kendoDropDownList({
            dataTextField: "Date",
            dataValueField: "Date",
            dataSource: dates,
            index: 0,
            change: $scope.onchange
        }).data("kendoDropDownList");
        mdaMessageData = $('#my-selects').val();
        if (mdaMessageData.length < step) {
            var para = mdaMessageData.join(',');
        } else {
            for (let index = 0; index < step; index++) {
                if (para === undefined) {
                    para = mdaMessageData[index];
                } else {
                    para = para + ',' + mdaMessageData[index];
                }
            }
        }
        if (moment(BEGIN_DATE).date() == moment(END_DATE).date()) {
            $scope.GetValue(BEGIN_DATE, END_DATE, para);
        } else {
            END_DATE = moment(BEGIN_DATE).add(1, 'd').set('hour', 0).set('minute', 0).set('second', 0).format('YYYY-MM-DD');
            $scope.GetValue(BEGIN_DATE, END_DATE, para);
        }

    }

    $scope.onchange = (e) => {
        $('.lazyLoad').remove();
        BEGIN_DATE = kendoDate.value();
        if (mdaMessageData.length < step) {
            var para = mdaMessageData.join(',');
        } else {
            for (let index = 0; index < step; index++) {
                if (para === undefined) {
                    para = mdaMessageData[index];
                } else {
                    para = para + ',' + mdaMessageData[index];
                }
            }
        }
        if (moment(BEGIN_DATE).add(1, 'd') >= moment($('#endTime').val())) {
            END_DATE = $('#endTime').val();
        } else {
            END_DATE = moment(BEGIN_DATE).add(1, 'd').format('YYYY-MM-DD');
        }
        $scope.GetValue(BEGIN_DATE, END_DATE, para);
    }

    $scope.GetValue = (BEGIN_DATE, END_DATE, id) => {
        if (id === undefined) return;
        $("#loading").show();
        ifClick = false;
        if (END_DATE === undefined) {
            END_DATE = $('#endTime').val();
        }
        var data = {
            BEGIN_DATE: BEGIN_DATE,
            END_DATE: END_DATE,
            MACRS: id
        }
        $http.post('/statusrate/r/GetStatusList', data).success(function(result) {
            $("#loading").hide();
            var mac_temp = String(id).split(',');
            for (let index = 0; index < step; index++) {
                if (mac_temp.length < index) {
                    $('.status_list').append(`<div class='lazyLoad' style='display:none'></div>`);
                } else {
                    var temp = _.where(result.Data, { 'MAC_NBR': +mac_temp[index] });
                    if (temp.length > 0) {
                        $('.status_list').append(`<div id='mac_${temp[0].MAC_NBR}' class='lazyLoad' style='height:300px'></div>`);
                        drawline(`mac_${temp[0].MAC_NBR}`, temp[0], BEGIN_DATE);
                    } else {
                        $('.status_list').append(`<div class='lazyLoad' style='display:none'></div>`);
                    }
                }
            }
            // for (var i = 0; i < result.Data.length; i++) {
            //     $('.status_list').append(`<div id='mac_${result.Data[i].MAC_NBR}' class='lazyLoad' style='height:300px'></div>`);
            //     drawline(`mac_${result.Data[i].MAC_NBR}`, result.Data[i], BEGIN_DATE);
            // }
            ifClick = true;

        })
    }

    //鼠标滚动时间
    window.onscroll = () => {
        if (mdaMessageData.length == 0) {
            return false;
        }
        var bottomScroll = $(document).height() - ($(window).scrollTop() + $(window).height());
        para = '';
        if (bottomScroll <= 200) {
            if (ifClick == true) {
                for (let index = 0; index < step; index++) {
                    if (mdaMessageData.length == $('.lazyLoad').length) {
                        break;
                    }
                    if (para == '') {
                        para = mdaMessageData[$('.lazyLoad').length + index];
                    } else {
                        if ($('.lazyLoad').length + index < mdaMessageData.length)
                            para = para + ',' + mdaMessageData[$('.lazyLoad').length + index];
                    }

                    //判断是否加载完成
                }
                if (para != '')
                    $scope.GetValue(BEGIN_DATE, END_DATE, para);
                ifClick = false;
            }
        }
    }

    let drawline = (ele, data, BEGIN_DATE) => {
        let series = [];
        let dom = document.getElementById(ele);
        let myChart = echarts.init(dom);
        let app = {};
        let startTime = +moment(BEGIN_DATE).format('X') * 1000;
        let categories = [lang.EmployeePerformance.State];


        // Generate mock data
        echarts.util.each(categories, function(category, index) {
            var baseTime = startTime;
            if(data.status == null ){
                data.status = [];
            }
            for (var i = 0; i < data.status.length; i++) {
                var typeItem = _.where(types, { 'status': data.status[i].sr })[0];
                if (i == 0) {
                    var duration = data.status[i].dr * 1000 + startTime - (+moment(data.status[i].st).format('X') * 1000);

                } else {
                    var duration = data.status[i].dr * 1000;
                    baseTime = +moment(data.status[i].st).format('X') * 1000;
                }
                series.push({
                    name: typeItem.name,
                    value: [
                        index,
                        baseTime,
                        baseTime += duration,
                        duration
                    ],
                    itemStyle: {
                        normal: {
                            color: typeItem.color
                        }
                    }
                });
                //baseTime += Math.round(Math.random() * 2000);
            }
        });

        option = {
            tooltip: {
                formatter: function(params) {
                    return params.marker + params.data.name + params.name + ': ' + params.value[3] / 1000 + 's' + '<br />' + lang.MachineStatus.StartingTime +
                        moment(params.value[1]).format('HH:mm:ss') + '<br />' + lang.MachineStatus.EndTime + moment(params.value[2]).format('HH:mm:ss');
                }
            },
            title: {
                subtext: BEGIN_DATE,
                text: (data.CODE_NO == 'DEFAULT' || data.CODE_NO == '' ? '' : data.CODE_NO + '-') + data.CATEGORY + '-' + data.mac_name + '-' + data.mac_no,
                left: 'center'
            },
            legend: {
                data: ['bar', 'error']
            },
            dataZoom: [{
                start: 0,
                end: 99.999,
                type: 'slider',
                filterMode: 'weakFilter',
                showDataShadow: false,
                top: 200,
                height: 10,
                borderColor: 'transparent',
                backgroundColor: '#e2e2e2',
                handleIcon: 'M10.7,11.9H9.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4h1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7v-1.2h6.6z M13.3,22H6.7v-1.2h6.6z M13.3,19.6H6.7v-1.2h6.6z', // jshint ignore:line
                handleSize: 20,
                handleStyle: {
                    shadowBlur: 6,
                    shadowOffsetX: 1,
                    shadowOffsetY: 2,
                    shadowColor: '#aaa'
                },
                labelFormatter: ''
            }, {
                type: 'inside',
                filterMode: 'weakFilter'
            }],
            grid: {
                height: 100
            },
            xAxis: {
                min: startTime,
                scale: true,
                axisLabel: {
                    formatter: function(val) {
                        return moment(val).format('HH:mm');
                    }
                }
            },
            yAxis: {
                data: categories
            },
            series: [{
                type: 'custom',
                renderItem: renderItem,
                itemStyle: {
                    normal: {
                        opacity: 1
                    }
                },
                encode: {
                    x: [1, 2],
                    y: 0
                },
                data: series
            }]
        };
        if (option && typeof option === "object") {
            myChart.setOption(option, true);
        }
    }

    function renderItem(params, api) {
        var categoryIndex = api.value(0);
        var start = api.coord([api.value(1), categoryIndex]);
        var end = api.coord([api.value(2), categoryIndex]);
        var height = api.size([0, 1])[1] * 0.6;

        return {
            type: 'rect',
            shape: echarts.graphic.clipRectByRect({
                x: start[0],
                y: start[1] - height / 2,
                width: end[0] - start[0],
                height: height
            }, {
                x: params.coordSys.x,
                y: params.coordSys.y,
                width: params.coordSys.width,
                height: params.coordSys.height
            }),
            style: api.style()
        };
    }

}])

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