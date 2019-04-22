function createPolice(opts) {
    $('#police').append(`<div id='policeCentent' style='width:100%;height: 100%;margin-top:10px'><ul></ul></div>`);
    let startTime = moment().format('YYYY-MM-DD 00:00:00');
    let endTime = moment().format('YYYY-MM-DD HH:mm:ss');
    let ifAjaxEnd = [];  //判断ajax结束
    let PostAjaxDataDivide = lh_dataAll.webSeverData.Data.GetAllMachineList.length / (opts.eleSum * opts.lineSum);
    PostAjaxDataDivide = Math.ceil(PostAjaxDataDivide);
    for (let w = 0; w < PostAjaxDataDivide; w++) {
        let $createPolicePage = $(`<div class='changeOpacity' style='display:flex;width:100%;opacity:0'></div>`);
        if (w == 0) {
            var $createPolicePageLi = $(`<li class='activeLi'></li>`);
        } else {
            var $createPolicePageLi = $(`<li></li>`);
        }

        for (let p = 0; p < opts.lineSum; p++) {
            let $createPoliceLineSum = $(`<div class='createPoliceLineSum' style='flex:1'></div>`);
            let PostAjaxData = '';
            for (let i = 0; i < opts.eleSum; i++) {
                if ((w * opts.lineSum * opts.eleSum) + (opts.eleSum * p) + i < lh_dataAll.webSeverData.Data.GetAllMachineList.length) {
                    PostAjaxData += lh_dataAll.webSeverData.Data.GetAllMachineList[(w * opts.lineSum * opts.eleSum) + (opts.eleSum * p) + i].MAC_NBR + ',';
                } else {
                    PostAjaxData = PostAjaxData;
                }
            }
            var step = lh_dataAll.webSeverData.Data.GetAllMachineList.length;
            PostAjaxData = PostAjaxData.substr(0, PostAjaxData.length - 1);
            $createPolicePage.append($createPoliceLineSum);
            ifAjaxEnd[(w*opts.lineSum)+p] = false;
            GetValue(startTime, endTime, PostAjaxData, $createPoliceLineSum,(w*opts.lineSum)+p);
        }
        $('#policeCentent>ul').append($createPolicePageLi);
        $('#policeCentent').append($createPolicePage);
    }

    //轮播小组件
    $.slider({
        imgElement: $('#policeCentent>div'),
        liElement: $('#policeCentent>ul>li'),
        activeClass: 'activeLi',
        time: opts.carouselTime,
        activeLiShow: opts.activeLiShow,
        flex: true
    });
    //修改点的位置
    $('#policeCentent>ul').css({
        'top': (document.body.clientHeight - 80) + 'px'
    });

    function GetValue(startTime, endTime, id, $father,iii) {
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
                    // title = tempCount[j].CATEGORY + '-' + tempCount[j].MAC_NAME + '-' + tempCount[j].MAC_NO;
                    title = (tempCount[j].CODE_NO == null || tempCount[j].CODE_NO == '' ? '' : tempCount[j].CODE_NO + '-') + tempCount[j].CATEGORY + '-' + tempCount[j].MAC_NAME + '-' + tempCount[j].MAC_NO;
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
                $father.append(`<div id='container${i}' style='width:100%'  class='lazyLoad'></div>`);
                $(`#container${i}`).parent().parent().css({
                    'display': 'flex'
                })
                Highcharts.chart(`container${i}`, {
                    title: {
                        text: title,
                        style: {
                            color: "#fff"
                        }
                    },
                    chart: {
                        backgroundColor: "#000"
                    },
                    subtitle: {
                        text: '报警状态',
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
                    plotOptions: {
                        pie: {
                            allowPointSelect: true, // 可以被选择
                            cursor: 'pointer', // 鼠标样式
                            dataLabels: {
                                enabled: true,
                                format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                                style: {
                                    color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || '#fff'
                                }
                            }
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
            ifAjaxEnd[iii] = true;
            ifAjaxEndFun();
        })
    }
    let ifAjaxEndFun = ()=>{
        let dataArr = Array.from(new Set(ifAjaxEnd));
        if(dataArr.length == 1){
            $('.changeOpacity').css({
                opacity:1
            })
        }
    }
}