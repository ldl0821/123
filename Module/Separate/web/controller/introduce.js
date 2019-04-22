function createIntroduce() {
    $('#introduce').append(`<div id='elm1' style='width:100%;height:100%;overflow:auto !important;top:0;'></div>`);
    //调取客户ID
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
            url: '/TinyMCE/readData',
            type: 'post',
            data: {
                name: ajaxData,
            },
            success: function(data) {
                if (data.Data != undefined) {
                    $('#elm1').html(data.Data.text);
                }
            },
            error: function() {
                console.error('出错啦');
                return false;
            }
        })
    }
}