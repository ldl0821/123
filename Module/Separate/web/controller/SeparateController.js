window.onload = function() {
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

    let sumQuantity = lh_dataAll.boardList.length / lh_dataAll.quantity;
    sumQuantity = Math.ceil(sumQuantity);

    for (let i = 0; i < sumQuantity; i++) {
        $('#dowebok').append(`<div class="section${i}" style='display:flex;height:${document.body.clientHeight/sumQuantity}px;width:100%'></div>`);
    }

    for (let i = 0; i < lh_dataAll.boardList.length; i++) {
        switch (lh_dataAll.boardList[i].id) {
            // case 'introduce':
            //     $(`.section0`).append(`<div class = "slide"  id=${lh_dataAll.boardList[i].id}></div>`);
            //     createIntroduce(lh_dataAll.boardList[i]);
            //     break;
            case 'map':
                $(`.section0`).append(`<div class = "slide" style='flex:1;position:relative' id=${lh_dataAll.boardList[i].id}></div>`);
                createMAP(lh_dataAll.boardList[i]);
                break;
            case 'activation':
                $(`.section0`).append(`<div class = "slide" style='flex:1;position:relative' id=${lh_dataAll.boardList[i].id}></div>`);
                createActivation(lh_dataAll.boardList[i]);
                break;
            case 'state':
                $(`.section1`).append(`<div class = "slide" style='flex:1;position:relative' id=${lh_dataAll.boardList[i].id}></div>`);
                createState(lh_dataAll.boardList[i]);
                break;
            case 'police':
                $(`.section1`).append(`<div class = "slide" style='flex:1;position:relative' id=${lh_dataAll.boardList[i].id}></div>`);
                createPolice(lh_dataAll.boardList[i]);
                break;
            default:
                break;
        }
    }
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
}