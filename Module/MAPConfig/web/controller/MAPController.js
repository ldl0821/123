let historyWidth,
    historyHeight;
$(function() {
    /*********************************添加车间事件******************************************/
    //如果有文件这个值等于他的length
    let numWorkshop = 0;
    $.ajaxSettings.async = false;
    $.get('/maps/getJson', function(data) {
        if (data.Status == 0) {
            let dataArr = JSON.parse(data.Data);
            console.log(dataArr);
            //标题
            $('#title').html(dataArr.title.content);
            $('#title').css({
                'font-size': dataArr.title.size,
                'font-family': dataArr.title.ziti,
                'text-align': dataArr.title.arrange,
                'color': dataArr.title.color
            });
            $('#captionTitle').val(dataArr.title.content);
            $("#captionTitleSelect").val(getN(dataArr.title.size));
            $('#captionFontSelect').val(sliceString(dataArr.title.ziti));
            $('#captionCenterSelect').val(dataArr.title.arrange);
            $('#captionColor').val(colorRGBtoHex(dataArr.title.color));
            //车间
            if (dataArr.chejian.length != 0) {
                $('#pageHeight').val(getN(dataArr.chejian[0].page.height));
                $('#pageWidth').val(getN(dataArr.chejian[0].page.width));
                $('#pageColor').val(colorRGBtoHex(dataArr.chejian[0].page.background));
                //灯
                $('#lightX').val(dataArr.chejian[0].deng.lightX.substring(0, dataArr.chejian[0].deng.lightX.length - 2));
                $('#lightY').val(Number(dataArr.chejian[0].deng.lightY.substring(0, dataArr.chejian[0].deng.lightY.length - 2)) + Number(dataArr.chejian[0].deng.lightHeight.substring(0, dataArr.chejian[0].deng.lightHeight.length - 2)));
                $('#lightWidth').val(dataArr.chejian[0].deng.lightWidth.substring(0, dataArr.chejian[0].deng.lightWidth.length - 2));
                $('#lightHeight').val(dataArr.chejian[0].deng.lightHeight.substring(0, dataArr.chejian[0].deng.lightHeight.length - 2));
                $('#lightBorder').val(dataArr.chejian[0].deng.lightBorder.substring(0, dataArr.chejian[0].deng.lightBorder.length - 2));
                //灯边上的字体
                $('#lightFontX').val(Number(dataArr.chejian[0].ziti.lightFontX.substring(0, dataArr.chejian[0].ziti.lightFontX.length - 2)) - 20);
                $('#lightFonty').val(Number(dataArr.chejian[0].ziti.lightFonty.substring(0, dataArr.chejian[0].ziti.lightFonty.length - 2)) + 20);
                $('#lightFontColoe').val(colorRGBtoHex(dataArr.chejian[0].ziti.lightFontColoe));
                $('#lightFontsIZE').val(getN(dataArr.chejian[0].ziti.lightFontsIZE));
                $('#lightFontFamily').val(sliceString(dataArr.chejian[0].ziti.lightFontFamily));
                //线别属性
                if (dataArr.chejian[0].xianbei.length != 0) {
                    $('#addwireSizeSelect').val(getN(dataArr.chejian[0].xianbei[0].size));
                    $('#addwireColorSelect').val(colorRGBtoHex(dataArr.chejian[0].xianbei[0].color));
                    $('#addwireBackgroundSelect').val(colorRGBtoHex(dataArr.chejian[0].xianbei[0].background));
                }
            }
            numWorkshop = dataArr.chejian.length;
            for (let i = 0; i < dataArr.chejian.length; i++) {
                if (i == 0) {
                    $('.addworkshop').append(`<div id='${dataArr.chejian[i].id}' class="newtoolshop activenewtoolshop">${dataArr.chejian[i].name}</div>`);
                    $('#mediatevessel').append(`<div id='mediatevessel${getN(dataArr.chejian[i].id)}' class="configXinxi" style="width:${dataArr.chejian[i].page.width};height:${dataArr.chejian[i].page.height};"></div>`)
                } else {
                    $('.addworkshop').append(`<div id='${dataArr.chejian[i].id}' class="newtoolshop">${dataArr.chejian[i].name}</div>`);
                    $('#mediatevessel').append(`<div id='mediatevessel${getN(dataArr.chejian[i].id)}' class="configXinxi" style="width:${dataArr.chejian[i].page.width};height:${dataArr.chejian[i].page.height};display:none"></div>`)
                }

                for (let m = 0; m < dataArr.chejian[i].tupian.length; m++) {
                    if(dataArr.chejian[i].tupian[m].url.substring(0,1) != '.'){               
                        dataArr.chejian[i].tupian[m].url = '.' + dataArr.chejian[i].tupian[m].url.split(':')[2].substring(4);
                    }
                    $(`#mediatevessel${getN(dataArr.chejian[i].id)}`).append(`<img src='${dataArr.chejian[i].tupian[m].url}' style='width:${dataArr.chejian[i].tupian[m].width};height:${dataArr.chejian[i].tupian[m].height}'/> `);
                    $(`#mediatevessel${getN(dataArr.chejian[i].id)}`).find('img:last').control();
                    $(`#mediatevessel${getN(dataArr.chejian[i].id)}`).find('.createEvents:last').css({
                        left: dataArr.chejian[i].tupian[m].x,
                        top: dataArr.chejian[i].tupian[m].y
                    });
                    if (dataArr.chejian[i].tupian[m].name != undefined) {
                        $(`#mediatevessel${getN(dataArr.chejian[i].id)}`).find('.createEvents:last').attr('data-name', dataArr.chejian[i].tupian[m].name);
                        $(`#mediatevessel${getN(dataArr.chejian[i].id)}`).find('.createEvents:last').attr('data-shebei', dataArr.chejian[i].tupian[m].macId);
                        $(`#mediatevessel${getN(dataArr.chejian[i].id)}`).find('.createEvents:last').find('span').html(dataArr.chejian[i].tupian[m].name);
                    }
                }

                for (let m = 0; m < dataArr.chejian[i].xianbei.length; m++) {
                    $(`#mediatevessel${getN(dataArr.chejian[i].id)}`).append(`<div class='wirenumber'>线别</div>`);
                    $(`#mediatevessel${getN(dataArr.chejian[i].id)}`).find('.wirenumber:last').wireContorl();
                    $(`#mediatevessel${getN(dataArr.chejian[i].id)}`).find('.createEventsWire:last').find('.wirenumber').css({
                        width: dataArr.chejian[i].xianbei[m].width,
                        height: dataArr.chejian[i].xianbei[m].height,
                        'line-height': dataArr.chejian[i].xianbei[m].height,
                    })
                    $(`#mediatevessel${getN(dataArr.chejian[i].id)}`).find('.createEventsWire:last').css({
                        color: dataArr.chejian[i].xianbei[m].color,
                        background: dataArr.chejian[i].xianbei[m].background,
                        left: dataArr.chejian[i].xianbei[m].x,
                        top: dataArr.chejian[i].xianbei[m].y,
                    })
                    $(`#mediatevessel${getN(dataArr.chejian[i].id)}`).find('.createEventsWire:last').find('.wirenumber').html(dataArr.chejian[i].xianbei[m].content);
                }
            }
            $('.newtoolshop').unbind();
            $('.newtoolshop').click(function() {
                if ($(this).hasClass('activenewtoolshop')) {
                    return;
                }
                $('.newtoolshop').removeClass('activenewtoolshop');
                $(this).addClass('activenewtoolshop');
                let id = $(`.activenewtoolshop`).attr('id');
                $('.configXinxi').hide();
                $(`#mediatevessel${getN(id)}`).show();
            })
            if( dataArr.chejian[0] != undefined){
                $('.configXinxi').css({
                    background: dataArr.chejian[0].page.background
                })
            }
            $('.configXinxi').mousedown((e) => {
                e.preventDefault();
                $('.rightvessel>div').hide();
                $('.rightvessel>div').eq(0).show();
                $('.rightvessel>div').eq(1).show();
            });

        } else if (data.Status == 1) {
            console.log('没有历史');
            return;
        } else {
            BzAlert(data.error);
        }
    });
    $('.addworkshop #iconSign').click(() => {
        numWorkshop++;
        $('.addworkshop').append(`<div id='newtoolshop${numWorkshop}' class='newtoolshop'>新车间</div>`);
        $('#mediatevessel').append(`<div id='mediatevessel${numWorkshop}' class='configXinxi' style='width:${$('#pageWidth').val()}px;height:${$('#pageHeight').val()}px;background:${$('#pageColor').val()};display:none'></div>`)
        $('.newtoolshop').unbind();
        $('.newtoolshop').click(function() {
            if ($(this).hasClass('activenewtoolshop')) {
                return;
            }
            $('.newtoolshop').removeClass('activenewtoolshop');
            $(this).addClass('activenewtoolshop');
            let id = $(`.activenewtoolshop`).attr('id');
            $('.configXinxi').hide();
            $(`#mediatevessel${getN(id)}`).show();
        });
        $('.configXinxi').mousedown((e) => {
            e.preventDefault();
            $('.rightvessel>div').hide();
            $('.rightvessel>div').eq(0).show();
            $('.rightvessel>div').eq(1).show();
        });
    });
    $('.addworkshop #iconEdit').click(() => {
        $('.addworkshop .activenewtoolshop').attr('contenteditable', 'true');
        $('.addworkshop .activenewtoolshop').focus();
        $('.addworkshop .activenewtoolshop')[0].onblur = function() {
            $(this).attr('contenteditable', 'false');
        }
    });
    $('.addworkshop #iconRemove').click(() => {
        BzConfirm('删除车间？', function(e) {
            if (e) {
                let id = $(`.activenewtoolshop`).attr('id');
                $('.addworkshop .activenewtoolshop').remove();
                $(`#mediatevessel${getN(id)}`).remove();
            }
        });
    });

    /*********************************添加设备事件******************************************/
    $("#addFacilitySign").fileupload({ //文件上传
        dataType: 'json',
        autoUpload: true,
        url: "/MAPConfig/upload/addImg",
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        maxNumberOfFiles: 1,
        maxFileSize: 1000000,
        done: function(e, data) {
            if (data.result.Status == 0) {
                // $(".addfacility").css("backgroundImage", "url(./MAPConfig/upload/img" + data.result.Data + ")");
                // $(".addfacility").append('<li class="galleryli" imgname="' + data.result.Data + '" name="/NoDefault/' + data.result.Data + '"><a><div class="gallery" style="background-image:url(./images/machine/NoDefault/' + data.result.Data + ')"></div></a><i class="icon-trash"></i><i class="icon-ok-sign"></i><span>' + (data.result.Data.split(".")[0].length > 6 ? (data.result.Data.split(".")[0].substr(0, 6) + "...") : data.result.Data.split(".")[0]) + '</span></li>')
                $(".addfacility").append(`<div style='border:1px solid #000000;margin-top:5px;' class='imgsfacility'><img src='/MAPConfig/web/image/${data.result.Data}'/><span data-imgs='${data.result.Data}'>${data.result.Data.split('.')[0]>20?data.result.Data.split('.')[0].substr(0,20)+'...':data.result.Data.split('.')[0]}</span><div class='removeImgs'><i class="icon-trash"></i>删除</div></div>`);
                $('.imgsfacility:last>img')[0].onload = function() {
                    $('.imgsfacility:last>img').attr('data-width', $('.imgsfacility:last>img')[0].naturalWidth);
                    $('.imgsfacility:last>img').attr('data-height', $('.imgsfacility:last>img')[0].naturalHeight);
                    $('.imgsfacility:last').find('img')[0].ondragstart = function(e) {
                        e.dataTransfer.setData("width", $(this).attr('data-width'));
                        e.dataTransfer.setData("height", $(this).attr('data-height'));
                    }
                }
                $('.removeImgs:last').click(function() {
                    let that = this;
                    BzConfirm('确定要删除么？', function(e) {
                        if (e) {
                            $.post('/MAPConfig/deleteImgs', { name: $(that).parent().find('span').attr('data-imgs') }, (data) => {
                                if (data.Status == 0) {
                                    $(that).parent().remove();
                                } else {
                                    BzAlert(data.Message);
                                }
                            })
                        }
                    });
                });
                BzSuccess(data.result.Message);
            } else {
                BzAlert(data.result.Message);
            }
        },
        fail: function(e, data) {
            console.log('上传完成');
        }
    });

    /*********************************添加设备事件******************************************/
    function getImg() {
        $.post('/MAPConfig/getImg', (data) => {
            if (data.Status == 0) {
                for (let i = 0; i < data.Data.length; i++) {
                    $(".addfacility").append(`<div style='border:1px solid #000000;margin-top:5px;' class='imgsfacility'><img src='${data.Data[i].FilePath}'/><span data-imgs='${data.Data[i].FileName}'>${data.Data[i].FileName.split('.')[0].length>20 ?data.Data[i].FileName.split('.')[0].substr(0,20)+'...': data.Data[i].FileName.split('.')[0] }</span><div class='removeImgs'><i class="icon-trash"></i>删除</div></div>`);
                    $('.imgsfacility:last>img')[0].onload = function() {
                        $('.imgsfacility:last>img').attr('data-width', $('.imgsfacility:last>img')[0].naturalWidth);
                        $('.imgsfacility:last>img').attr('data-height', $('.imgsfacility:last>img')[0].naturalHeight);
                        $('.imgsfacility').eq(i).find('img')[0].ondragstart = function(e) {
                            e.dataTransfer.setData("width", $(this).attr('data-width'));
                            e.dataTransfer.setData("height", $(this).attr('data-height'));
                        }
                    }
                }
                $('.removeImgs').click(function() {
                    let that = this;
                    BzConfirm('删除要删除么？', function(e) {
                        if (e) {
                            $.post('/MAPConfig/deleteImgs', { name: $(that).parent().find('span').attr('data-imgs') }, (data) => {
                                if (data.Status == 0) {
                                    $(that).parent().remove();
                                } else {
                                    BzAlert(data.Message);
                                }
                            })
                        }
                    });
                })
            } else {
                BzAlert(data.Message);
            }
        })
    }
    getImg();


    /*********************************拖放事件******************************************/
    $('#mediatevessel')[0].ondrop = function(e) {
        e.preventDefault();
        var data = e.dataTransfer.getData("Text");
        for (let i = 0; i < $('.configXinxi').length; i++) {
            if ($('.configXinxi').eq(i).css('display') == 'block') {
                $(`.configXinxi`).eq(i).append(`<img src='${data}' style='width:${e.dataTransfer.getData("width")}px;height:${e.dataTransfer.getData("height")}px'/> `);
                $(`.configXinxi`).eq(i).find('img:last').control();
            }
        }
    };
    $('#mediatevessel')[0].ondragover = function(e) {
        e.preventDefault();
    };






    /*********************************标题配置******************************************/
    $('#captionTitle')[0].oninput = function() {
        $('#title').html($(this).val());
    };
    $("#captionTitleSelect").change(function() {
        $('#title').css(
            'fontSize', this.value + 'px'
        );
    });
    $('#captionFontSelect').change(function() {
        $('#title').css(
            'fontFamily', this.value
        );
    });
    $('#captionCenterSelect').change(function() {
        $('#title').css(
            'textAlign', this.value
        );
    });
    $('#captionColor').change(function() {
        $('#title').css(
            'color', this.value
        );
    });


    /*********************************线别配置******************************************/
    $('#addwireiconSign').click(function() {
        // $('#mediatevessel').append(`<div class='wirenumber'>线别</div>`);
        // $('#mediatevessel .wirenumber:last').wireContorl();

        for (let i = 0; i < $('.configXinxi').length; i++) {
            if ($('.configXinxi').eq(i).css('display') == 'block') {
                $('.configXinxi').eq(i).append(`<div class='wirenumber'>线别</div>`);
                $(`.configXinxi`).eq(i).find('.wirenumber:last').wireContorl();
            }
        }
    });
    $('#addwireSizeSelect').change(function() {
        $('.createEventsWire').css({
            'font-size': $(this).val()
        })
    });
    $('#addwireColorSelect').change(function() {
        $('.createEventsWire').css({
            color: $(this).val()
        })
    });
    $('#addwireBackgroundSelect').change(function() {
        $('.createEventsWire').css({
            background: $(this).val()
        })
    });
    /*********************************页面配置******************************************/
    $('#pageWidth').change(function() {
        $('.configXinxi').width($(this).val());
    });
    $('#pageHeight').change(function() {
        $('.configXinxi').height($(this).val());
    });
    $('#pageColor').change(function() {
        $('.configXinxi').css('background', $(this).val());
    });
    // $('#pageFile').change(function() {
    //     var $file = $(this);
    //     var fileObj = $file[0];
    //     var windowURL = window.URL || window.webkitURL;
    //     var dataURL;
    //     var $img = $(".configXinxi");
    //     dataURL = windowURL.createObjectURL(fileObj.files[0]);
    //     $img.css({
    //         'background': 'url(' + dataURL + ')',
    //         'background-size': ' 100% 100%',
    //         'background-repeat': 'no-repeat'
    //     });
    // });

    /*********************************添加设备事件******************************************/
    $("#pageFile").fileupload({ //文件上传
        dataType: 'json',
        autoUpload: true,
        url: "/MAPConfig/upload/addBackgroundImg",
        acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
        maxNumberOfFiles: 1,
        maxFileSize: 1000000,
        done: function(e, data) {
            if (data.result.Status == 0) {
                var $img = $(".configXinxi");
                $img.css({
                    'background': 'url(/MAPConfig/web/background/' + data.result.Data + ')',
                    'background-size': ' 100% 100%',
                    'background-repeat': 'no-repeat'
                });
                BzSuccess(data.result.Message);
            } else {
                BzAlert(data.result.Message);
            }
        },
        fail: function(e, data) {
            console.log('上传完成');
        }
    });

    /*********************************元素属性失焦******************************************/
    $('#coordinateX').change(function() {
        $(`[data-active='true']`).css({
            left: $(this).val() + 'px'
        })
    });
    $('#coordinateY').change(function() {
        $(`[data-active='true']`).css({
            top: $(this).val() + 'px'
        })
    });
    $('#coordinateWidth').change(function() {
        if ($(`[data-active='true']>img`).length > 0) {
            if ($('#lockCheckbox').attr('checked')) {
                $('#coordinateHeight').val(~~(historyHeight * ($('#coordinateWidth').val() / historyWidth)));
                $(`[data-active='true']>img`).css({
                    width: $(this).val() + 'px',
                    height: 'auto'
                })
                return;
            }
            $(`[data-active='true']>img`).css({
                width: $(this).val() + 'px',
                height: $('#coordinateHeight').val() + 'px',
            })
        } else {
            $(`[data-active='true']>div`).css({
                width: $(this).val() + 'px'
            })
        }

    });
    $('#coordinateHeight').change(function() {
        if ($(`[data-active='true']>img`).length > 0) {
            if ($('#lockCheckbox').attr('checked')) {
                $('#coordinateWidth').val(~~(historyWidth * ($('#coordinateHeight').val() / historyHeight)));
                $(`[data-active='true']>img`).css({
                    width: 'auto',
                    height: $(this).val() + 'px'
                })
                return;
            }
            $(`[data-active='true']>img`).css({
                height: $(this).val() + 'px',
                width: $('#coordinateWidth').val() + 'px',
            })
        } else {
            $(`[data-active='true']>div`).css({
                height: $(this).val() + 'px',
                'line-height': $(this).val() + 'px',
            })
        }
    });

    /*************************灯光配置*****************************/
    $('#lightX').change(function() {
        $('.facilityTopLight').css({
            'left': $('#lightX').val() + 'px'
        })
    });
    $('#lightY').change(function() {
        $('.facilityTopLight').css({
            'top': $('#lightY').val() - $('#lightHeight').val() + 'px'
        })
    });
    $('#lightWidth').change(function() {
        $('.facilityTopLight').css({
            'width': $('#lightWidth').val() + 'px'
        })
    });
    $('#lightHeight').change(function() {
        $('.facilityTopLight').css({
            'height': $('#lightHeight').val() + 'px'
        })
    });
    $('#lightBorder').change(function() {
        $('.facilityTopLight').css({
            'border-radius': $('#lightBorder').val() + 'px'
        })
    });
    /*************************字体配置*****************************/
    $('#lightFontX').change(function() {
        $('.facilityTopState').css({
            'left': Number($('#lightFontX').val()) + 20 + 'px'
        })
    });
    $('#lightFonty').change(function() {
        $('.facilityTopState').css({
            'top': Number($('#lightFonty').val()) - 20 + 'px'
        })
    });
    $('#lightFontColoe').change(function() {
        $('.facilityTopState').css({
            'color': $('#lightFontColoe').val()
        })
    });
    $('#lightFontsIZE').change(function() {
        $('.facilityTopState').css({
            'font-size': $('#lightFontsIZE').val() + 'px'
        })
    });
    $('#lightFontFamily').change(function() {
        $('.facilityTopState').css({
            'font-family': $('#lightFontFamily').val()
        })
    });



    var MAC_NBRname = $("#MAC_NBRname").comboxTree({
        url: "/shift/GetAllMachineAndMachineGroup",
        data: { groupID: 0 },
        treetemplate: $("#treeview-template").html(),
        width: $('#bindFacility').width() - 20,
        diffwidth: 27,
        type: 2,
    }).data("BZ-comboxTree");

    $('#input_MAC_NBRname').attr('readonly', "readonly");

    function getN(s) {
        return s.replace(/[^0-9]/ig, "");
    };
    $('#saveBtn').click(function() {
        let chejian = [];
        for (let i = 0; i < $('.newtoolshop').length; i++) {
            let id = $('.newtoolshop').eq(i).attr('id');
            let $tuId = $(`#mediatevessel${getN(id)}`);
            let tupian = [];
            let xianbei = [];
            let $tuIdcreateEvents = $tuId.find('.createEvents');
            let $tuIdcreateEventsWire = $tuId.find('.createEventsWire');
            for (let w = 0; w < $tuIdcreateEvents.length; w++) {
                // if ($tuIdcreateEvents.eq(w).attr('data-shebei') == undefined) {
                //     BzAlert('有未绑定的设备');
                //     return;
                // }
                tupian.push({
                    macId: $tuIdcreateEvents.eq(w).attr('data-shebei'),
                    name: $tuIdcreateEvents.eq(w).attr('data-name'),
                    url: $tuIdcreateEvents.eq(w).find('img').attr('src'),
                    x: $tuIdcreateEvents.eq(w).css('left'),
                    y: $tuIdcreateEvents.eq(w).css('top'),
                    width: $tuIdcreateEvents.eq(w).find('img').actual('width') + 'px',
                    height: $tuIdcreateEvents.eq(w).find('img').actual('height') + 'px',
                });
            }
            for (let w = 0; w < $tuIdcreateEventsWire.length; w++) {
                xianbei.push({
                    content: $tuIdcreateEventsWire.eq(w).text(),
                    background: $tuIdcreateEventsWire.eq(w).css('background'),
                    color: $tuIdcreateEventsWire.eq(w).css('color'),
                    x: $tuIdcreateEventsWire.eq(w).css('left'),
                    y: $tuIdcreateEventsWire.eq(w).css('top'),
                    width: $tuIdcreateEventsWire.eq(w).actual('width') + 'px',
                    height: $tuIdcreateEventsWire.eq(w).actual('height') + 'px',
                    size: $tuIdcreateEventsWire.eq(w).css('font-size')
                })
            }
            chejian.push({
                id: id,
                name: $('.newtoolshop').eq(i).html(),
                page: {
                    width: ~~$tuId.css('width').split('px')[0] + 'px',
                    height: ~~$tuId.css('height').split('px')[0] + 'px',
                    background: $tuId.css('background'),
                },
                deng: {
                    lightX: $('.facilityTopLight').css('left'),
                    lightY: $('.facilityTopLight').css('top'),
                    lightWidth: $('.facilityTopLight').actual('width') + 'px',
                    lightHeight: $('.facilityTopLight').actual('height') + 'px',
                    lightBorder: $('.facilityTopLight').css('border-radius')
                },
                ziti: {
                    lightFontX: $('.facilityTopState').css('left'),
                    lightFonty: $('.facilityTopState').css('top'),
                    lightFontColoe: $('.facilityTopState').css('color'),
                    lightFontsIZE: $('.facilityTopState').css('font-size'),
                    lightFontFamily: $('.facilityTopState').css('font-family')
                },
                tupian: tupian,
                xianbei: xianbei
            })
        }

        let saveJson = {
            title: {
                content: $('#title').html(),
                size: $('#title').css('font-size'),
                ziti: $('#title').css('font-family'),
                arrange: $('#title').css('text-align'),
                color: $('#title').css('color')
            },
            chejian: chejian
        }
        console.log(saveJson)
        $.post('/MAPConfig/saveJson', { saveJson: JSON.stringify(saveJson) }, function(data) {
            if (data.Status == 0) {
                BzSuccess(data.Message);
            } else {
                BzAlert(data.error);
            }
        })
    });
    /******************************************点击改元素 改变右边**************************************************/
    $('#title').click(() => {
        $('.rightvessel>div').hide();
        $('.rightvessel>div').eq(0).show();
        $('.rightvessel>div').eq(3).show();
    });

})

function addOnClick(_self) {
    $(`.createEvents[data-active='true']`).attr('data-shebei', $(_self).attr('nodeid'));
    $(`.createEvents[data-active='true']`).attr('data-name', $(_self).attr('attr'));
    $(`.createEvents[data-active='true']>span`).html($(`.createEvents[data-active='true']`).attr('data-name'));
}

function getN(s) {
    return s.replace(/[^0-9]/ig, "")
};

function sliceString(s) {
    return s.slice(1, s.length - 1);
}

function colorRGBtoHex(color) {
    var rgb = color.split(',');
    var r = parseInt(rgb[0].split('(')[1]);
    var g = parseInt(rgb[1]);
    var b = parseInt(rgb[2].split(')')[0]);
    var hex = "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    return hex;
}