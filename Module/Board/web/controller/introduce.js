function createIntroduce(message, fixedly) {
    $('#introduce').html('');
    if($(window).width() < 1000){
        $('#introduce').append(`<div id='elm1' style='height:100%;margin:0 auto;'></div>`);
    }else{
        $('#introduce').append(`<div id='elm1' style='width:1048px;height:100%;margin:0 auto;'></div>`);
    }
    //调取客户ID
    let ifImgOnload;
    $.ajax({
        url: '/TinyMCE/GetUserTable',
        type: 'post',
        success: function(data) {
            if (data.Status == 0) {
                if (data.Data.USER_PRE[0] == undefined) {} else {
                    ajaxReadData(data.Data.USER_PRE[0].COMPANY_NAME);
                }
            }
        },
        error: function() {
            console.error('出错啦');
            return false;
        }
    })

    //调取富文本数据
    function ajaxReadData(data) {
        ajaxData = data;
        $.ajax({
            url: '/TinyMCE/readDataBoard',
            type: 'post',
            data: {
                name: ajaxData,
            },
            success: function(data) {
                if (data.Data != undefined) {
                    $('#elm1').html(data.Data.text);
                    ifImgOnload = new Array($('#elm1 img').length);
                    lh_dataAll.elm1Height = 0;
                    for (let w = 0; w < $('#elm1 img').length; w++) {
                        ifImgOnload[w] = false;
                    }
                    //判断没有图片时  直接赋值为1
                    if ($('#elm1 img').length == 0) {
                        ifImgOnload = [true];
                        imgonlod();
                    }
                    $('#elm1 img').each(function(index) {
                        var $this = $(this);
                        var src = $this.attr('src');
                        var img = new Image()
                        img.onload = function() {
                            ifImgOnload[index] = true;
                            imgonlod();
                        }
                        img.src = src;
                    });

                }
            },
            error: function() {
                console.error('出错啦');
                return false;
            }
        })

        function imgonlod() {
            var ifImgOnloadEnd = Array.from(new Set(ifImgOnload));
            if (ifImgOnloadEnd.length != 1) {
                return false;
            }
            lh_dataAll.elm1Height = $('#elm1').height();
            $('.section').height(lh_dataAll.elm1Height);
            $('.fp-slidesContainer').height(lh_dataAll.elm1Height);
            $('#introduce>.fp-tableCell').height(lh_dataAll.elm1Height);
            lh_dataAll.clearIntervalTime = setInterval((function() {
                if (lh_dataAll.elm1Height <= lh_dataAll.windowHeightBottomShow) {
                    window.clearInterval(lh_dataAll.clearIntervalTime);
                    setTimeout(() => {
                        $.fn.fullpage.moveSlideRight();
                    }, lh_dataAll.clientTimesAll);
                } else {
                    $('#dowebok').css({
                        'overflow': 'auto'
                    });
                    var dowebokScrollTop = $("#dowebok").scrollTop() + lh_dataAll.clientSpeedsa;
                    $("#dowebok").scrollTop(dowebokScrollTop);
                    // $("#dowebok").scrollTop($("#dowebok").scrollTop() + lh_dataAll.clientSpeedsa);
                    // $('html').css({
                    //     'overflow': 'auto'
                    // });
                    if ($("#dowebok").scrollTop() >= lh_dataAll.elm1Height - lh_dataAll.windowHeightBottomShow - 1) {
                        window.clearInterval(lh_dataAll.clearIntervalTime);
                        if (fixedly == 'fixedly') {
                            createIntroduce('lh_dataAll.boardList[i]', 'fixedly');
                        } else {
                            $.fn.fullpage.moveSlideRight();
                        }
                        $('#introduce').css({
                            width:'19.7%'
                        })
                       
                        $("#dowebok").scrollTop(0);
                        $('#dowebok').css({
                            'overflow': 'hidden'
                        });
                        $('.fp-slidesContainer').height(lh_dataAll.windowHeightBottomShow);
                    }
                }
            }), lh_dataAll.clientTimes);
        }
    }
}