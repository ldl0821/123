//使用的是fullpage.js
let lh_dataAll = {
    clearIntervalTime: '', //不用修改
    MAPsetIntervalTime: 6000, //地图存在时间，单位是毫秒  
    //剩下页面的存在时间都是为每个页面单独的时间进行计算确保每个页面都全是显示一遍 但是它们在fullpage onSlideLeave  setTimeout时间写死
    clientTimesAll: 6000, //如果有客户信息没有滚动条 可以设置几秒切换，如果有滚动条无视
    /****************如果客户信息有滚动条设置*********************/
    clientSpeedsa: 1.2, //客户滚动速度越大越快  必须大于1.2
    clientTimes: 10, //客户滚动时间间隔越大越慢
    windowHeightBottomShow:0, //保存浏览器的高 用来显示下面的信息条
    massageHeightShow:0,
    /***********************************************************/
    notice:{
        // method:{
        //     Title:true,
        //     CutTool:false
        // },
        show:false,
        title:"上海斑彰信息有限公司",
        describe:"ask很大咖技术大会开奖号按时卡时间段和咖技术大交电话费收到回复开始绝代风华速度快房户端卡仕达卡a阿达阿萨德爱喝酒可视电话卡机的卡仕达哈克斯的接收到尽快哈撒大华师大的阿萨德阿萨德但是感受到"
    },
    /************************************************************************/
    //boardList此处数组的个数决定了页面的数目   
    //introduce是客户信息
    //map是地图
    //activation是设备稼动率
    //state设备状态
    //police报警信息
    //id是每一个页面的ID 添加ID是同时要配置这个id显示的东西  map是地图，
    /************************************************************************/
    boardList: [{
            id: 'introduce', //轮播ID  不能动
            page: 1,
        },
        {
            id: 'map', //轮播ID   不能动
            page: 2,
        },
        {
            id: 'activation', //轮播ID  不能动
            eleSum: 1, //一屏几个图表
            macSum: 5, //一个图表有几个设备
            carouselTime: 6000, //轮播切换时间
            activeLiShow: true, //true是显示下面的点  false为消失
            page: 3,
        },
        {
            id: 'state', //轮播ID   不能动
            eleSum: 4, //一屏几个图表
            carouselTime: 6000, //轮播切换时间
            activeLiShow: true, //true是显示下面的点  false为消失
            page: 4,
        },
        {
            id: 'police', //轮播ID   不能动
            eleSum: 2, //一屏有几行
            lineSum: 3, //一行有几个图饼
            carouselTime: 6000, //轮播切换时间
            activeLiShow: true, //true是显示下面的点  false为消失
            page: 5,
        }
    ],
    fullpage: {
        sectionsColor: ['#000'], //页面的背景颜色
        verticalCentered: true, //内容是否居中
        navigationPosition: true,
        loopHorizontal: true,
        controlArrowColor: '#1bbc9b', //左右滑块的箭头的背景颜色  
        slidesNavigation: false, //是否显示下面圆点
        scrollingSpeed: 1000, //切换速度，单位为毫秒
        resize: true,
        onSlideLeave: function(anchorLink, index, slideIndex, direction) {
            // var lh_dataAllClearIntervalTime;
            switch (slideIndex) {
                case 0:
                    /**************************2018/8/14修改过*******************************/
                    if (lh_dataAll.clearIntervalTime != '') {
                        window.clearInterval(lh_dataAll.clearIntervalTime);
                        window.clearInterval(lh_dataAll.timeInter);
                    }
                    $("#dowebok").scrollTop(0);
                    /*********************************************************/
                    // $('.section').append(`<div class = "slide" id='map'></div>`);
                    // $('.section>div>div').append(`<div class = "slide fp-slide fp-table" id='activation'></div>`);
                    window.clearInterval(lh_dataAll.clearIntervalTime);
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                    $('#dowebok').css({
                        'overflow': 'hidden'
                    })
                    $('#dowebok').css({
                        'overflow': 'hidden'
                    });
                    createMAP(lh_dataAll.boardList[1]);
                    break;
                case 1:
                    // $('.slide').eq(0).remove();
                    // $('.section').append(`<div class = "slide" id='activation'></div>`);
                    // $('.section').append(`<div class = "slide" id='state'></div>`);
                    // $('.section>div>div').append(`<div class = "slide fp-slide fp-table" id='state'></div>`);
                    window.clearInterval(lh_dataAll.MAPsetIntervals);
                    createActivation(lh_dataAll.boardList[2]);
                    setTimeout(() => {
                        window.clearInterval(lh_dataAll.timeInter);
                        $.fn.fullpage.moveSlideRight();
                    }, ($('.pagination>ul>li').length + 1) * lh_dataAll.boardList[2].carouselTime);
                    break;
                case 2:
                    // $('.slide').eq(0).remove();
                    // $('.section').append(`<div class = "slide" id='state'></div>`);
                    // $('.section').append(`<div class = "slide" id='police'></div>`);
                    createState(lh_dataAll.boardList[3]);
                    setTimeout(() => {
                        window.clearInterval(lh_dataAll.timeInter);
                        $.fn.fullpage.moveSlideRight();
                    }, ($('#stateChild>ul>li').length + 1) * lh_dataAll.boardList[3].carouselTime);
                    break;
                case 3:
                    // $('.slide').eq(0).remove();
                    // $('.section').append(`<div class = "slide" id='police'></div>`);
                    // $('.section').append(`<div class = "slide" id='introduce'></div>`);
                    createPolice(lh_dataAll.boardList[4]);
                    setTimeout(() => {
                        window.clearInterval(lh_dataAll.timeInter);
                        $.fn.fullpage.moveSlideRight();
                    }, ($('#policeCentent>ul>li').length + 1) * lh_dataAll.boardList[4].carouselTime);
                    break;
                case 4:
                    if(lh_dataAll.refreshPage >= 15){
                        location.reload();
                    }else{
                        lh_dataAll.refreshPage++
                    }
                    $('body').append(`<div id='allloding' style='width:100%;height:100%;position:fixed;top:0;left:0;z-index:999999;background:rgba(30,30,30,1)'>
                        <div id='loading' style = 'font-size:26px;text-align:center;position:absolute;top:40%;width:100%;z-index:9999999'>
                            <i class='icon-spinner icon-spin' style='color:#fff;width:24px;height:24px'></i>正在努力加载
                        </div>
                    </div>`)
                        //一秒钟之后删除加载页面  1秒钟之后再去下拉
                    setTimeout(() => {
                        $('#allloding').remove();
                        $("#dowebok").scrollTop(0);
                        $('#dowebok').css({
                            'overflow': 'auto'
                        });
                        $('.fp-slidesContainer').height($('#elm1').height());
                        lh_dataAll.clearIntervalTime = setInterval((function() {
                            if (lh_dataAll.elm1Height <= lh_dataAll.windowHeightBottomShow) {
                                window.clearInterval(lh_dataAll.clearIntervalTime);
                                setTimeout(() => {
                                    $.fn.fullpage.moveSlideRight();
                                }, lh_dataAll.clientTimesAll);
                            } else {
                                // $("body").scrollTop($("body").scrollTop() + lh_dataAll.clientSpeedsa);
                                // $('body').css({
                                //     'overflow': 'auto'
                                // });
                                // $('html').css({
                                //     'overflow': 'auto'
                                // });
                                // if (document.body.scrollTop >= $('.fp-slidesContainer').height() - $(window).height()) {
                                //     window.clearInterval(lh_dataAllClearIntervalTime);
                                //     $.fn.fullpage.moveSlideRight();
                                // }
                                var dowebokScrollTop = $("#dowebok").scrollTop() + lh_dataAll.clientSpeedsa;
                                $("#dowebok").scrollTop(dowebokScrollTop);
                                if ($("#dowebok").scrollTop() >= lh_dataAll.elm1Height - lh_dataAll.windowHeightBottomShow - 1) {
                                    window.clearInterval(lh_dataAll.clearIntervalTime);
                                    $.fn.fullpage.moveSlideRight();
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
                        }), lh_dataAll.clientTimes)
                    }, 1000);
                    // location.reload();
                    // $('.fp-slidesContainer').css({
                    //     transform: 'translate3d(-0px, 0px, 0px)'
                    // });     
                    // console.log($('.fp-slidesContainer')[0])
                    // $('.slide').eq(0).remove();
                    // $('.section').append(`<div class = "slide" id='introduce'></div>`);
                    // $('.section').append(`<div class = "slide" id='map'></div>`);
                    // createIntroduce(lh_dataAll.boardList[0]);
                    break;
                default:
                    console.error('Error');
                    break;
            }
        },
    },
    webSeverData: '',
    webSeverDataState: '',
    lh_dataClearInterval: '',
    //用来添加滚动条
    elm1Height: 0,
    timeInter: null,
    MAP_nbr: '', //用来保存请求来的地图设备
    ALL_nbr: '', //用来保存请求来的状态稼动等的设备
    MAPsetIntervals: '', //不用修改
    MAPsetIntervalSppeed: 1, //不用修改
    MAPsetIntervalFrequency: 15, //不用修改
    scrollTopIs: 0, //不用修改
    refreshPage:0,
    windowHeight: 0 //用来保存浏览器的高 用来刷新页面
}

$.ajax({
    url: '/Board/getTxt',
    async: false,
    success: (data) => {
        //使用&&做if else 使用+dataJson.activationEleSum将字符串转数字
        data.Status == 1 && console.log('没有配置信息');
        if (data.Status == 1) {
            return false;
        }
        if(JSON.parse(data.data).flag == 2){
            return false;
        }
        data.Status == -999 && BzAlert(data.error);
        let dataJson = JSON.parse(data.data);
        lh_dataAll.MAPsetIntervalTime = +dataJson.MAP_Time;
        lh_dataAll.MAPsetIntervalSppeed = +dataJson.MAP_speed;
        lh_dataAll.MAPsetIntervalFrequency = +dataJson.MAP_frequency;
        lh_dataAll.clientTimesAll = +dataJson.introduceTime;
        lh_dataAll.clientSpeedsa = +dataJson.introduceSpeeds;
        lh_dataAll.clientTimes = +dataJson.introduceTimes;
        lh_dataAll.MAP_nbr = dataJson.MAP_nbr;
        lh_dataAll.ALL_nbr = dataJson.ALL_nbr;
        for (let i = 0; i < lh_dataAll.boardList.length; i++) {
            if (lh_dataAll.boardList[i].id == 'activation') {
                lh_dataAll.boardList[i].eleSum = +dataJson.activationEleSum;
                lh_dataAll.boardList[i].macSum = +dataJson.activationMacSum;
                lh_dataAll.boardList[i].carouselTime = +dataJson.activationTime;
                lh_dataAll.boardList[i].activeLiShow = dataJson.activationChecked == 'true' ? true : false;
            }

            if (lh_dataAll.boardList[i].id == 'state') {
                lh_dataAll.boardList[i].eleSum = +dataJson.stateEleSum;
                lh_dataAll.boardList[i].carouselTime = +dataJson.stateTime;
                lh_dataAll.boardList[i].activeLiShow = dataJson.stateChecked == 'true' ? true : false;
            }

            if (lh_dataAll.boardList[i].id == 'police') {
                lh_dataAll.boardList[i].eleSum = +dataJson.policeEleSum;
                lh_dataAll.boardList[i].lineSum = +dataJson.policeLineSum;
                lh_dataAll.boardList[i].carouselTime = +dataJson.policeTime;
                lh_dataAll.boardList[i].activeLiShow = dataJson.policeChecked == 'true' ? true : false;
            }
        }
    }
});