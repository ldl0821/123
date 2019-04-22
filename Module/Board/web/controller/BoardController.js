window.onload = function() {
    lh_dataAll.windowHeight = $(window).height(); //用于判断页面大小发生变化  
    if(lh_dataAll.notice.show){
        lh_dataAll.massageHeightShow = $(window).height()*0.1;
    }
    lh_dataAll.windowHeightBottomShow = $(window).height() - lh_dataAll.massageHeightShow; //用于判断页面大小发生变化 
    $.ajax({
        url: '/MapGroupList',
        type: 'post',
        async: false,
        success: function(data) {
            if (data.Mac_List.Data.GetAllMachineList.length != 0) {
                //2018.10.9 LH  去除null
                data.Mac_List.Data.GetAllMachineList =  data.Mac_List.Data.GetAllMachineList.filter(function(item){ return item.MAC_NBR != null});
                lh_dataAll.webSeverData = data.Mac_List;
                lh_dataAll.webSeverDataState = data;
            }
        },
        error: function(error) {
            console.error(error);
        }
    })
    
    $('#dowebok').append(`<div class="section" style='height:100%;'></div>`);

    if (getQueryString('id') != null || getQueryString('id') != undefined) {
        switch (getQueryString('id')) {
            case '1': //introduce
                $('.section').append(`<div class = "slide" id='introduce' style='width:100%'></div>`);
                for (let i = 0; i < lh_dataAll.boardList.length; i++) {
                    if (getQueryString('id') == lh_dataAll.boardList[i].page) {
                        createIntroduce(lh_dataAll.boardList[i], 'fixedly');
                    }
                }
                break;
            case '2': //map
                $('.section').append(`<div class = "slide" id='map' style='width:100%'></div>`);
                for (let i = 0; i < lh_dataAll.boardList.length; i++) {
                    if (getQueryString('id') == lh_dataAll.boardList[i].page) {
                        createMAP(lh_dataAll.boardList[i]);
                    }
                }
                break;
            case '3': //activation
                $('.section').append(`<div class = "slide" id='activation' style='width:100%'></div>`);
                for (let i = 0; i < lh_dataAll.boardList.length; i++) {
                    if (getQueryString('id') == lh_dataAll.boardList[i].page) {
                        createActivation(lh_dataAll.boardList[i]);
                        setInterval(() => {
                            createActivation(lh_dataAll.boardList[i]);
                        }, ($('.pagination>ul>li').length + 1) * lh_dataAll.boardList[2].carouselTime);
                    }
                }
                break;
            case '4': //state
                $('.section').append(`<div class = "slide" id='state' style='width:100%'></div>`);
                for (let i = 0; i < lh_dataAll.boardList.length; i++) {
                    if (getQueryString('id') == lh_dataAll.boardList[i].page) {
                        createState(lh_dataAll.boardList[i]);
                        setInterval(() => {
                            createState(lh_dataAll.boardList[i]);
                        }, ($('#stateChild>ul>li').length + 1) * lh_dataAll.boardList[3].carouselTime);
                    }
                }
                break;
            case '5': //police
                $('.section').append(`<div class = "slide" id='police' style='width:100%'></div>`);
                for (let i = 0; i < lh_dataAll.boardList.length; i++) {
                    if (getQueryString('id') == lh_dataAll.boardList[i].page) {
                        createPolice(lh_dataAll.boardList[i]);
                        setInterval(() => {
                            createPolice(lh_dataAll.boardList[i]);
                        }, ($('#policeCentent>ul>li').length + 1) * lh_dataAll.boardList[4].carouselTime);
                    }
                }
                break;
            default:
                break;
        }
        $('#dowebok').fullpage(lh_dataAll.fullpage);
        return;
    }

    for (let i = 0; i < lh_dataAll.boardList.length; i++) {
        switch (lh_dataAll.boardList[i].id) {
            case 'introduce':
                $('.section').append(`<div class = "slide" id=${lh_dataAll.boardList[i].id}></div>`);
                createIntroduce(lh_dataAll.boardList[i]);
                break;
            case 'map':
                $('.section').append(`<div class = "slide" id=${lh_dataAll.boardList[i].id}></div>`);
                // createMAP(lh_dataAll.boardList[i]);
                break;
            case 'activation':
                $('.section').append(`<div class = "slide" id=${lh_dataAll.boardList[i].id}></div>`);
                // createActivation(lh_dataAll.boardList[i]);
                break;
            case 'state':
                $('.section').append(`<div class = "slide" id=${lh_dataAll.boardList[i].id}></div>`);
                // createState(lh_dataAll.boardList[i]);
                break;
            case 'police':
                $('.section').append(`<div class = "slide" id=${lh_dataAll.boardList[i].id}></div>`);
                // createPolice(lh_dataAll.boardList[i]);
                break;
            default:
                break;
        }
    }
    $('#dowebok').fullpage(lh_dataAll.fullpage);
    if(lh_dataAll.notice.show){
        var wsServer = new WebSocket('ws://192.168.0.211:5555');
        wsServer.onopen = function (e) {
            (typeof e == 'string') && wsServer.send(e);
        };
        wsServer.onclose = function (e) {
       
        };
        wsServer.onmessage = function (e) {
               console.log(e);
        };
        wsServer.onerror = function (e) {
            console.log(e);
        }
        //wsServer.send('aaaa');


        $('#dowebok').css({
            'height': '90%'
        })
        $('body').append(`<div style="width:100%;height:15%;position:fixed;bottom:0;left:0;background:#000">
            <h2 style='margin-top:30px'>${lh_dataAll.notice.title}</h2>
            <h4 id="describeIdRoll" style="position: relative;">
                <div id="describeIdRoll1" style="position:absolute;white-space:nowrap;">${lh_dataAll.notice.describe}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
            </h4>
        </div>`)
        $('#describeIdRoll').append(`<div style="position:absolute;left:${$('#describeIdRoll1').width()};white-space:nowrap;">${lh_dataAll.notice.describe}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>`)
        var _box1 = $('#describeIdRoll>div')[0];
        var _box2 = $('#describeIdRoll>div')[1];
        var x = 0;
        var fun = function(){
            _box1.style.left = x + 'px';
            _box2.style.left = (x +$('#describeIdRoll1').width()) + 'px';
            x--;
            if((x +$('#describeIdRoll1').width()) == 0){
                x = 0;
            }
        }
        setInterval(fun,10);
    }
    
    // lh_dataAll.elm1Height = $('#dowebok').height();
    // $.fn.fullpage.moveSlideRight();
    // setTimeout(() => {
    //     $.fn.fullpage.moveSlideRight();
    // }, 1000)
    // setTimeout(() => {
    //     $.fn.fullpage.moveSlideRight();
    // }, 2000)
    // setTimeout(() => {
    //     $.fn.fullpage.moveSlideRight();
    // }, 3000)
    // setTimeout(() => {
    //     $.fn.fullpage.moveSlideRight();
    // }, 6000)
    // lh_dataAll.lh_dataClearInterval = setInterval(function() {
    //     $.fn.fullpage.moveSlideRight();
    // }, lh_dataAll.setIntervalTime); //切换速度，单位是毫秒


    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var reg_rewrite = new RegExp("(^|/)" + name + "/([^/]*)(/|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        var q = window.location.pathname.substr(1).match(reg_rewrite);
        if (r != null) {
            return unescape(r[2]);
        } else if (q != null) {
            return unescape(q[2]);
        } else {
            return null;
        }
    }


    //捕获浏览器全屏的事件  然后刷新页面
    window.onresize = function() {
        if (lh_dataAll.windowHeightBottomShow > lh_dataAll.windowHeight) {
            window.location.reload();
        }
    }
}