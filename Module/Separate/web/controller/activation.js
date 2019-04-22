function createActivation(opts) {
    $('#activation').append(`<ul id='wrap' class='hiSlider pagination' style='width:100%;height:100%;bottom:0;margin-top:10px'><ul></ul></ul>`);
    let PostAjaxData = '';
    if (lh_dataAll.webSeverData.Data.GetAllMachineList.length < opts.macSum) {
        for (let i = 0, len = lh_dataAll.webSeverData.Data.GetAllMachineList.length; i < len; i++) {
            PostAjaxData += lh_dataAll.webSeverData.Data.GetAllMachineList[i].MAC_NBR + ',';
        }
    } else {
        let PostAjaxDataDivide = lh_dataAll.webSeverData.Data.GetAllMachineList.length / (opts.macSum * opts.eleSum);
        PostAjaxDataDivide = Math.ceil(PostAjaxDataDivide);
        for (let w = 0; w < PostAjaxDataDivide; w++) {
            let $ownActivation = $(`<div class='ownActivation${w}'></div>`);
            if (w == 0) {
                var $ownActivationUl = $(`<li class='ownActivationUl${w} activeLi'></li>`);
            } else {
                var $ownActivationUl = $(`<li class='ownActivationUl${w}'></li>`);
            }
            for (let m = 0; m < opts.eleSum; m++) { //4
                PostAjaxData = '';
                for (let i = 0; i < opts.macSum; i++) { // 6
                    if ((w * opts.macSum * opts.eleSum) + (opts.macSum * m) + i < lh_dataAll.webSeverData.Data.GetAllMachineList.length) {
                        PostAjaxData += lh_dataAll.webSeverData.Data.GetAllMachineList[(w * opts.macSum * opts.eleSum) + (opts.macSum * m) + i].MAC_NBR + ',';
                    } else {
                        PostAjaxData = PostAjaxData;
                    }
                }
                PostAjax(PostAjaxData, `.ownActivation${w}`);
            }
            $('.pagination').append($ownActivation);
            $('.pagination>ul').append($ownActivationUl);
        }
        //修改点的位置
        $('.pagination>ul').css({
            'top': (document.body.clientHeight - 80) + 'px'
        });
        //轮播小组件
        $.slider({
            imgElement: $('.pagination>div'),
            liElement: $('.pagination li'),
            activeClass: 'activeLi',
            time: opts.carouselTime,
            activeLiShow: opts.activeLiShow
        })

        //-   <div class="body">
        //- 		<div id="">
        //- 			123456789
        //- 		</div>
        //- 		<div id="">
        //- 			8/8888888
        //- 		</div>
        //- 		<div id="">
        //- 			4156789789
        //- 		</div>
        //- 		<div id="">
        //- 			4564867987
        //- 		</div>
        //- 	<ul>
        //-       <li class="active"></li>
        //-       <li></li>
        //-       <li></li>
        //-       <li></li>
        //-     </ul>
        //-   </div>
    }
 

    function PostAjax(id, father) {
        let startTime = moment().format('YYYY-MM-DD 00:00:00');
        let endTime = moment().format('YYYY-MM-DD HH:mm:ss');
        /******************************************************************按天查询****************************************************************/
        let dataArr = [];
        let keyValue;
        keyValue = JSON.stringify({
            MARS: id,
            BEGIN_DATE: startTime,
            END_DATE: endTime,
            Flag: 1,
            Show: 1,
        });
        $.post("/Statement/machineactivation/GetNewNULLActivation", {
            key: keyValue
        }, (data) => {
            // data.Data[0].sort(function(x,y){
            //     return moment(x.DAY_TYPE).second()-moment(y.DAY_TYPE).second();
            // });
            dataArr = data;
            //单独算开机时间
            dataArrTimeStart = dataArr.Data[0].map(function(item, index, arr) {
                const i = arr.find(_item => item.MAC_NBR === _item.MAC_NBR);
                if (i !== item) {
                    i.DAY_TYPE.push(item.DAY_TYPE);
                    i.DEBUG.push(item.DEBUG);
                    i.DOWN.push(item.DOWN);
                    i.FREE.push(item.FREE);
                    i.OPEN_MAC_TIME.push(item.OPEN_MAC_TIME);
                    i.RUN.push(item.RUN);
                    return undefined;
                } else {
                    i.DAY_TYPE = [i.DAY_TYPE];
                    i.DEBUG = [i.DEBUG];
                    i.DOWN = [i.DOWN];
                    i.FREE = [i.FREE];
                    i.OPEN_MAC_TIME = [i.OPEN_MAC_TIME];
                    i.RUN = [i.RUN];
                    return i;
                }
            }).filter(item => item !== undefined);
            //////////////////////////////////////////处理历史//////////////////////////////////////////
            var dataArrs = [];
            var datas = [];
            dataArrGroup = dataArr.Data[0].map(function(item, index, arr) {
                const i = arr.find(_item => item.MAC_NBR === _item.MAC_NBR);
                if (i !== item) {
                    i.DAY_TYPE += item.DAY_TYPE;
                    i.DEBUG += item.DEBUG;
                    i.DOWN += item.DOWN;
                    i.FREE += item.FREE;
                    // i.OPEN_MAC_TIME += item.OPEN_MAC_TIME;
                    i.RUN += item.RUN;
                    i.STOP += item.STOP;
                    i.SUM_DURATION += item.SUM_DURATION;
                    return undefined;
                } else {
                    i.DAY_TYPE = i.DAY_TYPE;
                    i.DEBUG = i.DEBUG;
                    i.DOWN = i.DOWN;
                    i.FREE = i.FREE;
                    i.OPEN_MAC_TIME = i.OPEN_MAC_TIME;
                    i.RUN = i.RUN;
                    i.STOP = i.STOP;
                    i.SUM_DURATION = i.SUM_DURATION;
                    return i;
                }
            }).filter(item => item !== undefined);
            dataArrs = [];
            for (var l = 0; l < dataArrGroup.length; l++) {
                datas = {};
                datas = {
                    MAC_NO: dataArrGroup[l].MAC_NO,
                    CODE_NO: dataArrGroup[l].CODE_NO,
                    MAC_NAME: dataArrGroup[l].MAC_NAME,
                    CATEGORY: dataArrGroup[l].CATEGORY,
                    DEBUG: dataArrGroup[l].DEBUG / dataArrGroup[l].SUM_DURATION,
                    MAC_NBR: dataArrGroup[l].MAC_NBR,
                    DOWN: dataArrGroup[l].DOWN / dataArrGroup[l].SUM_DURATION,
                    FREE: dataArrGroup[l].FREE / dataArrGroup[l].SUM_DURATION,
                    OPEN_MAC_TIME: dataArrGroup[l].OPEN_MAC_TIME,
                    SUM_DURATION: dataArrGroup[l].SUM_DURATION,
                    RUN: dataArrGroup[l].RUN / dataArrGroup[l].SUM_DURATION,
                    STOP: dataArrGroup[l].STOP / dataArrGroup[l].SUM_DURATION,
                    DEBUGNUM: dataArrGroup[l].DEBUG,
                    DOWNNUM: dataArrGroup[l].DOWN,
                    FREENUM: dataArrGroup[l].FREE,
                    RUNNUM: dataArrGroup[l].RUN,
                    STOPNUM: dataArrGroup[l].STOP,
                }
                dataArrs.push(datas);
                //处理好的 历史
                var DayDataArr = [];
                for (let i = 0; i < dataArrs.length; i++) {
                    DayDataArr.push({
                        time: (dataArrs[i].CODE_NO == null ? '' : dataArrs[i].CODE_NO) + ' ' + dataArrs[i].CATEGORY + ' ' + dataArrs[i].MAC_NAME + ' ' + dataArrs[i].MAC_NO,
                        sumtime: (dataArrs[i].OPEN_MAC_TIME / 3600).toFixed(2),
                        data: [(dataArrs[i].RUN * 100).toFixed(2), (dataArrs[i].RUN * 100).toFixed(2), (dataArrs[i].FREE * 100).toFixed(2), (dataArrs[i].DEBUG * 100).toFixed(2), (dataArrs[i].STOP * 100).toFixed(2), (dataArrs[i].DOWN * 100).toFixed(2)],
                        dataSum: [dataArrs[i].RUNNUM, dataArrs[i].RUNNUM , dataArrs[i].FREENUM , dataArrs[i].DEBUGNUM , dataArrs[i].STOPNUM , dataArrs[i].DOWNNUM],
                    })
                }
            }
            if (DayDataArr != undefined) {
                var ojson = {
                    "facility": {
                        // "name": startTime + '-' + endTime, //设备名称   
                        "name": $("#my-select").parent().find('button').attr("title"), //设备名称 htc:20180629
                        "plant": "", //工厂
                        "workshop": "", //车间
                        "production": '', //产线
                        "model": "", //设备型号
                        "number": '', //设备编号
                        "procedure": "", //程序号
                        "vender": "", //设备厂家
                        "echartsId": "echartsId" + DayDataArr[0].time, //echartsId
                        "elementTitle": startTime + '-' + endTime, //设备名称
                        /**
                         ** value time时间   
                         ** totaltime  总开机时间
                         ** data[标准稼动率，运行，空闲，调试，停机，关机]
                         **/
                        "value": DayDataArr,
                        'height': opts.eleHeight
                    }
                }
                $(father).createElement(ojson);
            }
        })
    }
}