function createMAP(boardListI, circulation) {
    $('#map').html(``);
    // $('#map').append('')
    $('#map').append(`<div id='container' style='width:80%;min-height:100%;bottom:0;position:absolute;top:0'></div>`);
    $.ajaxSettings.async = false;
    $.get('/maps/getJson', function(data) {
        if (data.Status == 0) {
            dataObj = JSON.parse(data.Data);
            $('.title').html(dataObj.title.content);
            $('.title').css({
                'color': dataObj.title.color,
                'font-size': dataObj.title.size,
                'font-family': dataObj.title.ziti,
                'text-align': dataObj.title.arrange
            });
            $('#map').append(`<div id='rightId'><div class='offside' id='offside'></div></div>`);
            for (let i = 0; i < dataObj.chejian.length; i++) {
                if (i == 0) {
                    $('#rightId').append(`<div id='plant${i}' class='plant activeplant'>${dataObj.chejian[i].name}</div>`);
                    $('#container').append(`<div id='drawing${i}' class='drawing' style='position:relative;display:block;width:${dataObj.chejian[i].page.width};height:${dataObj.chejian[i].page.height};background:${dataObj.chejian[i].page.background};'></div>`);
                } else {
                    $('#rightId').append(`<div id='plant${i}' class='plant '>${dataObj.chejian[i].name}</div>`);
                    $('#container').append(`<div id='drawing${i}' class='drawing' style='position:relative;display:none;width:${dataObj.chejian[i].page.width};height:${dataObj.chejian[i].page.height};background:${dataObj.chejian[i].page.background};'></div>`);
                }

                for (let w = 0; w < dataObj.chejian[i].tupian.length; w++) {
                    if(dataObj.chejian[i].tupian[w].url.substring(0,1) != '.'){
                        dataObj.chejian[i].tupian[w].url = '.' + dataObj.chejian[i].tupian[w].url.split(':')[2].substring(4);
                    }
                    $(`#drawing${i}`).append(`<div data-macId='${dataObj.chejian[i].tupian[w].macId}'  class='dataMacId' data-name='${dataObj.chejian[i].tupian[w].name}' style='position:absolute;top:${dataObj.chejian[i].tupian[w].y};left:${dataObj.chejian[i].tupian[w].x}'><img src='${dataObj.chejian[i].tupian[w].url}' style='width:${Number(getN(dataObj.chejian[i].tupian[w].width))+6}px;height:${Number(getN(dataObj.chejian[i].tupian[w].height))+6}px;top:${dataObj.chejian[i].tupian[w].y};left:${dataObj.chejian[i].tupian[w].x}'/></div>`);
                }
                for (let q = 0; q < dataObj.chejian[i].xianbei.length; q++) {
                    $(`#drawing${i}`).append(`<div style='position:absolute;font-size:${dataObj.chejian[i].xianbei[q].size};text-align: center;line-height:${dataObj.chejian[i].xianbei[q].height};width:${dataObj.chejian[i].xianbei[q].width};background:${dataObj.chejian[i].xianbei[q].background};color:${dataObj.chejian[i].xianbei[q].color};height:${dataObj.chejian[i].xianbei[q].height};top:${dataObj.chejian[i].xianbei[q].y};left:${dataObj.chejian[i].xianbei[q].x}'>${dataObj.chejian[i].xianbei[q].content}</div>`);
                }
                $(`#drawing${i}`).css({
                    'transform': 'scale(' + $('#container').width() / getN(dataObj.chejian[i].page.width) + ')'
                });
            }
            // $('.drawing').css({
            //     transform: 'scale(' + window.innerWidth / 1048 + ')'
            // })
        } else if (data.Status == 1) {
            BzConfirm('您还没有配置文件，是否要去配置文件？', function(e) {
                if (e) {
                    console.log('您还没有配置文件，是否要去配置文件？');
                }
            });
        } else {
            BzAlert(data.error);
        }
        $('#offside').click(function() {
            if ($('#rightId').css('right') == '0px') {
                $('#rightId').animate({
                    right: '-100px'
                })
            } else {
                $('#rightId').animate({
                    right: '0px'
                })
            }
        });
    })
    $.ajaxSettings.async = true;
    $('#container').height(lh_dataAll.windowHeightBottomShow);
    $('#map').append(`<div id='map_state' style='width:20%;height:100%;bottom:0;display:inline-block;position:absolute;right:0'>
        <table class='table'  style='text-align: center' align="center">
            <thead>
                <tr>
                    <th colspan="5" style='text-align: center' >总数</th>
                </tr>
            </thead>
            <tbody>
                 <tr>
                    <th>运行</th>
                    <th>空闲</th>
                    <th>调试</th>
                    <th>停机</th>
                    <th>关机</th>
                </tr>
                <tr>
                    <th class='dataArrRunData' style='color: rgb(78, 207, 31)'></th>
                    <th class='dataArrIdleData' style='color: rgb(230, 210, 21);'></th>
                    <th class='dataArrDebugData' style='color: rgb(27, 36, 247);'></th>
                    <th class='dataArrStopData' style='color: rgb(245, 40, 12)'></th>
                    <th class='dataArrOfflineData' style='color: rgb(96, 103, 101);'></th>
                </tr>
            </tbody>
        </table>
    </div>`);

    dataSuccess(lh_dataAll.webSeverDataState);

    function dataSuccess(data) {
        var dataValue = data.Data;
        var Mac_List = data.Mac_List.Data.GetAllMachineList;
        for (var i = 0; i < data.Data.length; i++) {
            for (var q = 0; q < Mac_List.length; q++) {
                if (data.Data[i].MacNbr == Mac_List[q].MAC_NBR) {
                    Mac_List[q].value = data.Data[i].Value[0].Value;
                }
            }
        }
        for (var w = 0; w < Mac_List.length; w++) {
            if (Mac_List[w].CODE_NO == null || Mac_List[w].CODE_NO == undefined) {
                Mac_List[w].CODE_NO = ''
            }
        }

        var resultArrSole = [];
        for (var i = 0; i < Mac_List.length; i++) {
            var obj = Mac_List[i];
            var num = obj.MAC_NBR;
            var isExist = false;
            for (var j = 0; j < data.Data.length; j++) {
                var aj = data.Data[j];
                var n = aj.MacNbr;
                if (n == num) {
                    isExist = true;
                    break;
                }
            }
            if (!isExist) {
                resultArrSole.push(obj);
            }
        }
        for (var q = 0; q < Mac_List.length; q++) {
            if (Mac_List[q].value == 0) {
                Mac_List[q].value = 3;
            }
            if (!Mac_List[q].value) {
                Mac_List[q].value = 6;
            }
        }
        for (let w = 0; w < $('.dataMacId').length; w++) {
            if ($('.dataMacId').eq(w).attr('data-macid') == 'undefined') {
                $('.dataMacId').eq(w).prepend(`<div class='ellipseOff' style='position:absolute;top:${dataObj.chejian[0].deng.lightY};left:${dataObj.chejian[0].deng.lightX};width:${dataObj.chejian[0].deng.lightWidth};height:${dataObj.chejian[0].deng.lightHeight};border-radius:${dataObj.chejian[0].deng.lightBorder} !important'></div><div style='position:absolute;color:${dataObj.chejian[0].ziti.lightFontColoe};font-family:${dataObj.chejian[0].ziti.lightFontFamily};left:${dataObj.chejian[0].ziti.lightFontX};font-size:${dataObj.chejian[0].ziti.lightFontsIZE};top:${dataObj.chejian[0].ziti.lightFonty}'>没有连接设备</div>`);
            }
        }

        for (let i = 0; i < Mac_List.length; i++) {
            for (let q = 0; q < $('.dataMacId').length; q++) {
                if (Mac_List[i].MAC_NBR == $('.dataMacId').eq(q).attr('data-macid')) {
                    switch (Mac_List[i].value) {
                        case 1:
                            // dataArrStopData += 1;
                            $('.dataMacId').eq(q).prepend(`<div class='ellipseStop' style='position:absolute;top:${dataObj.chejian[0].deng.lightY};left:${dataObj.chejian[0].deng.lightX};width:${dataObj.chejian[0].deng.lightWidth};height:${dataObj.chejian[0].deng.lightHeight};border-radius:${dataObj.chejian[0].deng.lightBorder} !important'></div><div style='position:absolute;color:${dataObj.chejian[0].ziti.lightFontColoe};font-family:${dataObj.chejian[0].ziti.lightFontFamily};left:${dataObj.chejian[0].ziti.lightFontX};font-size:${dataObj.chejian[0].ziti.lightFontsIZE};top:${dataObj.chejian[0].ziti.lightFonty}'>${$('.dataMacId').eq(q).attr('data-name')}</div>`);
                            break;
                        case 2:
                            $('.dataMacId').eq(q).prepend(`<div class='ellipseRun' style='position:absolute;top:${dataObj.chejian[0].deng.lightY};left:${dataObj.chejian[0].deng.lightX};width:${dataObj.chejian[0].deng.lightWidth};height:${dataObj.chejian[0].deng. lightHeight};border-radius:${dataObj.chejian[0].deng.lightBorder} !important'></div><div style='position:absolute;color:${dataObj.chejian[0].ziti.lightFontColoe};font-family:${dataObj.chejian[0].ziti.lightFontFamily};left:${dataObj.chejian[0].ziti.lightFontX};font-size:${dataObj.chejian[0].ziti.lightFontsIZE};top:${dataObj.chejian[0].ziti.lightFonty}'>${$('.dataMacId').eq(q).attr('data-name')}</div>`);
                            break;
                        case 3:
                            $('.dataMacId').eq(q).prepend(`<div class='ellipseIdle' style='position:absolute;top:${dataObj.chejian[0].deng.lightY};left:${dataObj.chejian[0].deng.lightX};width:${dataObj.chejian[0].deng.lightWidth};height:${dataObj.chejian[0].deng.lightHeight};border-radius:${dataObj.chejian[0].deng.lightBorder} !important'></div><div style='position:absolute;color:${dataObj.chejian[0].ziti.lightFontColoe};font-family:${dataObj.chejian[0].ziti.lightFontFamily};left:${dataObj.chejian[0].ziti.lightFontX};font-size:${dataObj.chejian[0].ziti.lightFontsIZE};top:${dataObj.chejian[0].ziti.lightFonty}'>${$('.dataMacId').eq(q).attr('data-name')}</div>`);
                            break;
                        case 4:
                            $('.dataMacId').eq(q).prepend(`<div class='ellipseOff' style='position:absolute;top:${dataObj.chejian[0].deng.lightY};left:${dataObj.chejian[0].deng.lightX};width:${dataObj.chejian[0].deng.lightWidth};height:${dataObj.chejian[0].deng.lightHeight};border-radius:${dataObj.chejian[0].deng.lightBorder} !important'></div><div style='position:absolute;color:${dataObj.chejian[0].ziti.lightFontColoe};font-family:${dataObj.chejian[0].ziti.lightFontFamily};left:${dataObj.chejian[0].ziti.lightFontX};font-size:${dataObj.chejian[0].ziti.lightFontsIZE};top:${dataObj.chejian[0].ziti.lightFonty}'>${$('.dataMacId').eq(q).attr('data-name')}</div>`);
                            break;
                        case 5:
                            $('.dataMacId').eq(q).prepend(`<div class='ellipseDebug' style='position:absolute;top:${dataObj.chejian[0].deng.lightY};left:${dataObj.chejian[0].deng.lightX};width:${dataObj.chejian[0].deng.lightWidth};height:${dataObj.chejian[0].deng.lightHeight};border-radius:${dataObj.chejian[0].deng.lightBorder} !important'></div><div style='position:absolute;color:${dataObj.chejian[0].ziti.lightFontColoe};font-family:${dataObj.chejian[0].ziti.lightFontFamily};left:${dataObj.chejian[0].ziti.lightFontX};font-size:${dataObj.chejian[0].ziti.lightFontsIZE};top:${dataObj.chejian[0].ziti.lightFonty}'>${$('.dataMacId').eq(q).attr('data-name')}</div>`);
                            break;
                        default:
                            break;
                    }
                }
            }
        }

        function setTimeoutTimes() {
            setTimeout(() => {
                let $saveClass = $('#rightId').find('div.activeplant').next();
                if ($saveClass.length <= 0) {
                    if (circulation == 'circulation') {
                        createMAP('lh_dataAll.boardList[i]', 'circulation');
                        return;
                    }
                    $.fn.fullpage.moveSlideRight();
                    return;
                }
                $('.plant').removeClass('activeplant');
                $saveClass.addClass('activeplant');
                let id = $saveClass.attr('id');
                $('.drawing').hide();
                $(`#drawing${getN(id)}`).show();
                setTimeoutTimes();
            }, lh_dataAll.MAPsetIntervalTime);
        }
        if ($('.drawing').height() * getMatrix($('.drawing')) < lh_dataAll.windowHeightBottomShow) {
            setTimeoutTimes();
        } else {
            lh_dataAll.MAPsetIntervals = setInterval((function() {
                lh_dataAll.scrollTopIs = lh_dataAll.scrollTopIs + lh_dataAll.MAPsetIntervalSppeed;
                $('#container').scrollTop(lh_dataAll.scrollTopIs);
                // if ($('.drawing').height() * getMatrix($('.drawing')) < $(window).height() + 2) {
                //     lh_dataAll.MAPsetIntervalSppeed = 2000;
                //     let $saveClass = $('#rightId').find('div.activeplant').next();
                //     $('.plant').removeClass('activeplant');
                //     $saveClass.addClass('activeplant');
                //     let id = $saveClass.attr('id');
                //     $('.drawing').hide();
                //     $(`#drawing${getN(id)}`).show();
                // }
                if ($('.drawing').height() * getMatrix($('.drawing')) - $('#container').scrollTop() <= lh_dataAll.windowHeightBottomShow + 2) {
                    let $saveClass = $('#rightId').find('div.activeplant').next();
                    if ($saveClass.length <= 0) {
                        window.clearInterval(lh_dataAll.MAPsetIntervals);
                        lh_dataAll.scrollTopIs = 0;
                        if (circulation == 'circulation') {
                            createMAP('lh_dataAll.boardList[i]', 'circulation');
                            return;
                        }
                        $.fn.fullpage.moveSlideRight();
                        return;
                    }
                    $('.plant').removeClass('activeplant');
                    $saveClass.addClass('activeplant');
                    let id = $saveClass.attr('id');
                    $('.drawing').hide();
                    $(`#drawing${getN(id)}`).show();
                    lh_dataAll.scrollTopIs = 0;
                }
            }), lh_dataAll.MAPsetIntervalFrequency);
        }

        if (lh_dataAll.MAP_nbr != '' || lh_dataAll.MAP_nbr.length != 0) {
            //修改设备数量
            let Mac_ListFile_MAC = [];
            let lh_dataAllMAP_nbr = lh_dataAll.MAP_nbr.split(',');
            for (let i = 0; i < Mac_List.length; i++) {
                for (let w = 0; w < lh_dataAllMAP_nbr.length; w++) {
                    if (Mac_List[i].MAC_NBR == lh_dataAllMAP_nbr[w]) {
                        Mac_ListFile_MAC.push(Mac_List[i]);
                        break;
                    }
                }
            }
            MAP_dotAll(Mac_ListFile_MAC);
        } else {
            MAP_dotAll(Mac_List);
        }



        for (var w = 0; w < resultArrSole.length; w++) {
            dataValue.push({
                MacNbr: resultArrSole[w].MAC_NBR,
                Value: [{
                    name: '该设备没联网',
                    Value: resultArrSole[w].value,
                }]
            })
        }



        //拿到JSON 最小数
        var list = new Array();
        for (var i in data.Mac_List.Data.GetAllMachineGroupList) {
            list.push(data.Mac_List.Data.GetAllMachineGroupList[i].PID);
        }
        list.sort(function(num1, num2) {
            return num2 - num1;
        })
        var mincnt = eval(list[list.length - 1]);
        var dataArrGroup = [];
        for (var i = 0; i < data.Mac_List.Data.GetAllMachineGroupList.length; i++) {
            if (mincnt == data.Mac_List.Data.GetAllMachineGroupList[i].PID) {
                dataArrGroup.push(data.Mac_List.Data.GetAllMachineGroupList[i]);
            }
        }
        for (let i = 0; i < dataArrGroup.length; i++) {
            let dataArrGroupGP_NBR = dataArrGroup[i].GP_NBR;
            let dataArrGroupGP_NAME = dataArrGroup[i].GP_NAME;
            let that = this;
            $.ajax({
                url: '/main/GetMacNameList',
                type: 'post',
                data: {
                    nodeID: dataArrGroupGP_NBR,
                },
                success: function(data) {
                    let rootMacInfo = data.Data.rootMacInfo
                    for (var b = 0; b < rootMacInfo.length; b++) {
                        for (var q = 0; q < dataValue.length; q++) {
                            if (rootMacInfo[b].MAC_NBR == dataValue[q].MacNbr) {
                                rootMacInfo[b].value = dataValue[q].Value[0].Value;
                            }
                        }
                    }
                    for (var v = 0; v < rootMacInfo.length; v++) {
                        for (var q = 0; q < Mac_List.length; q++) {
                            if (rootMacInfo[v].MAC_NBR == Mac_List[q].MAC_NBR) {
                                rootMacInfo[v].latitude = Mac_List[q].latitude;
                                rootMacInfo[v].longitude = Mac_List[q].longitude;
                            }
                        }
                    }
                    var dataArrStop = [];
                    var dataArrRun = [];
                    var dataArrIdle = [];
                    var dataArrOffline = [];
                    var dataArrDebug = [];
                    for (var j = 0; j < rootMacInfo.length; j++) {
                        switch (rootMacInfo[j].value) {
                            case 1:
                                dataArrStop.push(rootMacInfo[j].value);
                                break;
                            case 2:
                                dataArrRun.push(rootMacInfo[j].value);
                                break;
                            case 3:
                            case 0:
                                dataArrIdle.push(rootMacInfo[j].value);
                                break;
                            case 4:
                            case 6:
                                dataArrOffline.push(rootMacInfo[j].value);
                                break;
                            case 5:
                                dataArrDebug.push(rootMacInfo[j].value);
                                break;
                            default:
                                console.error('出错啦');
                                break;
                        }
                    }
                    $('#map_state').append(`<table id='client${i}' class='table' style='text-align: center' align="center">
                            <thead>
                                <tr>
                                    <th colspan="5" style='text-align: center' >${dataArrGroup[i].GP_NAME==''?'未定义':dataArrGroup[i].GP_NAME}</th>
                                </tr>
                            </thead>
                        <tbody>
                            <tr>
                                <th>运行</th>
                                <th>空闲</th>
                                <th>调试</th>
                                <th>停机</th>
                                <th>关机</th>
                            </tr>
                            <tr>
                                <th class='dataArrRunData${i}' style='color: rgb(78, 207, 31)'>${dataArrRun.length}</th>
                                <th class='dataArrIdleData${i}' style='color: rgb(230, 210, 21);'>${dataArrIdle.length}</th>
                                <th class='dataArrDebugData${i}' style='color: rgb(27, 36, 247);'>${dataArrDebug.length}</th>
                                <th class='dataArrStopData${i}' style='color: rgb(245, 40, 12);'>${dataArrStop.length}</th>
                                <th class='dataArrOfflineData${i}' style='color: rgb(96, 103, 101);'>${dataArrOffline.length}</th>
                            </tr>
                        </tbody>
                    </table>`);
                },
                error: function(err) {
                    console.error(err);
                    return false;
                }
            })
        }
    }

    function MAP_dotAll(Mac_List) {
        var dataArrOfflineData = 0;
        var dataArrStopData = 0;
        var dataArrDebugData = 0;
        var dataArrIdleData = 0;
        var dataArrRunData = 0;
        for (var i = 0; i < Mac_List.length; i++) {
            switch (Mac_List[i].value) {
                case 1:
                    dataArrStopData += 1;
                    break;
                case 2:
                    dataArrRunData += 1;
                    break;
                case 3:
                case 0:
                    dataArrIdleData += 1;
                    break;
                case 4:
                    dataArrOfflineData += 1;
                    break;
                case 5:
                    dataArrDebugData += 1;
                    break;
                case 6:
                    dataArrOfflineData += 1;
                    break;
                default:
                    console.error('出错啦');
                    break;
            }
        }
        $('.dataArrRunData').html(dataArrRunData);
        $('.dataArrIdleData').html(dataArrIdleData);
        $('.dataArrDebugData').html(dataArrDebugData);
        $('.dataArrStopData').html(dataArrStopData);
        $('.dataArrOfflineData').html(dataArrOfflineData);
    }

    function getN(s) {
        return s.replace(/[^0-9]/ig, "")
    };

    function getMatrix(ele) {
        for (let q = 0; q < ele.length; q++) {
            if (ele.eq(q).css('transform') != 'none') {
                console.log(ele.eq(q).css('transform'));
                let a = ele.eq(q).css('transform').split(',');
                let b = a[0].split('(');
                return b[1];
            }
        }
    };
}