function createPolice(opts) {
    $('#police').html(``);
    $('#introduce').css({
        width:'20%'
    })
    $('#police').append(`<div id='policeCentent' style='width:100%;height: 100%;'><ul></ul></div>`);
    let startTime = moment().format('YYYY-MM-DD 00:00:00');
    let endTime = moment().format('YYYY-MM-DD HH:mm:ss');
    //用来保存设备 文件拿到的设备和请求到的设备
    let lh_dataAllALL_nbr = [];
    //拿到文件的设备  判断如果文件没有内容 那就拿所有设备
    let lh_dataAllALL_nbrSplit;
    if (lh_dataAll.ALL_nbr != '' || lh_dataAll.ALL_nbr.length != 0) {
        lh_dataAllALL_nbrSplit = lh_dataAll.ALL_nbr.split(',');
        for (let i = 0; i < lh_dataAllALL_nbrSplit.length; i++) {
            lh_dataAllALL_nbr.push({
                MAC_NBR: lh_dataAllALL_nbrSplit[i]
            })
        }
    } else {
        lh_dataAllALL_nbr = lh_dataAll.webSeverData.Data.GetAllMachineList;
    }


    let PostAjaxDataDivide = lh_dataAllALL_nbr.length / (opts.eleSum * opts.lineSum);
    PostAjaxDataDivide = Math.ceil(PostAjaxDataDivide);
    //判斷所有ajax执行结束
    let indexwq = 0;
    let if_AJAX_END = []; //判斷所有ajax执行结束

    for (let w = 0; w < PostAjaxDataDivide; w++) {
        let $createPolicePage = $(`<div style='display:flex;width:100%;'></div>`);
        if (w == 0) {
            var $createPolicePageLi = $(`<li class='activeLi'></li>`);
        } else {
            var $createPolicePageLi = $(`<li></li>`);
        }
        $('#policeCentent>ul').append($createPolicePageLi);
        $('#policeCentent').append($createPolicePage);
        for (let p = 0; p < opts.lineSum; p++) {
            indexwq++;
            let $createPoliceLineSum = $(`<div class='createPoliceLineSum' style='flex:1'></div>`);
            let PostAjaxData = '';
            for (let i = 0; i < opts.eleSum; i++) {
                if ((w * opts.lineSum * opts.eleSum) + (opts.eleSum * p) + i < lh_dataAllALL_nbr.length) {
                    PostAjaxData += lh_dataAllALL_nbr[(w * opts.lineSum * opts.eleSum) + (opts.eleSum * p) + i].MAC_NBR + ',';
                } else {
                    PostAjaxData = PostAjaxData;
                }
            }
            var step = lh_dataAllALL_nbr.length;
            PostAjaxData = PostAjaxData.substr(0, PostAjaxData.length - 1);
            $createPolicePage.append($createPoliceLineSum);
            GetValue(startTime, endTime, PostAjaxData, $createPoliceLineSum, indexwq);
        }
    }

    //修改点的位置
    $('#policeCentent>ul').css({
        'top': (document.body.clientHeight - 80 - lh_dataAll.massageHeightShow) + 'px'
    });


    function GetValue(startTime, endTime, id, $father, indexP) {
        if_AJAX_END[indexP - 1] = false;
        var data = {
            begin_date: startTime,
            end_date: endTime,
            mars_nbrs: id
        }
        $.post('/MachineAlarm/GetASlarmDataList', data).success(function(result) {
            for (let i = 0; i < result.Data.length; i++) {
                if (!result.Data[i].ALARM_NO && !result.Data[i].ALARM_MESSAGE && !result.Data[i].COUNTER) {
                    result.Data[i].ALARM_NO = '无报警';
                    result.Data[i].ALARM_MESSAGE = '无报警';
                    result.Data[i].COUNTER = 1;
                }
                if (result.Data[i].ALARM_MESSAGE.indexOf(".") != -1) {
                    result.Data[i].ALARM_MESSAGE = result.Data[i].ALARM_MESSAGE.split(".").join(' ');
                    result.Data[i].ALARM_NO = result.Data[i].ALARM_NO.split(".").join(' ');
                }
            }
            let templist = _.groupBy(result.Data, 'MAC_NBR');
            for (var i in templist) {
                let COUNTER = 0;
                let tempCount = _.sortBy(templist[i], function(item) {
                    return -item.COUNTER;
                });
                var Data = [],
                    AllCount = 0,
                    title;
                for (var j = 0; j < tempCount.length; j++) {
                    title = (tempCount[j].CODE_NO == null ? '' : tempCount[j].CODE_NO) + ' ' + tempCount[j].CATEGORY + ' ' + tempCount[j].MAC_NAME + ' ' + tempCount[j].MAC_NO;
                    if (j > 4) {
                        COUNTER += tempCount[j].COUNTER
                    } else
                        Data.push({
                            name: tempCount[j].ALARM_NO,
                            mac: i,
                            y: tempCount[j].COUNTER
                        })
                }
                if (COUNTER > 0) {
                    Data.push({
                        name: '其他',
                        mac: i,
                        y: COUNTER
                    })
                }
                $father.append(`<div id='container${i}' style='width:100%;height:${lh_dataAll.windowHeightBottomShow/opts.eleSum-80/opts.eleSum}px' class='lazyLoad'></div><hr>`);
                $(`#container${i}`).parent().parent().css({
                    'display': 'flex'
                })
                Highcharts.chart(`container${i}`, {
                    title: {
                        text: title,
                        style: {
                            color: "#fff",
                            fontWeight: 600,
                        }
                    },
                    chart: {
                        backgroundColor: "#000"
                    },
                    subtitle: {
                        text: moment().format('YYYY-MM-DD'),
                        style: {
                            color: "#ccc"
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    tooltip: {
                        headerFormat: '',
                        pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {point.name}</b><br/>次数:<b>{point.y}</b><br/>'
                    },
                    legend: {
                        layout: 'vertical',
                        align: 'right',
                        verticalAlign: 'top',
                        borderWidth: 0,
                        itemStyle: {
                            color: "#fff"
                        },
                        itemHoverStyle: {
                            color: '#ccc'
                        },
                        labelFormat: '{percentage:.1f}%        <b>{name}</b>',
                        y: $(window).width() < 1000?30:15,
                    },
                    plotOptions: {
                        pie: {
                            allowPointSelect: true, // 可以被选择
                            cursor: 'pointer', // 鼠标样式
                            dataLabels: {
                                enabled: true,
                                distance: -50,
                                format: '{point.percentage:.1f} %',
                                style: {
                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || '#fff',
                                },
                                shadow: true
                            },
                            showInLegend: true
                        },

                        series: {
                            events: {

                            }
                        }
                    },
                    series: [{
                        type: 'pie',
                        name: 'Alarm',
                        data: Data
                    }]
                });
            }
            if_AJAX_END[indexP - 1] = true;
            ajaxAllSuccess(if_AJAX_END);
        })
    }

    function ajaxAllSuccess(index) {
        let indexLength = Array.from(new Set(index));
        if (indexLength.length == 1) {
            $('#policeCentent>div').css({
                'display': 'none'
            });
            // //轮播小组件
            $.slider({
                imgElement: $('#policeCentent>div'),
                liElement: $('#policeCentent>ul>li'),
                activeClass: 'activeLi',
                time: opts.carouselTime,
                activeLiShow: opts.activeLiShow,
                flex: true
            });
        }
    }
}