//使用的是fullpage.js
let lh_dataAll = {
    clearIntervalTime: '', //不用修改
    setIntervalTime: 5000, //这个页面存在时间，单位是毫秒
    quantity: 2,
    /************************************************************************/
    //boardList此处数组的个数决定了页面的数目   \
    //introduce是客户信息
    //map是地图
    //activation是设备稼动率
    //state设备状态
    //police报警信息
    //id是每一个页面的ID 添加ID是同时要配置这个id显示的东西  map是地图，
    /************************************************************************/
    boardList: [{
            id: 'map', //轮播ID   不能动
        },
        {
            id: 'activation', //轮播ID  不能动
            eleHeight: ($(window).height()/2)-30, //图表的显示的高度
            eleSum: 1, //一屏几个图表
            macSum: 6, //一个图表有几个设备
            carouselTime: 4000, //轮播切换时间
            activeLiShow: false //true是显示下面的点  false为消失
        },
        {
            id: 'state', //轮播ID   不能动
            eleSum: 1, //一屏几个图表
            eleHeight: 200, //图表的显示的高度
            carouselTime: 5000, //轮播切换时间
            activeLiShow: false //true是显示下面的点  false为消失
        },
        {
            id: 'police', //轮播ID   不能动
            eleSum: 1, //一屏有几行
            lineSum: 2, //一行有几个图饼
            carouselTime: 4000, //轮播切换时间
            activeLiShow: false //true是显示下面的点  false为消失
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
        onSlideLeave: function(anchorLink, index, slideIndex, direction) {
            switch (slideIndex) {
                case 0:
                    window.clearInterval(lh_dataAll.clearIntervalTime);
                    document.body.scrollTop = document.documentElement.scrollTop = 0;
                    $('body').css({
                        'overflow': 'hidden'
                    })
                    $('html').css({
                        'overflow': 'hidden'
                    })
                    break;
                case 1:
                    break;
                case 2:
                    break;
                case 3:
                    break;
                case 4:
                    let i = 100; //客户信息向下滚动的速度
                    lh_dataAll.clearIntervalTime = setInterval((function() {
                        document.body.scrollTop = document.body.scrollTop + i;
                    }), 200)
                    $('body').css({
                        'overflow': 'auto'
                    })
                    $('html').css({
                        'overflow': 'auto'
                    })
                    break;
                default:
                    break;
            }
        },
    },
    webSeverData: '',
    webSeverDataState: '',
    lh_dataClearInterval: '',
}