(function() {
    let facilityWide, facilityTall, dataObj;
    let setIntervalNum = 10000; //页面10秒一刷新
    window.onload = function() {
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
                $('body').append(`<div id='rightId'><div class='offside' id='offside'></div></div>`);
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
                        'transform': 'scale(' + $(window).width() / getN(dataObj.chejian[i].page.width) + ')'
                    });
                }
                // $('.drawing').css({
                //     transform: 'scale(' + window.innerWidth / 1048 + ')'
                // })
            } else if (data.Status == 1) {
                BzConfirm('您还没有配置文件，是否要去配置文件？', function(e) {
                    if (e) {
                        window.location.href = '/MAPConfigs';
                    }
                });
            } else {
                BzAlert(data.error);
            }
        })
        $.ajaxSettings.async = true;
        getMapGroupList()
        setInterval(getMapGroupList,setIntervalNum)
        function getMapGroupList(){
            $.ajax({
                type: "post",
                url: "/MapGroupList",
                data: {
                    list: []
                },
                success: function(data) {
                    dataSuccess(data);
                },
                error: function(err) {
                    return false;
                }
            });
        }




        // //绑定键盘事件 按ESC的时候跳转页面
        // document.onkeyup = function(event) {
        //     var e = event || window.event;
        //     var keyCode = e.keyCode || e.which;
        //     if (keyCode == 27) {
        //         window.location.href = '/compiles';
        //     }
        // }
        $('.plant').click(function(e) {
            e.preventDefault();
            $('.plant').removeClass('activeplant');
            $(this).addClass('activeplant');
            let id = $(this).attr('id');
            $('.drawing').hide();
            $(`#drawing${getN(id)}`).show();
        })

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
        $('.excquit').click(() => {
            window.location.href = '/compiles';
        });
    }

    function dataSuccess(data) {
        var dataValue = data.Data;
        var Mac_List = data.Mac_List.Data.GetAllMachineList;
        Mac_List = Mac_List.filter(function(item){ return item.MAC_NBR != null});
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
        MAP_dotAll(Mac_List);
        $('.dataMacIdText').remove();
        $('.ellipseStop').remove();
        $('.ellipseRun').remove();
        $('.ellipseIdle').remove();
        $('.ellipseOff').remove();
        $('.ellipseDebug').remove();
        for (let w = 0; w < $('.dataMacId').length; w++) {
            
            if ($('.dataMacId').eq(w).attr('data-macid') == 'undefined') {
                $('.dataMacId').eq(w).prepend(`<div class='ellipseOff' style='position:absolute;top:${dataObj.chejian[0].deng.lightY};left:${dataObj.chejian[0].deng.lightX};width:${dataObj.chejian[0].deng.lightWidth};height:${dataObj.chejian[0].deng.lightHeight};border-radius:${dataObj.chejian[0].deng.lightBorder} !important'></div><div class='dataMacIdText' style='position:absolute;color:${dataObj.chejian[0].ziti.lightFontColoe};font-family:${dataObj.chejian[0].ziti.lightFontFamily};left:${dataObj.chejian[0].ziti.lightFontX};font-size:${dataObj.chejian[0].ziti.lightFontsIZE};top:${dataObj.chejian[0].ziti.lightFonty}'>没有连接设备</div>`);
            }
        }

        for (let i = 0; i < Mac_List.length; i++) {
            for (let q = 0; q < $('.dataMacId').length; q++) {
                if (Mac_List[i].MAC_NBR == $('.dataMacId').eq(q).attr('data-macid')) {
                    switch (Mac_List[i].value) {
                        case 1:
                            // dataArrStopData += 1;
                            $('.dataMacId').eq(q).prepend(`<div class='ellipseStop' style='position:absolute;top:${dataObj.chejian[0].deng.lightY};left:${dataObj.chejian[0].deng.lightX};width:${dataObj.chejian[0].deng.lightWidth};height:${dataObj.chejian[0].deng.lightHeight};border-radius:${dataObj.chejian[0].deng.lightBorder} !important'></div><div class='dataMacIdText' style='position:absolute;color:${dataObj.chejian[0].ziti.lightFontColoe};font-family:${dataObj.chejian[0].ziti.lightFontFamily};left:${dataObj.chejian[0].ziti.lightFontX};font-size:${dataObj.chejian[0].ziti.lightFontsIZE};top:${dataObj.chejian[0].ziti.lightFonty}'>${$('.dataMacId').eq(q).attr('data-name')}</div>`);
                            break;
                        case 2:
                            $('.dataMacId').eq(q).prepend(`<div class='ellipseRun' style='position:absolute;top:${dataObj.chejian[0].deng.lightY};left:${dataObj.chejian[0].deng.lightX};width:${dataObj.chejian[0].deng.lightWidth};height:${dataObj.chejian[0].deng. lightHeight};border-radius:${dataObj.chejian[0].deng.lightBorder} !important'></div><div class='dataMacIdText' style='position:absolute;color:${dataObj.chejian[0].ziti.lightFontColoe};font-family:${dataObj.chejian[0].ziti.lightFontFamily};left:${dataObj.chejian[0].ziti.lightFontX};font-size:${dataObj.chejian[0].ziti.lightFontsIZE};top:${dataObj.chejian[0].ziti.lightFonty}'>${$('.dataMacId').eq(q).attr('data-name')}</div>`);
                            break;
                        case 3:
                            $('.dataMacId').eq(q).prepend(`<div class='ellipseIdle' style='position:absolute;top:${dataObj.chejian[0].deng.lightY};left:${dataObj.chejian[0].deng.lightX};width:${dataObj.chejian[0].deng.lightWidth};height:${dataObj.chejian[0].deng.lightHeight};border-radius:${dataObj.chejian[0].deng.lightBorder} !important'></div><div class='dataMacIdText' style='position:absolute;color:${dataObj.chejian[0].ziti.lightFontColoe};font-family:${dataObj.chejian[0].ziti.lightFontFamily};left:${dataObj.chejian[0].ziti.lightFontX};font-size:${dataObj.chejian[0].ziti.lightFontsIZE};top:${dataObj.chejian[0].ziti.lightFonty}'>${$('.dataMacId').eq(q).attr('data-name')}</div>`);
                            break;
                        case 4:
                            $('.dataMacId').eq(q).prepend(`<div class='ellipseOff' style='position:absolute;top:${dataObj.chejian[0].deng.lightY};left:${dataObj.chejian[0].deng.lightX};width:${dataObj.chejian[0].deng.lightWidth};height:${dataObj.chejian[0].deng.lightHeight};border-radius:${dataObj.chejian[0].deng.lightBorder} !important'></div><div class='dataMacIdText' style='position:absolute;color:${dataObj.chejian[0].ziti.lightFontColoe};font-family:${dataObj.chejian[0].ziti.lightFontFamily};left:${dataObj.chejian[0].ziti.lightFontX};font-size:${dataObj.chejian[0].ziti.lightFontsIZE};top:${dataObj.chejian[0].ziti.lightFonty}'>${$('.dataMacId').eq(q).attr('data-name')}</div>`);
                            break;
                        case 5:
                            $('.dataMacId').eq(q).prepend(`<div class='ellipseDebug' style='position:absolute;top:${dataObj.chejian[0].deng.lightY};left:${dataObj.chejian[0].deng.lightX};width:${dataObj.chejian[0].deng.lightWidth};height:${dataObj.chejian[0].deng.lightHeight};border-radius:${dataObj.chejian[0].deng.lightBorder} !important'></div><div class='dataMacIdText' style='position:absolute;color:${dataObj.chejian[0].ziti.lightFontColoe};font-family:${dataObj.chejian[0].ziti.lightFontFamily};left:${dataObj.chejian[0].ziti.lightFontX};font-size:${dataObj.chejian[0].ziti.lightFontsIZE};top:${dataObj.chejian[0].ziti.lightFonty}'>${$('.dataMacId').eq(q).attr('data-name')}</div>`);
                            break;
                        default:
                            break;
                    }
                }
            }
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
        $('.number').eq(0).html(dataArrRunData);
        $('.number').eq(1).html(dataArrIdleData);
        $('.number').eq(2).html(dataArrDebugData);
        $('.number').eq(3).html(dataArrStopData);
        $('.number').eq(4).html(dataArrOfflineData);
    }

    function getN(s) {
        return s.replace(/[^0-9]/ig, "")
    };
})()