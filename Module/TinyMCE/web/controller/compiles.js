window.onload = function() {
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }

    //调取客户ID
    $.ajax({
            url: '/TinyMCE/GetUserTable',
            type: 'post',
            success: function(data) {
                if (data.Status == 0) {
                    localStorage.setItem('USER_MDA_MESSAGE', JSON.stringify(data.Data));
                    if (data.Data.USER_PRE[0] == undefined) {} else {
                        ajaxReadData(data.Data.USER_PRE[0].COMPANY_NAME);
                    }
                }
            },
            error: function() {
                console.error(lang.Common.Error);
                return false;
            }
        })
        //调取富文本数据
    function ajaxReadData(data) {
        let ajaxData;
        if (getQueryString('name')) {
            ajaxData = getQueryString('name');
        } else {
            ajaxData = data;
        }
        $.ajax({
            url: '/TinyMCE/readData',
            type: 'post',
            data: {
                name: ajaxData,
            },
            success: function(data) {
                if (data.Data == undefined) {} else {
                    $('#elm1').html(data.Data.text);
                }
            },
            error: function() {
                console.error(lang.Common.Error);
                return false;
            }
        })
    }
}